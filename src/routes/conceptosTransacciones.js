import express from 'express';
import ConceptoTransaccion from '../models/ConceptoTransaccion.js';

const router = express.Router();

// Obtener todos los conceptos de transacciones
router.get('/', async (req, res) => {
  try {
    const conceptosTransacciones = await ConceptoTransaccion.findAll({
      order: [['id_concepto', 'DESC']]
    });
    res.json(conceptosTransacciones);
  } catch (error) {
    console.error('Error al obtener conceptos de transacciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener un concepto de transacción por ID
router.get('/:id', async (req, res) => {
  try {
    const conceptoTransaccion = await ConceptoTransaccion.findByPk(req.params.id);
    if (!conceptoTransaccion) {
      return res.status(404).json({ message: 'Concepto de transacción no encontrado' });
    }
    res.json(conceptoTransaccion);
  } catch (error) {
    console.error('Error al obtener concepto de transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo concepto de transacción
router.post('/', async (req, res) => {
  try {
    const nuevoConceptoTransaccion = await ConceptoTransaccion.create(req.body);
    res.status(201).json(nuevoConceptoTransaccion);
  } catch (error) {
    console.error('Error al crear concepto de transacción:', error);
    res.status(400).json({ message: 'Error al crear concepto de transacción', error: error.message });
  }
});

// Actualizar un concepto de transacción
router.put('/:id', async (req, res) => {
  try {
    const [filasActualizadas] = await ConceptoTransaccion.update(req.body, {
      where: { id_concepto: req.params.id }
    });
    
    if (filasActualizadas === 0) {
      return res.status(404).json({ message: 'Concepto de transacción no encontrado' });
    }
    
    const conceptoTransaccionActualizado = await ConceptoTransaccion.findByPk(req.params.id);
    res.json(conceptoTransaccionActualizado);
  } catch (error) {
    console.error('Error al actualizar concepto de transacción:', error);
    res.status(400).json({ message: 'Error al actualizar concepto de transacción', error: error.message });
  }
});

// Eliminar un concepto de transacción
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await ConceptoTransaccion.destroy({
      where: { id_concepto: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      return res.status(404).json({ message: 'Concepto de transacción no encontrado' });
    }
    
    res.json({ message: 'Concepto de transacción eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar concepto de transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear múltiples conceptos de transacciones (importación masiva)
router.post('/bulk-create', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos válidos para importar' });
    }

    // Validar y procesar los datos
    const conceptosTransaccionesParaCrear = data.map(row => {
      // Validar campos requeridos
      if (!row.concepto_dian || row.concepto_dian.trim() === '') {
        throw new Error(`Concepto DIAN es requerido en la fila: ${JSON.stringify(row)}`);
      }

      return {
        id_tipotransaccion: row.id_tipotransaccion ? parseInt(row.id_tipotransaccion) : null,
        codigo_dian: row.codigo_dian?.toString().trim() || null,
        concepto_dian: row.concepto_dian?.toString().trim()
      };
    });

    // Crear registros en lote
    const conceptosTransaccionesCreados = await ConceptoTransaccion.bulkCreate(conceptosTransaccionesParaCrear, {
      validate: true,
      returning: true
    });

    res.status(201).json({ 
      message: `Se crearon ${conceptosTransaccionesCreados.length} conceptos de transacciones correctamente`,
      created: conceptosTransaccionesCreados.length,
      data: conceptosTransaccionesCreados
    });
  } catch (error) {
    console.error('Error en importación masiva de conceptos de transacciones:', error);
    res.status(400).json({ 
      message: 'Error al importar conceptos de transacciones', 
      error: error.message 
    });
  }
});

export default router; 