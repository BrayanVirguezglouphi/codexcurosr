import sequelize from '../src/config/database.js';

// Importar todos los modelos
import '../src/models/User.js';
import '../src/models/Tercero.js';
import '../src/models/Factura.js';
import '../src/models/Transaccion.js';
import '../src/models/CentroCosto.js';
import '../src/models/Concepto.js';
import '../src/models/ConceptoTransaccion.js';
import '../src/models/ConfiguracionDian.js';
import '../src/models/Contrato.js';
import '../src/models/Cuenta.js';
import '../src/models/EtiquetaContable.js';
import '../src/models/LineaServicio.js';
import '../src/models/Moneda.js';
import '../src/models/Tax.js';
import '../src/models/TipoTransaccion.js';

// Importar relaciones
import '../src/models/relationships.js';

console.log('🚀 Creando tablas en Google Cloud SQL...');

async function createTables() {
  try {
    // Probar conexión
    console.log('🔄 Probando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Sincronizar modelos (crear tablas)
    console.log('🔄 Creando tablas...');
    await sequelize.sync({ force: true }); // force: true elimina y recrea todas las tablas
    console.log('✅ Todas las tablas creadas correctamente.');

    // Mostrar tablas creadas
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tablas creadas:');
    results.forEach(table => {
      console.log(`   • ${table.table_name}`);
    });
    
    console.log('\n🎉 ¡Base de datos lista para usar!');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Agregar datos iniciales manualmente desde la aplicación');
    console.log('   2. O ejecutar scripts específicos de inserción');

  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar creación de tablas
createTables()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error.message);
    process.exit(1);
  }); 