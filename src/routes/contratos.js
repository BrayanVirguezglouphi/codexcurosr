import express from 'express';
import Contrato from '../models/Contrato.js';
import Tercero from '../models/Tercero.js';
import Moneda from '../models/Moneda.js';
import Tax from '../models/Tax.js';

const router = express.Router();

// Obtener todos los contratos con relaciones
router.get('/', async (req, res) => {
  try {
    const contratos = await Contrato.findAll({
      include: [
        {
          model: Tercero,
          as: 'tercero',
          attributes: ['id_tercero', 'primer_nombre', 'primer_apellido', 'razon_social', 'numero_documento', 'tipo_personalidad']
        },
        {
          model: Moneda,
          as: 'moneda',
          attributes: ['id_moneda', 'nombre_moneda', 'codigo_iso', 'simbolo']
        },
        {
          model: Tax,
          as: 'tax',
          attributes: ['id_tax', 'titulo_impuesto']
        }
      ],
      order: [['id_contrato', 'DESC']]
    });
    res.json(contratos);
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener un contrato por ID
router.get('/:id', async (req, res) => {
  try {
    const contrato = await Contrato.findByPk(req.params.id, {
      include: [
        {
          model: Tercero,
          as: 'tercero',
          attributes: ['id_tercero', 'primer_nombre', 'primer_apellido', 'razon_social', 'numero_documento', 'tipo_personalidad']
        },
        {
          model: Moneda,
          as: 'moneda',
          attributes: ['id_moneda', 'nombre_moneda', 'codigo_iso', 'simbolo']
        },
        {
          model: Tax,
          as: 'tax',
          attributes: ['id_tax', 'titulo_impuesto']
        }
      ]
    });
    if (!contrato) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    res.json(contrato);
  } catch (error) {
    console.error('Error al obtener contrato:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo contrato
router.post('/', async (req, res) => {
  console.log('BODY RECIBIDO EN API CONTRATOS:', req.body);
  try {
    if ('id_contrato' in req.body) delete req.body.id_contrato;
    const nuevoContrato = await Contrato.create(req.body);
    res.status(201).json(nuevoContrato);
  } catch (error) {
    console.error('Error al crear contrato:', error);
    res.status(400).json({ message: 'Error al crear contrato', error: error.message });
  }
});

// Actualizar un contrato
router.put('/:id', async (req, res) => {
  try {
    const [filasActualizadas] = await Contrato.update(req.body, {
      where: { id_contrato: req.params.id }
    });
    
    if (filasActualizadas === 0) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    
    const contratoActualizado = await Contrato.findByPk(req.params.id, {
      include: [
        {
          model: Tercero,
          as: 'tercero',
          attributes: ['id_tercero', 'primer_nombre', 'primer_apellido', 'razon_social', 'numero_documento', 'tipo_personalidad']
        },
        {
          model: Moneda,
          as: 'moneda',
          attributes: ['id_moneda', 'nombre_moneda', 'codigo_iso', 'simbolo']
        },
        {
          model: Tax,
          as: 'tax',
          attributes: ['id_tax', 'titulo_impuesto']
        }
      ]
    });
    res.json(contratoActualizado);
  } catch (error) {
    console.error('Error al actualizar contrato:', error);
    res.status(400).json({ message: 'Error al actualizar contrato', error: error.message });
  }
});

// Eliminar un contrato
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await Contrato.destroy({
      where: { id_contrato: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    
    res.json({ message: 'Contrato eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar contrato:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router; 