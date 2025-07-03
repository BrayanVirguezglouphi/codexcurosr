const { Pool } = require('pg');

// Configuración de conexión
const dbConfig = {
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false,
  // Configuración adicional para mejorar la estabilidad
  connectionTimeoutMillis: 60000, // 60 segundos
  idleTimeoutMillis: 30000, // 30 segundos
  max: 5, // máximo de conexiones
  keepAlive: true
};

console.log('🔗 Configuración de base de datos:');
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Password: ${'*'.repeat(dbConfig.password.length)}`);

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Manejar errores del pool
pool.on('error', (err, client) => {
  console.error('❌ Error inesperado del pool:', err);
});

// Función para probar la conexión
const testConnection = async () => {
  let client;
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos establecida correctamente:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    console.error('🔍 Detalles del error:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      errorCode: error.code,
      errorDetail: error.detail
    });
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Probar conexión automáticamente
testConnection();

module.exports = { pool, testConnection }; 