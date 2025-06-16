import Transaccion from '../models/Transaccion.js';
import Cuenta from '../models/Cuenta.js';
import TipoTransaccion from '../models/TipoTransaccion.js';
import Moneda from '../models/Moneda.js';
import EtiquetaContable from '../models/EtiquetaContable.js';
import Tercero from '../models/Tercero.js';
import Concepto from '../models/Concepto.js';

export const getAllTransacciones = async (req, res) => {
  try {
    const transacciones = await Transaccion.findAll({
      include: [
        { model: Cuenta, as: 'cuenta', attributes: ['titulo_cuenta'] },
        { model: Cuenta, as: 'cuentaDestino', attributes: ['titulo_cuenta'] },
        { model: TipoTransaccion, as: 'tipoTransaccion', attributes: ['tipo_transaccion'] },
        { model: Moneda, as: 'moneda', attributes: ['nombre_moneda'] },
        { model: EtiquetaContable, as: 'etiquetaContable', attributes: ['etiqueta_contable'] },
        { model: Tercero, as: 'tercero', attributes: ['primer_nombre', 'primer_apellido', 'razon_social'] },
        { model: Concepto, as: 'concepto', attributes: ['concepto_dian'] }
      ],
      order: [['fecha_transaccion', 'DESC']]
    });
    const transaccionesProcesadas = transacciones.map(t => {
      const tercero = t.tercero;
      let nombre_tercero = null;
      if (tercero) {
        if (tercero.razon_social) {
          nombre_tercero = tercero.razon_social;
        } else if (tercero.primer_nombre || tercero.primer_apellido) {
          nombre_tercero = `${tercero.primer_nombre || ''} ${tercero.primer_apellido || ''}`.trim();
        }
      }
      return {
        ...t.toJSON(),
        nombre_tercero: nombre_tercero || '-'
      };
    });
    res.json(transaccionesProcesadas);
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
    const camposRequeridos = ['id_cuenta', 'id_tipotransaccion', 'fecha_transaccion', 'valor_total_transaccion'];
    for (const campo of camposRequeridos) {
      if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === '') {
        return res.status(400).json({ 
          message: `El campo ${campo} es requerido`,
          field: campo
        });
      }
    }

    // Validar que el valor_total_transaccion sea positivo
    if (parseFloat(req.body.valor_total_transaccion) <= 0) {
      return res.status(400).json({
        message: 'El valor total de la transacción debe ser mayor que 0',
        field: 'valor_total_transaccion'
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
    console.log('🔄 UPDATE - ID:', req.params.id);
    console.log('🔄 UPDATE - Datos recibidos:', req.body);
    
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      console.log('❌ UPDATE - Transacción no encontrada:', req.params.id);
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    console.log('✅ UPDATE - Transacción encontrada:', transaccion.id_transaccion);

    // Validar que el valor_total_transaccion sea positivo si se está actualizando
    if (req.body.valor_total_transaccion && parseFloat(req.body.valor_total_transaccion) <= 0) {
      console.log('❌ UPDATE - Valor inválido:', req.body.valor_total_transaccion);
      return res.status(400).json({
        message: 'El valor total de la transacción debe ser mayor que 0',
        field: 'valor_total_transaccion'
      });
    }

    console.log('🔄 UPDATE - Actualizando transacción...');
    await transaccion.update(req.body);
    console.log('✅ UPDATE - Transacción actualizada correctamente');
    console.log('📤 UPDATE - Enviando respuesta:', transaccion.toJSON());
    
    res.json(transaccion);
  } catch (error) {
    console.error('❌ UPDATE - Error al actualizar transacción:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findByPk(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    await transaccion.destroy();
    res.json({ message: 'Transacción eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ message: error.message });
  }
}; 