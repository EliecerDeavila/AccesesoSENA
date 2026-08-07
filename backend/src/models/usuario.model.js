const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Rol = require('./rol.model');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_documento: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  tipo_documento: {
    type: DataTypes.ENUM('CC', 'TI', 'CE', 'PA'),
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rol,
      key: 'id_rol'
    }
  },
  telefono_contacto: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  contacto_emergencia: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  eliminado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

module.exports = Usuario;
