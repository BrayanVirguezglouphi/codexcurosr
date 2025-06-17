const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del build de React
app.use(express.static(path.join(__dirname, 'dist')));

// APIs
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema Empresarial API funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API Test exitoso',
    data: {
      servidor: 'Google Cloud Run',
      base_datos: process.env.DB_HOST || '34.42.197.64',
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/facturas', (req, res) => {
  res.json({
    message: 'API Facturas funcionando',
    data: [
      { id: 1, numero: 'F001', cliente: 'Cliente Test', total: 1000 },
      { id: 2, numero: 'F002', cliente: 'Cliente Test 2', total: 2000 }
    ]
  });
});

app.get('/api/transacciones', (req, res) => {
  res.json({
    message: 'API Transacciones funcionando',
    data: [
      { id: 1, tipo: 'Ingreso', descripcion: 'Venta productos', monto: 1500 },
      { id: 2, tipo: 'Egreso', descripcion: 'Compra materiales', monto: -500 }
    ]
  });
});

// Para todas las demás rutas, servir el index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Sistema Empresarial corriendo en puerto ${PORT}`);
  console.log(`📊 Aplicación React disponible en: http://localhost:${PORT}`);
  console.log(`🔗 APIs disponibles en: http://localhost:${PORT}/health`);
}); 