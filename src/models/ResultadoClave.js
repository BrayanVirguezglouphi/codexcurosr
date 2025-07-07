import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ResultadoClave = sequelize.define('ResultadoClave', {
  id_kr: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_kr'
  },
  id_objetivo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_objetivo'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'descripcion'
  },
  valor_objetivo: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    field: 'valor_objetivo'
  },
  unidad: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'unidad'
  },
  fecha_limite: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_limite'
  },
  id_responsable: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_responsable'
  },
  porcentaje_cumplimiento: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    field: 'porcentaje_cumplimiento'
  },
  fecha_evaluacion: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_evaluacion'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'okr_resultados_clave',
  schema: 'public',
  timestamps: false,
  freezeTableName: true
});

export default ResultadoClave; 