import express from 'express';
import {
  getAllFacturas,
  getFacturaById,
  createFactura,
  updateFactura,
  deleteFactura,
  importFacturas
} from '../controllers/FacturaController.js';

const router = express.Router();

router.get('/', getAllFacturas);
router.get('/:id', getFacturaById);
router.post('/', createFactura);
router.post('/import', importFacturas);
router.put('/:id', updateFactura);
router.delete('/:id', deleteFactura);

export default router; 