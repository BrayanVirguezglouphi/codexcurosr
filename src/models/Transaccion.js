import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaccion = sequelize.define('Transaccion', {
  id_transaccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_transaccion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tipo_transaccion: {
    type: DataTypes.ENUM('INGRESO', 'EGRESO', 'TRANSFERENCIA'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'COMPLETADA', 'ANULADA'),
    allowNull: false,
    defaultValue: 'PENDIENTE'
  },
  cuenta_origen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cuenta_destino: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  referencia: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  comprobante_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'adcot_transacciones',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

export default Transaccion; 