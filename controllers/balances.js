const { closeBalance, getBalanceByGroupId } = require('../services/balances'); // Importa los servicios correspondientes

// Controlador para cerrar el balance de un grupo
exports.closeBalance = async (req, res) => {
  try {
    const { groupId } = req.params; // Obtienes el ID del grupo desde los parámetros

    if (!groupId) {
      return res.status(400).json({ error: 'El ID del grupo es obligatorio.' });
    }

    // Llamamos al servicio `closeBalance` que maneja la lógica del cálculo y actualización
    const result = await closeBalance(groupId);

    // Asegúrate de que el resultado del servicio contiene la información que esperamos
    if (result && result.message) {
      return res.status(200).json({ message: result.message, transactions: result.transactions || [] });
    } else {
      return res.status(400).json({ error: 'Hubo un problema al procesar el cierre del balance.' });
    }
  } catch (error) {
    console.error('Error en el controlador closeBalance:', error.message);
    return res.status(500).json({ error: 'Error al cerrar balance. Por favor, intente nuevamente.' });
  }
};

// Controlador para obtener los balances por grupo
exports.getBalanceByGroupId = async (req, res) => {
  try {
    console.log('Inicio del controlador - req.params:', req.params);

    const { groupId } = req.params; // Obtener el ID del grupo desde los parámetros de la URL

    // Verificar si el groupId está presente y es válido
    if (!groupId || isNaN(groupId)) {
      return res.status(400).json({ error: 'El ID del grupo es obligatorio y debe ser un número válido.' });
    }

    console.log('Antes de llamar al servicio getBalanceByGroupId - groupId:', groupId);

    // Llamar al servicio getBalanceByGroupId para obtener los balances
    const result = await getBalanceByGroupId(groupId);

    console.log('Resultado del servicio getBalanceByGroupId - result:', result);

    // Si se encuentran balances, devolverlos al cliente
    if (result && result.length > 0) {
      return res.status(200).json(result);
    }

    // Si no se encuentran balances, retornar un mensaje apropiado
    return res.status(404).json({ message: 'No se encontraron balances para este grupo.' });
  } catch (error) {
    console.error('Error en el controlador getBalanceByGroupId:', error.message);
    return res.status(500).json({ error: 'Error interno al obtener balances. Por favor, intente nuevamente.' });
  }
};
