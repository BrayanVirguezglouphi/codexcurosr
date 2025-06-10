import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CentroCosto = sequelize.define('CentroCosto', {
  id_centro_costo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sub_centro_costo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  centro_costo_macro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descripcion_cc: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'adcot_centros_costos',
  timestamps: false
});

export default CentroCosto; 