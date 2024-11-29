const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ClosedBalance = sequelize.define(
  'ClosedBalance',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proyectos', // Nombre de la tabla referenciada
        key: 'id_proyecto',
      },
    },
    user_from: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios', // Nombre de la tabla referenciada
        key: 'id_usuario',
      },
    },
    user_to: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios', // Nombre de la tabla referenciada
        key: 'id_usuario',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'saldado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
  },
  {
    tableName: 'closed_balances',
    timestamps: false, // Deshabilitar `createdAt` y `updatedAt`
  }
);

module.exports = ClosedBalance;
