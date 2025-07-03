import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LineaServicio = sequelize.define('LineaServicio', {
  id_servicio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  servicio: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion_servicio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_modelonegocio: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'adcot_lineas_de_servicios',
  timestamps: false
});

export default LineaServicio; 