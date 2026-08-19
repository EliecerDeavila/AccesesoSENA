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
      where: { numero_documento: '1143387774', eliminado: false }
    });

    if (!adminExiste) {
      const adminPassword = 'Day95112413d**';
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      await Usuario.create({
        numero_documento: '1143387774',
        tipo_documento: 'CC',
        nombre_completo: 'Administrador General',
        id_rol: adminRol.id_rol,
        telefono_contacto: '3001234567',
        contacto_emergencia: '3009876543',
        password_hash: passwordHash
      });

      console.log('✅ Usuario admin creado (doc: 1143387774, pass: ' + adminPassword + ')');
      console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
    } else {
      console.log('ℹ️  Usuario admin ya existe');
    }

    // CREAR USUARIO VIGILANTE DOC 1000000001 (siempre se ejecuta, independiente del admin)
    const vigilanteRol = await Rol.findOne({ where: { nombre: 'VIGILANTE' } });
    if (vigilanteRol) {
      const vigilanteExiste = await Usuario.findOne({
        where: { numero_documento: '1000000001', eliminado: false }
      });

      if (!vigilanteExiste) {
        const tempPassword = 'Vigilante2024';
        const vigilantePasswordHash = await bcrypt.hash(tempPassword, 10);

        await Usuario.create({
          numero_documento: '1000000001',
          tipo_documento: 'CC',
          nombre_completo: 'Vigilante de Prueba',
          id_rol: vigilanteRol.id_rol,
          telefono_contacto: '3005550001',
          contacto_emergencia: '3005550002',
          password_hash: vigilantePasswordHash
        });

        console.log('✅ Usuario vigilante creado (doc: 1000000001, pass: ' + tempPassword + ')');
        console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
      } else {
        console.log('ℹ️  Usuario vigilante ya existe');
      }
    } else {
      console.error('❌ Rol VIGILANTE no encontrado');
    }

  } catch (error) {
    console.error('❌ Error al crear usuarios:', error.message);
  }
};

module.exports = seedAdmin;