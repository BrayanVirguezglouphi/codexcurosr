// Ruta /api/db-test para probar conexión a Railway
export default async function handler(req, res) {
  console.log('🔄 Probando conexión a base de datos bajo demanda...');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Importar dinámicamente solo cuando se necesita
    const { testConnection } = await import('../src/config/database.js');
    
    // Timeout más corto para prueba
    const dbConnected = await Promise.race([
      testConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de 3 segundos')), 3000)
      )
    ]);
    
    res.status(200).json({
      success: true,
      database: {
        connected: dbConnected,
        host: process.env.DB_HOST,
        message: dbConnected ? 'Conexión exitosa a Railway' : 'Conexión falló'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error probando DB:', error.message);
    res.status(200).json({
      success: false,
      database: {
        connected: false,
        error: error.message,
        host: process.env.DB_HOST
      },
      timestamp: new Date().toISOString()
    });
  }
} 