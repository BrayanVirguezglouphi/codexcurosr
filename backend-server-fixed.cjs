const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Configuración de base de datos
const pool = new Pool({
  host: process.env.DB_HOST || '35.238.111.59',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456789',
  ssl: false
});

// Función para probar conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a BD exitosa:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a BD:', error.message);
    return false;
  }
};

// Ruta de health check con estado de BD
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'OK',
    message: 'Servidor backend funcionando',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8080,
    database: {
      connected: dbConnected,
      host: process.env.DB_HOST || '35.238.111.59',
      database: process.env.DB_NAME || 'SQL_DDL_ADMCOT'
    }
  });
});

// Endpoint para debug - listar todas las tablas disponibles
app.get('/api/debug/tables', async (req, res) => {
  try {
    console.log('🔍 Listando todas las tablas disponibles...');
    
    const todasTablas = await pool.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND (table_name LIKE 'adcot_%' OR table_name IN ('moneda', 'users'))
      ORDER BY table_name
    `);
    
    console.log(`✅ Encontradas ${todasTablas.rows.length} tablas`);
    
    res.json({
      totalTables: todasTablas.rows.length,
      tables: todasTablas.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error al listar tablas:', error);
    res.status(500).json({ 
      error: 'Error al listar tablas',
      details: error.message 
    });
  }
});

// Ruta para obtener transacciones reales con nombres de tabla correctos
app.get('/api/transacciones', async (req, res) => {
  try {
    console.log('🔍 Consultando transacciones en BD...');
    
    const query = `
      SELECT 
        t.id_transaccion,
        t.fecha_transaccion,
        t.titulo_transaccion,
        t.valor_total_transaccion,
        t.observacion,
        t.trm_moneda_base,
        t.registro_validado,
        t.registro_auxiliar,
        t.aplica_retencion,
        t.aplica_impuestos,
        tt.tipo_transaccion,
        c.nombre_cuenta
      FROM adcot_transacciones t
      LEFT JOIN adcot_tipo_transaccion tt ON t.id_tipotransaccion = tt.id_tipotransaccion
      LEFT JOIN adcot_cuentas c ON t.id_cuenta = c.id_cuenta
      ORDER BY t.fecha_transaccion DESC
      LIMIT 100
    `;
    
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} transacciones`);
    
    // Formatear datos para el frontend
    const transacciones = result.rows.map(row => ({
      id_transaccion: row.id_transaccion,
      fecha_transaccion: row.fecha_transaccion,
      titulo_transaccion: row.titulo_transaccion,
      valor_total_transaccion: parseFloat(row.valor_total_transaccion) || 0,
      observacion: row.observacion,
      trm_moneda_base: parseFloat(row.trm_moneda_base) || 0,
      registro_validado: row.registro_validado,
      registro_auxiliar: row.registro_auxiliar,
      aplica_retencion: row.aplica_retencion,
      aplica_impuestos: row.aplica_impuestos,
      tipoTransaccion: {
        tipo_transaccion: row.tipo_transaccion
      },
      cuenta: {
        nombre_cuenta: row.nombre_cuenta
      }
    }));
    
    res.json(transacciones);
  } catch (error) {
    console.error('❌ Error al obtener transacciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener transacciones',
      details: error.message 
    });
  }
});

// Ruta para crear transacción
app.post('/api/transacciones', async (req, res) => {
  try {
    const {
      titulo_transaccion,
      valor_total_transaccion,
      id_tipotransaccion,
      id_cuenta,
      observacion
    } = req.body;

    const query = `
      INSERT INTO adcot_transacciones 
      (titulo_transaccion, valor_total_transaccion, id_tipotransaccion, id_cuenta, observacion, fecha_transaccion)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      titulo_transaccion,
      valor_total_transaccion,
      id_tipotransaccion,
      id_cuenta,
      observacion
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear transacción:', error);
    res.status(500).json({ 
      error: 'Error al crear transacción',
      details: error.message 
    });
  }
});

// Ruta para actualizar transacción
app.put('/api/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    // Construir query dinámicamente
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE adcot_transacciones 
      SET ${setClause}
      WHERE id_transaccion = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar transacción:', error);
    res.status(500).json({ 
      error: 'Error al actualizar transacción',
      details: error.message 
    });
  }
});

// Ruta para eliminar transacción
app.delete('/api/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM adcot_transacciones WHERE id_transaccion = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    res.json({ message: 'Transacción eliminada', transaccion: result.rows[0] });
  } catch (error) {
    console.error('❌ Error al eliminar transacción:', error);
    res.status(500).json({ 
      error: 'Error al eliminar transacción',
      details: error.message 
    });
  }
});

// RUTAS DE CATÁLOGOS - Implementar todos los endpoints que aparecen en los errores 404

// 1. Catálogo de tipos de transacción
app.get('/api/catalogos/tipos-transaccion', async (req, res) => {
  try {
    console.log('🔍 Consultando tipos de transacción...');
    const query = 'SELECT * FROM adcot_tipo_transaccion ORDER BY tipo_transaccion ASC';
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} tipos de transacción`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener tipos de transacción:', error);
    res.status(500).json({ 
      error: 'Error al obtener tipos de transacción',
      details: error.message 
    });
  }
});

