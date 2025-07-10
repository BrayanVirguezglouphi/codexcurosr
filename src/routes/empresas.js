import express from 'express';
import {
  getAllEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
} from '../controllers/EmpresaController.js';

const router = express.Router();

// Manejo de PUT sin ID - devolver error descriptivo
router.put('/', (req, res) => {
  res.status(400).json({ 
    error: 'ID requerido',
    message: 'Para actualizar una empresa, debe especificar el ID: PUT /api/crm/empresas/:id'
  });
});

router.get('/', getAllEmpresas);
router.get('/:id', getEmpresaById);
router.post('/', createEmpresa);
router.put('/:id', updateEmpresa);
router.delete('/:id', deleteEmpresa);

export default router; 