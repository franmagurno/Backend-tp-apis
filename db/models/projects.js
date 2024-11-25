const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Project = sequelize.define(
  'Project',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_creador: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'proyectos',
    timestamps: true,
  }
);

module.exports = Project;