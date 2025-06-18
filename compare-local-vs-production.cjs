const http = require('http');
const https = require('https');

console.log('🔍 Comparando backend local vs producción...\n');

const LOCAL_URL = 'http://localhost:8080';
const PROD_URL = 'https://pros-backend-996366858087.us-central1.run.app';

const endpoints = [
  '/api/health',
  '/api/catalogos/cuentas',
  '/api/catalogos/terceros',
  '/api/terceros',
  '/api/transacciones'
];

async function testEndpoint(baseUrl, endpoint, isHttps = false) {
  return new Promise((resolve) => {
    const module = isHttps ? https : http;
    const url = baseUrl + endpoint;
    
    const options = isHttps ? {
      hostname: 'pros-backend-996366858087.us-central1.run.app',
      port: 443,
      path: endpoint,
      method: 'GET'
    } : {
      hostname: 'localhost',
      port: 8080,
      path: endpoint,
      method: 'GET'
    };

    const req = module.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: jsonData,
            length: Array.isArray(jsonData) ? jsonData.length : 1,
            sample: Array.isArray(jsonData) && jsonData.length > 0 ? jsonData[0] : jsonData
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            error: 'Invalid JSON',
            raw: data.substring(0, 200)
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.abort();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function compareEndpoints() {
  for (const endpoint of endpoints) {
    console.log(`📡 Comparando ${endpoint}...`);
    
    // Test local
    console.log('   🏠 LOCAL:');
    const localResult = await testEndpoint(LOCAL_URL, endpoint, false);
    if (localResult.success) {
      console.log(`      Status: ${localResult.status}`);
      console.log(`      Datos: ${localResult.length} registros`);
      if (localResult.sample) {
        console.log(`      Muestra: ${JSON.stringify(localResult.sample).substring(0, 100)}...`);
      }
    } else {
      console.log(`      ❌ Error: ${localResult.error}`);
    }

    // Test producción
    console.log('   🌐 PRODUCCIÓN:');
    const prodResult = await testEndpoint(PROD_URL, endpoint, true);
    if (prodResult.success) {
      console.log(`      Status: ${prodResult.status}`);
      console.log(`      Datos: ${prodResult.length} registros`);
      if (prodResult.sample) {
        console.log(`      Muestra: ${JSON.stringify(prodResult.sample).substring(0, 100)}...`);
      }
    } else {
      console.log(`      ❌ Error: ${prodResult.error}`);
    }

    // Comparación
    console.log('   🔄 COMPARACIÓN:');
    if (localResult.success && prodResult.success) {
      if (localResult.length === prodResult.length) {
        console.log(`      ✅ Misma cantidad de registros (${localResult.length})`);
      } else {
        console.log(`      ❌ DIFERENTE cantidad: Local=${localResult.length}, Prod=${prodResult.length}`);
      }
      
      if (JSON.stringify(localResult.sample) === JSON.stringify(prodResult.sample)) {
        console.log(`      ✅ Estructura de datos idéntica`);
      } else {
        console.log(`      ❌ DIFERENTE estructura de datos`);
      }
    } else {
      console.log(`      ❌ No se pueden comparar (uno falló)`);
    }
    
    console.log('');
  }

  console.log('💡 DIAGNÓSTICO:');
  console.log('Si ves diferencias, significa que:');
  console.log('1. 🔄 Cloud Build no ha terminado de desplegar');
  console.log('2. 🗄️  Las bases de datos tienen datos diferentes');
  console.log('3. 📝 El código local no está sincronizado con producción');
  console.log('');
  console.log('🎯 SOLUCIÓN:');
  console.log('1. Hacer git push para sincronizar código');
  console.log('2. Esperar 5-10 minutos a que Cloud Build complete');
  console.log('3. Volver a comparar');
}

// Ejecutar comparación
compareEndpoints(); 