import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';
import Transaccion from './Transaccion.js';

const Cuenta = sequelize.define('Cuenta', {
  id_cuenta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_cuenta: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'adcot_cuentas',
  timestamps: false
});

Cuenta.hasMany(Transaccion, { foreignKey: 'id_cuenta', as: 'transacciones' });
Transaccion.belongsTo(Cuenta, { foreignKey: 'id_cuenta', as: 'cuenta' });
Cuenta.hasMany(Transaccion, { foreignKey: 'id_cuenta_destino_transf', as: 'transfRecibidas' });
Transaccion.belongsTo(Cuenta, { foreignKey: 'id_cuenta_destino_transf', as: 'cuentaDestino' });

export default Cuenta; 