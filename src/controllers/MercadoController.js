import Mercado from '../models/Mercado.js';

export const getAllMercados = async (req, res) => {
  try {
    console.log('🔍 Obteniendo mercados...');
    const mercados = await Mercado.findAll({
      order: [['segmento_mercado', 'ASC']]
    });
    console.log(`✅ Encontrados ${mercados.length} mercados`);
    res.json(mercados);
  } catch (error) {
    console.error('❌ Error al obtener mercados:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const getMercadoById = async (req, res) => {
  try {
    const mercado = await Mercado.findByPk(req.params.id);
    if (mercado) {
      res.json(mercado);
    } else {
      res.status(404).json({ message: 'Mercado no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener mercado por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createMercado = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    // Validar campos requeridos
    const camposRequeridos = ['segmento_mercado'];
    for (const campo of camposRequeridos) {
      if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === '') {
        return res.status(400).json({ 
          message: `El campo ${campo} es requerido`,
          field: campo
        });
      }
    }

    const mercado = await Mercado.create(req.body);
    console.log('Mercado creado:', mercado);
    res.status(201).json(mercado);
  } catch (error) {
    console.error('Error al crear mercado:', error);
    
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
      message: 'Error interno al crear el mercado',
      error: error.message
    });
  }
};

export const updateMercado = async (req, res) => {
  try {
    console.log('🔄 UPDATE - ID:', req.params.id);
    console.log('🔄 UPDATE - Datos recibidos:', req.body);
    
    const mercado = await Mercado.findByPk(req.params.id);
    if (!mercado) {
      console.log('❌ UPDATE - Mercado no encontrado:', req.params.id);
      return res.status(404).json({ message: 'Mercado no encontrado' });
    }

    console.log('✅ UPDATE - Mercado encontrado:', mercado.id_mercado);

    console.log('🔄 UPDATE - Actualizando mercado...');
    await mercado.update(req.body);
    console.log('✅ UPDATE - Mercado actualizado correctamente');
    console.log('📤 UPDATE - Enviando respuesta:', mercado.toJSON());
    
    res.json(mercado);
  } catch (error) {
    console.error('❌ UPDATE - Error al actualizar mercado:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteMercado = async (req, res) => {
  try {
    const mercado = await Mercado.findByPk(req.params.id);
    if (!mercado) {
      return res.status(404).json({ message: 'Mercado no encontrado' });
    }

    await mercado.destroy();
    res.json({ message: 'Mercado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar mercado:', error);
    res.status(500).json({ message: error.message });
  }
}; 