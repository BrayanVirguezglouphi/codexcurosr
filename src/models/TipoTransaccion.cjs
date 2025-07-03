const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const TipoTransaccion = sequelize.define('TipoTransaccion', {
  id_tipotransaccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_transaccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion_tipo_transaccion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'adcot_tipo_transaccion',
  timestamps: false
});

module.exports = TipoTransaccion; 