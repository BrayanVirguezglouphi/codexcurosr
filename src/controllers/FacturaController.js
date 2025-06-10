import Factura from '../models/Factura.js';
import Contrato from '../models/Contrato.js';
import Tercero from '../models/Tercero.js';
import Moneda from '../models/Moneda.js';
import Tax from '../models/Tax.js';

export const getAllFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: Contrato,
          as: 'contrato',
          attributes: ['id_contrato', 'numero_contrato_os', 'descripcion_servicio_contratado', 'estatus_contrato'],
          include: [
            {
              model: Tercero,
              as: 'tercero',
              attributes: ['id_tercero', 'primer_nombre', 'primer_apellido', 'razon_social', 'numero_documento', 'tipo_personalidad']
            }
          ]
        },
        {
          model: Moneda,
          as: 'moneda',
          attributes: ['id_moneda', 'nombre_moneda', 'codigo_iso', 'simbolo']
        },
        {
          model: Tax,
          as: 'tax',
          attributes: ['id_tax', 'titulo_impuesto']
        }
      ],
      order: [['id_factura', 'DESC']]
    });
    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getFacturaById = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [
        {
          model: Contrato,
          as: 'contrato',
          attributes: ['id_contrato', 'numero_contrato_os', 'descripcion_servicio_contratado', 'estatus_contrato'],
          include: [
            {
              model: Tercero,
              as: 'tercero',
              attributes: ['id_tercero', 'primer_nombre', 'primer_apellido', 'razon_social', 'numero_documento', 'tipo_personalidad']
            }
          ]
        },
        {
          model: Moneda,
          as: 'moneda',
          attributes: ['id_moneda', 'nombre_moneda', 'codigo_iso', 'simbolo']
        },
        {
          model: Tax,
          as: 'tax',
          attributes: ['id_tax', 'titulo_impuesto']
        }
      ]
    });
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

export const importFacturas = async (req, res) => {
  try {
    console.log('=== RECIBIENDO IMPORTACIÓN EN SERVIDOR ===');
    console.log('Headers recibidos:', req.headers);
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    console.log('Body completo:', req.body);
    
    const { facturas } = req.body;
    
    console.log('Array de facturas extraído:', facturas);
    
    if (!facturas || !Array.isArray(facturas) || facturas.length === 0) {
      console.log('Error: Array de facturas inválido');
      return res.status(400).json({ 
        message: 'Se requiere un array de facturas para importar' 
      });
    }

    console.log(`Importando ${facturas.length} facturas...`);

    const resultados = {
      exitosas: [],
      errores: [],
      total: facturas.length
    };

    // Procesar cada factura individualmente
    for (let i = 0; i < facturas.length; i++) {
      const facturaData = facturas[i];
      
      try {
        // Validar campos requeridos
        const camposRequeridos = ['numero_factura', 'estatus_factura', 'fecha_radicado', 'subtotal_facturado_moneda'];
        const camposFaltantes = camposRequeridos.filter(campo => {
          const valor = facturaData[campo];
          const faltante = !valor || valor === null || valor === undefined || valor === '';
          if (faltante) {
            console.log(`Campo faltante: ${campo} = ${valor} (tipo: ${typeof valor})`);
          }
          return faltante;
        });
        
        console.log(`Fila ${i + 1} - Campos faltantes:`, camposFaltantes);
        console.log(`Fila ${i + 1} - Datos completos:`, facturaData);
        
        if (camposFaltantes.length > 0) {
          resultados.errores.push({
            fila: facturaData._rowIndex || i + 1,
            data: facturaData,
            error: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
          });
          continue;
        }

        // Limpiar campos que no deben ir a la BD
        const { _rowIndex, ...cleanData } = facturaData;

        // Convertir fechas si están en formato string
        if (cleanData.fecha_radicado && typeof cleanData.fecha_radicado === 'string') {
          cleanData.fecha_radicado = new Date(cleanData.fecha_radicado);
        }
        if (cleanData.fecha_estimada_pago && typeof cleanData.fecha_estimada_pago === 'string') {
          cleanData.fecha_estimada_pago = new Date(cleanData.fecha_estimada_pago);
        }

        // Crear la factura
        const nuevaFactura = await Factura.create(cleanData);
        resultados.exitosas.push({
          fila: facturaData._rowIndex || i + 1,
          id: nuevaFactura.id_factura,
          numero_factura: nuevaFactura.numero_factura
        });
        
      } catch (error) {
        console.error(`Error en fila ${i + 1}:`, error);
        
        let mensajeError = error.message;
        
        // Manejar errores específicos de Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
          mensajeError = `Número de factura duplicado: ${facturaData.numero_factura}`;
        } else if (error.name === 'SequelizeValidationError') {
          mensajeError = error.errors?.map(e => `${e.path}: ${e.message}`).join(', ') || 'Error de validación';
        }
        
        resultados.errores.push({
          fila: facturaData._rowIndex || i + 1,
          data: facturaData,
          error: mensajeError
        });
      }
    }

    // Respuesta con resultados
    const response = {
      message: `Importación completada: ${resultados.exitosas.length} exitosas, ${resultados.errores.length} errores`,
      resultados
    };

    // Si hay errores, retornar código 207 (Multi-Status)
    if (resultados.errores.length > 0) {
      res.status(207).json(response);
    } else {
      res.status(201).json(response);
    }

  } catch (error) {
    console.error('Error en importación masiva:', error);
    res.status(500).json({ 
      message: 'Error interno en la importación',
      error: error.message 
    });
  }
}; 