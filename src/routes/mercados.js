import express from 'express';
import {
  getAllMercados,
  getMercadoById,
  createMercado,
  updateMercado,
  deleteMercado
} from '../controllers/MercadoController.js';

const router = express.Router();

// Manejo de PUT sin ID - devolver error descriptivo
router.put('/', (req, res) => {
  res.status(400).json({ 
    error: 'ID requerido',
    message: 'Para actualizar un mercado, debe especificar el ID: PUT /api/crm/mercados/:id'
  });
});

router.get('/', getAllMercados);
router.get('/:id', getMercadoById);
router.post('/', createMercado);
router.put('/:id', updateMercado);
router.delete('/:id', deleteMercado);

export default router; 