const { pool } = require('../src/config/database.cjs');

async function showTableStructure() {
  let client;
  try {
    console.log('🔄 Conectando a la base de datos...');
    client = await pool.connect();
    console.log('✅ Conexión establecida correctamente\n');

    // Primero obtener todas las tablas del esquema public
    console.log('📋 Listando todas las tablas disponibles:');
    console.log('----------------------------------------');
    
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.table(tables);

    // Ahora mostrar la estructura de cada tabla
    for (const { table_name } of tables) {
      console.log(`\n📋 Estructura de la tabla ${table_name}:`);
      console.log('----------------------------------------');
      
      // Consultar la estructura de la tabla
      const { rows: columns } = await client.query(`
        SELECT 
          column_name, 
          data_type,
          character_maximum_length,
          column_default,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `, [table_name]);

      // Mostrar los resultados en formato tabla
      console.table(columns);

      // Obtener una muestra de datos
      const { rows: sampleData } = await client.query(`
        SELECT * FROM "${table_name}" LIMIT 1;
      `);

      if (sampleData.length > 0) {
        console.log(`\n📝 Ejemplo de registro en ${table_name}:`);
        console.log(JSON.stringify(sampleData[0], null, 2));
      } else {
        console.log(`\n⚠️ No hay datos de ejemplo en la tabla ${table_name}`);
      }
      
      console.log('\n' + '='.repeat(50));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
      console.log('\n👋 Conexión cerrada');
    }
  }
}

showTableStructure(); 