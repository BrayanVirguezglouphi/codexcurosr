import { DataTypes } from 'sequelize';
import sequelize from '../config/database-gcp.js';

const ContactoPersona = sequelize.define('ContactoPersona', {
  id_persona: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_primero: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nombre_segundo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  apellido_primero: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido_segundo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  id_empresa: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cargo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  correo_corporativo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  correo_personal: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  rol: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  id_buyer: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'crm_personas_interes',
  timestamps: false
});

export default ContactoPersona; 