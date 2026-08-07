const Rol = require('../models/rol.model');

const rolesPorDefecto = [
  'ADMINISTRADOR',
  'VIGILANTE',
  'APRENDIZ',
  'INSTRUCTOR',
  'VISITANTE',
  'CONTRATISTA'
];

const seedRoles = async () => {
  try {
    for (const nombre of rolesPorDefecto) {
      await Rol.findOrCreate({
        where: { nombre },
        defaults: { nombre }
      });
    }
    console.log('✅ Roles creados correctamente');
  } catch (error) {
    console.error('❌ Error al crear roles:', error.message);
  }
};

module.exports = seedRoles;
