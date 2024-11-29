const express = require('express');
const { getBalanceByGroupId, closeBalance } = require('../controllers/balances');

const router = express.Router();

// Ruta para obtener los balances de un grupo
router.get('/groups/:groupId', getBalanceByGroupId);

// Ruta para cerrar el balance de un grupo
router.post('/groups/:groupId/close-balance', closeBalance);

module.exports = router;
