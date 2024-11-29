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

exports.changePassword = async (req, res) => {
  try {
    // Obtener el token desde los headers
    const token = req.headers.authorization?.split(' ')[1]; // Token en formato "Bearer <token>"
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar y decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const { id_usuario } = decoded; // Obtener el id_usuario del token
    const { contrasena_actual, nueva_contrasena } = req.body;

    // Validación de los campos de contraseña
    if (!contrasena_actual || !nueva_contrasena) {
      return res.status(400).json({ error: 'Debe proporcionar la contraseña actual y la nueva contraseña.' });
    }

    // Buscar al usuario por id_usuario
    const usuario = await userService.getUserById(id_usuario);
    console.log('Usuario encontrado:', usuario); // Verifica si el usuario fue encontrado
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Verificar si la contraseña actual proporcionada es correcta
    const passwordMatch = await bcrypt.compare(contrasena_actual, usuario.contrasena);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);

    // Actualizar la contraseña en la base de datos
    await userService.updatePassword(id_usuario, hashedPassword);

    // Responder con éxito
    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
};



exports.deleteAccount = async (req, res) => {
  try {
    const { id_usuario } = req.params; // Obtén el id_usuario desde los parámetros de la URL

    // Verifica si el ID fue enviado
    if (!id_usuario) {
      return res.status(400).json({ error: 'El ID del usuario es obligatorio.' });
    }

    // Busca el usuario por su ID
    const user = await User.findByPk(id_usuario); // Reemplaza "User" con el modelo correcto
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Elimina el usuario
    await user.destroy(); // Método directo en la instancia del modelo para eliminarlo

    res.status(200).json({ message: 'Cuenta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const { id_usuario } = req.params; // Aquí obtienes el parámetro de la URL
    const user = await User.findByPk(id_usuario); // Asegúrate de usar la consulta correcta para obtener el usuario por ID

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para actualizar la foto de perfil
exports.updateProfilePicture = async (req, res) => {
  try {
    // Obtenemos el id_usuario desde `req.user` que debe ser configurado por un middleware de autenticación (JWT)
    const { id_usuario } = req.user; // Asegúrate de que req.user esté siendo llenado con el usuario autenticado

    if (!id_usuario) {
      return res.status(400).json({ error: 'Usuario no autenticado.' });
    }

    // Verificamos si un archivo fue enviado en la solicitud
    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

    if (!fotoPerfil) {
      return res.status(400).json({ error: 'No se proporcionó una foto de perfil.' });
    }

    // Llamamos al servicio para actualizar la foto de perfil del usuario en la base de datos
    const updatedUser = await userService.updateUser(id_usuario, { foto_perfil: fotoPerfil });

    // Respondemos con el usuario actualizado, incluyendo la nueva foto de perfil
    res.status(200).json({
      message: 'Foto de perfil actualizada correctamente.',
      usuario: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    res.status(500).json({ error: 'Error al actualizar la foto de perfil.' });
  }
};
