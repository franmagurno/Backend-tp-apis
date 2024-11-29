const Ticket= require('../services/tickets');
const upload = require('../middlewares/upload'); // Middleware de subida de archivos

// Crear un ticket
exports.createTicket = async (req, res) => {
  try {
    const {
      id_proyecto,
      id_usuario,
      fecha_compra,
      monto_total,
      descripcion,
      division_type,
      porcentajes,
    } = req.body;

    const imagenPath = req.file ? `/uploads/${req.file.filename}` : null;

    const ticket = await Ticket.createTicket({
      id_proyecto,
      id_usuario,
      fecha_compra,
      monto_total,
      imagen: imagenPath, // Guarda la ruta de la imagen
      descripcion,
      division_type,
      porcentajes: division_type === 'porcentajes' ? porcentajes : null,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error al crear el ticket:', error);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
};

// Obtener tickets por ID de proyecto
exports.getTicketsByProjectId = async (req, res) => {
  try {
    const { id_proyecto } = req.params;

    const tickets = await Ticket.getTicketsByProjectId(id_proyecto);

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tickets para este proyecto.' });
    }

    const ticketsWithImageURL = tickets.map((ticket) => ({
      ...ticket.toJSON(), // Convertir el modelo Sequelize a JSON puro
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

// Eliminar un ticket
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
