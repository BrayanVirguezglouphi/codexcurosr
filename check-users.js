const { Pool } = require('pg');

// Configuración de la base de datos (igual que en backend)
const dbConfig = {
  host: 'localhost',
  port: 8321,
  database: 'SQL_DDL_ADMCOT',
  user: 'postgres',
  password: 'your_password',
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

checkUsers(); 