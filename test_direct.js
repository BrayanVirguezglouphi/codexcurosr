import sequelize from './src/config/database.js';
import './src/models/Moneda.js';
import './src/models/Factura.js';
import './src/models/Contrato.js';
import './src/models/Tercero.js';
import './src/models/Tax.js';

async function testDirect() {
  try {
    // Importar modelos
    const Factura = (await import('./src/models/Factura.js')).default;
    const Contrato = (await import('./src/models/Contrato.js')).default;
    const Tercero = (await import('./src/models/Tercero.js')).default;
    const Moneda = (await import('./src/models/Moneda.js')).default;
    const Tax = (await import('./src/models/Tax.js')).default;
    
    console.log('Probando consulta simple de facturas...');
    const facturas = await Factura.findAll({
      limit: 5,
      order: [['id_factura', 'DESC']]
    });
    
    console.log('Facturas encontradas:', facturas.length);
    if (facturas.length > 0) {
      console.log('Primera factura:', facturas[0].toJSON());
    }
    
    console.log('\nProbando consulta con relaciones...');
    const facturasConRelaciones = await Factura.findAll({
      include: [
        {
          model: Contrato,
          as: 'contrato',
          attributes: ['id_contrato', 'numero_contrato_os', 'descripcion_servicio_contratado', 'estatus_contrato'],
          include: [
            {
              model: Tercero,
              as: 'tercero',
              attributes: ['id_tercero', 'primer_nombre', 'primer_apellido', 'razon_social', 'numero_documento', 'tipo_personalidad']
            }
          ]
        },
        {
          model: Moneda,
          as: 'moneda',
          attributes: ['id_moneda', 'nombre_moneda', 'codigo_iso', 'simbolo']
        },
        {
          model: Tax,
          as: 'tax',
          attributes: ['id_tax', 'titulo_impuesto']
        }
      ],
      limit: 3,
      order: [['id_factura', 'DESC']]
    });
    
    console.log('Facturas con relaciones encontradas:', facturasConRelaciones.length);
    if (facturasConRelaciones.length > 0) {
      console.log('Primera factura con relaciones:', JSON.stringify(facturasConRelaciones[0].toJSON(), null, 2));
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

testDirect(); 