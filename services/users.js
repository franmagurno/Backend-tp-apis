const User = require('../db/models/users');
const bcrypt = require('bcrypt');

// Servicio: Buscar usuario por email
const findUserByEmail = async (correo) => {
  return await User.findOne({ where: { correo } });
};

// Servicio: Crear un usuario
const createUser = async ({ nombre, correo, contrasena }) => {
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  return await User.create({ nombre, correo, contrasena: hashedPassword, ultimo_acceso: null });
};

// Servicio: Obtener todos los usuarios
const getAllUsers = async () => {
  return await User.findAll();
};

// Servicio: Actualizar último acceso
const updateLastAccess = async (id_usuario) => {
  const user = await User.findByPk(id_usuario);
  if (user) {
    user.ultimo_acceso = new Date();
    await user.save();
  }
};

// Servicio: Actualizar usuario
const updateUser = async (id_usuario, data) => {
  const user = await User.findByPk(id_usuario);
  if (!user) throw new Error('Usuario no encontrado.');
  return await user.update(data);
};

// Servicio: Cambiar contraseña
const changeUserPassword = async (id_usuario, contrasena_actual, nueva_contrasena) => {
  const user = await User.findByPk(id_usuario);
  if (!user) throw new Error('Usuario no encontrado.');

  const isMatch = await bcrypt.compare(contrasena_actual, user.contrasena);
  if (!isMatch) throw new Error('La contraseña actual es incorrecta.');

  const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
  user.contrasena = hashedPassword;
  await user.save();
};

// Servicio: Eliminar usuario
const deleteUser = async (id_usuario) => {
  const user = await User.findByPk(id_usuario);
  if (!user) throw new Error('Usuario no encontrado.');
  await user.destroy();
};

module.exports = {
  findUserByEmail,
  createUser,
  getAllUsers,
  updateLastAccess,
  updateUser,
  changeUserPassword,
  deleteUser,
};
