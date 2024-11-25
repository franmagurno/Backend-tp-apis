const sequelize = require('../db');
const Usuario = require('./users');
const Project = require('./projects');
const UsuariosGrupos = require('./UsuariosGrupos');
const Notification = require('./notifications');
const TipoNotificacion = require('./tipo_notificacion');

// Definir asociaciones aquí
Usuario.hasMany(UsuariosGrupos, { foreignKey: 'id_usuario' });
UsuariosGrupos.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Project.hasMany(UsuariosGrupos, { foreignKey: 'id_grupo' });
UsuariosGrupos.belongsTo(Project, { foreignKey: 'id_grupo' });

Notification.belongsTo(TipoNotificacion, { foreignKey: 'id_tipo' });
TipoNotificacion.hasMany(Notification, { foreignKey: 'id_tipo' });

// Exportar todos los modelos desde aquí
module.exports = {
  sequelize,
  Usuario,
  Project,
  UsuariosGrupos,
  Notification,
  TipoNotificacion,
};
