const { Pool } = require('pg');

async function testLocalTunnel() {
  console.log('🔗 Probando conexión a través del proxy local de cloudflared...');
  
  // Configuración para conectarse al proxy local de cloudflared
  const localTunnelConfig = {
    host: 'localhost',
    port: 8321,
    database: 'SQL_DDL_ADMCOT',
    user: 'postgres',
    password: '00GP5673BD**$eG3Ve1101',
    ssl: false
  };
  
  console.log('📋 Configuración (proxy local):', {
    host: localTunnelConfig.host,
    port: localTunnelConfig.port,
    database: localTunnelConfig.database,
    user: localTunnelConfig.user
  });
  
  const pool = new Pool(localTunnelConfig);
  
  try {
    console.log('\n🔍 Intentando conectar a través del proxy local...');
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Conexión exitosa a través del proxy local de cloudflared!');
    console.log('⏰ Hora del servidor:', result.rows[0].current_time);
    console.log('🗄️ Versión PostgreSQL:', result.rows[0].postgres_version);
    
    console.log('\n🔍 Verificando tabla User...');
    const userTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'User'
    `);
    
    if (userTable.rows.length > 0) {
      console.log('✅ Tabla User encontrada');
      
      console.log('\n🔍 Verificando usuario david...');
      const davidUser = await pool.query('SELECT id, username, email FROM "User" WHERE username = $1', ['david']);
      
      if (davidUser.rows.length > 0) {
        console.log('✅ Usuario david encontrado:', davidUser.rows[0]);
        
        console.log('\n🔍 Probando login simulado...');
        const bcrypt = require('bcryptjs');
        const user = davidUser.rows[0];
        
        // Obtener la contraseña completa
        const fullUser = await pool.query('SELECT * FROM "User" WHERE username = $1', ['david']);
        const passwordTest = await bcrypt.compare('dav1dpwd', fullUser.rows[0].password);
        console.log('🔐 Prueba de contraseña:', passwordTest ? '✅ Correcta' : '❌ Incorrecta');
        
      } else {
        console.log('❌ Usuario david no encontrado');
      }
    } else {
      console.log('❌ Tabla User no encontrada');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    if (error.code) {
      console.error('🔍 Código de error:', error.code);
    }
  } finally {
    pool.end();
  }
}

testLocalTunnel(); 