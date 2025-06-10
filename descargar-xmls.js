import axios from 'axios';
import fs from 'fs';
import path from 'path';

console.log('📥 Descargando XMLs de facturas electrónicas...\n');

async function descargarXMLs() {
  try {
    // Crear directorio para XMLs si no existe
    const xmlDir = './xmls-facturas-electronicas';
    if (!fs.existsSync(xmlDir)) {
      fs.mkdirSync(xmlDir);
      console.log('📁 Directorio creado:', xmlDir);
    }

    // Obtener lista de facturas electrónicas
    console.log('🔍 Obteniendo lista de facturas electrónicas...');
    const response = await axios.get('http://localhost:5000/api/factura-electronica');
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log('⚠️ No hay facturas electrónicas disponibles');
      return;
    }

    const facturas = response.data.data;
    console.log(`✅ Encontradas ${facturas.length} facturas electrónicas\n`);

    // Descargar XMLs de cada factura
    for (const factura of facturas) {
      console.log(`📄 Procesando factura ${factura.numero_electronico} (ID: ${factura.id_factura_electronica})`);
      
      try {
        // Descargar XML original
        const xmlOriginalResponse = await axios.get(
          `http://localhost:5000/api/factura-electronica/${factura.id_factura_electronica}/xml/original`,
          { responseType: 'text' }
        );
        
        const archivoOriginal = path.join(xmlDir, `${factura.numero_electronico}_original.xml`);
        fs.writeFileSync(archivoOriginal, xmlOriginalResponse.data);
        console.log(`  ✅ XML original: ${archivoOriginal}`);

        // Descargar XML firmado
        const xmlFirmadoResponse = await axios.get(
          `http://localhost:5000/api/factura-electronica/${factura.id_factura_electronica}/xml/firmado`,
          { responseType: 'text' }
        );
        
        const archivoFirmado = path.join(xmlDir, `${factura.numero_electronico}_firmado.xml`);
        fs.writeFileSync(archivoFirmado, xmlFirmadoResponse.data);
        console.log(`  ✅ XML firmado: ${archivoFirmado}`);

        // Información adicional
        console.log(`  📊 CUFE: ${factura.cufe}`);
        console.log(`  📊 Estado: ${factura.estado_dian}`);
        console.log(`  📊 Fecha: ${new Date(factura.fecha_creacion).toLocaleString()}`);
        console.log('');

      } catch (error) {
        console.log(`  ❌ Error descargando factura ${factura.numero_electronico}:`, error.message);
      }
    }

    // Crear archivo de resumen
    const resumen = {
      fecha_descarga: new Date().toISOString(),
      total_facturas: facturas.length,
      facturas: facturas.map(f => ({
        id: f.id_factura_electronica,
        numero_electronico: f.numero_electronico,
        cufe: f.cufe,
        estado: f.estado_dian,
        fecha_creacion: f.fecha_creacion,
        archivos: [
          `${f.numero_electronico}_original.xml`,
          `${f.numero_electronico}_firmado.xml`
        ]
      }))
    };

    const archivoResumen = path.join(xmlDir, 'resumen.json');
    fs.writeFileSync(archivoResumen, JSON.stringify(resumen, null, 2));
    console.log(`📋 Resumen creado: ${archivoResumen}`);

    console.log('\n🎉 ¡Descarga completada!');
    console.log(`📁 Archivos guardados en: ${path.resolve(xmlDir)}`);
    console.log(`📊 Total de facturas procesadas: ${facturas.length}`);
    console.log(`📄 Total de archivos XML: ${facturas.length * 2}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

descargarXMLs();