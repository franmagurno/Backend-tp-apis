const Ticket = require('../db/models/tickets'); // Importar el modelo Ticket
const Usuario = require('../db/models/users'); // Importar Usuario
const ClosedBalance = require('../db/models/closedBalances'); // Importar ClosedBalance

// Servicio para cerrar el balance
// Servicio para cerrar el balance
exports.closeBalance = async (groupId) => {
  try {
    console.log('Servicio closeBalance - groupId:', groupId);

    // Obtener todos los tickets del grupo
    const tickets = await Ticket.findAll({
      where: { id_proyecto: groupId },
      attributes: ['id_usuario', 'monto_total', 'porcentajes', 'division_type', 'id_ticket'], // Incluir los campos necesarios
    });

    if (tickets.length === 0) {
      console.log('No se encontraron tickets para el proyecto:', groupId);
      return { message: 'No hay tickets asociados a este proyecto.' };
    }

    const userBalances = {}; // Objeto para almacenar balances entre usuarios

    // Procesar cada ticket
    tickets.forEach((ticket) => {
      const { id_usuario: idPagador, monto_total, porcentajes, division_type } = ticket;

      if (!porcentajes || !Array.isArray(porcentajes)) {
        console.warn(`El ticket ${ticket.id_ticket} no tiene porcentajes válidos.`);
        return; // Ignorar este ticket si los porcentajes son nulos o no son un arreglo
      }

      if (division_type === 'equitativo') {
        const miembros = porcentajes.length; // Número de miembros en la división
        const montoEquitativo = monto_total / miembros;

        porcentajes.forEach((miembro) => {
          const { id_usuario: idMiembro } = miembro;

          if (idMiembro !== idPagador) {
            if (!userBalances[idPagador]) userBalances[idPagador] = { debe: 0, recibe: 0 };
            if (!userBalances[idMiembro]) userBalances[idMiembro] = { debe: 0, recibe: 0 };

            userBalances[idPagador].recibe += montoEquitativo;  // Lo que recibe el pagador
            userBalances[idMiembro].debe += montoEquitativo;   // Lo que debe el miembro
          }
        });
      } else if (division_type === 'porcentajes') {
        porcentajes.forEach((miembro) => {
          const { id_usuario: idMiembro, porcentaje } = miembro;
          const debePagar = (monto_total * porcentaje) / 100;

          if (idMiembro !== idPagador) {
            if (!userBalances[idPagador]) userBalances[idPagador] = { debe: 0, recibe: 0 };
            if (!userBalances[idMiembro]) userBalances[idMiembro] = { debe: 0, recibe: 0 };

            userBalances[idPagador].recibe += debePagar;  // Lo que recibe el pagador
            userBalances[idMiembro].debe += debePagar;   // Lo que debe el miembro
          }
        });
      }
    });

    console.log('Balances calculados:', userBalances);

    const transactions = [];

    // Crear o actualizar transacciones para registrar en closed_balances
    for (const [idUsuario, balance] of Object.entries(userBalances)) {
      if (balance.debe > 0) {
        // Si el usuario debe algo, el monto debe ser negativo (deuda)
        transactions.push({
          group_id: groupId,
          user_from: idUsuario,  // Usuario que debe
          user_to: idUsuario,    // El mismo usuario (porque es la deuda)
          amount: (-balance.debe).toFixed(2),  // El monto a pagar es negativo
          estado: 'pendiente',
        });
      }

      if (balance.recibe > 0) {
        // Si el usuario recibe algo, el monto debe ser positivo (crédito)
        transactions.push({
          group_id: groupId,
          user_from: idUsuario,  // El que recibe el dinero
          user_to: idUsuario,    // El mismo usuario (porque es el crédito)
          amount: balance.recibe.toFixed(2), // El monto a recibir es positivo
          estado: 'pendiente',
        });
      }
    }

    // Actualizar los balances en la tabla `closed_balances`
    for (const transaction of transactions) {
      // Verificar si ya existe un balance entre los usuarios en `closed_balances`
      const existingBalance = await ClosedBalance.findOne({
        where: {
          group_id: groupId,
          user_from: transaction.user_from,
          user_to: transaction.user_to,
        },
      });

      if (existingBalance) {
        // Si ya existe, actualizar el balance
        existingBalance.amount = parseFloat(existingBalance.amount) + parseFloat(transaction.amount);
        await existingBalance.save(); // Guardar el balance actualizado
      } else {
        // Si no existe, crear una nueva transacción
        await ClosedBalance.create(transaction);
      }
    }

    console.log('Balances actualizados en closed_balances:', transactions);

    // Eliminar los tickets del grupo
    const ticketIds = tickets.map((ticket) => ticket.id_ticket);
    await Ticket.destroy({
      where: {
        id_ticket: ticketIds,
      },
    });

    console.log('Tickets eliminados:', ticketIds);

    return {
      message: 'Balance cerrado correctamente, actualizado en la base de datos, y tickets eliminados.',
      transactions,
    };
  } catch (error) {
    console.error('Error en el servicio closeBalance:', error.message);
    throw new Error('Error al cerrar balance.');
  }
};


// Servicio para obtener balance por grupo
exports.getBalanceByGroupId = async (groupId) => {
  try {
    console.log('Servicio getBalanceByGroupId - groupId:', groupId);

    // Obtener balances más recientes de la tabla ClosedBalance
    const balances = await ClosedBalance.findAll({
      where: { group_id: groupId },
      attributes: ['user_from', 'user_to', 'amount', 'estado'],
      include: [
        {
          model: Usuario,
          as: 'userFrom',
          attributes: ['id_usuario', 'nombre', 'correo'],
        },
        {
          model: Usuario,
          as: 'userTo',
          attributes: ['id_usuario', 'nombre', 'correo'],
        },
      ],
    });

    if (balances.length === 0) {
      console.log('No se encontraron balances para el grupo:', groupId);
      return { message: 'No hay balances asociados a este grupo.' };
    }

    const formattedBalances = balances.map((balance) => ({
      userFrom: {
        id: balance.userFrom.id_usuario,
        name: balance.userFrom.nombre,
        email: balance.userFrom.correo,
      },
      userTo: {
        id: balance.userTo.id_usuario,
        name: balance.userTo.nombre,
        email: balance.userTo.correo,
      },
      amount: parseFloat(balance.amount).toFixed(2), // Mostrar el balance con dos decimales
      estado: balance.estado,
    }));

    console.log('Balances obtenidos:', formattedBalances);
    return formattedBalances;
  } catch (error) {
    console.error('Error en el servicio getBalanceByGroupId:', error.message);
    throw new Error('Error al obtener balances.');
  }
};
