import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RegistroAvance = sequelize.define('RegistroAvance', {
  id_registro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_registro'
  },
  id_kr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_kr'
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_hora'
  },
  valor_actual: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    field: 'valor_actual'
  },
  progreso_calculado: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    field: 'progreso_calculado'
  }
}, {
  tableName: 'okr_registros_avance',
  schema: 'public',
  timestamps: false,
  freezeTableName: true
});

export default RegistroAvance; 