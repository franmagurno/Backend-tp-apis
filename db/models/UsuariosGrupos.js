const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Asegura la ruta correcta
const User = require('./users');
const Project= require('./projects');
const UsuariosGrupos = sequelize.define('UsuariosGrupos', {
  id_usuario_grupo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id_usuario',
    },
    allowNull: false,
  },
  id_grupo: {
    type: DataTypes.INTEGER,
    references: {
      model: Project,
      key: 'id',
    },
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'Usuarios_Grupos',
  timestamps: true,
});

module.exports = UsuariosGrupos;
