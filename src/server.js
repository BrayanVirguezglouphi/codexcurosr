import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import facturasRoutes from './routes/facturas.js';
import transaccionesRoutes from './routes/transacciones.js';
import setupRelationships from './models/relationships.js';
import catalogosRouter from './routes/catalogos.js';
import { testConnection } from './config/database-gcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Base de datos lazy init
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    console.log('🔄 Inicializando base de datos...');
    const connected = await testConnection();
    if (connected) {
      setupRelationships();
      dbInitialized = true;
      console.log('✅ Base de datos lista');
    }
    return connected;
  }
  return true;
};

// Middleware
app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    if (!dbInitialized) await initializeDatabase();
    next();
  } catch (err) {
    console.error('❌ DB error:', err);
    next();
  }
});

// Rutas API
app.use('/api/facturas', facturasRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/catalogos', catalogosRouter);

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await initializeDatabase();
  res.json({
    status: 'OK',
    dbConnected,
    dbInitialized,
    timestamp: new Date().toISOString()
  });
});

// Servir SPA build
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: err.message });
});

// ⏳ Arrancar servidor SIEMPRE (sin lógica de Vercel)
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
