require('dotenv').config(); // Para cargar variables de entorno
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize'); // Asegúrate de tener Sequelize instalado
const Usuario = require('./db/models/users'); // Cambia la ruta según tu modelo de usuarios

// Función para generar un token
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('La variable JWT_SECRET no está definida en el entorno.');
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

// Función principal para generar tokens para todos los usuarios
const generateTokensForAllUsers = async () => {
  try {
    // Configura tu conexión con la base de datos
    const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'mysql', // Cambia según tu base de datos: 'mysql', 'postgres', etc.
    });

    // Conecta con la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Obtener todos los usuarios de la base de datos
    const usuarios = await Usuario.findAll();

    // Generar un token para cada usuario
    const tokens = usuarios.map((usuario) => {
      const payload = {
        id: usuario.id_usuario, // Cambia según los campos de tu modelo
        nombre: usuario.nombre,
        correo: usuario.correo,
      };
      return { usuario: usuario.nombre, token: generateToken(payload) };
    });

    // Mostrar los tokens generados
    tokens.forEach(({ usuario, token }) => {
      console.log(`Token para ${usuario}: ${token}`);
    });

    // Cerrar conexión con la base de datos
    await sequelize.close();
    console.log('Conexión a la base de datos cerrada correctamente.');
  } catch (error) {
    console.error('Error al generar tokens:', error.message);
  }
};

// Ejecutar la función si se llama directamente
if (require.main === module) {
  generateTokensForAllUsers();
}

module.exports = { generateToken };
