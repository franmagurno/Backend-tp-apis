const Expense = require('../db/models/expenses');

// Controlador: Crear un nuevo gasto
exports.createExpense = async (req, res) => {
  try {
    const { id_ticket, descripcion, monto, asignado_a } = req.body;
    const expense = await Expense.create({ id_ticket, descripcion, monto, asignado_a });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear gasto' });
  }
};

// Controlador: Obtener todos los gastos
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

// Controlador: Obtener un gasto por ID
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener gasto' });
  }
};

// Controlador: Eliminar un gasto
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.destroy({ where: { id } });
    if (!expense) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};
