import sequelize from '../config/database-vm.js';

const showTables = async () => {
  try {
    // Consultar todas las tablas
    const [results] = await sequelize.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nTablas en la base de datos:');
    console.log('------------------------');
    
    for (const table of results) {
      console.log(`📋 ${table.table_name} (${table.column_count} columnas)`);
      
      // Obtener información de las columnas
      const [columns] = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}'
        ORDER BY ordinal_position;
      `);
      
      columns.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'required';
        console.log(`   ├─ ${col.column_name}: ${type} (${nullable})`);
      });
      console.log('   └────────────');
    }

  } catch (error) {
    console.error('Error al obtener las tablas:', error);
  } finally {
    await sequelize.close();
  }
};

showTables(); 