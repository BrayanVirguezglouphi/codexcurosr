const http = require('http');

console.log('Probando API de Facturación Electrónica...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/factura-electronica/estadisticas/dashboard',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Respuesta exitosa:', JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('Respuesta (texto):', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error de conexión:', error.message);
});

req.end();