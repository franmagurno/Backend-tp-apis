const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Conexión a la base de datos

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_proyecto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_gastos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  detalles: {
    type: DataTypes.JSON, // Resumen de contribuciones en formato JSON
    allowNull: true,
  },
  fecha_generacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Report;
