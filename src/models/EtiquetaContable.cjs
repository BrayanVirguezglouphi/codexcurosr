const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');
const Transaccion = require('./Transaccion.js');

const EtiquetaContable = sequelize.define('EtiquetaContable', {
  id_etiqueta_contable: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  etiqueta_contable: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion_etiqueta: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'adcot_etiquetas_contables',
  timestamps: false
});

EtiquetaContable.hasMany(Transaccion, { foreignKey: 'id_etiqueta_contable', as: 'transacciones' });
Transaccion.belongsTo(EtiquetaContable, { foreignKey: 'id_etiqueta_contable', as: 'etiquetaContable' });

module.exports = EtiquetaContable; 