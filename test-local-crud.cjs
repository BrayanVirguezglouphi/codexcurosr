const http = require('http');

const BASE_URL = 'http://localhost:8080';

console.log('🧪 Probando CRUD completo en backend local...\n');

// Función helper para hacer requests HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : null;
          resolve({
            status: res.statusCode,
            data: jsonData,
            raw: responseData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: null,
            raw: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Tests secuenciales
async function runTests() {
  console.log('1️⃣ Health Check...');
  try {
    const health = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${health.status}`);
    if (health.data) {
      console.log(`   Respuesta: ${health.data.status} - ${health.data.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log('   🔧 Asegúrate de que el backend esté ejecutándose: node backend-server-fixed.cjs');
    return;
  }

  console.log('\n2️⃣ GET /api/terceros...');
  try {
    const getTerceros = await makeRequest('GET', '/api/terceros');
    console.log(`   Status: ${getTerceros.status}`);
    if (getTerceros.data && Array.isArray(getTerceros.data)) {
      console.log(`   📊 ${getTerceros.data.length} terceros encontrados`);
      if (getTerceros.data.length > 0) {
        console.log(`   Primer tercero: ${getTerceros.data[0].nombre || 'Sin nombre'}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n3️⃣ POST /api/terceros (Crear nuevo)...');
  try {
    const newTercero = {
      nombre: 'Test CRUD Local',
      documento: '999888777',
      email: 'test@local.com',
      telefono: '555-0123'
    };
    
    const createTercero = await makeRequest('POST', '/api/terceros', newTercero);
    console.log(`   Status: ${createTercero.status}`);
    
    if (createTercero.status === 201 || createTercero.status === 200) {
      console.log('   ✅ Tercero creado exitosamente');
      if (createTercero.data && createTercero.data.id) {
        const newId = createTercero.data.id;
        console.log(`   🆔 ID asignado: ${newId}`);
        
        // Test PUT con el ID recién creado
        console.log(`\n4️⃣ PUT /api/terceros/${newId} (Actualizar)...`);
        const updatedData = {
          nombre: 'Test CRUD Local ACTUALIZADO',
          documento: '999888777',
          email: 'updated@local.com',
          telefono: '555-9999'
        };
        
        const updateTercero = await makeRequest('PUT', `/api/terceros/${newId}`, updatedData);
        console.log(`   Status: ${updateTercero.status}`);
        
        if (updateTercero.status === 200) {
          console.log('   ✅ Tercero actualizado exitosamente');
          console.log('   🎯 ¡PUT funciona! - Esto resuelve el error 405');
        } else {
          console.log('   ❌ PUT falló - necesitamos arreglar esto');
        }

        // Test DELETE
        console.log(`\n5️⃣ DELETE /api/terceros/${newId} (Eliminar)...`);
        const deleteTercero = await makeRequest('DELETE', `/api/terceros/${newId}`);
        console.log(`   Status: ${deleteTercero.status}`);
        
        if (deleteTercero.status === 200 || deleteTercero.status === 204) {
          console.log('   ✅ Tercero eliminado exitosamente');
        }
      }
    } else {
      console.log('   ❌ No se pudo crear tercero');
      console.log(`   Respuesta: ${createTercero.raw}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n6️⃣ Verificación final GET /api/terceros...');
  try {
    const finalCheck = await makeRequest('GET', '/api/terceros');
    console.log(`   Status: ${finalCheck.status}`);
    if (finalCheck.data && Array.isArray(finalCheck.data)) {
      console.log(`   📊 ${finalCheck.data.length} terceros en total`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎯 RESULTADO DEL TEST:');
  console.log('Si todos los endpoints respondieron con status 200/201:');
  console.log('✅ El backend local funciona correctamente');
  console.log('✅ Las operaciones CRUD están implementadas');
  console.log('✅ El error 405 se resolverá cuando despleguemos');
  console.log('\n🚀 PRÓXIMO PASO:');
  console.log('Hacer git push para desplegar estos cambios a producción');
}

// Esperar un poco para que el servidor arranque
setTimeout(() => {
  runTests();
}, 2000); 