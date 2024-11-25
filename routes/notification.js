const express = require('express');
const {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
  getUnreadNotifications,
} = require('../controllers/notification');
const { authenticate } = require('../middlewares/authenticate'); // Importa el middleware de autenticación
const router = express.Router();

// Rutas para notificaciones protegidas con authenticate
router.post('/create', authenticate, createNotification); // Crear una nueva notificación
router.get('/', authenticate, getNotifications); // Obtener todas las notificaciones (con filtro opcional por usuario)
router.get('/unread', authenticate, getUnreadNotifications); // Obtener todas las notificaciones no leídas de un usuario
router.get('/:id', authenticate, getNotificationById); // Obtener una notificación específica por ID
router.patch('/:id/read', authenticate, markAsRead); // Marcar una notificación como leída
router.delete('/:id', authenticate, deleteNotification); // Eliminar una notificación por ID

module.exports = router;
