const { Pool } = require('pg');

const pool = new Pool({
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa:', result.rows);
    
    const usersResult = await pool.query('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'Users\');');
    console.log('¿Existe la tabla Users?:', usersResult.rows[0].exists);
    
    if (usersResult.rows[0].exists) {
      const columnsResult = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'Users\';');
      console.log('Estructura de la tabla Users:', columnsResult.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

testConnection();