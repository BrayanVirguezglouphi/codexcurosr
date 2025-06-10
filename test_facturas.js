console.log('🧪 Probando conexión con el servidor...');

// Primero probar si el servidor está disponible
fetch('http://localhost:5000/api/facturas')
  .then(response => {
    console.log('✅ Servidor respondió con status:', response.status);
    console.log('📋 Headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      return response.text().then(text => {
        console.log('❌ Respuesta de error:', text);
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('🎉 ¡Éxito! Datos recibidos del servidor:');
    console.log('📊 Tipo de datos:', typeof data);
    console.log('📝 Es array:', Array.isArray(data));
    console.log('🔢 Número de facturas:', Array.isArray(data) ? data.length : 'No es un array');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('📄 Primera factura:');
      console.log(JSON.stringify(data[0], null, 2));
    } else if (Array.isArray(data)) {
      console.log('📭 No hay facturas en la base de datos');
    }
  })
  .catch(error => {
    console.error('💥 Error completo:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }); 