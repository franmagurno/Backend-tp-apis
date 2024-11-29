const { closeBalance, getBalanceByGroupId} = require('../services/balances');

// Obtener balances por proyecto (group_id)exports.closeBalance = async (req, res) => {
  exports.closeBalance = async (req, res) => {
    try {
      console.log('Inicio del controlador - req.params:', req.params);
  
      const { groupId } = req.params;
  
      if (!groupId) {
        return res.status(400).json({ error: 'El ID del grupo es obligatorio.' });
      }
  
      console.log('Antes de llamar al servicio - groupId:', groupId);
  
      const result = await closeBalance(groupId);
  
      console.log('Resultado del servicio - result:', result);
  
      return res.status(200).json(result); // Devolver el resultado al cliente
    } catch (error) {
      console.error('Error en el controlador closeBalance:', error.message);
      return res.status(500).json({ error: 'Error interno al cerrar balance.' });
    }
  };
  
  exports.getBalanceByGroupId = async (req, res) => {
    try {
      console.log('Inicio del controlador - req.params:', req.params);
  
      const { groupId } = req.params;
  
      if (!groupId) {
        return res.status(400).json({ error: 'El ID del grupo es obligatorio.' });
      }
  
      console.log('Antes de llamar al servicio getBalanceByGroupId - groupId:', groupId);
  
      const result = await getBalanceByGroupId(groupId);
  
      console.log('Resultado del servicio getBalanceByGroupId - result:', result);
  
      return res.status(200).json(result); // Devolver el resultado al cliente
    } catch (error) {
      console.error('Error en el controlador getBalanceByGroupId:', error.message);
      return res.status(500).json({ error: 'Error interno al obtener balances.' });
    }
  };
  
  