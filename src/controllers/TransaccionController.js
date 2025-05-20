import Transaccion from '../models/Transaccion.js';

export const getAllTransacciones = async (req, res) => {
  try {
    const transacciones = await Transaccion.findAll({
      order: [['fecha_transaccion', 'DESC']]
    });
    res.json(transacciones);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTransaccionById = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (transaccion) {
      res.json(transaccion);
    } else {
      res.status(404).json({ message: 'Transacción no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener transacción por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createTransaccion = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    // Validar campos requeridos
    const camposRequeridos = ['fecha_transaccion', 'tipo_transaccion', 'monto', 'categoria', 'cuenta_origen'];
    for (const campo of camposRequeridos) {
      if (!req.body[campo]) {
        return res.status(400).json({ 
          message: `El campo ${campo} es requerido`,
          field: campo
        });
      }
    }

    // Validar que el monto sea positivo
    if (parseFloat(req.body.monto) <= 0) {
      return res.status(400).json({
        message: 'El monto debe ser mayor que 0',
        field: 'monto'
      });
    }

    // Si es una transferencia, validar cuenta destino
    if (req.body.tipo_transaccion === 'TRANSFERENCIA' && !req.body.cuenta_destino) {
      return res.status(400).json({
        message: 'La cuenta destino es requerida para transferencias',
        field: 'cuenta_destino'
      });
    }

    const transaccion = await Transaccion.create(req.body);
    console.log('Transacción creada:', transaccion);
    res.status(201).json(transaccion);
  } catch (error) {
    console.error('Error al crear transacción:', error);
    
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
      message: 'Error interno al crear la transacción',
      error: error.message
    });
  }
};

export const updateTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    // Validar que el monto sea positivo si se está actualizando
    if (req.body.monto && parseFloat(req.body.monto) <= 0) {
      return res.status(400).json({
        message: 'El monto debe ser mayor que 0',
        field: 'monto'
      });
    }

    // Validar cuenta destino para transferencias
    if (req.body.tipo_transaccion === 'TRANSFERENCIA' && !req.body.cuenta_destino) {
      return res.status(400).json({
        message: 'La cuenta destino es requerida para transferencias',
        field: 'cuenta_destino'
      });
    }

    await transaccion.update(req.body);
    res.json(transaccion);
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    // En lugar de eliminar, marcar como ANULADA
    await transaccion.update({ estado: 'ANULADA' });
    res.json({ message: 'Transacción anulada correctamente' });
  } catch (error) {
    console.error('Error al anular transacción:', error);
    res.status(500).json({ message: error.message });
  }
}; 