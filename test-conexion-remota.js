import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Cargar variables de entorno
dotenv.config();

console.log('🧪 PRUEBA DE CONEXIÓN A BASE DE DATOS REMOTA');
console.log('='.repeat(50));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345'
};

console.log('📋 Configuración de conexión:');
console.log(`   🌐 Host: ${dbConfig.host}`);
console.log(`   🔌 Puerto: ${dbConfig.port}`);
console.log(`   🗄️  Base de Datos: ${dbConfig.database}`);
console.log(`   👤 Usuario: ${dbConfig.username}`);
console.log(`   🔐 Contraseña: ${'*'.repeat(dbConfig.password.length)}`);
console.log('');

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'postgres',
  logging: false, // Sin logs SQL para esta prueba
  dialectOptions: {
    connectTimeout: 10000, // 10 segundos de timeout
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function probarConexion() {
  try {
    console.log('🔄 Intentando conectar...');
    
    // Probar autenticación
    await sequelize.authenticate();
    console.log('✅ Autenticación exitosa!');
    
    // Probar consulta simple
    const [results] = await sequelize.query('SELECT NOW() as fecha_servidor, version() as version_postgres');
    console.log('✅ Consulta de prueba exitosa!');
    console.log(`   📅 Fecha del servidor: ${results[0].fecha_servidor}`);
    console.log(`   🐘 Versión PostgreSQL: ${results[0].version_postgres.split(' ')[0]} ${results[0].version_postgres.split(' ')[1]}`);
    
    // Verificar si existe la base de datos objetivo
    console.log('');
    console.log('🔍 Verificando estructura de la base de datos...');
    
    try {
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log(`✅ Base de datos encontrada con ${tables.length} tablas:`);
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
      
      // Verificar algunas tablas específicas del proyecto
      const expectedTables = ['facturas', 'terceros', 'contratos', 'transacciones'];
      const existingTables = tables.map(t => t.table_name.toLowerCase());
      
      console.log('');
      console.log('🧾 Verificando tablas del proyecto:');
      expectedTables.forEach(tableName => {
        const exists = existingTables.some(existing => existing.includes(tableName.toLowerCase()));
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${tableName}`);
      });
      
    } catch (error) {
      console.log('⚠️  No se pudo verificar la estructura de tablas');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('');
    console.log('🎉 CONEXIÓN EXITOSA - Todo está funcionando correctamente!');
    console.log('👍 Puedes usar esta configuración en tu aplicación.');
    
  } catch (error) {
    console.log('❌ ERROR DE CONEXIÓN');
    console.log('');
    
    if (error.name === 'ConnectionRefusedError') {
      console.log('🚫 No se pudo conectar al servidor');
      console.log('   Posibles causas:');
      console.log('   • El servidor PostgreSQL no está corriendo');
      console.log('   • La IP o puerto son incorrectos');
      console.log('   • Firewall bloqueando la conexión');
      console.log('   • PostgreSQL no permite conexiones remotas');
    } else if (error.name === 'ConnectionTimedOutError') {
      console.log('⏰ Timeout de conexión');
      console.log('   Posibles causas:');
      console.log('   • Servidor muy lento para responder');
      console.log('   • Problemas de red');
      console.log('   • Firewall con reglas restrictivas');
    } else if (error.original && error.original.code === 'ENOTFOUND') {
      console.log('🔍 Host no encontrado');
      console.log('   Posibles causas:');
      console.log('   • La IP o dominio son incorrectos');
      console.log('   • Problemas de DNS');
    } else if (error.original && error.original.code === '28P01') {
      console.log('🔐 Error de autenticación');
      console.log('   Posibles causas:');
      console.log('   • Usuario o contraseña incorrectos');
      console.log('   • Usuario no tiene permisos para la base de datos');
    } else if (error.original && error.original.code === '3D000') {
      console.log('🗄️  Base de datos no existe');
      console.log('   Solución:');
      console.log('   • Crear la base de datos en el servidor remoto');
      console.log('   • Verificar el nombre exacto de la base de datos');
    }
    
    console.log('');
    console.log('🔧 Detalles técnicos del error:');
    console.log(`   Código: ${error.original?.code || 'N/A'}`);
    console.log(`   Mensaje: ${error.message}`);
    console.log(`   Host intentado: ${dbConfig.host}:${dbConfig.port}`);
  } finally {
    try {
      await sequelize.close();
      console.log('');
      console.log('🔌 Conexión cerrada.');
    } catch (closeError) {
      // Ignorar errores al cerrar
    }
  }
}

// Ejecutar prueba
probarConexion(); 