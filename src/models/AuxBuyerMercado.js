import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const AuxBuyerMercado = sequelize.define('AuxBuyerMercado', {
  id_buyer_mercado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_mercado: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_buyer: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'crm_aux_buyer_mercados',
  timestamps: false
});

export default AuxBuyerMercado; 