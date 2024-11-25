const Project = require('../db/models/projects');
const UsuariosGrupos = require('../db/models/UsuariosGrupos');
const Usuario = require('../db/models/users');

// Servicio: Crear un nuevo proyecto
const createProject = async (nombre, descripcion, usuarios, id_creador) => {
  // Verifica que el creador exista
  const creador = await Usuario.findByPk(id_creador);
  if (!creador) {
    throw new Error('El creador no existe.');
  }

  // Agrega el correo del creador a la lista de usuarios
  const usuariosCorreos = [...usuarios, creador.correo];

  // Buscar los usuarios por sus correos electrónicos
  const usuariosEncontrados = await Usuario.findAll({
    where: { correo: usuariosCorreos },
  });

  // Verifica si todos los correos fueron encontrados
  if (usuariosEncontrados.length !== usuariosCorreos.length) {
    const correosEncontrados = usuariosEncontrados.map((u) => u.correo);
    const correosNoEncontrados = usuariosCorreos.filter((correo) => !correosEncontrados.includes(correo));
    throw new Error(`Los siguientes correos no fueron encontrados: ${correosNoEncontrados.join(', ')}`);
  }

  // Crea el proyecto
  const proyecto = await Project.create({ nombre, descripcion, id_creador });

  // Crear relaciones entre usuarios y el grupo
  const relaciones = usuariosEncontrados.map((usuario) => ({
    id_usuario: usuario.id_usuario,
    id_grupo: proyecto.id,
    rol: usuario.id_usuario === id_creador ? 'Creador' : 'Miembro',
    fecha_asignacion: new Date(),
  }));
  await UsuariosGrupos.bulkCreate(relaciones);

  // Devuelve el proyecto y los usuarios agregados
  const nombresUsuarios = usuariosEncontrados.map((usuario) => usuario.nombre);
  return {
    message: `El grupo "${nombre}" fue creado exitosamente. Los usuarios ${nombresUsuarios.join(' y ')} fueron agregados al grupo.`,
    grupo: proyecto,
  };
};

// Servicio: Obtener proyectos asociados a un usuario
const getProjectsByUserId = async (id_usuario) => {
  const relaciones = await UsuariosGrupos.findAll({
    where: { id_usuario },
    include: {
      model: Project,
      attributes: ['id', 'nombre', 'descripcion'],
    },
  });

  return relaciones.map((relacion) => relacion.Project);
};

// Servicio: Agregar un miembro a un proyecto
const addMemberToProject = async (id_grupo, correo) => {
  // Verifica que el proyecto (grupo) exista
  const proyecto = await Project.findByPk(id_grupo);
  if (!proyecto) {
    throw new Error('El proyecto no existe.');
  }

  // Verifica que el usuario exista
  const usuario = await Usuario.findOne({ where: { correo } });
  if (!usuario) {
    throw new Error('El usuario no existe.');
  }

  // Verifica si el usuario ya es miembro del grupo
  const existeRelacion = await UsuariosGrupos.findOne({
    where: { id_usuario: usuario.id_usuario, id_grupo },
  });
  if (existeRelacion) {
    throw new Error('El usuario ya es miembro del grupo.');
  }

  // Agregar al usuario al grupo
  await UsuariosGrupos.create({
    id_usuario: usuario.id_usuario,
    id_grupo,
    rol: 'Miembro',
    fecha_asignacion: new Date(),
  });

  return {
    message: `El usuario con correo ${correo} fue agregado al proyecto "${proyecto.nombre}".`,
  };
};

module.exports = {
  createProject,
  getProjectsByUserId,
  addMemberToProject,
};
