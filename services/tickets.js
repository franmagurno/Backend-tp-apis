const Ticket = require('../db/models/tickets');
const sequelize = require('../db/db');

// Servicio: Crear un ticket
const createTicket = async ({
  id_proyecto,
  id_usuario,
  fecha_compra,
  monto_total,
  imagen,
  division_type,
  porcentajes,
  descripcion,
}) => {
  try {
    const ticket = await Ticket.create({
      id_proyecto,
      id_usuario,
      fecha_compra,
      monto_total,
      imagen,
      division_type,
      porcentajes: division_type === 'porcentajes' ? porcentajes : null,
      descripcion,
    });

    if (!ticket) {
      throw new Error('No se pudo crear el ticket.');
    }

    return ticket;
  } catch (error) {
    console.error('Error al crear el ticket:', error);
    throw new Error(`Error al crear el ticket: ${error.message}`);
  }
};

// Servicio: Obtener tickets por ID de proyecto
const getTicketsByProjectId = async (id_proyecto) => {
  return await Ticket.findAll({
    where: { id_proyecto },
    attributes: [
      'id_ticket',
      'id_proyecto',
      'id_usuario',
      'fecha_compra',
      'monto_total',
      'imagen',
      'division_type',
      'porcentajes',
      'descripcion',
    ], // Asegúrate de incluir los campos necesarios
  });
};

// Servicio: Eliminar un ticket
const deleteTicket = async (id_ticket) => {
  try {
    const deleted = await Ticket.destroy({ where: { id_ticket } });
    return deleted > 0; // Devuelve true si se eliminó, false si no
  } catch (error) {
    console.error('Error al eliminar el ticket:', error);
    throw new Error('Error al eliminar el ticket.');
  }
};

module.exports = {
  createTicket,
  getTicketsByProjectId,
  deleteTicket,
};
