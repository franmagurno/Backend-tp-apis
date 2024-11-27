const jwt = require('jsonwebtoken'); // Importar JSON Web Token 
const userService = require('../services/users'); // Importa los servicios
const User = require('../db/models/users'); // Asegúrate de que la ruta sea correcta
const upload = require('../middlewares/upload');
const bcrypt = require('bcrypt');
const uploadSingle = upload.single('foto_perfil'); // Cambia 'profilePhoto' por 'foto_perfil'

exports.registerUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await User.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      foto_perfil: fotoPerfil,
    });

    // Generate a token for the new user
    const token = jwt.sign(
      { id_usuario: user.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        foto_perfil: user.foto_perfil,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor." });
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
  const { correo, contrasena } = req.body;

  try {
    // Busca el usuario por correo
    const usuario = await User.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    // Compara la contraseña ingresada con el hash almacenado
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    // Genera un token JWT si la contraseña es correcta
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, usuario });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
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
