const sequelize = require('../db');
const Usuario = require('./users');
const Project = require('./projects');
const UsuariosGrupos = require('./UsuariosGrupos');
const Notification = require('./notifications');
const TipoNotificacion = require('./tipo_notificacion');

// Configurar asociaciones
const setupAssociations = () => {
  // Asociación Usuario - UsuariosGrupos
  Usuario.hasMany(UsuariosGrupos, {
    foreignKey: 'id_usuario',
    as: 'GroupMemberships',   // Alias for association
  });

  UsuariosGrupos.belongsTo(Usuario, {
    foreignKey: 'id_usuario', // Foreign key in UsuariosGrupos table
    targetKey: 'id_usuario',          // Primary key in Usuario table
    as: 'User',               // Alias for association
  });

  Project.belongsTo(Usuario, { as: 'creator', foreignKey: 'id_creador' });

  // Asociación UsuariosGrupos - Project
  UsuariosGrupos.belongsTo(Project, {
    foreignKey: 'id_grupo', // Llave foránea en Usuarios_Grupos
    targetKey: 'id_proyecto', // Llave primaria en proyectos
    as: 'AssociatedProject', // Alias único
  });
 // Alias único para esta asociación

  // Asociación Notification - TipoNotificacion
  Notification.belongsTo(TipoNotificacion, { foreignKey: 'id_tipo' });
  TipoNotificacion.hasMany(Notification, { foreignKey: 'id_tipo' });
};

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
};
