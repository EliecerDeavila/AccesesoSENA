const { Usuario, Rol } = require('../models/index');

const seedUsuariosPrueba = async () => {
  try {
    // 1. Asegurar que existe el rol FUNCIONARIO (no está en los por defecto)
    let funcionarioRol = await Rol.findOne({ where: { nombre: 'FUNCIONARIO' } });
    if (!funcionarioRol) {
      funcionarioRol = await Rol.create({ nombre: 'FUNCIONARIO' });
      console.log('✅ Rol FUNCIONARIO creado');
    }

    // 2. Obtener roles necesarios
    const aprendizRol = await Rol.findOne({ where: { nombre: 'APRENDIZ' } });
    const instructorRol = await Rol.findOne({ where: { nombre: 'INSTRUCTOR' } });
    const adminRol = await Rol.findOne({ where: { nombre: 'ADMINISTRADOR' } });
    const vigilanteRol = await Rol.findOne({ where: { nombre: 'VIGILANTE' } });

    if (!aprendizRol || !instructorRol) {
      console.error('❌ Roles APRENDIZ o INSTRUCTOR no encontrados');
      return;
    }

    // 3. Usuarios de prueba: 20 en total distribuidos
    //    - 4 Aprendices (SIN password_hash por acuerdo)
    //    - 8 Funcionarios (SIN password_hash por acuerdo)
    //    - 8 Instructores (SIN password_hash por acuerdo)
    //    (No agregamos más admin/vigilante para no repetir docs existentes: 1143387774 y 1000000001)
    const usuariosPrueba = [];

    // --- APRENDICES (4 usuarios) --- SIN password_hash
    for (let i = 1; i <= 4; i++) {
      const doc = `55555555${i}`;
      usuariosPrueba.push({
        numero_documento: doc,
        tipo_documento: 'CC',
        nombre_completo: `Aprendiz Test ${i}`,
        id_rol: aprendizRol.id_rol,
        telefono_contacto: `300111${i}${i}`,
        contacto_emergencia: `300222${i}${i}`,
        // NOTA: password_hash NO se incluye - estos usuarios operan sin contraseña local
      });
    }

    // --- FUNCIONARIOS (8 usuarios) --- SIN password_hash
    for (let i = 1; i <= 8; i++) {
      const doc = `44444444${i}`;
      usuariosPrueba.push({
        numero_documento: doc,
        tipo_documento: 'CC',
        nombre_completo: `Funcionario Test ${i}`,
        id_rol: funcionarioRol.id_rol,
        telefono_contacto: `300333${i}${i}`,
        contacto_emergencia: `300444${i}${i}`,
        // NOTA: password_hash NO se incluye - estos usuarios operan sin contraseña local
      });
    }

    // --- INSTRUCTORES (8 usuarios) --- SIN password_hash
    for (let i = 1; i <= 8; i++) {
      const doc = `3333333${i}`;
      usuariosPrueba.push({
        numero_documento: doc,
        tipo_documento: 'CC',
        nombre_completo: `Instructor Test ${i}`,
        id_rol: instructorRol.id_rol,
        telefono_contacto: `300555${i}${i}`,
        contacto_emergencia: `300666${i}${i}`,
        // NOTA: password_hash NO se incluye - estos usuarios operan sin contraseña local
      });
    }

    // 4. Crear todos los usuarios en lote
    await Usuario.bulkCreate(usuariosPrueba, { validateBeforeSave: true });

    console.log('✅ 20 usuarios de prueba creados correctamente');
    console.log('   - 4 Aprendices (doc: 5555555501-5555555504) - SIN password local');
    console.log('   - 8 Funcionarios (doc: 4444444401-4444444408) - SIN password local');
    console.log('   - 8 Instructores (doc: 3333333001-3333333008) - SIN password local');
    console.log('✅ Solo los roles ADMINISTRADOR y VIGILANTE tienen credenciales de acceso');
    console.log('⚠️  Estos usuarios usan autenticación externa o flujos sin password');

  } catch (error) {
    console.error('❌ Error al crear usuarios de prueba:', error.message);
  }
};

(async () => {
  await seedUsuariosPrueba();
})();

module.exports = seedUsuariosPrueba;