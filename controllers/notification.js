const notificationService = require('../services/notifications');

// Crear una nueva notificación
exports.createNotification = async (req, res) => {
  try {
    const { id_usuario, mensaje, id_tipo } = req.body;

    const notification = await notificationService.createNotification({
      id_usuario,
      mensaje,
      id_tipo,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear la notificación:', error);
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
};

// Obtener todas las notificaciones (con filtro opcional por usuario)
exports.getNotifications = async (req, res) => {
  try {
    const { id_usuario } = req.query;

    const notifications = await notificationService.getNotifications(id_usuario);
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// Obtener una notificación por ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    res.status(500).json({ error: 'Error al obtener notificación' });
  }
};

// Marcar una notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ message: 'Notificación marcada como leída', notification });
  } catch (error) {
    console.error('Error al actualizar notificación:', error);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
};

// Eliminar una notificación
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await notificationService.deleteNotification(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};

// Obtener notificaciones no leídas de un usuario
exports.getUnreadNotifications = async (req, res) => {
  try {
    const { id_usuario } = req.query;

    if (!id_usuario) {
      return res.status(400).json({ error: 'Se requiere id_usuario' });
    }

    const notifications = await notificationService.getUnreadNotifications(id_usuario);
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
  }
};
