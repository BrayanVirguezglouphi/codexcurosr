import express from 'express';
import {
  getAllBuyerPersonas,
  getBuyerPersonaById,
  createBuyerPersona,
  updateBuyerPersona,
  deleteBuyerPersona
} from '../controllers/BuyerPersonaController.js';

const router = express.Router();

// Manejo de PUT sin ID - devolver error descriptivo
router.put('/', (req, res) => {
  res.status(400).json({ 
    error: 'ID requerido',
    message: 'Para actualizar una buyer persona, debe especificar el ID: PUT /api/crm/buyer-personas/:id'
  });
});

router.get('/', getAllBuyerPersonas);
router.get('/:id', getBuyerPersonaById);
router.post('/', createBuyerPersona);
router.put('/:id', updateBuyerPersona);
router.delete('/:id', deleteBuyerPersona);

export default router; 