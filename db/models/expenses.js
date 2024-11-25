const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Conexión a la base de datos

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_ticket: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  asignado_a: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Expense;
