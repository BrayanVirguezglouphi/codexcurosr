const http = require('http');

console.log('🧪 Probando API de Facturación Electrónica...\n');

// Función para hacer peticiones HTTP
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Probar endpoints
async function testAPI() {
  try {
    console.log('1. Probando estadísticas...');
    const stats = await makeRequest('/api/factura-electronica/estadisticas/dashboard');
    console.log(`   Status: ${stats.statusCode}`);
    if (stats.statusCode === 200) {
      const data = JSON.parse(stats.data);
      console.log(`   ✅ Total facturas: ${data.data?.contadores?.total || 0}`);
      console.log(`   ✅ Configuración: ${data.data?.configuracion ? 'Activa' : 'No configurada'}`);
    } else {
      console.log(`   ❌ Error: ${stats.data}`);
    }

    console.log('\n2. Probando lista de facturas...');
    const facturas = await makeRequest('/api/factura-electronica');
    console.log(`   Status: ${facturas.statusCode}`);
    if (facturas.statusCode === 200) {
      const data = JSON.parse(facturas.data);
      console.log(`   ✅ Facturas encontradas: ${data.data?.length || 0}`);
    } else {
      console.log(`   ❌ Error: ${facturas.data}`);
    }

    console.log('\n3. Probando facturas disponibles para conversión...');
    const disponibles = await makeRequest('/api/facturas');
    console.log(`   Status: ${disponibles.statusCode}`);
    if (disponibles.statusCode === 200) {
      const data = JSON.parse(disponibles.data);
      console.log(`   ✅ Facturas disponibles: ${data.data?.length || 0}`);
    } else {
      console.log(`   ❌ Error: ${disponibles.data}`);
    }

    console.log('\n🎉 Prueba completada!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testAPI();