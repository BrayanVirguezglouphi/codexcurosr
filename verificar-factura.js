import mysql from 'mysql2/promise';

console.log('🔍 Verificando datos de factura para DIAN...\n');

// Requisitos mínimos DIAN para facturación electrónica
const requisitosDIAN = {
  empresa: [
    'NIT emisor',
    'Razón social',
    'Dirección',
    'Ciudad',
    'Teléfono',
    'Email'
  ],
  factura: [
    'Número de factura',
    'Fecha de emisión',
    'Fecha de vencimiento',
    'Moneda',
    'Subtotal',
    'Impuestos (IVA)',
    'Total'
  ],
  cliente: [
    'Tipo de documento',
    'Número de documento',
    'Nombre/Razón social',
    'Dirección',
    'Ciudad',
    'Email'
  ],
  items: [
    'Código del producto/servicio',
    'Descripción',
    'Cantidad',
    'Valor unitario',
    'Valor total',
    'IVA aplicable'
  ]
};

async function verificarFactura() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'adcot_sistema_empresarial'
    });

    console.log('✅ Conexión a base de datos establecida\n');

    // Obtener la última factura
    const [facturas] = await connection.execute(`
      SELECT * FROM adcot_facturas 
      ORDER BY id_factura DESC 
      LIMIT 1
    `);

    if (facturas.length === 0) {
      console.log('❌ No se encontraron facturas en el sistema');
      return;
    }

    const factura = facturas[0];
    console.log('📄 DATOS DE LA ÚLTIMA FACTURA:');
    console.log('================================');
    console.log(`ID: ${factura.id_factura}`);
    console.log(`Número: ${factura.numero_factura}`);
    console.log(`Fecha: ${factura.fecha_factura}`);
    console.log(`Cliente: ${factura.nombre_cliente}`);
    console.log(`Subtotal: $${factura.subtotal}`);
    console.log(`IVA: $${factura.iva}`);
    console.log(`Total: $${factura.total}`);
    console.log(`Estado: ${factura.estado}`);
    console.log('');

    // Verificar datos del cliente
    console.log('👤 DATOS DEL CLIENTE:');
    console.log('====================');
    console.log(`Nombre: ${factura.nombre_cliente || 'NO DEFINIDO'}`);
    console.log(`Email: ${factura.email_cliente || 'NO DEFINIDO'}`);
    console.log(`Teléfono: ${factura.telefono_cliente || 'NO DEFINIDO'}`);
    console.log(`Dirección: ${factura.direccion_cliente || 'NO DEFINIDO'}`);
    console.log(`Ciudad: ${factura.ciudad_cliente || 'NO DEFINIDO'}`);
    console.log(`Documento: ${factura.documento_cliente || 'NO DEFINIDO'}`);
    console.log('');

    // Verificar configuración DIAN
    const [config] = await connection.execute(`
      SELECT * FROM adcot_configuracion_dian 
      WHERE activo = 1 
      LIMIT 1
    `);

    console.log('⚙️ CONFIGURACIÓN DIAN:');
    console.log('======================');
    if (config.length > 0) {
      const conf = config[0];
      console.log(`✅ Configuración activa encontrada`);
      console.log(`NIT Empresa: ${conf.nit_empresa}`);
      console.log(`Ambiente: ${conf.ambiente}`);
      console.log(`Prefijo: ${conf.prefijo_factura}`);
      console.log(`Número actual: ${conf.numero_actual}`);
      console.log(`Rango: ${conf.rango_inicial} - ${conf.rango_final}`);
      console.log(`Resolución: ${conf.numero_resolucion}`);
    } else {
      console.log('❌ No hay configuración DIAN activa');
    }
    console.log('');

    // Análisis de cumplimiento DIAN
    console.log('📋 ANÁLISIS DE CUMPLIMIENTO DIAN:');
    console.log('==================================');
    
    const problemas = [];
    
    // Verificar datos básicos de factura
    if (!factura.numero_factura) problemas.push('❌ Falta número de factura');
    if (!factura.fecha_factura) problemas.push('❌ Falta fecha de factura');
    if (!factura.subtotal || factura.subtotal <= 0) problemas.push('❌ Subtotal inválido');
    if (!factura.total || factura.total <= 0) problemas.push('❌ Total inválido');
    
    // Verificar datos del cliente
    if (!factura.nombre_cliente) problemas.push('❌ Falta nombre del cliente');
    if (!factura.documento_cliente) problemas.push('❌ Falta documento del cliente');
    if (!factura.email_cliente) problemas.push('⚠️ Falta email del cliente (recomendado)');
    if (!factura.direccion_cliente) problemas.push('⚠️ Falta dirección del cliente (recomendado)');
    
    // Verificar configuración DIAN
    if (config.length === 0) problemas.push('❌ No hay configuración DIAN');
    
    if (problemas.length === 0) {
      console.log('✅ La factura cumple con los requisitos básicos DIAN');
    } else {
      console.log('⚠️ Se encontraron los siguientes problemas:');
      problemas.forEach(problema => console.log(`   ${problema}`));
    }
    
    console.log('\n🎯 RECOMENDACIONES:');
    console.log('===================');
    console.log('1. Asegurar que todos los campos obligatorios estén completos');
    console.log('2. Verificar que los montos sean correctos');
    console.log('3. Confirmar datos del cliente (especialmente documento y email)');
    console.log('4. Revisar configuración DIAN (NIT, resolución, rangos)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verificarFactura();