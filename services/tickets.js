const Ticket = require('../db/models/tickets');
const TicketMember = require('../db/models/ticketMembers'); // Modelo de TicketMember
const sequelize = require('../db/db'); // Para transacciones

// Servicio: Crear un ticket
const createTicket = async ({ id_proyecto, id_usuario, fecha_compra, monto_total, imagen, division_type, members }) => {
  // Crear el ticket primero
  const ticket = await Ticket.create({
    id_proyecto,
    id_usuario,
    fecha_compra,
    monto_total,
    imagen,
    division_type,
  });

  // Si hay members y division_type es 'porcentajes', insertar los miembros
  if (division_type === 'porcentajes' && members) {
    const memberRecords = members.map(member => ({
      id_ticket: ticket.id_ticket, // Usa el ID del ticket recién creado
      id_usuario: member.member_id, // Corresponde al campo 'id_usuario' en la tabla
      porcentaje: member.porcentaje,
    }));
    
    await TicketMember.bulkCreate(memberRecords);
  }

  return ticket;
};

// Servicio: Obtener tickets por ID de proyecto
const getTicketsByProjectId = async (id_proyecto) => {
  return await Ticket.findAll({
    where: { id_proyecto },
    include: [
      {
        model: TicketMember,
        as: 'members', // Alias definido en las relaciones del modelo
      },
    ],
  });
};

// Servicio: Eliminar un ticket
const deleteTicket = async (id_ticket) => {
  const transaction = await sequelize.transaction(); // Inicia una transacción
  try {
    // Eliminar primero los miembros asociados
    await TicketMember.destroy({ where: { ticket_id: id_ticket }, transaction });

    // Luego eliminar el ticket
    const deleted = await Ticket.destroy({ where: { id_ticket }, transaction });

    // Confirmar la transacción
    await transaction.commit();

    return deleted > 0; // Devuelve true si se eliminó, false si no
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createTicket,
  getTicketsByProjectId,
  deleteTicket,
};
