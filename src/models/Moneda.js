import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';
import Transaccion from './Transaccion.js';

const Moneda = sequelize.define('Moneda', {
  id_moneda: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_moneda: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo_iso: {
    type: DataTypes.STRING(10),
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

Moneda.hasMany(Transaccion, { foreignKey: 'id_moneda_transaccion', as: 'transacciones' });
Transaccion.belongsTo(Moneda, { foreignKey: 'id_moneda_transaccion', as: 'moneda' });

export default Moneda; 