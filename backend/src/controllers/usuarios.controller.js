const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { Usuario, Rol } = require('../models/index');

const crearUsuarioSchema = z.object({
  numero_documento: z.string().min(5, 'Documento debe tener al menos 5 caracteres'),
  tipo_documento: z.enum(['CC', 'TI', 'CE', 'PA'], { message: 'Tipo de documento inválido' }),
  nombre_completo: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  id_rol: z.number().int().positive('ID de rol inválido'),
  telefono_contacto: z.string().optional(),
  contacto_emergencia: z.string().optional(),
  password: z.string().min(6).optional()
});

const actualizarUsuarioSchema = z.object({
  numero_documento: z.string().min(5).optional(),
  tipo_documento: z.enum(['CC', 'TI', 'CE', 'PA']).optional(),
  nombre_completo: z.string().min(3).optional(),
  id_rol: z.number().int().positive().optional(),
  telefono_contacto: z.string().optional(),
  contacto_emergencia: z.string().optional(),
  password: z.string().min(6).optional()
});

const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { eliminado: false },
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password_hash'] }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar usuarios', error: error.message });
  }
};

const buscarPorDocumento = async (req, res) => {
  try {
    const { numero_documento } = req.params;

    const usuario = await Usuario.findOne({
      where: { numero_documento, eliminado: false },
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar usuario', error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const resultado = crearUsuarioSchema.safeParse(req.body);

    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => e.message);
      return res.status(400).json({ message: 'Datos inválidos', errores });
    }

    const { numero_documento, tipo_documento, nombre_completo, id_rol, telefono_contacto, contacto_emergencia, password } = resultado.data;

    const rolExiste = await Rol.findByPk(id_rol);
    if (!rolExiste) {
      return res.status(400).json({ message: 'El rol especificado no existe' });
    }

    const docExiste = await Usuario.findOne({ where: { numero_documento, eliminado: false } });
    if (docExiste) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese documento' });
    }

    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const usuario = await Usuario.create({
      numero_documento,
      tipo_documento,
      nombre_completo,
      id_rol,
      telefono_contacto,
      contacto_emergencia,
      password_hash: passwordHash
    });

    const usuarioResponse = await Usuario.findByPk(usuario.id_usuario, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password_hash'] }
    });

    res.status(201).json({ message: 'Usuario creado correctamente', usuario: usuarioResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const resultado = actualizarUsuarioSchema.safeParse(req.body);

    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => e.message);
      return res.status(400).json({ message: 'Datos inválidos', errores });
    }

    const datosActualizar = { ...resultado.data };

    if (datosActualizar.id_rol) {
      const rolExiste = await Rol.findByPk(datosActualizar.id_rol);
      if (!rolExiste) {
        return res.status(400).json({ message: 'El rol especificado no existe' });
      }
    }

    if (datosActualizar.numero_documento && datosActualizar.numero_documento !== usuario.numero_documento) {
      const docExiste = await Usuario.findOne({ where: { numero_documento: datosActualizar.numero_documento, eliminado: false } });
      if (docExiste) {
        return res.status(400).json({ message: 'Ya existe un usuario con ese documento' });
      }
    }

    if (datosActualizar.password) {
      datosActualizar.password_hash = await bcrypt.hash(datosActualizar.password, 10);
      delete datosActualizar.password;
    }

    await usuario.update(datosActualizar);

    const usuarioActualizado = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password_hash'] }
    });

    res.json({ message: 'Usuario actualizado correctamente', usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findOne({
      where: { id_usuario: id, eliminado: false }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await usuario.update({ eliminado: true });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password_actual, nueva_password } = req.body;

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Los Vigilantes solo pueden cambiar su propia contraseña
    // Los Administradores pueden cambiar la de cualquier usuario
    const esAdmin = usuario.rol.nombre === 'ADMINISTRADOR';
    const esMismoUsuario = usuario.numero_documento === req.usuario.numero_documento;

    if (!esAdmin && !esMismoUsuario) {
      return res.status(403).json({ message: 'No autorizado para cambiar esta contraseña' });
    }

    // Verificar contraseña actual usando bcrypt
    const passwordValida = await bcrypt.compare(password_actual, usuario.password_hash);

    if (!passwordValida) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear la nueva contraseña
    const nuevaHash = await bcrypt.hash(nueva_password, 10);

    // Actualizar password_hash
    await usuario.update({ password_hash: nuevaHash });

    // Obtener usuario response sin password_hash
    const usuarioActualizado = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password_hash'] }
    });

    res.json({ 
      message: 'Contraseña actualizada correctamente',
      usuario: usuarioActualizado,
      requiereReingreso: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar contraseña', error: error.message });
  }
};

const resetPasswordPorAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nueva_password } = req.body;

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña
    const nuevaHash = await bcrypt.hash(nueva_password, 10);

    // Actualizar password_hash
    await usuario.update({ password_hash: nuevaHash });

    // Obtener usuario response sin password_hash
    const usuarioActualizado = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password_hash'] }
    });

    res.json({ 
      message: 'Contraseña reseteada por administrador',
      usuario: usuarioActualizado,
      temporal: false,
      requiereReingreso: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al resetear contraseña', error: error.message });
  }
};

const crearVisitanteSchema = z.object({
  numero_documento: z.string().min(5, 'Documento debe tener al menos 5 caracteres'),
  tipo_documento: z.enum(['CC', 'TI', 'CE', 'PA'], { message: 'Tipo de documento inválido' }),
  nombre_completo: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  telefono_contacto: z.string().optional(),
  contacto_emergencia: z.string().optional()
});

const crearVisitante = async (req, res) => {
  try {
    const resultado = crearVisitanteSchema.safeParse(req.body);

    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => e.message);
      return res.status(400).json({ message: 'Datos inválidos', errores });
    }

    const { numero_documento, tipo_documento, nombre_completo, telefono_contacto, contacto_emergencia } = resultado.data;

    const rolVisitante = await Rol.findOne({ where: { nombre: 'VISITANTE' } });
    if (!rolVisitante) {
      return res.status(500).json({ message: 'Rol VISITANTE no encontrado en el sistema' });
    }

    const docExiste = await Usuario.findOne({ where: { numero_documento, eliminado: false } });
    if (docExiste) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese documento', usuario: docExiste });
    }

    const usuario = await Usuario.create({
      numero_documento,
      tipo_documento,
      nombre_completo,
      id_rol: rolVisitante.id_rol,
      telefono_contacto,
      contacto_emergencia,
      password_hash: null
    });

    const usuarioResponse = await Usuario.findByPk(usuario.id_usuario, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password_hash'] }
    });

    res.status(201).json({ message: 'Visitante creado correctamente', usuario: usuarioResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear visitante', error: error.message });
  }
};

module.exports = { listar, buscarPorDocumento, crear, actualizar, eliminar, cambiarPassword, resetPasswordPorAdmin, crearVisitante };
