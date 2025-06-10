import axios from 'axios';

console.log('🧪 Probando conversión de factura 58...\n');

async function testConversion() {
  try {
    console.log('📤 Enviando petición de conversión...');
    
    const response = await axios.post('http://localhost:5000/api/factura-electronica/convertir/58', {}, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Respuesta exitosa:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error en conversión:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.message);
    
    if (error.response?.data) {
      console.log('Error data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 500) {
      console.log('\n🔍 Error 500 detectado - revisar logs del servidor');
    }
  }
}

testConversion();