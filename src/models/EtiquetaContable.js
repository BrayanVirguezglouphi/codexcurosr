import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';
import Transaccion from './Transaccion.js';

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

export default EtiquetaContable; 