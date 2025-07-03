const { Pool } = require('pg');

const pool = new Pool({
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
});

async function showUsers() {
  try {
    const result = await pool.query('SELECT id, email, password, role FROM "Users" ORDER BY id');
    console.log('\nUsuarios disponibles:');
    result.rows.forEach(user => {
      console.log(`\nID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
      console.log('------------------------');
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

showUsers(); 