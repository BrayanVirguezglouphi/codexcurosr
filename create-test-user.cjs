const { Pool } = require('pg');

const pool = new Pool({
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
});

async function createTestUser() {
  try {
    // Primero verificar si la tabla existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creando tabla Users...');
      await pool.query(`
        CREATE TABLE "Users" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Tabla Users creada exitosamente');
    }

    // Insertar usuario de prueba
    const result = await pool.query(`
      INSERT INTO "Users" (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
      SET password = $3, role = $4
      RETURNING id, name, email, role;
    `, ['Ana Torres', 'ana.torres@example.com', '1234', 'admin']);

    console.log('\nUsuario creado/actualizado:', result.rows[0]);

    // Verificar que el usuario existe
    const check = await pool.query('SELECT id, name, email, password, role FROM "Users" WHERE email = $1', ['ana.torres@example.com']);
    console.log('\nVerificación del usuario:', check.rows[0]);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

createTestUser(); 