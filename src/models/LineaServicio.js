import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LineaServicio = sequelize.define('LineaServicio', {
  id_servicio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_servicio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  servicio: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion_servicio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'adcot_lineas_de_servicios',
  timestamps: false
});

export default LineaServicio; 