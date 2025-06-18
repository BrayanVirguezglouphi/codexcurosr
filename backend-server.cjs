const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de health check simple
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor backend funcionando',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8080
  });
});

// Ruta de prueba para transacciones
app.get('/api/transacciones', (req, res) => {
  res.json([
    { id: 1, descripcion: 'Transacción de prueba 1', monto: 100000 },
    { id: 2, descripcion: 'Transacción de prueba 2', monto: 200000 },
    { id: 3, descripcion: 'Transacción de prueba 3', monto: 150000 }
  ]);
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback para SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor usando PORT de Cloud Run
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
}); 