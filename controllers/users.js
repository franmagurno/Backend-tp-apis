const userService = require('../services/users'); // Importa los servicios
const User = require('../db/models/users'); // Asegúrate de que la ruta sea correcta
const upload = require('../middlewares/upload');
const bcrypt = require('bcrypt');
const uploadSingle = upload.single('foto_perfil'); // Cambia 'profilePhoto' por 'foto_perfil'

exports.registerUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await User.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      foto_perfil: fotoPerfil,
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Controlador: Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};

// Controlador: Obtener usuario por email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio.' });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};



exports.loginUser = async (req, res) => {
  console.log("Request body:", req.body); 
  const { correo, contrasena } = req.body;

  try {
    // Buscar al usuario por correo
    const user = await User.findOne({ where: { correo } });
    if (!user) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Verificar si la contraseña es válida
    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Actualizar el último acceso
    user.ultimo_acceso = new Date();
    await user.save(); // Guardar los cambios en la base de datos

    // Responder con los datos del usuario
    res.json({
      message: "Inicio de sesión exitoso",
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        ultimo_acceso: user.ultimo_acceso, // Devuelve el último acceso actualizado
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Controlador: Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { nombre, correo } = req.body;

    if (!nombre && !correo) {
      return res.status(400).json({ error: 'Debe proporcionar un nombre o correo para actualizar.' });
    }

    const updatedUser = await userService.updateUser(id_usuario, { nombre, correo });
    res.status(200).json({ message: 'Perfil actualizado exitosamente.', updatedUser });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador: Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { contrasena_actual, nueva_contrasena } = req.body;

    if (!contrasena_actual || !nueva_contrasena) {
      return res.status(400).json({ error: 'Debe proporcionar la contraseña actual y la nueva contraseña.' });
    }

    await userService.changeUserPassword(id_usuario, contrasena_actual, nueva_contrasena);
    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

// Controlador: Eliminar cuenta
exports.deleteAccount = async (req, res) => {
  try {
    const { id_usuario } = req.user;

    await userService.deleteUser(id_usuario);
    res.status(200).json({ message: 'Cuenta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
