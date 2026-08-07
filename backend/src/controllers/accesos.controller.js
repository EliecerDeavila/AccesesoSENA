const { z } = require('zod');
const { Op } = require('sequelize');
const { Acceso, Usuario, Rol } = require('../models/index');
const sequelize = require('../config/db');

const entradaSchema = z.object({
  id_usuario: z.number().int().positive('ID de usuario inválido'),
  motivo_visita: z.string().optional()
});

const salidaSchema = z.object({
  id_usuario: z.number().int().positive('ID de usuario inválido')
});

const registrarEntrada = async (req, res) => {
  try {
    const resultado = entradaSchema.safeParse(req.body);

    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => e.message);
      return res.status(400).json({ message: 'Datos inválidos', errores });
    }

    const { id_usuario, motivo_visita } = resultado.data;

    const usuario = await Usuario.findOne({
      where: { id_usuario, eliminado: false },
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const hoy = new Date().toISOString().split('T')[0];

    const accesoAbierto = await Acceso.findOne({
      where: {
        id_usuario,
        fecha: hoy,
        hora_salida: null
      }
    });

    if (accesoAbierto) {
      return res.status(400).json({ message: 'El usuario ya tiene un acceso registrado sin salida. Registre la salida primero.' });
    }

    const ahora = new Date();
    const horaEntrada = ahora.toTimeString().split(' ')[0];

    const registroPor = req.usuario.id_usuario;

    const acceso = await Acceso.create({
      id_usuario,
      fecha: hoy,
      hora_entrada: horaEntrada,
      hora_salida: null,
      motivo_visita: motivo_visita || null,
      registrado_por: registroPor
    });

    const accesoResponse = await Acceso.findByPk(acceso.id_acceso, {
      include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'numero_documento', 'nombre_completo'] }]
    });

    res.status(201).json({ message: 'Entrada registrada correctamente', acceso: accesoResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar entrada', error: error.message });
  }
};

const registrarSalida = async (req, res) => {
  try {
    const resultado = salidaSchema.safeParse(req.body);

    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => e.message);
      return res.status(400).json({ message: 'Datos inválidos', errores });
    }

    const { id_usuario } = resultado.data;

    const usuario = await Usuario.findOne({
      where: { id_usuario, eliminado: false }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const hoy = new Date().toISOString().split('T')[0];

    const accesoAbierto = await Acceso.findOne({
      where: {
        id_usuario,
        fecha: hoy,
        hora_salida: null
      }
    });

    if (!accesoAbierto) {
      return res.status(400).json({ message: 'No se encontró un acceso abierto para este usuario. Registre la entrada primero.' });
    }

    const ahora = new Date();
    const horaSalida = ahora.toTimeString().split(' ')[0];

    await accesoAbierto.update({ hora_salida: horaSalida });

    const accesoResponse = await Acceso.findByPk(accesoAbierto.id_acceso, {
      include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'numero_documento', 'nombre_completo'] }]
    });

    res.json({ message: 'Salida registrada correctamente', acceso: accesoResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar salida', error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const accesos = await Acceso.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'numero_documento', 'nombre_completo'] }],
      order: [['fecha', 'DESC'], ['hora_entrada', 'DESC']]
    });
    res.json(accesos);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar accesos', error: error.message });
  }
};

const buscarPorDocumento = async (req, res) => {
  try {
    const { numero_documento } = req.params;

    const usuario = await Usuario.findOne({ where: { numero_documento } });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const accesos = await Acceso.findAll({
      where: { id_usuario: usuario.id_usuario },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'numero_documento', 'nombre_completo'] }],
      order: [['fecha', 'DESC'], ['hora_entrada', 'DESC']]
    });

    res.json(accesos);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar accesos', error: error.message });
  }
};

module.exports = { registrarEntrada, registrarSalida, listar, buscarPorDocumento };
