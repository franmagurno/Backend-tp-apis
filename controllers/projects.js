const projectService = require('../services/projects');

// Controlador: Crear un nuevo proyecto
exports.createProject = async (req, res) => {
  const { nombre, descripcion, usuarios, id_creador } = req.body;

  if (!nombre || !usuarios || !Array.isArray(usuarios) || !id_creador) {
    return res.status(400).json({ error: 'Debe proporcionar un nombre, un array de correos de usuarios y un id_creador' });
  }

  try {
    const result = await projectService.createProject(nombre, descripcion, usuarios, id_creador);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ error: error.message || 'Error al crear proyecto.' });
  }
};

// Controlador: Obtener los proyectos asociados a un usuario
exports.getGroupsByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const grupos = await projectService.getProjectsByUserId(id);

    if (!grupos || grupos.length === 0) {
      return res.status(404).json({ message: 'No hay grupos asociados a este usuario.' });
    }

    res.status(200).json({ userId: id, groups: grupos });
  } catch (error) {
    console.error('Error al obtener grupos por usuario:', error);
    res.status(500).json({ error: 'Error al obtener grupos por usuario.' });
  }
};

// Controlador: Agregar un miembro a un proyecto
exports.addMemberToProject = async (req, res) => {
  const { id_grupo, correo } = req.body;

  if (!id_grupo || !correo) {
    return res.status(400).json({ error: 'Debe proporcionar el id del grupo y el correo del usuario.' });
  }

  try {
    const result = await projectService.addMemberToProject(id_grupo, correo);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error al agregar miembro al proyecto:', error);
    res.status(500).json({ error: error.message || 'Error al agregar miembro al proyecto.' });
  }
};
