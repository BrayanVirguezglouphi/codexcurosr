import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import facturasRoutes from './routes/facturas.js';
import transaccionesRoutes from './routes/transacciones.js';
import setupRelationships from './models/relationships.js';
import catalogosRouter from './routes/catalogos.cjs';
import { testConnection } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

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

// Middleware para asegurar conexión a BD
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    await initializeDatabase();
  }
  next();
});

// Rutas
app.use('/api/facturas', facturasRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/catalogos', catalogosRouter);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  await initializeDatabase();
});
