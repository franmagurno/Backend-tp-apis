const express = require('express');
const { createProject, getGroupsByUserId, addMemberToProject } = require('../controllers/projects'); // Importar la nueva funcionalidad
const { authenticate } = require('../middlewares/authenticate'); // Importar el middleware de autenticación
const router = express.Router();

// Endpoints para proyectos protegidos con autenticación
router.post('/create', authenticate, createProject); // Crear proyecto
router.get('/user/:id/groups', authenticate, getGroupsByUserId); // Obtener grupos asociados a un usuario
router.post('/add-member', authenticate, addMemberToProject); // Agregar miembro a un proyecto

module.exports = router;
