import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const Transaccion = sequelize.define('Transaccion', {
  id_transaccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_tipotransaccion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_transaccion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  titulo_transaccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  id_moneda_transaccion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  valor_total_transaccion: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  trm_moneda_base: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: true
  },
  observacion: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  url_soporte_adjunto: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  registro_auxiliar: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  registro_validado: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  id_etiqueta_contable: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_tercero: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_cuenta_destino_transf: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  aplica_retencion: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  aplica_impuestos: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  id_concepto: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'adcot_transacciones',
  timestamps: false
});

export default Transaccion; 