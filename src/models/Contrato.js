import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const Contrato = sequelize.define('Contrato', {
  id_contrato: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_contrato_os: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_tercero: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  descripcion_servicio_contratado: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estatus_contrato: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'ACTIVO'
  },
  fecha_contrato: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_inicio_servicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_final_servicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  id_moneda_cotizacion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  valor_cotizado: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  valor_descuento: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  trm: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  id_tax: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  valor_tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  modo_de_pago: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  url_cotizacion: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  url_contrato: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  observaciones_contrato: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'adcot_contratos_clientes',
  timestamps: false
});

export default Contrato; 