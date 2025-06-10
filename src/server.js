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
app.use('/api/impuestos', impuestosRoutes);
app.use('/api/terceros', tercerosRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/lineas-servicios', lineasServiciosRoutes);
app.use('/api/centros-costos', centrosCostosRoutes);
app.use('/api/etiquetas-contables', etiquetasContablesRoutes);
app.use('/api/conceptos-transacciones', conceptosTransaccionesRoutes);
app.use('/api/tipos-transaccion', tiposTransaccionRoutes);

app.use('/api/catalogos', catalogosRouter);

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