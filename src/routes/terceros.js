import express from 'express';
import Tercero from '../models/Tercero.js';

const router = express.Router();

// Obtener todos los terceros
router.get('/', async (req, res) => {
  try {
    const terceros = await Tercero.findAll({
      order: [['id_tercero', 'DESC']]
    });
    res.json(terceros);
  } catch (error) {
    console.error('Error al obtener terceros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener un tercero por ID
router.get('/:id', async (req, res) => {
  try {
    const tercero = await Tercero.findByPk(req.params.id);
    if (!tercero) {
      return res.status(404).json({ message: 'Tercero no encontrado' });
    }
    res.json(tercero);
  } catch (error) {
    console.error('Error al obtener tercero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo tercero
router.post('/', async (req, res) => {
  try {
    const nuevoTercero = await Tercero.create(req.body);
    res.status(201).json(nuevoTercero);
  } catch (error) {
    console.error('Error al crear tercero:', error);
    res.status(400).json({ message: 'Error al crear tercero', error: error.message });
  }
});

// Crear múltiples terceros (bulk-create)
router.post('/bulk-create', async (req, res) => {
  try {
    const { terceros } = req.body;
    
    if (!Array.isArray(terceros) || terceros.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de terceros no vacío' 
      });
    }

    // Validar datos requeridos
    for (const tercero of terceros) {
      if (!tercero.numero_documento || !tercero.tipo_relacion) {
        return res.status(400).json({ 
          error: 'Cada tercero debe tener al menos numero_documento y tipo_relacion' 
        });
      }
    }

    const nuevosTerceros = await Tercero.bulkCreate(terceros, {
      returning: true,
      validate: true
    });

    res.status(201).json({
      message: `${nuevosTerceros.length} terceros creados exitosamente`,
      terceros: nuevosTerceros
    });
  } catch (error) {
    console.error('Error al crear terceros en bulk:', error);
    res.status(400).json({ 
      error: 'Error al crear terceros', 
      details: error.message 
    });
  }
});

// Actualizar un tercero
router.put('/:id', async (req, res) => {
  try {
    const [filasActualizadas] = await Tercero.update(req.body, {
      where: { id_tercero: req.params.id }
    });
    
    if (filasActualizadas === 0) {
      return res.status(404).json({ message: 'Tercero no encontrado' });
    }
    
    const terceroActualizado = await Tercero.findByPk(req.params.id);
    res.json(terceroActualizado);
  } catch (error) {
    console.error('Error al actualizar tercero:', error);
    res.status(400).json({ message: 'Error al actualizar tercero', error: error.message });
  }
});

// Eliminar un tercero
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await Tercero.destroy({
      where: { id_tercero: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      return res.status(404).json({ message: 'Tercero no encontrado' });
    }
    
    res.json({ message: 'Tercero eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tercero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router; 