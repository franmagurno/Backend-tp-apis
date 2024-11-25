const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path'); // Importa el módulo path
const { sequelize } = require('./db/models');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const ticketRoutes = require('./routes/tickets');
const notificationsRoutes = require('./routes/notification');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

app.use((req, res, next) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  next();
});

// Middleware global
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(morgan('dev'));

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Sirviendo la carpeta 'uploads' como estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationsRoutes);

// Prueba de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Verificar conexión a la base de datos
sequelize.authenticate()
  .then(() => console.log('Conexión a la base de datos establecida exitosamente'))
  .catch((error) => console.error('Error al conectar a la base de datos:', error));

// Sincronizar modelos
sequelize.sync({ alter: isDev })
  .then(() => console.log('Modelos sincronizados con la base de datos'))
  .catch((error) => console.error('Error al sincronizar modelos:', error));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error interno:', err);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map(e => e.message) });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

// Ruta de fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
