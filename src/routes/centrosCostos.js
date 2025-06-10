import express from 'express';
import CentroCosto from '../models/CentroCosto.js';

const router = express.Router();

// Obtener todos los centros de costos
router.get('/', async (req, res) => {
  try {
    const centrosCostos = await CentroCosto.findAll({
      order: [['id_centro_costo', 'DESC']]
    });
    res.json(centrosCostos);
  } catch (error) {
    console.error('Error al obtener centros de costos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener un centro de costo por ID
router.get('/:id', async (req, res) => {
  try {
    const centroCosto = await CentroCosto.findByPk(req.params.id);
    if (!centroCosto) {
      return res.status(404).json({ message: 'Centro de costo no encontrado' });
    }
    res.json(centroCosto);
  } catch (error) {
    console.error('Error al obtener centro de costo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo centro de costo
router.post('/', async (req, res) => {
  try {
    const nuevoCentroCosto = await CentroCosto.create(req.body);
    res.status(201).json(nuevoCentroCosto);
  } catch (error) {
    console.error('Error al crear centro de costo:', error);
    res.status(400).json({ message: 'Error al crear centro de costo', error: error.message });
  }
});

// Actualizar un centro de costo
router.put('/:id', async (req, res) => {
  try {
    const [filasActualizadas] = await CentroCosto.update(req.body, {
      where: { id_centro_costo: req.params.id }
    });
    
    if (filasActualizadas === 0) {
      return res.status(404).json({ message: 'Centro de costo no encontrado' });
    }
    
    const centroCostoActualizado = await CentroCosto.findByPk(req.params.id);
    res.json(centroCostoActualizado);
  } catch (error) {
    console.error('Error al actualizar centro de costo:', error);
    res.status(400).json({ message: 'Error al actualizar centro de costo', error: error.message });
  }
});

// Eliminar un centro de costo
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await CentroCosto.destroy({
      where: { id_centro_costo: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      return res.status(404).json({ message: 'Centro de costo no encontrado' });
    }
    
    res.json({ message: 'Centro de costo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar centro de costo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear múltiples centros de costos (importación masiva)
router.post('/bulk-create', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos válidos para importar' });
    }

    // Validar y procesar los datos
    const centrosCostosParaCrear = data.map(row => {
      // Validar campos requeridos
      if (!row.sub_centro_costo || row.sub_centro_costo.trim() === '') {
        throw new Error(`Sub centro de costo es requerido en la fila: ${JSON.stringify(row)}`);
      }

      return {
        sub_centro_costo: row.sub_centro_costo?.toString().trim(),
        centro_costo_macro: row.centro_costo_macro?.toString().trim() || null,
        descripcion_cc: row.descripcion_cc?.toString().trim() || null
      };
    });

    // Crear registros en lote
    const centrosCostosCreados = await CentroCosto.bulkCreate(centrosCostosParaCrear, {
      validate: true,
      returning: true
    });

    res.status(201).json({ 
      message: `Se crearon ${centrosCostosCreados.length} centros de costos correctamente`,
      created: centrosCostosCreados.length,
      data: centrosCostosCreados
    });
  } catch (error) {
    console.error('Error en importación masiva de centros de costos:', error);
    res.status(400).json({ 
      message: 'Error al importar centros de costos', 
      error: error.message 
    });
  }
});

export default router; 