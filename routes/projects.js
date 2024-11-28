const express = require('express');
const { createProject, getGroupsByUserId, addMemberToProject, deleteProject, getMembersByGroupId, deleteMemberFromGroup } = require('../controllers/projects'); // Importar la nueva funcionalidad
const { authenticate } = require('../middlewares/authenticate'); // Importar el middleware de autenticación
const router = express.Router();

// Endpoints para proyectos protegidos con autenticación
router.post('/create', authenticate, createProject); // Crear proyecto
router.get('/user/:id/groups', authenticate, getGroupsByUserId); // Obtener grupos asociados a un usuario
router.post('/group/:id_grupo/add-member', authenticate, addMemberToProject); // Nueva ruta
 // Agregar miembro a un proyecto
router.delete('/delete/:id_grupo',deleteProject);
router.get('/group/:id_grupo/members', authenticate, getMembersByGroupId); 
router.delete('/projects/group/:id_grupo/member/:id_usuario', deleteMemberFromGroup);

module.exports = router;
