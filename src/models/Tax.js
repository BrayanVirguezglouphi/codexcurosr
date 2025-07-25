import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tax = sequelize.define('Tax', {
  id_tax: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_tax'
  },
  tipo_obligacion: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tipo_obligacion'
  },
  institucion_reguladora: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'institucion_reguladora'
  },
  titulo_impuesto: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'titulo_impuesto'
  },
  formula_aplicacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'formula_aplicacion'
  },
  oportunidades_optimizacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  periodicidad_declaracion: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'periodicidad_declaracion'
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'ACTIVO'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  url_referencia_normativa: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  fecha_inicio_impuesto: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_final_impuesto: {
    type: DataTypes.DATE,
    allowNull: true
  },
  url_instrucciones: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'adcot_taxes',
  schema: 'public',
  timestamps: false,
  freezeTableName: true
});

export default Tax; 