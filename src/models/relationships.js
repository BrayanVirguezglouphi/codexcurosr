import Factura from './Factura.js';
import Transaccion from './Transaccion.js';

// Relación entre Facturas y Transacciones a través de la tabla auxiliar
const setupRelationships = () => {
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
};

export default setupRelationships; 