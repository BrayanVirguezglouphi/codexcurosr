import express from 'express';
import EtiquetaContable from '../models/EtiquetaContable.js';

const router = express.Router();

// Obtener todas las etiquetas contables
router.get('/', async (req, res) => {
  try {
    const etiquetasContables = await EtiquetaContable.findAll({
      order: [['id_etiqueta_contable', 'DESC']]
    });
    res.json(etiquetasContables);
  } catch (error) {
    console.error('Error al obtener etiquetas contables:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener una etiqueta contable por ID
router.get('/:id', async (req, res) => {
  try {
    const etiquetaContable = await EtiquetaContable.findByPk(req.params.id);
    if (!etiquetaContable) {
      return res.status(404).json({ message: 'Etiqueta contable no encontrada' });
    }
    res.json(etiquetaContable);
  } catch (error) {
    console.error('Error al obtener etiqueta contable:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear una nueva etiqueta contable
router.post('/', async (req, res) => {
  if ('id_etiqueta_contable' in req.body) delete req.body.id_etiqueta_contable;
  try {
    const nuevaEtiquetaContable = await EtiquetaContable.create(req.body);
    res.status(201).json(nuevaEtiquetaContable);
  } catch (error) {
    console.error('Error al crear etiqueta contable:', error);
    res.status(400).json({ message: 'Error al crear etiqueta contable', error: error.message });
  }
});

// Actualizar una etiqueta contable
router.put('/:id', async (req, res) => {
  try {
    const [filasActualizadas] = await EtiquetaContable.update(req.body, {
      where: { id_etiqueta_contable: req.params.id }
    });
    
    if (filasActualizadas === 0) {
      return res.status(404).json({ message: 'Etiqueta contable no encontrada' });
    }
    
    const etiquetaContableActualizada = await EtiquetaContable.findByPk(req.params.id);
    res.json(etiquetaContableActualizada);
  } catch (error) {
    console.error('Error al actualizar etiqueta contable:', error);
    res.status(400).json({ message: 'Error al actualizar etiqueta contable', error: error.message });
  }
});

// Eliminar una etiqueta contable
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await EtiquetaContable.destroy({
      where: { id_etiqueta_contable: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      return res.status(404).json({ message: 'Etiqueta contable no encontrada' });
    }
    
    res.json({ message: 'Etiqueta contable eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar etiqueta contable:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear múltiples etiquetas contables (importación masiva)
router.post('/bulk-create', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos válidos para importar' });
    }

    // Validar y procesar los datos
    const etiquetasContablesParaCrear = data.map(row => {
      // Validar campos requeridos
      if (!row.etiqueta_contable || row.etiqueta_contable.trim() === '') {
        throw new Error(`Etiqueta contable es requerida en la fila: ${JSON.stringify(row)}`);
      }

      return {
        etiqueta_contable: row.etiqueta_contable?.toString().trim(),
        descripcion_etiqueta: row.descripcion_etiqueta?.toString().trim() || null
      };
    });

    // Crear registros en lote
    const etiquetasContablesCreadas = await EtiquetaContable.bulkCreate(etiquetasContablesParaCrear, {
      validate: true,
      returning: true
    });

    res.status(201).json({ 
      message: `Se crearon ${etiquetasContablesCreadas.length} etiquetas contables correctamente`,
      created: etiquetasContablesCreadas.length,
      data: etiquetasContablesCreadas
    });
  } catch (error) {
    console.error('Error en importación masiva de etiquetas contables:', error);
    res.status(400).json({ 
      message: 'Error al importar etiquetas contables', 
      error: error.message 
    });
  }
});

export default router; 