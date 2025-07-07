import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComentarioOKR = sequelize.define('ComentarioOKR', {
  id_comentario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_comentario'
  },
  id_objetivo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_objetivo'
  },
  id_kr: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_kr'
  },
  id_autor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_autor'
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'texto'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'okr_comentarios',
  schema: 'public',
  timestamps: false,
  freezeTableName: true
});

export default ComentarioOKR; 