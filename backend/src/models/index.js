const Rol = require('./rol.model');
const Usuario = require('./usuario.model');
const Acceso = require('./acceso.model');

Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });

Usuario.hasMany(Acceso, { foreignKey: 'id_usuario', as: 'accesos' });
Acceso.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

module.exports = { Rol, Usuario, Acceso };
