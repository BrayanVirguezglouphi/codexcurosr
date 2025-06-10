import express from 'express';
import Tax from '../models/Tax.js';

const router = express.Router();

// Obtener todos los impuestos
router.get('/', async (req, res) => {
  try {
    const impuestos = await Tax.findAll({
      order: [['id_tax', 'DESC']]
    });
    res.json(impuestos);
  } catch (error) {
    console.error('Error al obtener impuestos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener un impuesto por ID
router.get('/:id', async (req, res) => {
  try {
    const impuesto = await Tax.findByPk(req.params.id);
    if (!impuesto) {
      return res.status(404).json({ message: 'Impuesto no encontrado' });
    }
    res.json(impuesto);
  } catch (error) {
    console.error('Error al obtener impuesto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo impuesto
router.post('/', async (req, res) => {
  try {
    const nuevoImpuesto = await Tax.create(req.body);
    res.status(201).json(nuevoImpuesto);
  } catch (error) {
    console.error('Error al crear impuesto:', error);
    res.status(400).json({ message: 'Error al crear impuesto', error: error.message });
  }
});

// Crear múltiples impuestos (bulk-create)
router.post('/bulk-create', async (req, res) => {
  try {
    const { impuestos } = req.body;
    
    if (!Array.isArray(impuestos) || impuestos.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de impuestos no vacío' 
      });
    }

    // Validar datos requeridos
    for (const impuesto of impuestos) {
      if (!impuesto.titulo_impuesto) {
        return res.status(400).json({ 
          error: 'Cada impuesto debe tener al menos titulo_impuesto' 
        });
      }
    }

    const nuevosImpuestos = await Tax.bulkCreate(impuestos, {
      returning: true,
      validate: true
    });

    res.status(201).json({
      message: `${nuevosImpuestos.length} impuestos creados exitosamente`,
      impuestos: nuevosImpuestos
    });
  } catch (error) {
    console.error('Error al crear impuestos en bulk:', error);
    res.status(400).json({ 
      error: 'Error al crear impuestos', 
      details: error.message 
    });
  }
});

// Actualizar un impuesto
router.put('/:id', async (req, res) => {
  try {
    const [filasActualizadas] = await Tax.update(req.body, {
      where: { id_tax: req.params.id }
    });
    
    if (filasActualizadas === 0) {
      return res.status(404).json({ message: 'Impuesto no encontrado' });
    }
    
    const impuestoActualizado = await Tax.findByPk(req.params.id);
    res.json(impuestoActualizado);
  } catch (error) {
    console.error('Error al actualizar impuesto:', error);
    res.status(400).json({ message: 'Error al actualizar impuesto', error: error.message });
  }
});

// Eliminar un impuesto
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await Tax.destroy({
      where: { id_tax: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      return res.status(404).json({ message: 'Impuesto no encontrado' });
    }
    
    res.json({ message: 'Impuesto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar impuesto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router; 