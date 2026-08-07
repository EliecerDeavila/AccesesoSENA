const { z } = require('zod');
const { Op } = require('sequelize');
const { Acceso, Usuario, Rol } = require('../models/index');
const sequelize = require('../config/db');

const reporteFechaSchema = z.object({
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
});

const reportesGenerales = async (req, res) => {
  try {
    const accesos = await Acceso.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'numero_documento', 'nombre_completo'] }
      ],
      order: [['fecha', 'DESC'], ['hora_entrada', 'DESC']]
    });

    const totalAccesos = accesos.length;
    const accesosConSalida = accesos.filter(a => a.hora_salida !== null).length;
    const accesosSinSalida = totalAccesos - accesosConSalida;

    res.json({
      total_accesos: totalAccesos,
      con_salida: accesosConSalida,
      sin_salida: accesosSinSalida,
      accesos
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reportes', error: error.message });
  }
};

const reportesPorFecha = async (req, res) => {
  try {
    const resultado = reporteFechaSchema.safeParse(req.query);

    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => e.message);
      return res.status(400).json({ message: 'Parámetros inválidos', errores });
    }

    const { fecha_inicio, fecha_fin } = resultado.data;

    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      return res.status(400).json({ message: 'La fecha de inicio no puede ser mayor que la fecha fin' });
    }

    const accesos = await Acceso.findAll({
      where: {
        fecha: {
          [Op.between]: [fecha_inicio, fecha_fin]
        }
      },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'numero_documento', 'nombre_completo'] }
      ],
      order: [['fecha', 'ASC'], ['hora_entrada', 'ASC']]
    });

    const totalAccesos = accesos.length;
    const accesosConSalida = accesos.filter(a => a.hora_salida !== null).length;
    const accesosSinSalida = totalAccesos - accesosConSalida;

    res.json({
      fecha_inicio,
      fecha_fin,
      total_accesos: totalAccesos,
      con_salida: accesosConSalida,
      sin_salida: accesosSinSalida,
      accesos
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reportes por fecha', error: error.message });
  }
};

const aforo = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const accesosAbiertos = await Acceso.findAll({
      where: {
        fecha: hoy,
        hora_salida: null
      },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'numero_documento', 'nombre_completo'] }
      ]
    });

    const totalAforo = accesosAbiertos.length;

    res.json({
      fecha: hoy,
      aforo_actual: totalAforo,
      personas_dentro: accesosAbiertos.map(a => ({
        id_usuario: a.usuario.id_usuario,
        numero_documento: a.usuario.numero_documento,
        nombre_completo: a.usuario.nombre_completo,
        hora_entrada: a.hora_entrada,
        motivo_visita: a.motivo_visita
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar aforo', error: error.message });
  }
};

module.exports = { reportesGenerales, reportesPorFecha, aforo };
