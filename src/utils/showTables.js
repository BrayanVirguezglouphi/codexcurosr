import sequelize from '../config/database.js';

const showTables = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `);
    
    console.log('Tablas encontradas en la base de datos:');
    results.forEach(result => {
      console.log(result.table_name);
    });

    // Obtener estructura de cada tabla
    for (const result of results) {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${result.table_name}'
        ORDER BY ordinal_position;
      `);
      
      console.log(`\nEstructura de la tabla ${result.table_name}:`);
      columns.forEach(column => {
        console.log(`- ${column.column_name}: ${column.data_type}${column.character_maximum_length ? `(${column.character_maximum_length})` : ''} ${column.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
  } catch (error) {
    console.error('Error al obtener las tablas:', error);
  } finally {
    await sequelize.close();
  }
};

showTables(); 