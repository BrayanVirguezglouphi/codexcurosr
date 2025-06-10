import express from 'express';
import LineaServicio from '../models/LineaServicio.js';

const router = express.Router();

// Obtener todas las líneas de servicios
router.get('/', async (req, res) => {
  try {
    const lineasServicios = await LineaServicio.findAll({
      order: [['id_servicio', 'DESC']]
    });
    res.json(lineasServicios);
  } catch (error) {
    console.error('Error al obtener líneas de servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener una línea de servicio por ID
router.get('/:id', async (req, res) => {
  try {
    const lineaServicio = await LineaServicio.findByPk(req.params.id);
    if (!lineaServicio) {
      return res.status(404).json({ message: 'Línea de servicio no encontrada' });
    }
    res.json(lineaServicio);
  } catch (error) {
    console.error('Error al obtener línea de servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear una nueva línea de servicio
router.post('/', async (req, res) => {
  try {
    const nuevaLineaServicio = await LineaServicio.create(req.body);
    res.status(201).json(nuevaLineaServicio);
  } catch (error) {
    console.error('Error al crear línea de servicio:', error);
    res.status(400).json({ message: 'Error al crear línea de servicio', error: error.message });
  }
});

// Crear múltiples líneas de servicios (bulk-create)
router.post('/bulk-create', async (req, res) => {
  try {
    const { lineasServicios } = req.body;
    
    if (!Array.isArray(lineasServicios) || lineasServicios.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de líneas de servicios no vacío' 
      });
    }

    // Validar datos requeridos
    for (const linea of lineasServicios) {
      if (!linea.servicio || !linea.tipo_servicio) {
        return res.status(400).json({ 
          error: 'Cada línea de servicio debe tener al menos servicio y tipo_servicio' 
        });
      }
    }

    const nuevasLineasServicios = await LineaServicio.bulkCreate(lineasServicios, {
      returning: true,
      validate: true
    });

    res.status(201).json({
      message: `${nuevasLineasServicios.length} líneas de servicios creadas exitosamente`,
      lineasServicios: nuevasLineasServicios
    });
  } catch (error) {
    console.error('Error al crear líneas de servicios en bulk:', error);
    res.status(400).json({ 
      error: 'Error al crear líneas de servicios', 
      details: error.message 
    });
  }
});

// Actualizar una línea de servicio
router.put('/:id', async (req, res) => {
  try {
    const [filasActualizadas] = await LineaServicio.update(req.body, {
      where: { id_servicio: req.params.id }
    });
    
    if (filasActualizadas === 0) {
      return res.status(404).json({ message: 'Línea de servicio no encontrada' });
    }
    
    const lineaServicioActualizada = await LineaServicio.findByPk(req.params.id);
    res.json(lineaServicioActualizada);
  } catch (error) {
    console.error('Error al actualizar línea de servicio:', error);
    res.status(400).json({ message: 'Error al actualizar línea de servicio', error: error.message });
  }
});

// Eliminar una línea de servicio
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await LineaServicio.destroy({
      where: { id_servicio: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      return res.status(404).json({ message: 'Línea de servicio no encontrada' });
    }
    
    res.json({ message: 'Línea de servicio eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar línea de servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router; 