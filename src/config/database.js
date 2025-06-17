import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno (excepto en producción Cloud Run)
if (!process.env.K_SERVICE) {
  dotenv.config();
}

console.log('Iniciando configuración de la base de datos...');
console.log('Variables de entorno disponibles:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('CLOUD_RUN:', process.env.K_SERVICE || 'No');

// Configuración de conexión con variables de entorno
const dbConfig = {
  database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  dialect: 'postgres'
};

console.log('🔗 Configuración de base de datos:');
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.username}`);
console.log(`   Password: ${'*'.repeat(dbConfig.password.length)}`);

// Configuración especial para Cloud Run (stateless containers)
const isCloudRun = process.env.K_SERVICE ? true : false;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: false, // Desactivar logging en producción para funciones serverless
  pool: {
    max: isCloudRun ? 5 : 10,        // Menos conexiones en Cloud Run
    min: 0,         // Mínimo de conexiones
    acquire: isCloudRun ? 15000 : 30000, // Timeout más corto en Cloud Run
    idle: isCloudRun ? 10000 : 10000     // Liberar conexiones más rápido en Cloud Run
  },
  dialectOptions: {
    // Para conexiones SSL si es necesario
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // Timeout de conexión más corto para containers
    connectTimeout: isCloudRun ? 15000 : 30000
  },
  // Reintentos de conexión
  retry: {
    max: isCloudRun ? 2 : 3
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

// Solo probar conexión automáticamente si no estamos en Cloud Run
if (!process.env.K_SERVICE) {
  testConnection();
}

export default sequelize; 