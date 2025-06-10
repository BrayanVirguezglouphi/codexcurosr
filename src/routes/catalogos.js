import express from 'express';
import Cuenta from '../models/Cuenta.js';
import TipoTransaccion from '../models/TipoTransaccion.js';
import Moneda from '../models/Moneda.js';
import EtiquetaContable from '../models/EtiquetaContable.js';
import Tercero from '../models/Tercero.js';
import Concepto from '../models/Concepto.js';
import Contrato from '../models/Contrato.js';
import Tax from '../models/Tax.js';

const router = express.Router();

router.get('/cuentas', async (req, res) => {
  const cuentas = await Cuenta.findAll({ attributes: ['id_cuenta', 'titulo_cuenta'] });
  res.json(cuentas);
});

router.get('/tipos-transaccion', async (req, res) => {
  const tipos = await TipoTransaccion.findAll({ attributes: ['id_tipotransaccion', 'tipo_transaccion'] });
  res.json(tipos);
});

router.get('/monedas', async (req, res) => {
  const monedas = await Moneda.findAll({ attributes: ['id_moneda', 'nombre_moneda'] });
  res.json(monedas);
});

router.get('/etiquetas-contables', async (req, res) => {
  const etiquetas = await EtiquetaContable.findAll({ attributes: ['id_etiqueta_contable', 'etiqueta_contable'] });
  res.json(etiquetas);
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

router.get('/taxes', async (req, res) => {
  const taxes = await Tax.findAll({ attributes: ['id_tax', 'titulo_impuesto'] });
  res.json(taxes);
});

export default router; 