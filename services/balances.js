const Ticket = require('../db/models/tickets'); // Importar el modelo Ticket
const Usuario = require('../db/models/users'); // Importar Usuario
const ClosedBalance = require('../db/models/closedBalances');
const Project = require('../services/projects'); // Importar

// Servicio para cerrar el balance


// Servicio para cerrar el balance
exports.closeBalance = async (groupId) => {
  try {
    console.log('Servicio closeBalance - groupId:', groupId);

    // Obtener todos los tickets del grupo
    const tickets = await Ticket.findAll({
      where: { id_proyecto: groupId },
      attributes: ['id_usuario', 'monto_total', 'porcentajes', 'division_type', 'id_ticket'],
    });

    if (tickets.length === 0) {
      console.log('No se encontraron tickets para el proyecto:', groupId);
      return { message: 'No hay tickets asociados a este proyecto.' };
    }

    const userBalances = {}; // Objeto para almacenar balances entre usuarios

    // Obtener miembros del grupo
    const miembros = await Project.getMembersByGroupId(groupId); // Obtener miembros del grupo
    const totalMembers = miembros.length;

    if (totalMembers === 0) {
      console.log('No se encontraron miembros en el grupo:', groupId);
      return { message: 'No hay miembros en este grupo.' };
    }

    // Procesar cada ticket
    tickets.forEach((ticket) => {
      const { id_usuario: idPagador, monto_total, porcentajes, division_type } = ticket;

      // Si la división es equitativa, calcular el balance entre los miembros
      if (division_type === 'equitativo') {
        const montoEquitativo = monto_total / totalMembers; // Dividir el monto entre todos los miembros

        // Calcular el balance para cada miembro
        miembros.forEach((miembro) => {
          const { id: idMiembro } = miembro;

          if (idMiembro !== idPagador) {
            if (!userBalances[idPagador]) userBalances[idPagador] = { debe: 0, recibe: 0 };
            if (!userBalances[idMiembro]) userBalances[idMiembro] = { debe: 0, recibe: 0 };

            userBalances[idPagador].recibe += montoEquitativo; // Lo que recibe el pagador
            userBalances[idMiembro].debe += montoEquitativo;   // Lo que debe el miembro
          }
        });
      } else if (division_type === 'porcentajes') {
        // Intentamos parsear porcentajes
        let parsedPorcentajes = [];
        try {
          parsedPorcentajes = JSON.parse(porcentajes);
        } catch (error) {
          console.warn('Formato de porcentajes no válido:', porcentajes);
          return; // Si los porcentajes no son válidos, no procesamos este ticket
        }

        // Procesar los porcentajes solo si son válidos
        parsedPorcentajes.forEach((miembro) => {
          const { id_usuario: idMiembro, porcentaje } = miembro;

          // Verificar que el porcentaje esté definido y sea mayor que 0
          if (idMiembro && porcentaje != null && porcentaje > 0) {
            const debePagar = (monto_total * porcentaje) / 100;

            // Asegurar que el usuario que paga no se agregue a la lista de balances
            if (idMiembro !== idPagador) {
              if (!userBalances[idPagador]) userBalances[idPagador] = { debe: 0, recibe: 0 };
              if (!userBalances[idMiembro]) userBalances[idMiembro] = { debe: 0, recibe: 0 };

              userBalances[idPagador].recibe += debePagar;  // Lo que recibe el pagador
              userBalances[idMiembro].debe += debePagar;   // Lo que debe el miembro
            }
          }
        });
      }
    });

    console.log('Balances calculados:', userBalances);

    const transactions = [];

    // Crear las transacciones para registrar en closed_balances
    for (const [idUsuario, balance] of Object.entries(userBalances)) {
      if (balance.debe > 0 && idUsuario) {
        // Verificamos que el usuario existe y tiene un balance
        transactions.push({
          group_id: groupId,
          user_from: idUsuario,  // Usuario que debe
          user_to: idUsuario,    // El mismo usuario (porque es la deuda)
          amount: (-balance.debe).toFixed(2),  // El monto a pagar es negativo
          estado: 'pendiente',
        });
      }

      if (balance.recibe > 0 && idUsuario) {
        // Verificamos que el usuario recibe algo y tiene un balance
        transactions.push({
          group_id: groupId,
          user_from: idUsuario,  // El que recibe el dinero
          user_to: idUsuario,    // El mismo usuario (porque es el crédito)
          amount: balance.recibe.toFixed(2), // El monto a recibir es positivo
          estado: 'pendiente',
        });
      }
    }

    // Si hay transacciones, guardarlas en la base de datos
    if (transactions.length > 0) {
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
    } else {
      console.log('No se generaron transacciones para el balance.');
    }

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



exports.getBalanceByGroupId = async (groupId) => {
  try {
    console.log('Servicio getBalanceByGroupId - groupId:', groupId);

    // Obtener los balances más recientes de la tabla ClosedBalance
    const balances = await ClosedBalance.findAll({
      where: { group_id: groupId },
      attributes: ['user_from', 'user_to', 'amount', 'estado'],
      include: [
        {
          model: Usuario,
          as: 'userFrom',  // Alias de la relación para el usuario que hizo el pago
          attributes: ['id_usuario', 'nombre', 'correo'],
        },
        {
          model: Usuario,
          as: 'userTo',    // Alias de la relación para los usuarios que deben
          attributes: ['id_usuario', 'nombre', 'correo'],
        },
      ],
    });

    if (balances.length === 0) {
      console.log('No se encontraron balances para el grupo:', groupId);
      return { message: 'No hay balances asociados a este grupo.' };
    }

    // Formatear los balances obtenidos
    const formattedBalances = balances.map((balance) => {
      // Revisar si el balance está bien estructurado
      const userFrom = balance.userFrom ? {
        id: balance.userFrom.id_usuario,
        name: balance.userFrom.nombre,
        email: balance.userFrom.correo,
      } : null;

      const userTo = balance.userTo ? {
        id: balance.userTo.id_usuario,
        name: balance.userTo.nombre,
        email: balance.userTo.correo,
      } : null;

      return {
        userFrom,
        userTo,
        amount: parseFloat(balance.amount).toFixed(2),  // Mostrar el balance con dos decimales
        estado: balance.estado,
      };
    });

    console.log('Balances obtenidos:', formattedBalances);
    return formattedBalances;
  } catch (error) {
    console.error('Error en el servicio getBalanceByGroupId:', error.message);
    throw new Error('Error al obtener balances.');
  }
};
