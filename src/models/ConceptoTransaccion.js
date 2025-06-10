import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConceptoTransaccion = sequelize.define('ConceptoTransaccion', {
  id_concepto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_tipotransaccion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  codigo_dian: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  concepto_dian: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'adcot_conceptos_transacciones',
  timestamps: false
});

export default ConceptoTransaccion; 