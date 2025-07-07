import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffOKR = sequelize.define('StaffOKR', {
  id_staff: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_staff'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nombre'
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'correo'
  },
  rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'rol'
  },
  id_tercero: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'id_tercero'
  }
}, {
  tableName: 'okr_staff',
  schema: 'public',
  timestamps: false,
  freezeTableName: true
});

export default StaffOKR; 