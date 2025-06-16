import express from 'express';
import {
  getAllTransacciones,
  getTransaccionById,
  createTransaccion,
  updateTransaccion,
  deleteTransaccion
} from '../controllers/TransaccionController.js';

const router = express.Router();

// Manejo de PUT sin ID - devolver error descriptivo
router.put('/', (req, res) => {
  res.status(400).json({ 
    error: 'ID requerido',
    message: 'Para actualizar una transacción, debe especificar el ID: PUT /api/transacciones/:id'
  });
});

router.get('/', getAllTransacciones);
router.get('/:id', getTransaccionById);
router.post('/', createTransaccion);
router.put('/:id', updateTransaccion);
router.delete('/:id', deleteTransaccion);

export default router; 