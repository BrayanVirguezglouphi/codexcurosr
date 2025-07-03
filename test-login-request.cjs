const http = require('http');

const data = JSON.stringify({
  email: 'ana.torres@example.com',
  password: '1234'
});

console.log('\nIntentando login con:', {
  email: 'ana.torres@example.com',
  password: '1234'
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

console.log('\nHaciendo petición a:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\nStatus:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('Response (raw):', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('\nError:', error);
});

req.write(data);
req.end(); 