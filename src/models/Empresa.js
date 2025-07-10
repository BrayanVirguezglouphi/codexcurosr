import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const Empresa = sequelize.define('Empresa', {
  id_empresa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_mercado: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  empresa: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_pais: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tamano_empleados: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  linkedin: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'crm_empresas',
  timestamps: false
});

export default Empresa; 