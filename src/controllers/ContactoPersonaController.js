import ContactoPersona from '../models/ContactoPersona.js';

export const getAllContactoPersonas = async (req, res) => {
  try {
    console.log('🔍 Obteniendo contactos...');
    const contactos = await ContactoPersona.findAll({
      order: [['apellido_primero', 'ASC'], ['nombre_primero', 'ASC']]
    });
    console.log(`✅ Encontrados ${contactos.length} contactos`);
    res.json(contactos);
  } catch (error) {
    console.error('❌ Error al obtener contactos:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const getContactoPersonaById = async (req, res) => {
  try {
    const contacto = await ContactoPersona.findByPk(req.params.id);
    if (contacto) {
      res.json(contacto);
    } else {
      res.status(404).json({ message: 'Contacto no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener contacto por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createContactoPersona = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    // Validar campos requeridos
    const camposRequeridos = ['nombre_primero', 'apellido_primero'];
    for (const campo of camposRequeridos) {
      if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === '') {
        return res.status(400).json({ 
          message: `El campo ${campo} es requerido`,
          field: campo
        });
      }
    }

    const contacto = await ContactoPersona.create(req.body);
    console.log('Contacto creado:', contacto);
    res.status(201).json(contacto);
  } catch (error) {
    console.error('Error al crear contacto:', error);
    
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Error de validación',
        details: error.errors?.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno al crear el contacto',
      error: error.message
    });
  }
};

export const updateContactoPersona = async (req, res) => {
  try {
    console.log('🔄 UPDATE - ID:', req.params.id);
    console.log('🔄 UPDATE - Datos recibidos:', req.body);
    
    const contacto = await ContactoPersona.findByPk(req.params.id);
    if (!contacto) {
      console.log('❌ UPDATE - Contacto no encontrado:', req.params.id);
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }

    console.log('✅ UPDATE - Contacto encontrado:', contacto.id_persona);

    console.log('🔄 UPDATE - Actualizando contacto...');
    await contacto.update(req.body);
    console.log('✅ UPDATE - Contacto actualizado correctamente');
    console.log('📤 UPDATE - Enviando respuesta:', contacto.toJSON());
    
    res.json(contacto);
  } catch (error) {
    console.error('❌ UPDATE - Error al actualizar contacto:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteContactoPersona = async (req, res) => {
  try {
    const contacto = await ContactoPersona.findByPk(req.params.id);
    if (!contacto) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }

    await contacto.destroy();
    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    res.status(500).json({ message: error.message });
  }
}; 