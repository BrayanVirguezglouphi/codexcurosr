import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('Iniciando configuración de la base de datos...');

// Configuración de conexión con variables de entorno
const dbConfig = {
  database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres'
};

console.log('🔗 Configuración de base de datos:');
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.username}`);
console.log(`   Password: ${'*'.repeat(dbConfig.password.length)}`);

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,        // Máximo de conexiones simultáneas
    min: 0,         // Mínimo de conexiones
    acquire: 30000, // Tiempo máximo para obtener conexión (30 seg)
    idle: 10000     // Tiempo máximo de inactividad (10 seg)
  },
  dialectOptions: {
    // Para conexiones SSL si es necesario
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // Timeout de conexión
    connectTimeout: 30000
  },
  // Reintentos de conexión
  retry: {
    max: 3
  }
});

// Función para probar la conexión
export const testConnection = async () => {
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    console.error('🔍 Detalles del error:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      errorCode: error.original?.code,
      errorDetail: error.original?.detail
    });
    return false;
  }
};

// Probar conexión al cargar el módulo
testConnection();

export default sequelize; 