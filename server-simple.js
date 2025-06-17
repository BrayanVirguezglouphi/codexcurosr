const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware básico
app.use(express.json());

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.send(`
    <h1>Sistema Empresarial - Test</h1>
    <p>Servidor funcionando en puerto ${PORT}</p>
    <p>Ambiente: ${process.env.NODE_ENV}</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  `);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor test corriendo en puerto ${PORT}`);
}); 