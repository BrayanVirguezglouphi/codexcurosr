const { Pool } = require('pg');

const pool = new Pool({
  host: '35.238.111.59',
  port: 5432,
  database: 'SQL_DDL_ADMCOT',
  user: 'postgres',
  password: '123456789',
  ssl: false
});

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...');
    
    // Verificar todas las tablas
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Todas las tablas disponibles:');
    allTables.rows.forEach(row => console.log('- ' + row.table_name));
    
    // Verificar estructura de la tabla de transacciones
    console.log('\n🔍 Verificando tabla de transacciones...');
    const transactionTable = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'adcot_transacciones'
      ORDER BY ordinal_position
    `);
    
    if (transactionTable.rows.length > 0) {
      console.log('\n📊 Columnas de adcot_transacciones:');
      transactionTable.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('❌ Tabla adcot_transacciones no encontrada');
    }
    
    // Contar transacciones
    const count = await pool.query('SELECT COUNT(*) FROM adcot_transacciones');
    console.log(`\n📈 Total de transacciones: ${count.rows[0].count}`);
    
    // Ver algunas transacciones de muestra
    const sample = await pool.query('SELECT * FROM adcot_transacciones LIMIT 3');
    console.log('\n📝 Muestra de transacciones:');
    sample.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id_transaccion}, Título: ${row.titulo_transaccion}, Valor: ${row.valor_total_transaccion}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables(); 