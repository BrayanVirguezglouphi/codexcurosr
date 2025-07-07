import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Objetivo = sequelize.define('Objetivo', {
  id_objetivo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_objetivo'
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'titulo'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'descripcion'
  },
  nivel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'nivel'
  },
  id_responsable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_responsable'
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_inicio'
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_fin'
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Activo',
    field: 'estado'
  },
  id_objetivo_preexistente: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_objetivo_preexistente'
  },
  nivel_impacto: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'nivel_impacto'
  }
}, {
  tableName: 'okr_objetivos',
  schema: 'public',
  timestamps: false,
  freezeTableName: true
});

export default Objetivo; 