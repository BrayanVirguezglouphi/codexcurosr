import sequelize from '../config/database-vm.js';

const showVMTables = async () => {
  try {
    console.log('\n📊 Estructura de la base de datos VM\n');

    // Obtener todas las tablas
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    // Agrupar tablas por módulo
    const modules = {
      'Contabilidad (ADCOT)': tables.filter(t => t.table_name.startsWith('adcot_')),
      'CRM': tables.filter(t => t.table_name.startsWith('crm_')),
      'RRHH': tables.filter(t => t.table_name.startsWith('rrhh_')),
      'General': tables.filter(t => !t.table_name.startsWith('adcot_') && 
                                  !t.table_name.startsWith('crm_') && 
                                  !t.table_name.startsWith('rrhh_'))
    };

    // Mostrar tablas por módulo
    for (const [moduleName, moduleTables] of Object.entries(modules)) {
      console.log(`\n🔷 ${moduleName}`);
      console.log('═'.repeat(50));

      for (const {table_name} of moduleTables) {
        // Obtener información de columnas
        const [columns] = await sequelize.query(`
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            column_default,
            is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${table_name}'
          ORDER BY ordinal_position;
        `);

        // Obtener llaves primarias
        const [primaryKeys] = await sequelize.query(`
          SELECT c.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
          JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
            AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
          WHERE constraint_type = 'PRIMARY KEY' AND tc.table_name = '${table_name}';
        `);

        // Obtener llaves foráneas
        const [foreignKeys] = await sequelize.query(`
          SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
          WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = '${table_name}';
        `);

        console.log(`\n📋 ${table_name}`);
        console.log('   Columnas:');
        columns.forEach(col => {
          const type = col.character_maximum_length 
            ? `${col.data_type}(${col.character_maximum_length})`
            : col.data_type;
          const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
          const isPK = primaryKeys.some(pk => pk.column_name === col.column_name) ? '🔑' : ' ';
          const fk = foreignKeys.find(fk => fk.column_name === col.column_name);
          const fkInfo = fk ? ` → ${fk.foreign_table_name}(${fk.foreign_column_name})` : '';
          
          console.log(`   ${isPK} ${col.column_name}: ${type} ${nullable}${fkInfo}`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

showVMTables(); 