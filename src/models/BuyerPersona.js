import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const BuyerPersona = sequelize.define('BuyerPersona', {
  id_buyer: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  buyer: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  background: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  retos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  identificadores: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  objeciones_comunes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  conductas_compra: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  que_podemos_hacer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  posible_mensaje: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  que_oye: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  que_piensa_siente: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  que_ve: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  que_dice_hace: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  esfuerzos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resultados_valor: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  url_file: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'crm_buyer_persona',
  timestamps: false
});

export default BuyerPersona; 