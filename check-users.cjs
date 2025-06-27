const { Pool } = require('pg');

// Configuración de la base de datos (igual que en backend)
const dbConfig = {
  host: 'localhost',
  port: 8321,
  database: 'SQL_DDL_ADMCOT',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
};

const pool = new Pool(dbConfig);

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    // Consultar usuarios
    const query = 'SELECT id, username, email, password, created_at FROM "User" ORDER BY id';
    const result = await pool.query(query);
    
    console.log(`✅ Encontrados ${result.rows.length} usuarios:`);
    
    result.rows.forEach((user, index) => {
      console.log(`\n📋 Usuario ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password.substring(0, 20)}...`);
      console.log(`   Creado: ${user.created_at}`);
      console.log(`   ¿Hasheada?: ${user.password.startsWith('$2') ? 'Sí' : 'No (texto plano)'}`);
    });
    
    // Verificar si existe la tabla
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
    `;
    
    const tableResult = await pool.query(tableQuery);
    console.log(`\n📊 Tabla "User" existe: ${tableResult.rows.length > 0 ? 'SÍ' : 'NO'}`);
    
    if (result.rows.length === 0) {
      console.log('\n⚠️ No hay usuarios en la base de datos. Necesitas crear al menos uno.');
      console.log('💡 Puedes usar el endpoint POST /api/auth/register para crear un usuario.');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error.message);
    console.error('💡 Verifica que:');
    console.error('   - El tunnel de Cloudflare esté activo (localhost:8321)');
    console.error('   - La base de datos PostgreSQL esté corriendo');
    console.error('   - La tabla "User" exista en la base de datos');
  } finally {
    await pool.end();
  }
}

async function testConnection() {
  const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'SQL_DDL_ADMCOT',
    password: '12345',
    port: 5432,
  };

  console.log('📝 Configuración de conexión:');
  console.log(JSON.stringify(config, null, 2));

  const pool = new Pool(config);

  try {
    console.log('\n🔄 Intentando conectar a PostgreSQL...');
    const client = await pool.connect();
    
    console.log('✅ Conexión establecida exitosamente!');
    
    // Probar una consulta simple
    console.log('\n📊 Probando consulta simple...');
    const result = await client.query('SELECT version()');
    console.log('Versión de PostgreSQL:', result.rows[0].version);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('\n❌ Error de conexión:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Detalles:', error.detail || 'No hay detalles adicionales');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Posibles soluciones:');
      console.error('1. Verifica que el servidor PostgreSQL esté corriendo');
      console.error('2. Confirma que el puerto 5432 esté abierto');
      console.error('3. Revisa el archivo pg_hba.conf para permisos de conexión');
    } else if (error.code === '28P01') {
      console.error('\n💡 Error de autenticación:');
      console.error('- Verifica que el usuario y contraseña sean correctos');
    } else if (error.code === '3D000') {
      console.error('\n💡 Error de base de datos:');
      console.error('- Verifica que la base de datos SQL_DDL_ADMCOT exista');
    }
    
    if (pool) await pool.end();
    return false;
  }
}

checkUsers();

// Ejecutar la prueba
testConnection(); 
 
 