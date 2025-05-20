import Factura from '../models/Factura.js';

export const getAllFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll();
    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getFacturaById = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (factura) {
      res.json(factura);
    } else {
      res.status(404).json({ message: 'Factura no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener factura por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createFactura = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    // Validar campos requeridos
    const camposRequeridos = ['numero_factura', 'estatus_factura', 'fecha_radicado', 'subtotal_facturado_moneda'];
    for (const campo of camposRequeridos) {
      if (!req.body[campo]) {
        return res.status(400).json({ 
          message: `El campo ${campo} es requerido`,
          field: campo
        });
      }
    }

    const factura = await Factura.create(req.body);
    console.log('Factura creada:', factura);
    res.status(201).json(factura);
  } catch (error) {
    console.error('Error al crear factura:', error);
    
    // Si es un error de validación de Sequelize
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
    
    // Para otros tipos de errores
    res.status(500).json({ 
      message: 'Error interno al crear la factura',
      error: error.message
    });
  }
};

export const updateFactura = async (req, res) => {
  try {
    console.log('Actualizando factura:', req.params.id, req.body);
    const factura = await Factura.findByPk(req.params.id);
    if (factura) {
      await factura.update(req.body);
      res.json(factura);
    } else {
      res.status(404).json({ message: 'Factura no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteFactura = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (factura) {
      await factura.destroy();
      res.json({ message: 'Factura eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Factura no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ message: error.message });
  }
}; 