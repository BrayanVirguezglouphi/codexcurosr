import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const Factura = sequelize.define('Factura', {
  id_factura: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_factura: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estatus_factura: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  id_contrato: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_radicado: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_estimada_pago: {
    type: DataTypes.DATE,
    allowNull: true
  },
  id_moneda: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  subtotal_facturado_moneda: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  id_tax: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  valor_tax: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  observaciones_factura: {
    type: DataTypes.STRING(250),
    allowNull: true
  }
}, {
  tableName: 'adcot_facturas',
  timestamps: false
});

export default Factura; 