import BuyerPersona from '../models/BuyerPersona.js';

export const getAllBuyerPersonas = async (req, res) => {
  try {
    console.log('🔍 Obteniendo buyer personas...');
    const buyerPersonas = await BuyerPersona.findAll({
      order: [['buyer', 'ASC']]
    });
    console.log(`✅ Encontradas ${buyerPersonas.length} buyer personas`);
    res.json(buyerPersonas);
  } catch (error) {
    console.error('❌ Error al obtener buyer personas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const getBuyerPersonaById = async (req, res) => {
  try {
    const buyerPersona = await BuyerPersona.findByPk(req.params.id);
    if (buyerPersona) {
      res.json(buyerPersona);
    } else {
      res.status(404).json({ message: 'Buyer Persona no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener buyer persona por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createBuyerPersona = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    // Validar campos requeridos
    const camposRequeridos = ['buyer'];
    for (const campo of camposRequeridos) {
      if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === '') {
        return res.status(400).json({ 
          message: `El campo ${campo} es requerido`,
          field: campo
        });
      }
    }

    const buyerPersona = await BuyerPersona.create(req.body);
    console.log('Buyer Persona creada:', buyerPersona);
    res.status(201).json(buyerPersona);
  } catch (error) {
    console.error('Error al crear buyer persona:', error);
    
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
      message: 'Error interno al crear la buyer persona',
      error: error.message
    });
  }
};

export const updateBuyerPersona = async (req, res) => {
  try {
    console.log('🔄 UPDATE - ID:', req.params.id);
    console.log('🔄 UPDATE - Datos recibidos:', req.body);
    
    const buyerPersona = await BuyerPersona.findByPk(req.params.id);
    if (!buyerPersona) {
      console.log('❌ UPDATE - Buyer Persona no encontrada:', req.params.id);
      return res.status(404).json({ message: 'Buyer Persona no encontrada' });
    }

    console.log('✅ UPDATE - Buyer Persona encontrada:', buyerPersona.id_buyer);

    console.log('🔄 UPDATE - Actualizando buyer persona...');
    await buyerPersona.update(req.body);
    console.log('✅ UPDATE - Buyer Persona actualizada correctamente');
    console.log('📤 UPDATE - Enviando respuesta:', buyerPersona.toJSON());
    
    res.json(buyerPersona);
  } catch (error) {
    console.error('❌ UPDATE - Error al actualizar buyer persona:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteBuyerPersona = async (req, res) => {
  try {
    const buyerPersona = await BuyerPersona.findByPk(req.params.id);
    if (!buyerPersona) {
      return res.status(404).json({ message: 'Buyer Persona no encontrada' });
    }

    await buyerPersona.destroy();
    res.json({ message: 'Buyer Persona eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar buyer persona:', error);
    res.status(500).json({ message: error.message });
  }
}; 