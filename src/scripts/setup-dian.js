import sequelize from '../config/database.js';

/**
 * Script simplificado para configurar el ambiente de pruebas DIAN
 */
async function setupDian() {
  try {
    console.log('🚀 Configurando ambiente de pruebas DIAN...');

    // Crear tabla de configuración DIAN
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS adcot_configuracion_dian (
        id_configuracion SERIAL PRIMARY KEY,
        ambiente VARCHAR(20) DEFAULT 'HABILITACION' NOT NULL,
        nit_empresa VARCHAR(20) NOT NULL,
        razon_social VARCHAR(255) NOT NULL,
        resolucion_dian VARCHAR(50) NOT NULL,
        fecha_resolucion DATE NOT NULL,
        prefijo_factura VARCHAR(10),
        rango_inicial INTEGER NOT NULL,
        rango_final INTEGER NOT NULL,
        numero_actual INTEGER DEFAULT 0 NOT NULL,
        url_api_envio VARCHAR(255) NOT NULL,
        url_api_consulta VARCHAR(255) NOT NULL,
        certificado_path VARCHAR(255),
        certificado_password VARCHAR(255),
        activo BOOLEAN DEFAULT true NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(nit_empresa, ambiente)
      );
    `);

    // Crear tabla de facturas electrónicas
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS adcot_facturas_electronicas (
        id_factura_electronica SERIAL PRIMARY KEY,
        id_factura INTEGER NOT NULL,
        cufe VARCHAR(96) UNIQUE,
        numero_electronico VARCHAR(50) NOT NULL,
        estado_dian VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL,
        xml_generado TEXT,
        xml_firmado TEXT,
        hash_xml VARCHAR(64),
        uuid_documento VARCHAR(36) UNIQUE,
        fecha_envio_dian TIMESTAMP,
        fecha_respuesta_dian TIMESTAMP,
        respuesta_dian TEXT,
        codigo_respuesta VARCHAR(10),
        mensaje_respuesta TEXT,
        pdf_path VARCHAR(255),
        qr_code TEXT,
        intentos_envio INTEGER DEFAULT 0 NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tablas creadas exitosamente');

    // Insertar configuración de pruebas
    const [results] = await sequelize.query(`
      INSERT INTO adcot_configuracion_dian (
        ambiente, nit_empresa, razon_social, resolucion_dian, fecha_resolucion,
        prefijo_factura, rango_inicial, rango_final, numero_actual,
        url_api_envio, url_api_consulta, activo
      ) VALUES (
        'HABILITACION', '900373115', 'EMPRESA DE PRUEBAS FACTURACIÓN ELECTRÓNICA',
        '18760000001', '2019-01-19', 'SETP', 1, 5000, 0,
        'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
        'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc', true
      ) ON CONFLICT (nit_empresa, ambiente) DO UPDATE SET
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING id_configuracion;
    `);

    console.log('✅ Configuración DIAN insertada exitosamente');
    console.log('📋 Configuración de pruebas:');
    console.log('   - Ambiente: HABILITACION (Pruebas)');
    console.log('   - NIT: 900373115 (Oficial DIAN)');
    console.log('   - Prefijo: SETP');
    console.log('   - Rango: 1 - 5000');
    console.log('   - URLs: Ambiente de habilitación DIAN');

    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Reiniciar el servidor: node src/server.js');
    console.log('   2. Probar conversión de facturas a electrónicas');
    console.log('   3. Verificar generación de XML UBL 2.1');

  } catch (error) {
    console.error('❌ Error en configuración:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar script
setupDian()
  .then(() => {
    console.log('\n✅ Setup completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en setup:', error.message);
    process.exit(1);
  });