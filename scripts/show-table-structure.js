const { Sequelize } = require('sequelize');
const config = require('../src/config/database.cjs');

async function showTableStructure() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    const sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');

    // Lista de tablas que queremos consultar
    const tables = [
      'cuentas',
      'monedas',
      'tipos_transaccion',
      'etiquetas_contables',
      'conceptos_transacciones',
      'terceros',
      'transacciones'
    ];

    for (const table of tables) {
      console.log(`\n📋 Estructura de la tabla ${table}:`);
      console.log('----------------------------------------');
      
      // Consultar la estructura de la tabla
      const [results] = await sequelize.query(`
        SELECT 
          column_name, 
          data_type,
          character_maximum_length,
          column_default,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${table}'
        ORDER BY ordinal_position;
      `);

      // Mostrar los resultados en formato tabla
      console.table(results);

      // Obtener una muestra de datos
      const [sampleData] = await sequelize.query(`
        SELECT * FROM ${table} LIMIT 1;
      `);

      if (sampleData.length > 0) {
        console.log(`\n📝 Ejemplo de registro en ${table}:`);
        console.log(JSON.stringify(sampleData[0], null, 2));
      } else {
        console.log(`\n⚠️ No hay datos de ejemplo en la tabla ${table}`);
      }
      
      console.log('\n' + '='.repeat(50));
    }

    await sequelize.close();
    console.log('\n👋 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showTableStructure(); 