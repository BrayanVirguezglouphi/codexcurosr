import { DataTypes } from 'sequelize';
import { sequelize } from '@/config/database';
import { User } from './User';

export const Actividad = sequelize.define('actividad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_actividad: {
    type: DataTypes.ENUM('CLIENTE', 'FACTURA', 'RRHH', 'CRM', 'TRANSACCION', 'CONTRATO', 'SISTEMA'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entidad_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de la entidad relacionada (factura, cliente, etc.)'
  },
  tipo_entidad: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tipo de la entidad relacionada (Factura, Cliente, etc.)'
  },
  datos_adicionales: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Datos adicionales en formato JSON'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'actividades',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Relación con Usuario
Actividad.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
}); 