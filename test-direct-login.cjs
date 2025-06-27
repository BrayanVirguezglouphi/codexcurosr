const http = require('http');

async function testDirectLogin() {
  const postData = JSON.stringify({
    username: 'bob',
    password: 'bobpass456'
  });

  const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 5000
  };

  console.log('🔐 Probando login directo con bob/bobpass456...');
  console.log(`📡 URL: http://${options.hostname}:${options.port}${options.path}`);

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`📨 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Response Body:`, body);
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('timeout', () => {
      console.log('⏰ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// También probemos alice
async function testAlice() {
  const postData = JSON.stringify({
    username: 'alice',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 5000
  };

  console.log('\n🔐 Probando login directo con alice/password123...');

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`📨 Status: ${res.statusCode}`);
      
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Response:`, body);
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('timeout', () => {
      console.log('⏰ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    await testDirectLogin();
    await testAlice();
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
  }
}

runTests(); 
 
 