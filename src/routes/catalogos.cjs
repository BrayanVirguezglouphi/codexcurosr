const express = require('express');
const Cuenta = require('../models/Cuenta.js');
const TipoTransaccion = require('../models/TipoTransaccion.cjs');
const Moneda = require('../models/Moneda.js');
const EtiquetaContable = require('../models/EtiquetaContable.cjs');
const Tercero = require('../models/Tercero.js');
const Concepto = require('../models/Concepto.js');
const Contrato = require('../models/Contrato.js');
const Tax = require('../models/Tax.js');
const { pool } = require('../../backend-server-fixed.cjs');

const router = express.Router();

router.get('/cuentas', async (req, res) => {
  const cuentas = await Cuenta.findAll({ attributes: ['id_cuenta', 'titulo_cuenta'] });
  res.json(cuentas);
});

router.get('/tipos-transaccion', async (req, res) => {
  try {
    console.log('🔍 Consultando tipos de transacción...');
    const tipos = await TipoTransaccion.findAll({ 
      attributes: ['id_tipotransaccion', 'tipo_transaccion', 'descripcion_tipo_transaccion'],
      order: [['tipo_transaccion', 'ASC']]
    });
    console.log('✅ Tipos de transacción encontrados:', tipos);
    res.json(tipos);
  } catch (error) {
    console.error('❌ Error al obtener tipos de transacción:', error);
    res.status(500).json({ error: 'Error al obtener tipos de transacción', details: error.message });
  }
});

router.get('/monedas', async (req, res) => {
  try {
    console.log('🔍 Consultando monedas...');
    const monedas = await Moneda.findAll({
      attributes: ['id_moneda', 'codigo_iso', 'nombre_moneda', 'simbolo', 'es_moneda_base'],
      order: [['nombre_moneda', 'ASC']]
    });

    console.log('✅ Monedas encontradas:', monedas);
    res.json(monedas);
  } catch (error) {
    console.error('❌ Error al obtener monedas:', error);
    res.status(500).json({ error: 'Error al obtener monedas', details: error.message });
  }
});

router.get('/etiquetas-contables', async (req, res) => {
  try {
    console.log('🔍 Consultando etiquetas contables...');
    const etiquetas = await EtiquetaContable.findAll({ 
      attributes: ['id_etiqueta_contable', 'etiqueta_contable'],
      order: [['etiqueta_contable', 'ASC']]
    });
    console.log('✅ Etiquetas contables encontradas:', etiquetas);
    res.json(etiquetas);
  } catch (error) {
    console.error('❌ Error al obtener etiquetas contables:', error);
    res.status(500).json({ error: 'Error al obtener etiquetas contables', details: error.message });
  }
});

router.get('/terceros', async (req, res) => {
  const terceros = await Tercero.findAll({ attributes: ['id_tercero', 'razon_social', 'primer_nombre', 'primer_apellido'] });
  res.json(terceros);
});

router.get('/conceptos', async (req, res) => {
  const conceptos = await Concepto.findAll({ attributes: ['id_concepto', 'concepto_dian'] });
  res.json(conceptos);
});

router.get('/contratos', async (req, res) => {
  const contratos = await Contrato.findAll({ attributes: ['id_contrato', 'numero_contrato_os', 'descripcion_servicio_contratado'] });
  res.json(contratos);
});

router.get('/impuestos', async (req, res) => {
  try {
    console.log('🔍 Consultando impuestos...');
    const impuestos = await Tax.findAll({
      raw: true,
      nest: true,
      attributes: [
        'id_tax',
        'tipo_obligacion',
        'institucion_reguladora',
        'titulo_impuesto',
        'formula_aplicacion',
        'periodicidad_declaracion'
      ],
      order: [['titulo_impuesto', 'ASC']]
    });
    console.log('✅ Impuestos encontrados:', impuestos);
    res.json(impuestos);
  } catch (error) {
    console.error('❌ Error al obtener impuestos:', error);
    res.status(500).json({ error: 'Error al obtener impuestos', details: error.message });
  }
});

router.get('/tipos-relacion', async (req, res) => {
  try {
    console.log('🔍 Consultando tipos de relación...');
    const result = await pool.query('SELECT id_tiporelacion, tipo_relacion FROM adcot_relacion_contractual');
    console.log('✅ Tipos de relación encontrados:', result.rows);
    res.json(result.rows || []);
  } catch (error) {
    console.error('❌ Error al obtener tipos de relación:', error);
    res.status(500).json({ error: 'Error al obtener tipos de relación', details: error.message });
  }
});

router.get('/tipos-documento', async (req, res) => {
  try {
    console.log('🔍 Consultando tipos de documento...');
    const result = await pool.query('SELECT id_tipodocumento, tipo_documento FROM adcot_tipo_documento');
    console.log('✅ Tipos de documento encontrados:', result.rows);
    res.json(result.rows || []);
  } catch (error) {
    console.error('❌ Error al obtener tipos de documento:', error);
    res.status(500).json({ error: 'Error al obtener tipos de documento', details: error.message });
  }
});

module.exports = router; 