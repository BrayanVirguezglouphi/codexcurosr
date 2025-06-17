import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

console.log('🌐 Configurando base de datos para Google Cloud Platform...');

// Configuración para Google Cloud SQL
const isCloudRun = process.env.K_SERVICE ? true : false;
const isCloudSQL = process.env.DB_HOST && process.env.DB_HOST.includes('googleapis.com');

// Configuración de conexión
const dbConfig = {
  database: process.env.DB_NAME || 'railway',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  dialect: 'postgres'
};

console.log('🔗 Configuración GCP:');
console.log(`   Entorno: ${isCloudRun ? 'Cloud Run' : 'Local'}`);
console.log(`   Cloud SQL: ${isCloudSQL ? 'Sí' : 'No'}`);
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);

// Configuración optimizada para Cloud Run y Cloud SQL
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Pool de conexiones optimizado para Cloud Run
  pool: {
    max: isCloudRun ? 5 : 10,     // Menos conexiones en Cloud Run
    min: 0,                       // Sin conexiones mínimas
    acquire: 30000,               // Timeout para adquirir conexión
    idle: 10000,                  // Tiempo antes de cerrar conexión idle
    evict: 1000,                  // Intervalo de limpieza de conexiones
    handleDisconnects: true       // Manejar desconexiones automáticamente
  },
  
  dialectOptions: {
    // SSL siempre requerido en Cloud SQL
    ssl: isCloudSQL || process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    
    // Configuración específica para Cloud SQL
    connectTimeout: 20000,        // 20 segundos para conectar
    requestTimeout: 15000,        // 15 segundos para queries
    
    // Configuración adicional para Cloud SQL Proxy
    ...(isCloudSQL && {
      socketPath: process.env.DB_SOCKET_PATH, // Para Cloud SQL Proxy
    })
  },
  
  // Configuración de reintentos
  retry: {
    max: 3,
    match: [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ConnectionError',
      'ConnectionTimedOutError',
      'TimeoutError'
    ]
  },
  
  // Configuración para Cloud Run (stateless)
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Función de prueba de conexión mejorada
export const testConnection = async () => {
  try {
    console.log('🔄 Probando conexión a Cloud SQL...');
    
    // Intentar conexión con timeout
    const connectionPromise = sequelize.authenticate();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout de conexión')), 15000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ Conexión a Cloud SQL establecida correctamente.');
    
    // Verificar configuración de la base de datos
    const [results] = await sequelize.query('SELECT version()');
    console.log('📊 Versión PostgreSQL:', results[0].version);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Cloud SQL:', error.message);
    console.error('🔍 Detalles del error:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      isCloudRun,
      isCloudSQL,
      errorCode: error.original?.code,
      errorDetail: error.original?.detail
    });
    
    // En Cloud Run, no fallar inmediatamente
    if (isCloudRun) {
      console.warn('⚠️ Conexión falló en Cloud Run, reintentando en próxima request...');
      return false;
    }
    
    throw error;
  }
};

// Función para cerrar conexiones (importante en Cloud Run)
export const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔒 Conexiones de base de datos cerradas correctamente.');
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error.message);
  }
};

// Manejar cierre graceful de la aplicación
if (isCloudRun) {
  process.on('SIGTERM', async () => {
    console.log('📡 Recibido SIGTERM, cerrando conexiones...');
    await closeConnection();
    process.exit(0);
  });
}

export default sequelize; 