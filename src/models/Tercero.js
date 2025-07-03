import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';
import Transaccion from './Transaccion.js';

const Tercero = sequelize.define('Tercero', {
  id_tercero: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_relacion: {
    type: DataTypes.INTEGER,
    references: {
      model: 'adcot_relacion_contractual',
      key: 'id_tiporelacion'
    }
  },
  tipo_personalidad: {
    type: DataTypes.STRING(50)
  },
  primer_nombre: {
    type: DataTypes.STRING(50)
  },
  otros_nombres: {
    type: DataTypes.STRING(50)
  },
  primer_apellido: {
    type: DataTypes.STRING(50)
  },
  segundo_apellido: {
    type: DataTypes.STRING(50)
  },
  razon_social: {
    type: DataTypes.STRING(150)
  },
  tipo_documento: {
    type: DataTypes.INTEGER,
    references: {
      model: 'adcot_tipo_documento',
      key: 'id_tipodocumento'
    }
  },
  numero_documento: {
    type: DataTypes.STRING(50)
  },
  dv: {
    type: DataTypes.STRING(5)
  },
  direccion: {
    type: DataTypes.STRING(100)
  },
  pais: {
    type: DataTypes.STRING(50)
  },
  departamento_region: {
    type: DataTypes.STRING(50)
  },
  municipio_ciudad: {
    type: DataTypes.STRING(50)
  },
  telefono: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  observaciones: {
    type: DataTypes.STRING(250)
  }
}, {
  tableName: 'adcot_terceros_exogenos',
  timestamps: false
});

Tercero.hasMany(Transaccion, { foreignKey: 'id_tercero', as: 'transacciones' });
Transaccion.belongsTo(Tercero, { foreignKey: 'id_tercero', as: 'tercero' });

export default Tercero; 