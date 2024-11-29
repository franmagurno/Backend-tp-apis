const Ticket = require('../db/models/tickets');  // Importar el modelo Ticket
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
    // Si la división es equitativa, calculamos el porcentaje de cada miembro
    if (division_type === 'equitativo') {
      // Aseguramos que no haya porcentajes proporcionados para la división equitativa
      porcentajes = []; // Limpiamos los porcentajes ya que se manejarán internamente
    }

    // Crear el ticket en la base de datos
    const ticket = await Ticket.create({
      id_proyecto,
      id_usuario,
      fecha_compra,
      monto_total,
      imagen,
      division_type,
      porcentajes: division_type === 'porcentajes' ? porcentajes : null,  // Solo asignamos porcentajes si es tipo 'porcentajes'
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
  try {
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
  } catch (error) {
    console.error('Error al obtener los tickets del proyecto:', error);
    throw new Error('Error al obtener los tickets del proyecto.');
  }
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
