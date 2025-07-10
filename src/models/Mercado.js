import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const Mercado = sequelize.define('Mercado', {
  id_mercado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  segmento_mercado: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_pais: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_industria: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  resumen_mercado: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recomendaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  url_reporte_mercado: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'crm_mercados',
  timestamps: false
});

export default Mercado; 