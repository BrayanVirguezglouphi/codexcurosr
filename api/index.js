// Versión simplificada para Vercel - Evita timeouts
import express from 'express';
import cors from 'cors';

const app = express();

// Configurar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

console.log('🚀 API iniciada en Vercel - Modo simplificado');
console.log('Variables disponibles:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL:', process.env.VERCEL);
console.log('- DB_HOST:', process.env.DB_HOST ? 'Configurado' : 'No configurado');

// RUTAS BÁSICAS (sin inicialización compleja)
app.get('/api/test', (req, res) => {
  console.log('✅ Ruta /api/test ejecutada correctamente');
  res.json({
    success: true,
    message: 'API funciona correctamente en Vercel',
    timestamp: new Date().toISOString(),
    environment: {
      vercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV,
      hasDbHost: !!process.env.DB_HOST
    },
    request: {
      method: req.method,
      url: req.url
    }
  });
});

app.get('/api/health', (req, res) => {
  console.log('✅ Ruta /api/health ejecutada correctamente');
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando correctamente',
    environment: process.env.NODE_ENV,
    platform: 'Vercel',
    database: {
      host: process.env.DB_HOST,
      status: 'testing...',
      note: 'Conexión se prueba bajo demanda'
    }
  });
});

// RUTA DE CONEXIÓN A DB (se ejecuta solo cuando se llama)
app.get('/api/db-test', async (req, res) => {
  console.log('🔄 Probando conexión a base de datos bajo demanda...');
  
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
    
    res.json({
      success: true,
      database: {
        connected: dbConnected,
        host: process.env.DB_HOST,
        message: dbConnected ? 'Conexión exitosa' : 'Conexión falló'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error probando DB:', error.message);
    res.json({
      success: false,
      database: {
        connected: false,
        error: error.message,
        host: process.env.DB_HOST
      },
      timestamp: new Date().toISOString()
    });
  }
});

// RUTA DE TRANSACCIONES CON CARGA BAJO DEMANDA
app.get('/api/transacciones', async (req, res) => {
  console.log('🔄 Cargando transacciones bajo demanda...');
  
  try {
    // Intentar cargar módulos de base de datos dinámicamente
    const { testConnection } = await import('../src/config/database.js');
    
    const dbConnected = await Promise.race([
      testConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout DB')), 3000)
      )
    ]);
    
    if (dbConnected) {
      console.log('✅ DB conectada - Cargando controlador real...');
      
      // Importar controlador real
      const { default: TransaccionController } = await import('../src/controllers/TransaccionController.js');
      const { default: setupRelationships } = await import('../src/models/relationships.js');
      
      // Configurar relaciones solo para esta request
      setupRelationships();
      
      // Ejecutar controlador real
      const controller = new TransaccionController();
      await controller.obtenerTransacciones(req, res);
      
    } else {
      throw new Error('Base de datos no disponible');
    }
    
  } catch (error) {
    console.log('⚠️ Error con DB, usando modo fallback:', error.message);
    
    // Modo fallback
    res.json({
      success: true,
      message: 'Endpoint de transacciones en modo fallback',
      note: 'Base de datos no disponible, mostrando datos de prueba',
      data: [
        {
          id: 1,
          titulo: 'Transacción de prueba',
          timestamp: new Date().toISOString()
        }
      ],
      total: 1,
      fallback: true,
      error: error.message
    });
  }
});

// Manejo de errores simplificado
app.use((err, req, res, next) => {
  console.error('❌ Error en aplicación:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`⚠️ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/api/health',
      '/api/test',
      '/api/db-test',
      '/api/transacciones'
    ]
  });
});

export default app; 