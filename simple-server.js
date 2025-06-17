const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Leer el archivo HTML de prueba
let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>PRUEBA SIMPLE - Sistema Empresarial</title>
    <style>
        body { 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4); 
            color: white; 
            font-family: Arial; 
            text-align: center; 
            padding: 50px;
        }
        h1 { font-size: 4em; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .status { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 20px; }
    </style>
</head>
<body>
    <h1>🚀 SERVIDOR FUNCIONANDO!</h1>
    <div class="status">
        <h2>✅ Puerto: ${PORT}</h2>
        <h2>⏰ Hora: ${new Date().toLocaleString()}</h2>
        <h2>🎯 Proyecto: PROS Sistema Empresarial</h2>
        <h2>🔥 ESTA ES LA PÁGINA DE PRUEBA COLORIDA</h2>
    </div>
    <a href="/health" style="color: yellow; font-size: 2em;">🔍 Health Check</a>
</body>
</html>`;

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            timestamp: new Date().toISOString(),
            port: PORT,
            message: 'Servidor simple funcionando correctamente'
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor simple corriendo en puerto ${PORT}`);
    console.log(`⏰ Iniciado: ${new Date().toISOString()}`);
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
    console.log('Cerrando servidor...');
    server.close(() => {
        process.exit(0);
    });
}); 