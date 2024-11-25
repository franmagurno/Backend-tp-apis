const express = require('express');
const { createReport, getReports, getReportById } = require('../controllers/reports');
const router = express.Router();

// Rutas para reportes
router.post('/create', createReport); // Crear un reporte
router.get('/', getReports); // Obtener todos los reportes
router.get('/:id', getReportById); // Obtener un reporte por ID

module.exports = router;
