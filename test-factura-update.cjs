const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8081';

async function testFacturaUpdate() {
  console.log('🧪 Probando actualización de factura...');
  
  try {
    // Primero obtener una factura existente
    console.log('📋 Obteniendo lista de facturas...');
    const response = await fetch(`${API_BASE}/api/facturas`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener facturas: ${response.status}`);
    }
    
    const facturas = await response.json();
    console.log(`✅ Encontradas ${facturas.length} facturas`);
    
    if (facturas.length === 0) {
      console.log('❌ No hay facturas para probar');
      return;
    }
    
    // Tomar la primera factura
    const factura = facturas[0];
    console.log(`📄 Probando con factura ID: ${factura.id_factura}`);
    console.log(`📄 Observaciones actuales: "${factura.observaciones_factura}"`);
    
    // Hacer una actualización de prueba
    const newObservations = `Prueba actualización ${new Date().toISOString()}`;
    console.log(`✏️ Actualizando observaciones a: "${newObservations}"`);
    
    const updateResponse = await fetch(`${API_BASE}/api/facturas/${factura.id_factura}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        observaciones_factura: newObservations
      })
    });
    
    console.log(`📡 Respuesta del servidor: ${updateResponse.status} ${updateResponse.statusText}`);
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Error al actualizar: ${updateResponse.status} - ${errorText}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('✅ Actualización exitosa:', updateResult);
    
    // Verificar que el cambio se aplicó
    console.log('🔍 Verificando que el cambio se aplicó...');
    const verifyResponse = await fetch(`${API_BASE}/api/facturas`);
    const updatedFacturas = await verifyResponse.json();
    const updatedFactura = updatedFacturas.find(f => f.id_factura === factura.id_factura);
    
    if (updatedFactura && updatedFactura.observaciones_factura === newObservations) {
      console.log('✅ ¡Cambio verificado exitosamente!');
      console.log(`📄 Nuevas observaciones: "${updatedFactura.observaciones_factura}"`);
    } else {
      console.log('❌ El cambio no se reflejó en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testFacturaUpdate(); 
 
 