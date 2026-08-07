const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./usuario.model');

const Acceso = sequelize.define('Acceso', {
  id_acceso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_entrada: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_salida: {
    type: DataTypes.TIME,
    allowNull: true
  },
  motivo_visita: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  registrado_por: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'accesos',
  timestamps: false
});

module.exports = Acceso;
