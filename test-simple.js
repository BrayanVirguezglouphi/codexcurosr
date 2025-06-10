console.log('Probando API...');

fetch('http://localhost:5000/api/factura-electronica/estadisticas/dashboard')
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Datos recibidos:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });