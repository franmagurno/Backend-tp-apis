const Report = require('../db/models/report');

// Controlador: Crear un nuevo reporte
exports.createReport = async (req, res) => {
  try {
    const { id_proyecto, total_gastos, detalles } = req.body;
    const report = await Report.create({ id_proyecto, total_gastos, detalles });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear reporte' });
  }
};

// Controlador: Obtener todos los reportes de un proyecto
exports.getReports = async (req, res) => {
  try {
    const { id_proyecto } = req.query; // Filtrar por proyecto (opcional)
    const where = id_proyecto ? { id_proyecto } : {};
    const reports = await Report.findAll({ where });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
};

// Controlador: Obtener un reporte por ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
};
