import sequelize from '../src/config/database.js';

// Importar todos los modelos
import '../src/models/User.js';
import '../src/models/Tercero.js';
import '../src/models/Factura.js';
import '../src/models/Transaccion.js';
import '../src/models/CentroCosto.js';
import '../src/models/Concepto.js';
import '../src/models/ConceptoTransaccion.js';
import '../src/models/ConfiguracionDian.js';
import '../src/models/Contrato.js';
import '../src/models/Cuenta.js';
import '../src/models/EtiquetaContable.js';
import '../src/models/LineaServicio.js';
import '../src/models/Moneda.js';
import '../src/models/Tax.js';
import '../src/models/TipoTransaccion.js';

// Importar relaciones
import '../src/models/relationships.js';

console.log('🚀 Inicializando base de datos en Google Cloud SQL...');

async function initializeDatabase() {
  try {
    // Probar conexión
    console.log('🔄 Probando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Sincronizar modelos (crear tablas)
    console.log('🔄 Sincronizando modelos...');
    await sequelize.sync({ force: true }); // force: true elimina y recrea todas las tablas
    console.log('✅ Tablas creadas correctamente.');

    // Crear datos iniciales
    console.log('🔄 Creando datos iniciales...');
    
    // Crear usuario administrador
    const User = sequelize.models.User;
    await User.create({
      name: 'Administrador',
      email: 'admin@pros.com',
      password: 'admin123', // En producción debería estar hasheada
      role: 'admin'
    });

    // Crear tipos de transacción básicos
    const TipoTransaccion = sequelize.models.TipoTransaccion;
    await TipoTransaccion.bulkCreate([
      { nombre: 'Factura de Venta', codigo: 'FV', descripcion: 'Factura de venta de productos o servicios' },
      { nombre: 'Factura de Compra', codigo: 'FC', descripcion: 'Factura de compra de productos o servicios' },
      { nombre: 'Nota Débito', codigo: 'ND', descripcion: 'Nota débito' },
      { nombre: 'Nota Crédito', codigo: 'NC', descripcion: 'Nota crédito' }
    ]);

    // Crear moneda por defecto
    const Moneda = sequelize.models.Moneda;
    await Moneda.create({
      codigo_iso: 'COP',
      nombre_moneda: 'Peso Colombiano',
      simbolo: '$',
      es_moneda_base: true
    });

    // Crear impuesto IVA
    const Tax = sequelize.models.Tax;
    await Tax.create({
      titulo_impuesto: 'Impuesto al Valor Agregado - IVA',
      tipo_obligacion: 'IVA',
      formula_aplicacion: 'Base gravable * 19%',
      periodicidad_declaracion: 'Bimestral',
      estado: 'ACTIVO'
    });

    // Crear centro de costo por defecto
    const CentroCosto = sequelize.models.CentroCosto;
    await CentroCosto.create({
      codigo: 'CC001',
      nombre: 'Administración',
      descripcion: 'Centro de costo administrativo'
    });

    // Crear configuración DIAN básica
    const ConfiguracionDian = sequelize.models.ConfiguracionDian;
    await ConfiguracionDian.create({
      ambiente: 'HABILITACION',
      nit: '900000000',
      nombre_empresa: 'PROS Sistema Empresarial',
      url_envio: 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
      url_consulta: 'https://catalogo-vpfe-hab.dian.gov.co/Document/FindDocument',
      certificado_path: '',
      password_certificado: '',
      activo: true
    });

    console.log('✅ Datos iniciales creados correctamente.');
    console.log('');
    console.log('🎉 ¡Base de datos inicializada correctamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log('   • Usuario admin creado: admin@pros.com / admin123');
    console.log('   • 4 tipos de transacción creados');
    console.log('   • Moneda COP configurada');
    console.log('   • Impuesto IVA (19%) configurado');
    console.log('   • Centro de costo administrativo creado');
    console.log('   • Configuración DIAN básica creada');
    console.log('');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar inicialización
initializeDatabase()
  .then(() => {
    console.log('✅ Proceso completado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el proceso:', error.message);
    process.exit(1);
  }); 