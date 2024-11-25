const ticketService = require('../services/tickets');
const upload = require('../middlewares/upload'); // Middleware de subida de archivos

exports.createTicket = async (req, res) => {
  try {
    const { id_proyecto, id_usuario, monto_total } = req.body;

    if (!id_proyecto || !id_usuario || !monto_total) {
      return res.status(400).json({ error: 'Se requieren id_proyecto, id_usuario y monto_total' });
    }

    const fecha_compra = req.body.fecha_compra || new Date().toISOString();
    const imagenPath = req.file ? `/uploads/${req.file.filename}` : null;

    const ticket = await ticketService.createTicket({
      id_proyecto,
      id_usuario,
      fecha_compra,
      monto_total,
      imagen: imagenPath,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error al crear el ticket:', error);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
};

exports.getTicketsByProjectId = async (req, res) => {
  try {
    const { id_proyecto } = req.params;

    const tickets = await ticketService.getTicketsByProjectId(id_proyecto);

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tickets para este proyecto.' });
    }

    const ticketsWithImageURL = tickets.map((ticket) => ({
      ...ticket,
      imagen_url: ticket.imagen
        ? `${req.protocol}://${req.get('host')}${ticket.imagen}`
        : null,
    }));

    res.json(ticketsWithImageURL);
  } catch (error) {
    console.error('Error al obtener los tickets por proyecto:', error);
    res.status(500).json({ error: 'Error al obtener tickets por proyecto' });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ticketService.deleteTicket(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json({ message: 'Ticket eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ticket:', error);
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
};
