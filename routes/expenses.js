const express = require('express');
const { createExpense, getExpenses, getExpenseById, deleteExpense } = require('../controllers/expenses');
const router = express.Router();

// Rutas para gastos
router.post('/create', createExpense); // Crear un gasto
router.get('/', getExpenses); // Obtener todos los gastos
router.get('/:id', getExpenseById); // Obtener un gasto por ID
router.delete('/:id', deleteExpense); // Eliminar un gasto por ID

module.exports = router;
