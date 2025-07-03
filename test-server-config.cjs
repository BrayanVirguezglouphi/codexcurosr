const { Pool } = require('pg');

// Configuración que usa el servidor
const serverConfig = {
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
};

async function checkServerConfig() {
  const pool = new Pool(serverConfig);
  
  try {
    console.log('\nVerificando conexión con configuración del servidor...');
    console.log('Config:', serverConfig);
    
    // Probar conexión
    const connTest = await pool.query('SELECT NOW()');
    console.log('\nConexión exitosa:', connTest.rows[0]);
    
    // Verificar tabla Users
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Users'
      );
    `);
    console.log('\nTabla Users existe:', tableCheck.rows[0].exists);
    
    // Verificar usuario de prueba
    const userCheck = await pool.query(
      'SELECT id, email, password, role FROM "Users" WHERE email = $1',
      ['ana.torres@example.com']
    );
    
    if (userCheck.rows.length > 0) {
      console.log('\nUsuario encontrado:', userCheck.rows[0]);
    } else {
      console.log('\nUsuario no encontrado');
    }
    
  } catch (err) {
    console.error('\nError:', err);
  } finally {
    await pool.end();
  }
}

checkServerConfig(); 