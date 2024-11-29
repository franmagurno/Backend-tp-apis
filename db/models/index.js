const sequelize = require('../db');
const Usuario = require('./users');
const Project = require('./projects');
const UsuariosGrupos = require('./UsuariosGrupos');
const Notification = require('./notifications');
const TipoNotificacion = require('./tipo_notificacion');
const Ticket = require('./tickets');

const ClosedBalance = require('./closedBalances');

// Configurar asociaciones
const setupAssociations = () => {
  // Asociación Usuario - UsuariosGrupos
  Usuario.hasMany(UsuariosGrupos, {
    foreignKey: 'id_usuario',
    onDelete: 'CASCADE',
    as: 'GroupMemberships',
  });

  UsuariosGrupos.belongsTo(Usuario, {
    foreignKey: 'id_usuario',
    targetKey: 'id_usuario',
    as: 'User',
  });

  Project.belongsTo(Usuario, { as: 'creator', foreignKey: 'id_creador', onDelete: 'CASCADE' });

  // Asociación UsuariosGrupos - Project
  UsuariosGrupos.belongsTo(Project, {
    foreignKey: 'id_grupo',
    targetKey: 'id_proyecto',
    as: 'AssociatedProject',
  });

  // Asociación Notification - TipoNotificacion
  Notification.belongsTo(TipoNotificacion, { foreignKey: 'id_tipo' });
  TipoNotificacion.hasMany(Notification, { foreignKey: 'id_tipo' });

  Usuario.hasMany(Project, { foreignKey: 'id_creador', onDelete: 'CASCADE', as: 'projects' });

  // Asociación Ticket - TicketMember

  // Asociación Usuario - Ticket
  Usuario.hasMany(Ticket, { foreignKey: 'id_usuario', as: 'tickets' });
  Ticket.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

  // Asociación Project - Ticket
  Project.hasMany(Ticket, { foreignKey: 'id_proyecto', as: 'tickets' });
  Ticket.belongsTo(Project, { foreignKey: 'id_proyecto', as: 'project' });

  // Asociación Usuario - ClosedBalance (Ajustado)
  Usuario.hasMany(ClosedBalance, { foreignKey: 'user_from', as: 'sentBalances' });
  Usuario.hasMany(ClosedBalance, { foreignKey: 'user_to', as: 'receivedBalances' });

  ClosedBalance.belongsTo(Usuario, { foreignKey: 'user_from', as: 'userFrom' });
  ClosedBalance.belongsTo(Usuario, { foreignKey: 'user_to', as: 'userTo' });

  // Asociación Project - ClosedBalance (Ajustado)
  Project.hasMany(ClosedBalance, { foreignKey: 'group_id', as: 'balances' });
  ClosedBalance.belongsTo(Project, { foreignKey: 'group_id', as: 'group' });
}
// Llamar a las configuraciones de asociaciones
setupAssociations();

// Exportar modelos y la instancia de sequelize
module.exports = {
  sequelize,
  Usuario,
  Project,
  UsuariosGrupos,
  Notification,
  TipoNotificacion,
  Ticket,
  ClosedBalance,
};
