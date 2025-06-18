import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';
import Transaccion from './Transaccion.js';

const Concepto = sequelize.define('Concepto', {
  id_concepto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_concepto: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'adcot_conceptos_transacciones',
  timestamps: false
});

Concepto.hasMany(Transaccion, { foreignKey: 'id_concepto', as: 'transacciones' });
Transaccion.belongsTo(Concepto, { foreignKey: 'id_concepto', as: 'concepto' });

export default Concepto; 