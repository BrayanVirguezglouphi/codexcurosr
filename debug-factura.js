import sequelize from './src/config/database.js';
import Factura from './src/models/Factura.js';

console.log('🔍 Debuggeando datos de factura...\n');

async function debugFactura() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Obtener la última factura
    const factura = await Factura.findOne({
      order: [['id_factura', 'DESC']]
    });

    if (!factura) {
      console.log('❌ No se encontraron facturas');
      return;
    }

    console.log('📄 DATOS DE LA ÚLTIMA FACTURA:');
    console.log('================================');
    console.log('Objeto completo:', JSON.stringify(factura.toJSON(), null, 2));
    
    console.log('\n🔍 CAMPOS ESPECÍFICOS PARA DIAN:');
    console.log('=================================');
    console.log('ID:', factura.id_factura);
    console.log('Número:', factura.numero_factura);
    console.log('Subtotal:', factura.subtotal_facturado_moneda);
    console.log('Valor Tax:', factura.valor_tax);
    console.log('Fecha radicado:', factura.fecha_radicado);
    console.log('Estado:', factura.estatus_factura);
    
    console.log('\n✅ VERIFICACIÓN DE CAMPOS REQUERIDOS:');
    console.log('=====================================');
    
    const verificaciones = [
      { campo: 'subtotal_facturado_moneda', valor: factura.subtotal_facturado_moneda, requerido: true },
      { campo: 'valor_tax', valor: factura.valor_tax, requerido: true },
      { campo: 'numero_factura', valor: factura.numero_factura, requerido: true },
      { campo: 'fecha_radicado', valor: factura.fecha_radicado, requerido: true }
    ];
    
    verificaciones.forEach(v => {
      const estado = v.valor !== null && v.valor !== undefined ? '✅' : '❌';
      console.log(`${estado} ${v.campo}: ${v.valor}`);
    });

    // Verificar tipos de datos
    console.log('\n🔢 TIPOS DE DATOS:');
    console.log('==================');
    console.log('subtotal_facturado_moneda tipo:', typeof factura.subtotal_facturado_moneda);
    console.log('valor_tax tipo:', typeof factura.valor_tax);
    
    // Intentar conversión a string (como lo hace el CUFE)
    console.log('\n🔄 CONVERSIÓN A STRING (PARA CUFE):');
    console.log('===================================');
    try {
      const subtotalStr = factura.subtotal_facturado_moneda.toString();
      const taxStr = factura.valor_tax ? factura.valor_tax.toString() : '0.00';
      console.log('✅ Subtotal como string:', subtotalStr);
      console.log('✅ Tax como string:', taxStr);
    } catch (error) {
      console.log('❌ Error en conversión:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

debugFactura();