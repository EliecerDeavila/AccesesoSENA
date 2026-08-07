const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { Usuario, Rol } = require('../models/index');

const loginSchema = z.object({
  numero_documento: z.string().min(5, 'Documento debe tener al menos 5 caracteres'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres')
});

const login = async (req, res) => {
  try {
    const resultado = loginSchema.safeParse(req.body);

    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => e.message);
      return res.status(400).json({ message: 'Datos inválidos', errores });
    }

    const { numero_documento, password } = resultado.data;

    const usuario = await Usuario.findOne({
      where: { numero_documento, eliminado: false },
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Documento o contraseña incorrectos' });
    }

    if (!usuario.password_hash) {
      return res.status(401).json({ message: 'Este usuario no tiene contraseña asignada' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Documento o contraseña incorrectos' });
    }

    const nombreRol = usuario.rol.nombre;

    if (!['ADMINISTRADOR', 'VIGILANTE'].includes(nombreRol)) {
      return res.status(403).json({ message: 'Solo ADMINISTRADOR y VIGILANTE pueden iniciar sesión' });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        numero_documento: usuario.numero_documento,
        nombre_completo: usuario.nombre_completo,
        rol: nombreRol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        numero_documento: usuario.numero_documento,
        nombre_completo: usuario.nombre_completo,
        rol: nombreRol
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

module.exports = { login };
