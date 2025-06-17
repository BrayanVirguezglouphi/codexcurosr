import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import facturasRoutes from './routes/facturas.js';
import transaccionesRoutes from './routes/transacciones.js';
import impuestosRoutes from './routes/impuestos.js';
import tercerosRoutes from './routes/terceros.js';
import contratosRoutes from './routes/contratos.js';
import lineasServiciosRoutes from './routes/lineasServicios.js';
import centrosCostosRoutes from './routes/centrosCostos.js';
import etiquetasContablesRoutes from './routes/etiquetasContables.js';
import conceptosTransaccionesRoutes from './routes/conceptosTransacciones.js';
import tiposTransaccionRoutes from './routes/tiposTransaccion.js';

import setupRelationships from './models/relationships.js';
import catalogosRouter from './routes/catalogos.js';
import { testConnection } from './config/database-gcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Inicializar conexión de base de datos
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    console.log('🔄 Inicializando base de datos...');
    const connected = await testConnection();
    if (connected) {
      setupRelationships();
      dbInitialized = true;
      console.log('✅ Base de datos inicializada correctamente');
    }
    return connected;
  }
  return true;
};

// Configurar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Middleware para inicializar base de datos bajo demanda
app.use(async (req, res, next) => {
  try {
    if (!dbInitialized) {
      console.log('🔄 Inicializando base de datos bajo demanda...');
      await initializeDatabase();
    }
    next();
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    // No fallar, continuar sin BD por ahora
    next();
  }
});

// Middleware para inicializar base de datos en Vercel
if (process.env.VERCEL === '1') {
  app.use(async (req, res, next) => {
    try {
      await initializeDatabase();
      next();
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      res.status(500).json({ 
        error: 'Error de conexión a base de datos',
        message: 'No se pudo conectar a la base de datos'
      });
    }
  });
}

// Log de variables de entorno en Vercel para debugging
if (process.env.VERCEL === '1') {
  console.log('🌐 Ejecutándose en Vercel');
  console.log('Variables de entorno:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_SSL:', process.env.DB_SSL);
}

// Servir archivos estáticos del build de producción
app.use(express.static(path.join(__dirname, '../dist')));

// Ruta de salud para verificar que el servidor funciona
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await initializeDatabase();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        connected: dbConnected,
        initialized: dbInitialized
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        connected: false
      }
    });
  }
});

// Configurar rutas
app.use('/api/facturas', facturasRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/impuestos', impuestosRoutes);
app.use('/api/terceros', tercerosRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/lineas-servicios', lineasServiciosRoutes);
app.use('/api/centros-costos', centrosCostosRoutes);
app.use('/api/etiquetas-contables', etiquetasContablesRoutes);
app.use('/api/conceptos-transacciones', conceptosTransaccionesRoutes);
app.use('/api/tipos-transaccion', tiposTransaccionRoutes);

app.use('/api/catalogos', catalogosRouter);

// Ruta catch-all para servir la aplicación React
// Esto debe ir DESPUÉS de todas las rutas API
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../dist/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sirviendo index.html:', err);
        res.status(500).send('Error interno del servidor');
      }
    });
  } catch (error) {
    console.error('Error en catch-all route:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo servir la aplicación'
    });
  }
});

// Manejo de errores mejorado para Vercel
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err.message);
  console.error('Stack trace:', err.stack);
  
  // Respuesta más detallada para debugging en Vercel
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isVercel = process.env.VERCEL === '1';
  
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: isDevelopment || isVercel ? err.message : 'Algo salió mal!',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Inicializar el servidor para Cloud Run y desarrollo local
// Cloud Run usa puerto 8080 por defecto
const PORT = process.env.PORT || 8080;

// Inicializar base de datos al arrancar (para Cloud Run)
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT: ${PORT}`);
    console.log(`VERCEL: ${process.env.VERCEL}`);
    console.log(`K_SERVICE: ${process.env.K_SERVICE}`); // Cloud Run indicator
    
    // NO inicializar base de datos al arrancar para evitar timeout
    // La base de datos se inicializará en el primer request
    console.log('⏭️ Base de datos se inicializará en el primer request');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌐 Listo para recibir conexiones`);
    });

    // Timeout para el servidor
    server.timeout = 60000; // 60 segundos
    
    // Manejar señales de cierre
    process.on('SIGTERM', () => {
      console.log('📡 Recibido SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('🔒 Servidor cerrado correctamente');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Solo NO arrancar si estamos específicamente en Vercel
if (!process.env.VERCEL) {
  startServer();
}

// Para Vercel (producción), exportar la app
export default app; 