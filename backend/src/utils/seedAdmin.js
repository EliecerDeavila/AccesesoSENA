const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models/index');

const seedAdmin = async () => {
  try {
    const adminRol = await Rol.findOne({ where: { nombre: 'ADMINISTRADOR' } });

    if (!adminRol) {
      console.error('❌ Rol ADMINISTRADOR no encontrado');
      return;
    }

    const adminExiste = await Usuario.findOne({
      where: { numero_documento: '1000000000', eliminado: false }
    });

    if (adminExiste) {
      console.log('ℹ️  Usuario admin ya existe');
      return;
    }

    const adminPassword = 'Day95112413d**';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await Usuario.create({
      numero_documento: '1000000000',
      tipo_documento: 'CC',
      nombre_completo: 'Administrador General',
      id_rol: adminRol.id_rol,
      telefono_contacto: '3001234567',
      contacto_emergencia: '3009876543',
      password_hash: passwordHash
    });

    console.log('✅ Usuario admin creado (doc: 1000000000, pass: ' + adminPassword + ')');
    console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
  } catch (error) {
    console.error('❌ Error al crear admin:', error.message);
  }
};

module.exports = seedAdmin;
