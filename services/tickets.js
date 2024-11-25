const Ticket = require('../db/models/tickets');

// Servicio: Crear un ticket
const createTicket = async ({ id_proyecto, id_usuario, fecha_compra, monto_total, imagen }) => {
  return await Ticket.create({
    id_proyecto,
    id_usuario,
    fecha_compra,
    monto_total,
    imagen,
  });
};

// Servicio: Obtener tickets por ID de proyecto
const getTicketsByProjectId = async (id_proyecto) => {
  return await Ticket.findAll({
    where: { id_proyecto },
  });
};

// Servicio: Eliminar un ticket
const deleteTicket = async (id_ticket) => {
  const deleted = await Ticket.destroy({ where: { id_ticket } });
  return deleted > 0; // Devuelve true si se eliminó, false si no
};

module.exports = {
  createTicket,
  getTicketsByProjectId,
  deleteTicket,
};
