import express from 'express';
import {
  getAllContactoPersonas,
  getContactoPersonaById,
  createContactoPersona,
  updateContactoPersona,
  deleteContactoPersona
} from '../controllers/ContactoPersonaController.js';

const router = express.Router();

// Manejo de PUT sin ID - devolver error descriptivo
router.put('/', (req, res) => {
  res.status(400).json({ 
    error: 'ID requerido',
    message: 'Para actualizar un contacto, debe especificar el ID: PUT /api/crm/contactos/:id'
  });
});

router.get('/', getAllContactoPersonas);
router.get('/:id', getContactoPersonaById);
router.post('/', createContactoPersona);
router.put('/:id', updateContactoPersona);
router.delete('/:id', deleteContactoPersona);

export default router; 