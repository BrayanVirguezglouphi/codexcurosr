import localSequelize from '../config/database.js';
import vmSequelize from '../config/database-vm.js';

const getTableInfo = async (sequelize, dbName) => {
  try {
    // Primero obtenemos los nombres de las tablas
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    // Luego obtenemos la información de columnas para cada tabla
    const tablesInfo = await Promise.all(
      tables.map(async ({ table_name }) => {
        const [columns] = await sequelize.query(`
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${table_name}'
          ORDER BY ordinal_position;
        `);
        
        return {
          table_name,
          column_count: columns.length,
          columns: columns.map(col => ({
            name: col.column_name,
            type: col.data_type + (col.character_maximum_length ? `(${col.character_maximum_length})` : ''),
            nullable: col.is_nullable === 'YES'
          }))
        };
      })
    );

    return tablesInfo;
  } catch (error) {
    console.error(`Error obteniendo información de ${dbName}:`, error);
    return [];
  }
};

const compareTables = async () => {
  try {
    console.log('🔄 Comparando tablas entre bases de datos...\n');

    // Obtener información de ambas bases de datos
    const localTables = await getTableInfo(localSequelize, 'Local');
    const vmTables = await getTableInfo(vmSequelize, 'VM');

    // Crear mapas para facilitar la comparación
    const localMap = new Map(localTables.map(t => [t.table_name, t]));
    const vmMap = new Map(vmTables.map(t => [t.table_name, t]));

    // Encontrar tablas únicas en cada base de datos
    const allTables = new Set([...localMap.keys(), ...vmMap.keys()]);
    
    console.log('📊 Resumen:');
    console.log(`   Local: ${localTables.length} tablas`);
    console.log(`   VM: ${vmTables.length} tablas\n`);

    // Tablas que solo existen en Local
    console.log('🟦 Tablas solo en Local:');
    let hasLocalOnly = false;
    for (const tableName of allTables) {
      if (!vmMap.has(tableName) && localMap.has(tableName)) {
        hasLocalOnly = true;
        const table = localMap.get(tableName);
        console.log(`   ├─ ${tableName} (${table.column_count} columnas)`);
      }
    }
    if (!hasLocalOnly) console.log('   ├─ Ninguna');
    console.log('   └────────────\n');

    // Tablas que solo existen en VM
    console.log('🟨 Tablas solo en VM:');
    let hasVMOnly = false;
    for (const tableName of allTables) {
      if (!localMap.has(tableName) && vmMap.has(tableName)) {
        hasVMOnly = true;
        const table = vmMap.get(tableName);
        console.log(`   ├─ ${tableName} (${table.column_count} columnas)`);
      }
    }
    if (!hasVMOnly) console.log('   ├─ Ninguna');
    console.log('   └────────────\n');

    // Tablas con diferente estructura
    console.log('🟧 Tablas con diferencias en columnas:');
    let hasDifferences = false;
    for (const tableName of allTables) {
      if (localMap.has(tableName) && vmMap.has(tableName)) {
        const localTable = localMap.get(tableName);
        const vmTable = vmMap.get(tableName);
        
        // Comparar columnas
        const localColMap = new Map(localTable.columns.map(c => [c.name, c]));
        const vmColMap = new Map(vmTable.columns.map(c => [c.name, c]));
        
        const localCols = new Set(localColMap.keys());
        const vmCols = new Set(vmColMap.keys());
        
        const localOnly = [...localCols].filter(x => !vmCols.has(x));
        const vmOnly = [...vmCols].filter(x => !localCols.has(x));
        const commonCols = [...localCols].filter(x => vmCols.has(x));
        
        const typeDiffs = commonCols.filter(col => {
          const localCol = localColMap.get(col);
          const vmCol = vmColMap.get(col);
          return localCol.type !== vmCol.type || localCol.nullable !== vmCol.nullable;
        });
        
        if (localOnly.length > 0 || vmOnly.length > 0 || typeDiffs.length > 0) {
          hasDifferences = true;
          console.log(`   ├─ ${tableName}:`);
          console.log(`      Local: ${localTable.column_count} columnas`);
          console.log(`      VM: ${vmTable.column_count} columnas`);
          
          if (localOnly.length > 0) {
            console.log('      Columnas solo en Local:');
            localOnly.forEach(col => {
              const colInfo = localColMap.get(col);
              console.log(`      - ${col} (${colInfo.type}, ${colInfo.nullable ? 'nullable' : 'required'})`);
            });
          }
          
          if (vmOnly.length > 0) {
            console.log('      Columnas solo en VM:');
            vmOnly.forEach(col => {
              const colInfo = vmColMap.get(col);
              console.log(`      - ${col} (${colInfo.type}, ${colInfo.nullable ? 'nullable' : 'required'})`);
            });
          }
          
          if (typeDiffs.length > 0) {
            console.log('      Columnas con diferentes tipos:');
            typeDiffs.forEach(col => {
              const localCol = localColMap.get(col);
              const vmCol = vmColMap.get(col);
              console.log(`      - ${col}:`);
              console.log(`        Local: ${localCol.type}, ${localCol.nullable ? 'nullable' : 'required'}`);
              console.log(`        VM: ${vmCol.type}, ${vmCol.nullable ? 'nullable' : 'required'}`);
            });
          }
          
          console.log('      ────────────');
        }
      }
    }
    if (!hasDifferences) console.log('   ├─ Ninguna');
    console.log('   └────────────');

  } catch (error) {
    console.error('Error durante la comparación:', error);
  } finally {
    await Promise.all([
      localSequelize.close(),
      vmSequelize.close()
    ]);
  }
};

compareTables(); 