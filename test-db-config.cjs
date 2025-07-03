const { Pool } = require('pg');

const config = {
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
};

async function testConfig() {
  const pool = new Pool(config);
  
  try {
    console.log('\nProbando conexión con config:', config);
    
    // Probar conexión
    const connTest = await pool.query('SELECT NOW()');
    console.log('\nConexión exitosa:', connTest.rows[0]);
    
    // Listar bases de datos
    const dbList = await pool.query('SELECT datname FROM pg_database');
    console.log('\nBases de datos disponibles:');
    dbList.rows.forEach(db => console.log(`- ${db.datname}`));
    
    // Listar tablas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\nTablas en la base de datos actual:');
    tables.rows.forEach(table => console.log(`- ${table.table_name}`));
    
    // Verificar tabla Users
    const userTable = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      ORDER BY ordinal_position;
    `);
    
    if (userTable.rows.length > 0) {
      console.log('\nEstructura de la tabla Users:');
      userTable.rows.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));
      
      // Contar usuarios
      const userCount = await pool.query('SELECT COUNT(*) FROM "Users"');
      console.log('\nTotal de usuarios:', userCount.rows[0].count);
      
      // Mostrar usuarios
      const users = await pool.query('SELECT id, email, password, role FROM "Users"');
      console.log('\nUsuarios en la tabla:');
      users.rows.forEach(user => console.log(user));
    } else {
      console.log('\nLa tabla Users no existe');
    }
    
  } catch (err) {
    console.error('\nError:', err);
  } finally {
    await pool.end();
  }
}

testConfig(); 