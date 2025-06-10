import sequelize from './src/config/database.js';

console.log('🔍 Buscando facturas disponibles...\n');

async function buscarFacturas() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Buscar facturas directamente con SQL
    const [facturas] = await sequelize.query(`
      SELECT f.id_factura, f.numero_factura, f.subtotal_facturado_moneda, f.valor_tax, f.estatus_factura,
             fe.id_factura_electronica
      FROM adcot_facturas f 
      LEFT JOIN adcot_facturas_electronicas fe ON f.id_factura = fe.id_factura
      ORDER BY f.id_factura DESC 
      LIMIT 10
    `);

    console.log('📄 FACTURAS ENCONTRADAS:');
    console.log('========================');
    
    facturas.forEach(factura => {
      const tieneElectronica = factura.id_factura_electronica ? '✅ CONVERTIDA' : '❌ SIN CONVERTIR';
      console.log(`ID: ${factura.id_factura} | Número: ${factura.numero_factura} | ${tieneElectronica}`);
    });

    // Encontrar la primera sin convertir
    const sinConvertir = facturas.find(f => !f.id_factura_electronica);
    
    if (sinConvertir) {
      console.log('\n🎯 FACTURA RECOMENDADA PARA PRUEBA:');
      console.log('===================================');
      console.log(`ID: ${sinConvertir.id_factura}`);
      console.log(`Número: ${sinConvertir.numero_factura}`);
      console.log(`Subtotal: ${sinConvertir.subtotal_facturado_moneda}`);
      console.log(`Tax: ${sinConvertir.valor_tax}`);
      console.log(`Estado: ${sinConvertir.estatus_factura}`);
      
      console.log('\n🚀 COMANDO PARA PROBAR:');
      console.log(`node -e "const axios = require('axios'); axios.post('http://localhost:5000/api/factura-electronica/convertir/${sinConvertir.id_factura}').then(r => console.log('Éxito:', r.data)).catch(e => console.log('Error:', e.response?.data || e.message))"`);
    } else {
      console.log('\n⚠️ Todas las facturas ya han sido convertidas');
      console.log('💡 Puedes crear una nueva factura o eliminar registros de facturas electrónicas para probar');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

buscarFacturas();