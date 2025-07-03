const { Pool } = require('pg');

const pool = new Pool({
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
});

async function testLogin() {
  try {
    // 1. Primero veamos todos los usuarios disponibles
    const allUsers = await pool.query('SELECT id, email, password FROM "Users" LIMIT 5');
    console.log('\nUsuarios disponibles:', allUsers.rows);

    // 2. Simulemos el proceso de login que usa el backend
    const testEmail = 'ana.torres@example.com'; // Usando un usuario que existe
    const testPassword = '1234'; // La contraseña que vimos en la base de datos
    const query = 'SELECT * FROM "Users" WHERE email = $1';
    const result = await pool.query(query, [testEmail]);
    
    if (result.rows.length === 0) {
      console.log('\nPrueba de login:', {
        email: testEmail,
        resultado: 'Usuario no encontrado'
      });
    } else {
      const user = result.rows[0];
      const passwordMatch = testPassword === user.password;
      console.log('\nPrueba de login:', {
        email: testEmail,
        encontrado: true,
        id: user.id,
        role: user.role,
        password_stored: user.password,
        password_provided: testPassword,
        password_matches: passwordMatch
      });
    }

    // 3. Veamos la consulta exacta que hace el backend
    const backendQuery = await pool.query('SELECT id, name, email, role FROM "Users" WHERE email = $1', [testEmail]);
    console.log('\nResultado consulta backend:', backendQuery.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

testLogin();