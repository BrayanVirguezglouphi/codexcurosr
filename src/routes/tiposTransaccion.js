const express = require('express');
const TipoTransaccion = require('../models/TipoTransaccion.cjs');

const router = express.Router();

// GET - Obtener todos los tipos de transacción
router.get('/', async (req, res) => {
  try {
    const tiposTransaccion = await TipoTransaccion.findAll({
      order: [['tipo_transaccion', 'ASC']]
    });
    res.json(tiposTransaccion);
  } catch (error) {
    console.error('Error al obtener tipos de transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET - Obtener un tipo de transacción por ID
router.get('/:id', async (req, res) => {
  try {
    const tipoTransaccion = await TipoTransaccion.findByPk(req.params.id);
    
    if (!tipoTransaccion) {
      return res.status(404).json({ message: 'Tipo de transacción no encontrado' });
    }
    
    res.json(tipoTransaccion);
  } catch (error) {
    console.error('Error al obtener tipo de transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 