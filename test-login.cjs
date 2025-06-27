const https = require('http');

async function testLogin(username, password) {
  const data = JSON.stringify({
    username: username,
    password: password
  });

  const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🔐 Probando credenciales de login...\n');

  const testCases = [
    { username: 'alice', password: 'password123' },
    { username: 'bob', password: 'bobpass456' },
    { username: 'charlie', password: 'charlie789' },
    { username: 'bob', password: 'wrong_password' }, // Para probar error
  ];

  for (const testCase of testCases) {
    try {
      console.log(`🧪 Probando: ${testCase.username} / ${testCase.password}`);
      const result = await testLogin(testCase.username, testCase.password);
      
      console.log(`   Status: ${result.status}`);
      if (result.data.success) {
        console.log(`   ✅ Login exitoso`);
        console.log(`   👤 Usuario: ${result.data.user.username} (${result.data.user.email})`);
        console.log(`   🎫 Token: ${result.data.token.substring(0, 30)}...`);
      } else {
        console.log(`   ❌ Login fallido: ${result.data.error}`);
      }
      console.log('');
    } catch (error) {
      console.log(`   💥 Error de conexión: ${error.message}\n`);
    }
  }
}

runTests(); 
 
 