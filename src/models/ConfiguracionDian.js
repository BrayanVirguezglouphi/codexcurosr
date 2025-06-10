import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConfiguracionDian = sequelize.define('ConfiguracionDian', {
  id_configuracion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ambiente: {
    type: DataTypes.ENUM('HABILITACION', 'PRODUCCION'),
    defaultValue: 'HABILITACION',
    allowNull: false,
    comment: 'Ambiente DIAN (Pruebas o Producción)'
  },
  nit_empresa: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'NIT de la empresa facturadora'
  },
  razon_social: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Razón social de la empresa'
  },
  resolucion_dian: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Número de resolución DIAN'
  },
  fecha_resolucion: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de la resolución DIAN'
  },
  prefijo_factura: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Prefijo autorizado para facturas'
  },
  rango_inicial: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número inicial autorizado'
  },
  rango_final: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número final autorizado'
  },
  numero_actual: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Último número utilizado'
  },
  url_api_envio: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'URL del servicio de envío DIAN'
  },
  url_api_consulta: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'URL del servicio de consulta DIAN'
  },
  certificado_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Ruta del certificado digital'
  },
  certificado_password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Contraseña del certificado (encriptada)'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'adcot_configuracion_dian',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['nit_empresa', 'ambiente']
    }
  ]
});

export default ConfiguracionDian;
