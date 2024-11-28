const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Conexión a la base de datos
const Ticket = require('./tickets')
const TicketMember = sequelize.define('TicketMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_ticket: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ticket, // El modelo de referencia
        key: 'id_ticket', // La clave foránea apunta a `id_ticket` en el modelo `Ticket`
      },
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  }, {
    tableName: 'ticket_members',
    timestamps: false,
  });
  
  module.exports = TicketMember;
  
