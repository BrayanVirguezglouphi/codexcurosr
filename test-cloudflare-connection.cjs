const { Pool } = require('pg');

async function testCloudflareConnection() {
  console.log('🔗 Probando múltiples configuraciones de Cloudflare Tunnel...\n');
  
  // Configuraciones a probar basadas en tu setup de Cloudflare
  const configuraciones = [
    {
      nombre: 'api2.zuhe.social con puerto 5432',
      config: {
        host: 'api2.zuhe.social',
        port: 5432,
        database: 'SQL_DDL_ADMCOT',
        user: 'postgres',
        password: '00GP5673BD**$eG3Ve1101',
        ssl: false
      }
    },
    {
      nombre: 'api2.zuhe.social con puerto 8321',
      config: {
        host: 'api2.zuhe.social',
        port: 8321,
        database: 'SQL_DDL_ADMCOT',
        user: 'postgres',
        password: '00GP5673BD**$eG3Ve1101',
        ssl: false
      }
    },
    {
      nombre: 'database.zuhe.social con puerto 5432',
      config: {
        host: 'database.zuhe.social',
        port: 5432,
        database: 'SQL_DDL_ADMCOT',
        user: 'postgres',
        password: '00GP5673BD**$eG3Ve1101',
        ssl: false
      }
    },
    {
      nombre: 'api.zuhe.social con puerto 5432',
      config: {
        host: 'api.zuhe.social',
        port: 5432,
        database: 'SQL_DDL_ADMCOT',
        user: 'postgres',
        password: '00GP5673BD**$eG3Ve1101',
        ssl: false
      }
    }
  ];
  
  let conexionExitosa = false;
  
  for (const { nombre, config } of configuraciones) {
    console.log(`\n🔍 Probando: ${nombre}`);
    console.log(`📋 Host: ${config.host}:${config.port}`);
    
    const pool = new Pool(config);
    
    try {
      // Timeout más corto para cada prueba
      const result = await Promise.race([
        pool.query('SELECT NOW() as current_time, version() as postgres_version'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 10000)
        )
      ]);
      
      console.log('✅ ¡CONEXIÓN EXITOSA!');
      console.log('⏰ Hora del servidor:', result.rows[0].current_time);
      console.log('🗄️ Versión PostgreSQL:', result.rows[0].postgres_version);
      
      // Verificar tabla User
      const userTable = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'User'
      `);
      
      if (userTable.rows.length > 0) {
        console.log('✅ Tabla User encontrada');
        
        const davidUser = await pool.query('SELECT id, username, email FROM "User" WHERE username = $1', ['david']);
        
        if (davidUser.rows.length > 0) {
          console.log('✅ Usuario david encontrado:', davidUser.rows[0]);
        } else {
          console.log('❌ Usuario david no encontrado');
        }
      } else {
        console.log('❌ Tabla User no encontrada');
      }
      
      conexionExitosa = true;
      console.log(`\n🎉 CONFIGURACIÓN CORRECTA ENCONTRADA:`);
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      break;
      
    } catch (error) {
      if (error.message === 'TIMEOUT') {
        console.log('❌ Timeout (10 segundos)');
      } else {
        console.log('❌ Error:', error.code || error.message);
      }
    } finally {
      await pool.end();
    }
  }
  
  if (!conexionExitosa) {
    console.log('\n💡 SUGERENCIAS:');
    console.log('1. El tunnel de Cloudflare puede requerir autenticación desde Cloud Run');
    console.log('2. Verifica que las aplicaciones en Zero Trust permitan acceso público');
    console.log('3. Considera usar una conexión directa TCP en lugar de HTTP proxy');
    console.log('4. Revisa si necesitas configurar Service Auth en Cloudflare');
  }
}

if (require.main === module) {
  testCloudflareConnection();
}

module.exports = { testCloudflareConnection }; 
testCloudflareConnection(); 