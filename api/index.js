// Versión híbrida optimizada para Vercel - CON base de datos optimizada
import express from 'express';
import cors from 'cors';
import { testConnection } from '../src/config/database.js';

const app = express();

// Configurar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Variables globales para control de inicialización
let dbInitialized = false;
let initializationPromise = null;
let appInitialized = false;

// Función de inicialización inteligente
const initializeApp = async () => {
  if (appInitialized) return true;
  
  if (initializationPromise) {
    return await initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🚀 Iniciando aplicación híbrida en Vercel...');
      console.log('Variables de entorno:');
      console.log('- NODE_ENV:', process.env.NODE_ENV);
      console.log('- VERCEL:', process.env.VERCEL);
      console.log('- DB_HOST:', process.env.DB_HOST ? 'Configurado' : 'No configurado');

      // Intentar conexión a base de datos
      console.log('🔄 Probando conexión a Railway...');
      const dbConnected = await testConnection();
      
      if (dbConnected) {
        console.log('✅ Base de datos conectada - Importando módulos completos...');
        
        // Importación dinámica para evitar timeout en inicialización
        const { default: setupRelationships } = await import('../src/models/relationships.js');
        const { default: facturasRoutes } = await import('../src/routes/facturas.js');
        const { default: transaccionesRoutes } = await import('../src/routes/transacciones.js');
        const { default: tercerosRoutes } = await import('../src/routes/terceros.js');
        const { default: contratosRoutes } = await import('../src/routes/contratos.js');
        const { default: catalogosRouter } = await import('../src/routes/catalogos.js');
        
        // Configurar relaciones
        setupRelationships();
        
        // Configurar rutas de base de datos
        app.use('/api/facturas', facturasRoutes);
        app.use('/api/transacciones', transaccionesRoutes);
        app.use('/api/terceros', tercerosRoutes);
        app.use('/api/contratos', contratosRoutes);
        app.use('/api/catalogos', catalogosRouter);
        
        console.log('✅ Aplicación completa inicializada con base de datos');
        dbInitialized = true;
      } else {
        console.log('⚠️ Base de datos no disponible - Modo solo rutas básicas');
        dbInitialized = false;
      }
      
      appInitialized = true;
      return true;
      
    } catch (error) {
      console.error('❌ Error en inicialización:', error.message);
      dbInitialized = false;
      appInitialized = true; // Continuar sin DB
      return false;
    }
  })();

  return await initializationPromise;
};

// Middleware de inicialización inteligente
app.use(async (req, res, next) => {
  try {
    await initializeApp();
    next();
  } catch (error) {
    console.error('❌ Error en middleware de inicialización:', error);
    next(); // Continuar sin DB
  }
});

// RUTAS DE DIAGNÓSTICO (siempre disponibles)
app.get('/api/test', (req, res) => {
  console.log('✅ Ruta /api/test ejecutada correctamente');
  res.json({
    success: true,
    message: 'API funciona correctamente en Vercel',
    timestamp: new Date().toISOString(),
    environment: {
      vercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV,
      hasDbHost: !!process.env.DB_HOST,
      dbInitialized,
      appInitialized
    },
    request: {
      method: req.method,
      url: req.url
    }
  });
});

app.get('/api/health', async (req, res) => {
  console.log('✅ Ruta /api/health ejecutada correctamente');
  
  let dbStatus = 'unknown';
  try {
    if (dbInitialized) {
      dbStatus = 'connected';
    } else {
      const testResult = await testConnection();
      dbStatus = testResult ? 'available' : 'unavailable';
    }
  } catch (error) {
    dbStatus = 'error';
  }

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando correctamente',
    environment: process.env.NODE_ENV,
    platform: 'Vercel',
    database: {
      host: process.env.DB_HOST,
      status: dbStatus,
      initialized: dbInitialized
    },
    app: {
      initialized: appInitialized,
      hasFullFunctionality: dbInitialized
    }
  });
});

// RUTAS FALLBACK (cuando DB no está disponible)
app.get('/api/transacciones', (req, res) => {
  if (!dbInitialized) {
    console.log('⚠️ Ruta /api/transacciones - Modo fallback (sin DB)');
    return res.json({
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
      fallback: true
    });
  }
  
  // Si llegamos aquí, la DB está inicializada y la ruta real se manejará automáticamente
  console.log('✅ Ruta /api/transacciones - Redirigiendo a controlador real');
  res.status(503).json({
    error: 'Ruta manejada por controlador de base de datos',
    message: 'Esta respuesta no debería verse si la DB está funcionando'
  });
});

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('❌ Error en aplicación híbrida:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString(),
    dbAvailable: dbInitialized,
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
      ...(dbInitialized ? [
        '/api/facturas',
        '/api/transacciones',
        '/api/terceros',
        '/api/contratos',
        '/api/catalogos'
      ] : ['/api/transacciones (modo fallback)'])
    ]
  });
});

export default app; 