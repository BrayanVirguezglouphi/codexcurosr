import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Moneda = sequelize.define('Moneda', {
  id_moneda: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_iso: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  nombre_moneda: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  simbolo: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  es_moneda_base: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  tableName: 'moneda',
  timestamps: false
});

export default Moneda; 