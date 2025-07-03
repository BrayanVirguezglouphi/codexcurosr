const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Pool de conexiones
const pool = new Pool({
  host: '100.94.177.68',
  port: 5432,
  database: 'SQL_DDL_ADMCOT_DEV',
  user: 'postgres',
  password: '00GP5673BD**$eG3Ve1101',
  ssl: false
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Ruta para ver tablas
app.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas básicas
app.get('/api/facturas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.id_factura,
        f.numero_factura,
        f.estatus_factura,
        f.id_contrato,
        f.fecha_radicado,
        f.fecha_estimada_pago,
        f.id_moneda,
        f.subtotal_facturado_moneda,
        f.id_tax,
        f.valor_tax,
        f.observaciones_factura,
        c.numero_contrato_os,
        t.razon_social as tercero_nombre
      FROM adcot_facturas f
      LEFT JOIN adcot_contratos_clientes c ON f.id_contrato = c.id_contrato
      LEFT JOIN adcot_terceros_exogenos t ON c.id_tercero = t.id_tercero
      ORDER BY f.fecha_radicado DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de contratos
app.get('/api/contratos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_contrato,
        numero_contrato_os,
        id_tercero,
        descripcion_servicio_contratado,
        estatus_contrato,
        fecha_contrato,
        fecha_inicio_servicio,
        fecha_final_servicio,
        id_moneda_cotizacion,
        valor_cotizado,
        valor_descuento,
        trm,
        id_tax,
        valor_tax,
        modo_de_pago,
        url_cotizacion,
        url_contrato,
        observaciones_contrato
      FROM adcot_contratos_clientes
      ORDER BY fecha_contrato DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contratos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        t.razon_social as tercero_nombre
      FROM adcot_contratos_clientes c
      LEFT JOIN adcot_terceros_exogenos t ON c.id_tercero = t.id_tercero
      WHERE c.id_contrato = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tipos de documento
app.get('/api/catalogos/tipos-documento', async (req, res) => {
  console.log('🔍 Consultando tipos de documento...');
  try {
    const result = await pool.query(
      'SELECT id_tipodocumento as id, tipo_documento as nombre FROM adcot_tipo_documento WHERE id_tipodocumento IS NOT NULL ORDER BY id_tipodocumento'
    );
    console.log(`✅ ${result.rows.length} tipos de documento encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando tipos de documento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tipos de relación
app.get('/api/catalogos/tipos-relacion', async (req, res) => {
  console.log('🔍 Consultando tipos de relación...');
  try {
    const result = await pool.query(
      'SELECT id_tiporelacion as id, tipo_relacion as nombre FROM adcot_relacion_contractual WHERE id_tiporelacion IS NOT NULL ORDER BY id_tiporelacion'
    );
    console.log(`✅ ${result.rows.length} tipos de relación encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando tipos de relación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tipos de transacción
app.get('/api/catalogos/tipos-transaccion', async (req, res) => {
  console.log('🔍 Consultando tipos de transacción...');
  try {
    const result = await pool.query(`
      SELECT 
        id_tipotransaccion as id,
        tipo_transaccion as nombre,
        descripcion_tipo_transaccion as descripcion
      FROM adcot_tipo_transaccion 
      WHERE id_tipotransaccion IS NOT NULL 
      ORDER BY id_tipotransaccion
    `);
    console.log(`✅ ${result.rows.length} tipos de transacción encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando tipos de transacción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de terceros
app.get('/api/terceros', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id_tercero,
        t.tipo_personalidad,
        t.id_tipo_documento,
        td.tipo_documento,
        t.numero_documento,
        t.dv,
        t.razon_social,
        t.primer_nombre,
        t.otros_nombres,
        t.primer_apellido,
        t.segundo_apellido,
        t.id_tiporelacion,
        rc.tipo_relacion,
        t.direccion,
        t.id_municipio_ciudad,
        t.telefono,
        t.observaciones,
        t.nombre_consolidado
      FROM adcot_terceros_exogenos t
      LEFT JOIN adcot_tipo_documento td ON t.id_tipo_documento = td.id_tipodocumento
      LEFT JOIN adcot_relacion_contractual rc ON t.id_tiporelacion = rc.id_tiporelacion
      ORDER BY t.id_tercero DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/terceros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        t.id_tercero,
        t.tipo_personalidad,
        t.id_tipo_documento,
        td.tipo_documento,
        t.numero_documento,
        t.dv,
        t.razon_social,
        t.primer_nombre,
        t.otros_nombres,
        t.primer_apellido,
        t.segundo_apellido,
        t.id_tiporelacion,
        rc.tipo_relacion,
        t.direccion,
        t.id_municipio_ciudad,
        t.telefono,
        t.observaciones,
        t.nombre_consolidado
      FROM adcot_terceros_exogenos t
      LEFT JOIN adcot_tipo_documento td ON t.id_tipo_documento = td.id_tipodocumento
      LEFT JOIN adcot_relacion_contractual rc ON t.id_tiporelacion = rc.id_tiporelacion
      WHERE t.id_tercero = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/terceros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const {
      tipo_personalidad,
      id_tipo_documento,
      numero_documento,
      dv,
      razon_social,
      primer_nombre,
      otros_nombres,
      primer_apellido,
      segundo_apellido,
      id_tiporelacion,
      direccion,
      id_municipio_ciudad,
      telefono,
      observaciones,
      nombre_consolidado
    } = req.body;

    const result = await pool.query(`
      UPDATE adcot_terceros_exogenos SET
        tipo_personalidad = $1,
        id_tipo_documento = $2,
        numero_documento = $3,
        dv = $4,
        razon_social = $5,
        primer_nombre = $6,
        otros_nombres = $7,
        primer_apellido = $8,
        segundo_apellido = $9,
        id_tiporelacion = $10,
        direccion = $11,
        id_municipio_ciudad = $12,
        telefono = $13,
        observaciones = $14,
        nombre_consolidado = $15
      WHERE id_tercero = $16
      RETURNING *
    `, [
      tipo_personalidad,
      id_tipo_documento,
      numero_documento,
      dv,
      razon_social,
      primer_nombre,
      otros_nombres,
      primer_apellido,
      segundo_apellido,
      id_tiporelacion,
      direccion,
      id_municipio_ciudad,
      telefono,
      observaciones,
      nombre_consolidado,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// También agregaremos la ruta para obtener una factura específica
app.get('/api/facturas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        f.*,
        c.numero_contrato_os,
        t.razon_social as tercero_nombre,
        ft.id_transaccion
      FROM adcot_facturas f
      LEFT JOIN adcot_contratos_clientes c ON f.id_contrato = c.id_contrato
      LEFT JOIN adcot_terceros_exogenos t ON c.id_tercero = t.id_tercero
      LEFT JOIN adcot_aux_factura_transacciones ft ON f.id_factura = ft.id_factura
      WHERE f.id_factura = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catálogos
// Monedas
app.get('/api/catalogos/monedas', async (req, res) => {
  console.log('🔍 Consultando monedas...');
  try {
    const result = await pool.query(`
      SELECT 
        id_moneda as id,
        codigo_iso,
        nombre_moneda as nombre,
        simbolo,
        es_moneda_base
      FROM moneda
      WHERE id_moneda IS NOT NULL
      ORDER BY id_moneda
    `);
    console.log(`✅ ${result.rows.length} monedas encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando monedas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Impuestos
app.get('/api/impuestos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_tax, 
        tipo_obligacion, 
        institucion_reguladora, 
        titulo_impuesto, 
        formula_aplicacion, 
        periodicidad_declaracion, 
        estado, 
        observaciones, 
        url_referencia_normativa, 
        fecha_inicio_impuesto, 
        fecha_final_impuesto, 
        url_instrucciones, 
        fecha_fin
      FROM adcot_taxes
      ORDER BY id_tax
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando impuestos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Estados de factura
app.get('/api/catalogos/estados-factura', async (req, res) => {
  try {
    const estados = [
      { id: 'PENDIENTE', nombre: 'Pendiente' },
      { id: 'PAGADA', nombre: 'Pagada' },
      { id: 'ANULADA', nombre: 'Anulada' },
      { id: 'EN_PROCESO', nombre: 'En Proceso' }
    ];
    res.json(estados);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Etiquetas contables
app.get('/api/catalogos/etiquetas-contables', async (req, res) => {
  console.log('🔍 Consultando etiquetas contables...');
  try {
    const result = await pool.query(`
      SELECT 
        id_etiqueta_contable as id,
        etiqueta_contable as nombre,
        descripcion_etiqueta
      FROM adcot_etiquetas_contables
      WHERE id_etiqueta_contable IS NOT NULL
      ORDER BY id_etiqueta_contable
    `);
    console.log(`✅ ${result.rows.length} etiquetas contables encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando etiquetas contables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cuentas
app.get('/api/catalogos/cuentas', async (req, res) => {
  console.log('🔍 Consultando cuentas...');
  try {
    const result = await pool.query(`
      SELECT 
        id_cuenta as id,
        titulo_cuenta as nombre,
        numero_cuenta,
        titular_cuenta,
        tipo_titular,
        url_certificado_cuenta
      FROM adcot_cuentas
      WHERE id_cuenta IS NOT NULL
      ORDER BY id_cuenta
    `);
    console.log(`✅ ${result.rows.length} cuentas encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando cuentas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Conceptos de transacciones
app.get('/api/catalogos/conceptos-transacciones', async (req, res) => {
  console.log('🔍 Consultando conceptos de transacciones...');
  try {
    const result = await pool.query(`
      SELECT 
        id_concepto as id,
        id_tipo_transaccion as tipo_transaccion,
        codigo_dian as codigo,
        concepto_dian as nombre
      FROM adcot_conceptos_transacciones 
      WHERE id_concepto IS NOT NULL 
      ORDER BY concepto_dian
    `);
    console.log(`✅ ${result.rows.length} conceptos de transacciones encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando conceptos de transacciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transacciones
app.get('/api/transacciones', async (req, res) => {
  console.log('🔍 Consultando transacciones...');
  try {
    const result = await pool.query(`
      SELECT 
        t.id_transaccion,
        t.id_cuenta,
        t.id_tipotransaccion,
        tt.tipo_transaccion,
        t.fecha_transaccion,
        t.titulo_transaccion,
        t.id_moneda_transaccion,
        m.nombre_moneda,
        t.valor_total_transaccion,
        t.trm_moneda_base,
        t.observacion,
        t.url_soporte_adjunto,
        t.registro_auxiliar,
        t.registro_validado,
        t.id_etiqueta_contable,
        ec.etiqueta_contable,
        t.id_tercero,
        ter.razon_social as nombre_tercero,
        t.id_cuenta_destino_transf,
        cd.titulo_cuenta as cuenta_destino,
        t.aplica_retencion,
        t.aplica_impuestos,
        t.id_concepto,
        ct.concepto_dian
      FROM adcot_transacciones t
      LEFT JOIN adcot_tipo_transaccion tt ON t.id_tipotransaccion = tt.id_tipotransaccion
      LEFT JOIN adcot_conceptos_transacciones ct ON t.id_concepto = ct.id_concepto
      LEFT JOIN adcot_etiquetas_contables ec ON t.id_etiqueta_contable = ec.id_etiqueta_contable
      LEFT JOIN adcot_cuentas c ON t.id_cuenta = c.id_cuenta
      LEFT JOIN moneda m ON t.id_moneda_transaccion = m.id_moneda
      LEFT JOIN adcot_terceros_exogenos ter ON t.id_tercero = ter.id_tercero
      LEFT JOIN adcot_cuentas cd ON t.id_cuenta_destino_transf = cd.id_cuenta
      ORDER BY t.fecha_transaccion DESC
    `);
    console.log(`✅ ${result.rows.length} transacciones encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando transacciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// También actualizamos la ruta para obtener una transacción específica
app.get('/api/transacciones/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🔍 Consultando transacción ${id}...`);
  try {
    const result = await pool.query(`
      SELECT 
        t.id_transaccion,
        t.id_cuenta,
        t.id_tipotransaccion,
        tt.tipo_transaccion,
        t.fecha_transaccion,
        t.titulo_transaccion,
        t.id_moneda_transaccion,
        m.nombre_moneda,
        t.valor_total_transaccion,
        t.trm_moneda_base,
        t.observacion,
        t.url_soporte_adjunto,
        t.registro_auxiliar,
        t.registro_validado,
        t.id_etiqueta_contable,
        ec.etiqueta_contable,
        t.id_tercero,
        ter.razon_social as nombre_tercero,
        t.id_cuenta_destino_transf,
        cd.titulo_cuenta as cuenta_destino,
        t.aplica_retencion,
        t.aplica_impuestos,
        t.id_concepto,
        ct.concepto_dian
      FROM adcot_transacciones t
      LEFT JOIN adcot_tipo_transaccion tt ON t.id_tipotransaccion = tt.id_tipotransaccion
      LEFT JOIN adcot_conceptos_transacciones ct ON t.id_concepto = ct.id_concepto
      LEFT JOIN adcot_etiquetas_contables ec ON t.id_etiqueta_contable = ec.id_etiqueta_contable
      LEFT JOIN adcot_cuentas c ON t.id_cuenta = c.id_cuenta
      LEFT JOIN moneda m ON t.id_moneda_transaccion = m.id_moneda
      LEFT JOIN adcot_terceros_exogenos ter ON t.id_tercero = ter.id_tercero
      LEFT JOIN adcot_cuentas cd ON t.id_cuenta_destino_transf = cd.id_cuenta
      WHERE t.id_transaccion = $1
    `, [id]);

    if (result.rows.length === 0) {
      console.log(`❌ Transacción ${id} no encontrada`);
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    console.log(`✅ Transacción ${id} encontrada`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error consultando transacción ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Líneas de servicios
app.get('/api/lineas-servicios', async (req, res) => {
  console.log('🔍 Consultando líneas de servicios...');
  try {
    const result = await pool.query(`
      SELECT 
        ls.id_servicio as id,
        ls.servicio as nombre,
        ls.descripcion_servicio,
        ls.id_modelonegocio,
        ms.modelo as nombre_modelonegocio
      FROM adcot_lineas_de_servicios ls
      LEFT JOIN adcot_modelos_servicios ms ON ls.id_modelonegocio = ms.id_modelonegocio
      WHERE ls.id_servicio IS NOT NULL
      ORDER BY ls.id_servicio
    `);
    console.log(`✅ ${result.rows.length} líneas de servicios encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando líneas de servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Modelos de negocio
app.get('/api/modelos-negocio', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_modelonegocio, modelo, descripcion FROM adcot_modelos_servicios ORDER BY id_modelonegocio
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando modelos de negocio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Centros de Costos
app.get('/api/centros-costos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_centro_costo, sub_centro_costo, centro_costo_macro, descripcion_cc FROM adcot_centro_costos ORDER BY id_centro_costo
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando centros de costos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Etiquetas Contables
app.get('/api/etiquetas-contables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_etiqueta_contable, etiqueta_contable, descripcion_etiqueta FROM adcot_etiquetas_contables ORDER BY id_etiqueta_contable
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando etiquetas contables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Conceptos de Transacciones
app.get('/api/conceptos-transacciones', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_concepto, id_tipo_transaccion, codigo_dian, concepto_dian FROM adcot_conceptos_transacciones ORDER BY id_concepto
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando conceptos de transacciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  
  // Mostrar tablas disponibles al iniciar
  pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `)
  .then(result => {
    console.log('\n📋 Tablas disponibles en la base de datos:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    console.log('\n');
  })
  .catch(err => {
    console.error('❌ Error al consultar tablas:', err);
  });
}); 