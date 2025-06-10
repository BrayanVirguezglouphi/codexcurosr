import ConfiguracionDian from '../models/ConfiguracionDian.js';
import sequelize from '../config/database.js';

/**
 * Script para configurar automáticamente el ambiente de pruebas DIAN
 * Utiliza los datos oficiales de testing de la DIAN
 */
async function configurarDianPruebas() {
  try {
    console.log('🚀 Iniciando configuración de ambiente de pruebas DIAN...');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync();
    console.log('✅ Tablas sincronizadas');

    // Verificar si ya existe configuración
    const configuracionExistente = await ConfiguracionDian.findOne({
      where: { activo: true }
    });

    if (configuracionExistente) {
      console.log('⚠️  Ya existe una configuración DIAN activa');
      console.log('Configuración actual:', {
        nit: configuracionExistente.nit_empresa,
        ambiente: configuracionExistente.ambiente,
        numero_actual: configuracionExistente.numero_actual
      });
      
      const respuesta = await preguntarContinuar('¿Desea reemplazarla? (s/n): ');
      if (respuesta.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada');
        return;
      }

      // Desactivar configuración existente
      await configuracionExistente.update({ activo: false });
      console.log('🔄 Configuración anterior desactivada');
    }

    // Datos oficiales de pruebas de la DIAN
    const configuracionPruebas = {
      ambiente: 'HABILITACION',
      nit_empresa: '900373115', // NIT de pruebas oficial DIAN
      razon_social: 'EMPRESA DE PRUEBAS FACTURACIÓN ELECTRÓNICA',
      resolucion_dian: '18760000001', // Resolución de pruebas
      fecha_resolucion: new Date('2019-01-19'),
      prefijo_factura: 'SETP', // Set de pruebas
      rango_inicial: 1,
      rango_final: 5000, // Rango amplio para pruebas
      numero_actual: 0,
      url_api_envio: 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
      url_api_consulta: 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
      certificado_path: null, // Se configurará después
      certificado_password: null,
      activo: true
    };

    // Crear nueva configuración
    const nuevaConfiguracion = await ConfiguracionDian.create(configuracionPruebas);
    
    console.log('✅ Configuración de pruebas DIAN creada exitosamente');
    console.log('📋 Detalles de configuración:');
    console.log('   - Ambiente:', nuevaConfiguracion.ambiente);
    console.log('   - NIT Empresa:', nuevaConfiguracion.nit_empresa);
    console.log('   - Razón Social:', nuevaConfiguracion.razon_social);
    console.log('   - Resolución:', nuevaConfiguracion.resolucion_dian);
    console.log('   - Prefijo:', nuevaConfiguracion.prefijo_factura);
    console.log('   - Rango:', `${nuevaConfiguracion.rango_inicial} - ${nuevaConfiguracion.rango_final}`);
    console.log('   - URL Envío:', nuevaConfiguracion.url_api_envio);
    console.log('   - URL Consulta:', nuevaConfiguracion.url_api_consulta);

    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📌 IMPORTANTE:');
    console.log('   - Esta configuración usa datos oficiales de pruebas de la DIAN');
    console.log('   - Para producción deberá actualizar con sus datos reales');
    console.log('   - Los certificados digitales se configuran por separado');
    console.log('   - El ambiente actual es HABILITACION (pruebas)');

    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Probar la generación de XML con una factura');
    console.log('   2. Configurar certificados digitales para firma');
    console.log('   3. Realizar pruebas de envío a la DIAN');
    console.log('   4. Pasar a producción cuando esté listo');

  } catch (error) {
    console.error('❌ Error configurando DIAN:', error);
    throw error;
  }
}

/**
 * Función auxiliar para preguntar al usuario
 */
function preguntarContinuar(pregunta) {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(pregunta, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

/**
 * Ejecutar script si se llama directamente
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  configurarDianPruebas()
    .then(() => {
      console.log('\n✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error ejecutando script:', error.message);
      process.exit(1);
    });
}

export default configurarDianPruebas;