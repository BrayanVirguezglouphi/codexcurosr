import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';
import Transaccion from './Transaccion.js';

const Cuenta = sequelize.define('Cuenta', {
  id_cuenta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_titular: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  titulo_cuenta: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  titular_cuenta: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  numero_cuenta: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  url_certificado_cuenta: {
    type: DataTypes.TEXT,
    allowNull: true
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
