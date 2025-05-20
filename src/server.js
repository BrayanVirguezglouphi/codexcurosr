import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import facturasRoutes from './routes/facturas.js';
import transaccionesRoutes from './routes/transacciones.js';
import setupRelationships from './models/relationships.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Configurar rutas
app.use('/api/facturas', facturasRoutes);
app.use('/api/transacciones', transaccionesRoutes);

// Establecer las relaciones entre modelos
setupRelationships();

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 