// 2. Catálogo de cuentas
app.get('/api/catalogos/cuentas', async (req, res) => {
  try {
    console.log('🔍 Consultando cuentas...');
    const query = 'SELECT * FROM adcot_cuentas ORDER BY nombre_cuenta ASC';
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} cuentas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener cuentas:', error);
    res.status(500).json({ 
      error: 'Error al obtener cuentas',
      details: error.message 
    });
  }
});

// 3. Catálogo de etiquetas contables
app.get('/api/catalogos/etiquetas-contables', async (req, res) => {
  try {
    console.log('🔍 Consultando etiquetas contables...');
    
    // Verificar tabla etiquetas
    const tablaEtiquetas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%etiqueta%'
    `);
    
    if (tablaEtiquetas.rows.length === 0) {
      return res.json([]); // Retornar array vacío si no existe
    }
    
    const nombreTabla = tablaEtiquetas.rows[0].table_name;
    const query = `SELECT * FROM ${nombreTabla} ORDER BY id_etiqueta_contable ASC`;
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} etiquetas contables`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener etiquetas contables:', error);
    res.json([]); // Retornar array vacío en caso de error
  }
});

// 4. Catálogo de conceptos
app.get('/api/catalogos/conceptos', async (req, res) => {
  try {
    console.log('🔍 Consultando conceptos...');
    
    // Verificar tabla conceptos
    const tablaConceptos = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%concepto%'
    `);
    
    if (tablaConceptos.rows.length === 0) {
      return res.json([]);
    }
    
    const nombreTabla = tablaConceptos.rows[0].table_name;
    const query = `SELECT * FROM ${nombreTabla} ORDER BY id_concepto ASC`;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} conceptos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener conceptos:', error);
    res.json([]);
  }
});

// 5. Catálogo de monedas
app.get('/api/catalogos/monedas', async (req, res) => {
  try {
    console.log('🔍 Consultando monedas...');
    const query = 'SELECT * FROM moneda ORDER BY nombre_moneda ASC';
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} monedas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener monedas:', error);
    res.status(500).json({ 
      error: 'Error al obtener monedas',
      details: error.message 
    });
  }
});

// 6. Catálogo de terceros
app.get('/api/catalogos/terceros', async (req, res) => {
  try {
    console.log('🔍 Consultando terceros...');
    const query = `
      SELECT 
        id_tercero,
        razon_social,
        primer_nombre,
        primer_apellido,
        tipo_personalidad,
        numero_documento
      FROM adcot_terceros_exogenos 
      ORDER BY razon_social ASC, primer_nombre ASC
    `;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} terceros`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener terceros:', error);
    res.status(500).json({ 
      error: 'Error al obtener terceros',
      details: error.message 
    });
  }
});

// RUTAS PRINCIPALES PARA OTRAS ENTIDADES

// 7. Ruta principal de terceros con detalles completos
app.get('/api/terceros', async (req, res) => {
  try {
    console.log('🔍 Consultando terceros completos...');
    const query = `
      SELECT * FROM adcot_terceros_exogenos 
      ORDER BY razon_social ASC, primer_nombre ASC
      LIMIT 100
    `;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} terceros`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener terceros:', error);
    res.status(500).json({ 
      error: 'Error al obtener terceros',
      details: error.message 
    });
  }
});

// 8. Ruta de conceptos de transacciones
app.get('/api/conceptos-transacciones', async (req, res) => {
  try {
    console.log('🔍 Consultando conceptos de transacciones...');
    const query = `
      SELECT 
        c.*,
        tt.tipo_transaccion
      FROM adcot_conceptos_transacciones c
      LEFT JOIN adcot_tipo_transaccion tt ON c.id_tipotransaccion = tt.id_tipotransaccion
      ORDER BY c.concepto_dian ASC
    `;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} conceptos de transacciones`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener conceptos de transacciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener conceptos de transacciones',
      details: error.message 
    });
  }
});

