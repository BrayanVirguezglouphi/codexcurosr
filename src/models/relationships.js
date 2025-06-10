import Factura from './Factura.js';

import Transaccion from './Transaccion.js';
import Contrato from './Contrato.js';
import Tercero from './Tercero.js';
import Moneda from './Moneda.js';
import Tax from './Tax.js';
import TipoTransaccion from './TipoTransaccion.js';

// Relaciones entre modelos
const setupRelationships = () => {
  // Relación entre Facturas y Transacciones a través de la tabla auxiliar
  Factura.belongsToMany(Transaccion, {
    through: 'adcot_aux_factura_transacciones',
    foreignKey: 'id_factura',
    otherKey: 'id_transaccion'
  });

  Transaccion.belongsToMany(Factura, {
    through: 'adcot_aux_factura_transacciones',
    foreignKey: 'id_transaccion',
    otherKey: 'id_factura'
  });



  // Relaciones de Facturas
  Factura.belongsTo(Contrato, { foreignKey: 'id_contrato', as: 'contrato' });
  Contrato.hasMany(Factura, { foreignKey: 'id_contrato', as: 'facturas' });

  Factura.belongsTo(Moneda, { foreignKey: 'id_moneda', as: 'moneda' });
  Moneda.hasMany(Factura, { foreignKey: 'id_moneda', as: 'facturas' });

  Factura.belongsTo(Tax, { foreignKey: 'id_tax', as: 'tax' });
  Tax.hasMany(Factura, { foreignKey: 'id_tax', as: 'facturas' });

  // Relaciones de Contratos
  Contrato.belongsTo(Tercero, { foreignKey: 'id_tercero', as: 'tercero' });
  Tercero.hasMany(Contrato, { foreignKey: 'id_tercero', as: 'contratos' });

  Contrato.belongsTo(Moneda, { foreignKey: 'id_moneda_cotizacion', as: 'moneda' });
  Moneda.hasMany(Contrato, { foreignKey: 'id_moneda_cotizacion', as: 'contratos' });

  Contrato.belongsTo(Tax, { foreignKey: 'id_tax', as: 'tax' });
  Tax.hasMany(Contrato, { foreignKey: 'id_tax', as: 'contratos' });

  // Relaciones de TipoTransaccion
  TipoTransaccion.hasMany(Transaccion, { foreignKey: 'id_tipotransaccion', as: 'transacciones' });
  Transaccion.belongsTo(TipoTransaccion, { foreignKey: 'id_tipotransaccion', as: 'tipoTransaccion' });
};

export default setupRelationships; 