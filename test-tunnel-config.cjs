const fs = require('fs');
const path = require('path');

console.log('🧪 Probando configuración del tunnel...');

// Leer el archivo de credenciales
try {
    const credentialsPath = path.join(__dirname, 'prf.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    console.log('✅ Archivo de credenciales leído correctamente:');
    console.log('📋 Tunnel ID:', credentials.TunnelID);
    console.log('📋 Account Tag:', credentials.AccountTag);
    console.log('📋 Tiene TunnelSecret:', credentials.TunnelSecret ? 'Sí' : 'No');
    
    // Verificar que coincide con nuestra configuración
    const expectedTunnelId = 'a53ca783-fbc3-4ad3-bdb5-7d3ca92188ac';
    if (credentials.TunnelID === expectedTunnelId) {
        console.log('✅ El Tunnel ID coincide con la configuración');
    } else {
        console.log('❌ ERROR: El Tunnel ID no coincide');
        console.log('   Esperado:', expectedTunnelId);
        console.log('   Encontrado:', credentials.TunnelID);
    }
    
    // Simular la variable de entorno que usará el contenedor
    const envVar = JSON.stringify(credentials);
    console.log('\n📝 Variable de entorno CLOUDFLARE_CREDENTIALS:');
    console.log(envVar);
    
    // Verificar que se puede parsear de vuelta
    try {
        const parsed = JSON.parse(envVar);
        console.log('\n✅ La variable de entorno se puede parsear correctamente');
    } catch (error) {
        console.log('\n❌ ERROR: No se puede parsear la variable de entorno:', error.message);
    }
    
} catch (error) {
    console.log('❌ ERROR leyendo credenciales:', error.message);
}

console.log('\n🏁 Prueba completada'); 