// 9. Ruta de tipos de transacción
app.get('/api/tipos-transaccion', async (req, res) => {
  try {
    console.log('🔍 Consultando tipos de transacción...');
    const query = 'SELECT * FROM adcot_tipo_transaccion ORDER BY tipo_transaccion ASC';
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} tipos de transacción`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener tipos de transacción:', error);
    res.status(500).json({ 
      error: 'Error al obtener tipos de transacción',
      details: error.message 
    });
  }
});

// 10. Ruta de etiquetas contables
app.get('/api/etiquetas-contables', async (req, res) => {
  try {
    console.log('🔍 Consultando etiquetas contables...');
    const query = 'SELECT * FROM adcot_etiquetas_contables ORDER BY etiqueta_contable ASC';
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} etiquetas contables`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener etiquetas contables:', error);
    res.status(500).json({ 
      error: 'Error al obtener etiquetas contables',
      details: error.message 
    });
  }
});

// 11. Ruta de centros de costos
app.get('/api/centros-costos', async (req, res) => {
  try {
    console.log('🔍 Consultando centros de costos...');
    
    // Verificar tabla centros de costos
    const tablaCentros = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%centro%'
    `);
    
    if (tablaCentros.rows.length === 0) {
      return res.json([]);
    }
    
    const nombreTabla = tablaCentros.rows[0].table_name;
    const query = `SELECT * FROM ${nombreTabla} LIMIT 100`;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} centros de costos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener centros de costos:', error);
    res.json([]);
  }
});

// 12. Ruta de contratos - VERIFICAR NOMBRE DE TABLA
app.get('/api/contratos', async (req, res) => {
  try {
    console.log('🔍 Consultando contratos...');
    
    // Primero verificar qué tabla de contratos existe
    const tablaExiste = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%contrato%'
    `);
    
    console.log('📋 Tablas de contratos encontradas:', tablaExiste.rows);
    
    if (tablaExiste.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontró tabla de contratos',
        availableTables: tablaExiste.rows
      });
    }
    
    // Usar la primera tabla encontrada (probablemente la correcta)
    const nombreTabla = tablaExiste.rows[0].table_name;
    console.log(`📊 Usando tabla: ${nombreTabla}`);
    
    const query = `SELECT * FROM ${nombreTabla} ORDER BY id_contrato DESC LIMIT 100`;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} contratos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener contratos:', error);
    res.status(500).json({ 
      error: 'Error al obtener contratos',
      details: error.message 
    });
  }
});

// 13. Ruta de facturas - VERIFICAR ESTRUCTURA
app.get('/api/facturas', async (req, res) => {
  try {
    console.log('🔍 Consultando facturas...');
    
    // Verificar tabla facturas
    const tablaFacturas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%factura%'
    `);
    
    if (tablaFacturas.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontró tabla de facturas'
      });
    }
    
    const nombreTablaFactura = tablaFacturas.rows[0].table_name;
    console.log(`📊 Usando tabla de facturas: ${nombreTablaFactura}`);
    
    // Query simple sin JOINs complejos por ahora
    const query = `SELECT * FROM ${nombreTablaFactura} ORDER BY id_factura DESC LIMIT 100`;
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} facturas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener facturas:', error);
    res.status(500).json({ 
      error: 'Error al obtener facturas',
      details: error.message 
    });
  }
});

// 14. Ruta de impuestos/taxes
app.get('/api/impuestos', async (req, res) => {
  try {
    console.log('🔍 Consultando impuestos...');
    
    // Verificar tablas de impuestos
    const tablaImpuestos = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%tax%' OR table_name LIKE '%impuesto%'
    `);
    
    if (tablaImpuestos.rows.length === 0) {
      return res.json([]);
    }
    
    const nombreTabla = tablaImpuestos.rows[0].table_name;
    const query = `SELECT * FROM ${nombreTabla} LIMIT 100`;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} impuestos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener impuestos:', error);
    res.json([]);
  }
});

// 15. Ruta de líneas de servicios
app.get('/api/lineas-servicios', async (req, res) => {
  try {
    console.log('🔍 Consultando líneas de servicios...');
    
    // Verificar tabla líneas de servicios
    const tablaLineas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%linea%' OR table_name LIKE '%servicio%'
    `);
    
    if (tablaLineas.rows.length === 0) {
      return res.json([]);
    }
    
    const nombreTabla = tablaLineas.rows[0].table_name;
    const query = `SELECT * FROM ${nombreTabla} LIMIT 100`;
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} líneas de servicios`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener líneas de servicios:', error);
    res.json([]);
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback para SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicializar conexión al arrancar
testConnection();

// Iniciar servidor usando PORT de Cloud Run
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
  console.log(`📊 Conectado a: ${process.env.DB_HOST || '35.238.111.59'}:${process.env.DB_PORT || 5432}`);
}); 