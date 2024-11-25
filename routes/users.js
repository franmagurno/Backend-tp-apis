const express = require('express');
const router = express.Router();
const userController = require('../controllers/users'); // Importa el controlador
const { authenticate } = require('../middlewares/authenticate'); // Importa el middleware de autenticación
const upload = require('../middlewares/upload'); // Configuración de multer


console.log(userController); // Verifica que las funciones estén correctamente importadas

// Ruta para registrar un usuario con subida de archivo
router.post('/register', upload.single('foto_perfil'), userController.registerUser);

// Ruta para iniciar sesión
router.post('/login', userController.loginUser);

// Ruta para obtener usuario por email (Protegida)
router.get('/email', authenticate, userController.getUserByEmail);

// Ruta para actualizar perfil (Protegida)
router.put('/profile', authenticate, userController.updateProfile);

// Ruta para cambiar contraseña (Protegida)
router.put('/password', authenticate, userController.changePassword);

// Ruta para eliminar cuenta (Protegida)
router.delete('/delete', authenticate, userController.deleteAccount);

module.exports = router;
