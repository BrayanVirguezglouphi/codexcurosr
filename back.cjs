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

// Eliminar un contrato
app.delete('/api/contratos/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar contrato con ID: ${id}`);
  
  try {
    // Verificar si el contrato existe antes de eliminar
    const checkResult = await pool.query('SELECT id_contrato FROM adcot_contratos_clientes WHERE id_contrato = $1', [id]);
    console.log(`🔍 Contrato encontrado:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Contrato ${id} no encontrado - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    
    // Eliminar el contrato
    const deleteResult = await pool.query('DELETE FROM adcot_contratos_clientes WHERE id_contrato = $1', [id]);
    console.log(`✅ Contrato ${id} eliminado correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Contrato eliminado correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar contrato:', error);
    res.status(500).json({ message: error.message });
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
        id_tipotransaccion,
        tipo_transaccion,
        descripcion_tipo_transaccion
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
      observaciones
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
        observaciones = $14
      WHERE id_tercero = $15
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

// Eliminar un tercero
app.delete('/api/terceros/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar tercero con ID: ${id}`);
  
  try {
    // Verificar si el tercero existe antes de eliminar
    const checkResult = await pool.query('SELECT id_tercero FROM adcot_terceros_exogenos WHERE id_tercero = $1', [id]);
    console.log(`🔍 Tercero encontrado:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Tercero ${id} no encontrado - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Tercero no encontrado' });
    }
    
    // Eliminar el tercero
    const deleteResult = await pool.query('DELETE FROM adcot_terceros_exogenos WHERE id_tercero = $1', [id]);
    console.log(`✅ Tercero ${id} eliminado correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Tercero eliminado correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar tercero:', error);
    res.status(500).json({ message: error.message });
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

// Actualizar una factura existente
app.put('/api/facturas/:id', async (req, res) => {
  const { id } = req.params;
  const {
    numero_factura,
    estatus_factura,
    id_contrato,
    fecha_radicado,
    fecha_estimada_pago,
    id_moneda,
    subtotal_facturado_moneda,
    id_tax,
    valor_tax,
    observaciones_factura
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_facturas SET
        numero_factura = $1,
        estatus_factura = $2,
        id_contrato = $3,
        fecha_radicado = $4,
        fecha_estimada_pago = $5,
        id_moneda = $6,
        subtotal_facturado_moneda = $7,
        id_tax = $8,
        valor_tax = $9,
        observaciones_factura = $10
      WHERE id_factura = $11
      RETURNING *
    `, [
      numero_factura,
      estatus_factura,
      id_contrato,
      fecha_radicado,
      fecha_estimada_pago,
      id_moneda,
      subtotal_facturado_moneda,
      id_tax,
      valor_tax,
      observaciones_factura,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando factura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una factura
app.delete('/api/facturas/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar factura con ID: ${id}`);
  
  try {
    // Verificar si la factura existe antes de eliminar
    const checkResult = await pool.query('SELECT id_factura FROM adcot_facturas WHERE id_factura = $1', [id]);
    console.log(`🔍 Factura encontrada:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Factura ${id} no encontrada - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Eliminar la factura
    const deleteResult = await pool.query('DELETE FROM adcot_facturas WHERE id_factura = $1', [id]);
    console.log(`✅ Factura ${id} eliminada correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Factura eliminada correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar factura:', error);
    res.status(500).json({ message: error.message });
  }
});

// Catálogos
// Monedas
app.get('/api/catalogos/monedas', async (req, res) => {
  console.log('🔍 Consultando monedas...');
  try {
    const result = await pool.query(`
      SELECT 
        id_moneda,
        codigo_iso,
        nombre_moneda,
        simbolo,
        es_moneda_base
      FROM moneda
      WHERE id_moneda IS NOT NULL
      ORDER BY id_moneda
    `);
    // Mapear los campos para que coincidan con lo que espera el frontend
    const monedas = result.rows.map(m => ({
      id_moneda: m.id_moneda,
      codigo_iso: m.codigo_iso,
      nombre_moneda: m.nombre_moneda,
      simbolo: m.simbolo,
      es_moneda_base: m.es_moneda_base
    }));
    console.log(`✅ ${monedas.length} monedas encontradas`);
    res.json(monedas);
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
        id_etiqueta_contable,
        etiqueta_contable,
        descripcion_etiqueta
      FROM adcot_etiquetas_contables
      WHERE id_etiqueta_contable IS NOT NULL
      ORDER BY id_etiqueta_contable
    `);
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
        id_cuenta,
        tipo_titular,
        titulo_cuenta,
        titular_cuenta,
        numero_cuenta,
        url_certificado_cuenta
      FROM adcot_cuentas
      WHERE id_cuenta IS NOT NULL
      ORDER BY id_cuenta
    `);
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

// Obtener todos los conceptos de transacciones
app.get('/api/conceptos-transacciones', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_concepto,
        id_tipo_transaccion,
        codigo_dian,
        concepto_dian
      FROM adcot_conceptos_transacciones
      ORDER BY id_concepto
    `);
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

// Eliminar una transacción
app.delete('/api/transacciones/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar transacción con ID: ${id}`);
  
  try {
    // Verificar si la transacción existe antes de eliminar
    const checkResult = await pool.query('SELECT id_transaccion FROM adcot_transacciones WHERE id_transaccion = $1', [id]);
    console.log(`🔍 Transacción encontrada:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Transacción ${id} no encontrada - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }
    
    // Eliminar la transacción
    const deleteResult = await pool.query('DELETE FROM adcot_transacciones WHERE id_transaccion = $1', [id]);
    console.log(`✅ Transacción ${id} eliminada correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Transacción eliminada correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar transacción:', error);
    res.status(500).json({ message: error.message });
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
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva transacción
app.post('/api/transacciones', async (req, res) => {
  const {
    id_cuenta,
    id_tipotransaccion,
    fecha_transaccion,
    titulo_transaccion,
    id_moneda_transaccion,
    valor_total_transaccion,
    trm_moneda_base,
    observacion,
    url_soporte_adjunto,
    registro_auxiliar,
    registro_validado,
    id_etiqueta_contable,
    id_tercero,
    id_cuenta_destino_transf,
    aplica_retencion,
    aplica_impuestos,
    id_concepto
  } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO adcot_transacciones (
        id_cuenta, id_tipotransaccion, fecha_transaccion, titulo_transaccion, id_moneda_transaccion, valor_total_transaccion, trm_moneda_base, observacion, url_soporte_adjunto, registro_auxiliar, registro_validado, id_etiqueta_contable, id_tercero, id_cuenta_destino_transf, aplica_retencion, aplica_impuestos, id_concepto
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `, [
      id_cuenta,
      id_tipotransaccion,
      fecha_transaccion,
      titulo_transaccion,
      id_moneda_transaccion,
      valor_total_transaccion,
      trm_moneda_base,
      observacion,
      url_soporte_adjunto,
      registro_auxiliar,
      registro_validado,
      id_etiqueta_contable,
      id_tercero,
      id_cuenta_destino_transf,
      aplica_retencion,
      aplica_impuestos,
      id_concepto
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando transacción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una transacción existente
app.put('/api/transacciones/:id', async (req, res) => {
  const { id } = req.params;
  const {
    id_cuenta,
    id_tipotransaccion,
    fecha_transaccion,
    titulo_transaccion,
    id_moneda_transaccion,
    valor_total_transaccion,
    trm_moneda_base,
    observacion,
    url_soporte_adjunto,
    registro_auxiliar,
    registro_validado,
    id_etiqueta_contable,
    id_tercero,
    id_cuenta_destino_transf,
    aplica_retencion,
    aplica_impuestos,
    id_concepto
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_transacciones SET
        id_cuenta = $1,
        id_tipotransaccion = $2,
        fecha_transaccion = $3,
        titulo_transaccion = $4,
        id_moneda_transaccion = $5,
        valor_total_transaccion = $6,
        trm_moneda_base = $7,
        observacion = $8,
        url_soporte_adjunto = $9,
        registro_auxiliar = $10,
        registro_validado = $11,
        id_etiqueta_contable = $12,
        id_tercero = $13,
        id_cuenta_destino_transf = $14,
        aplica_retencion = $15,
        aplica_impuestos = $16,
        id_concepto = $17
      WHERE id_transaccion = $18
      RETURNING *
    `, [
      id_cuenta,
      id_tipotransaccion,
      fecha_transaccion,
      titulo_transaccion,
      id_moneda_transaccion,
      valor_total_transaccion,
      trm_moneda_base,
      observacion,
      url_soporte_adjunto,
      registro_auxiliar,
      registro_validado,
      id_etiqueta_contable,
      id_tercero,
      id_cuenta_destino_transf,
      aplica_retencion,
      aplica_impuestos,
      id_concepto,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando transacción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un contrato existente
app.put('/api/contratos/:id', async (req, res) => {
  const { id } = req.params;
  const {
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
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_contratos_clientes SET
        numero_contrato_os = $1,
        id_tercero = $2,
        descripcion_servicio_contratado = $3,
        estatus_contrato = $4,
        fecha_contrato = $5,
        fecha_inicio_servicio = $6,
        fecha_final_servicio = $7,
        id_moneda_cotizacion = $8,
        valor_cotizado = $9,
        valor_descuento = $10,
        trm = $11,
        id_tax = $12,
        valor_tax = $13,
        modo_de_pago = $14,
        url_cotizacion = $15,
        url_contrato = $16,
        observaciones_contrato = $17
      WHERE id_contrato = $18
      RETURNING *
    `, [
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
      observaciones_contrato,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una línea de servicio existente
app.put('/api/lineas-servicios/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion_servicio,
    id_modelonegocio
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_lineas_de_servicios SET
        servicio = $1,
        descripcion_servicio = $2,
        id_modelonegocio = $3
      WHERE id_servicio = $4
      RETURNING *
    `, [
      nombre,
      descripcion_servicio,
      id_modelonegocio,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Línea de servicio no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando línea de servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una línea de servicio
app.delete('/api/lineas-servicios/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar línea de servicio con ID: ${id}`);
  
  try {
    // Verificar si la línea de servicio existe antes de eliminar
    const checkResult = await pool.query('SELECT id_servicio FROM adcot_lineas_de_servicios WHERE id_servicio = $1', [id]);
    console.log(`🔍 Línea de servicio encontrada:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Línea de servicio ${id} no encontrada - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Línea de servicio no encontrada' });
    }
    
    // Eliminar la línea de servicio
    const deleteResult = await pool.query('DELETE FROM adcot_lineas_de_servicios WHERE id_servicio = $1', [id]);
    console.log(`✅ Línea de servicio ${id} eliminada correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Línea de servicio eliminada correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar línea de servicio:', error);
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un impuesto existente
app.put('/api/impuestos/:id', async (req, res) => {
  const { id } = req.params;
  const {
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
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_taxes SET
        tipo_obligacion = $1,
        institucion_reguladora = $2,
        titulo_impuesto = $3,
        formula_aplicacion = $4,
        periodicidad_declaracion = $5,
        estado = $6,
        observaciones = $7,
        url_referencia_normativa = $8,
        fecha_inicio_impuesto = $9,
        fecha_final_impuesto = $10,
        url_instrucciones = $11,
        fecha_fin = $12
      WHERE id_tax = $13
      RETURNING *
    `, [
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
      fecha_fin,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Impuesto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando impuesto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un impuesto
app.delete('/api/impuestos/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar impuesto con ID: ${id}`);
  
  try {
    // Verificar si el impuesto existe antes de eliminar
    const checkResult = await pool.query('SELECT id_tax FROM adcot_taxes WHERE id_tax = $1', [id]);
    console.log(`🔍 Impuesto encontrado:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Impuesto ${id} no encontrado - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Impuesto no encontrado' });
    }
    
    // Eliminar el impuesto
    const deleteResult = await pool.query('DELETE FROM adcot_taxes WHERE id_tax = $1', [id]);
    console.log(`✅ Impuesto ${id} eliminado correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Impuesto eliminado correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar impuesto:', error);
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un centro de costos existente
app.put('/api/centros-costos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    sub_centro_costo,
    centro_costo_macro,
    descripcion_cc
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_centro_costos SET
        sub_centro_costo = $1,
        centro_costo_macro = $2,
        descripcion_cc = $3
      WHERE id_centro_costo = $4
      RETURNING *
    `, [
      sub_centro_costo,
      centro_costo_macro,
      descripcion_cc,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Centro de costos no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando centro de costos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un centro de costos
app.delete('/api/centros-costos/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar centro de costos con ID: ${id}`);
  
  try {
    // Verificar si el centro de costos existe antes de eliminar
    const checkResult = await pool.query('SELECT id_centro_costo FROM adcot_centro_costos WHERE id_centro_costo = $1', [id]);
    console.log(`🔍 Centro de costos encontrado:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Centro de costos ${id} no encontrado - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Centro de costos no encontrado' });
    }
    
    // Eliminar el centro de costos
    const deleteResult = await pool.query('DELETE FROM adcot_centro_costos WHERE id_centro_costo = $1', [id]);
    console.log(`✅ Centro de costos ${id} eliminado correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Centro de costos eliminado correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar centro de costos:', error);
    res.status(500).json({ message: error.message });
  }
});

// Actualizar una etiqueta contable existente
app.put('/api/etiquetas-contables/:id', async (req, res) => {
  const { id } = req.params;
  const {
    etiqueta_contable,
    descripcion_etiqueta
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_etiquetas_contables SET
        etiqueta_contable = $1,
        descripcion_etiqueta = $2
      WHERE id_etiqueta_contable = $3
      RETURNING *
    `, [
      etiqueta_contable,
      descripcion_etiqueta,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Etiqueta contable no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando etiqueta contable:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una etiqueta contable
app.delete('/api/etiquetas-contables/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar etiqueta contable con ID: ${id}`);
  
  try {
    // Verificar si la etiqueta contable existe antes de eliminar
    const checkResult = await pool.query('SELECT id_etiqueta_contable FROM adcot_etiquetas_contables WHERE id_etiqueta_contable = $1', [id]);
    console.log(`🔍 Etiqueta contable encontrada:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Etiqueta contable ${id} no encontrada - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Etiqueta contable no encontrada' });
    }
    
    // Eliminar la etiqueta contable
    const deleteResult = await pool.query('DELETE FROM adcot_etiquetas_contables WHERE id_etiqueta_contable = $1', [id]);
    console.log(`✅ Etiqueta contable ${id} eliminada correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Etiqueta contable eliminada correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar etiqueta contable:', error);
    res.status(500).json({ message: error.message });
  }
});

// Actualizar un concepto de transacción existente
app.put('/api/conceptos-transacciones/:id', async (req, res) => {
  const { id } = req.params;
  const {
    id_tipo_transaccion,
    codigo_dian,
    concepto_dian
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE adcot_conceptos_transacciones SET
        id_tipo_transaccion = $1,
        codigo_dian = $2,
        concepto_dian = $3
      WHERE id_concepto = $4
      RETURNING *
    `, [
      id_tipo_transaccion,
      codigo_dian,
      concepto_dian,
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Concepto de transacción no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando concepto de transacción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un concepto de transacción
app.delete('/api/conceptos-transacciones/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar concepto de transacción con ID: ${id}`);
  
  try {
    // Verificar si el concepto de transacción existe antes de eliminar
    const checkResult = await pool.query('SELECT id_concepto FROM adcot_conceptos_transacciones WHERE id_concepto = $1', [id]);
    console.log(`🔍 Concepto de transacción encontrado:`, checkResult.rows.length > 0 ? 'SÍ' : 'NO');
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Concepto de transacción ${id} no encontrado - respondiendo 404`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Concepto de transacción no encontrado' });
    }
    
    // Eliminar el concepto de transacción
    const deleteResult = await pool.query('DELETE FROM adcot_conceptos_transacciones WHERE id_concepto = $1', [id]);
    console.log(`✅ Concepto de transacción ${id} eliminado correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Concepto de transacción eliminado correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar concepto de transacción:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== ENDPOINTS OKR ====================

// Staff OKR - Obtener todo el staff
app.get('/api/okr/staff', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_staff,
        nombre,
        correo,
        rol,
        id_tercero
      FROM okr_staff
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando staff OKR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff OKR - Crear nuevo staff
app.post('/api/okr/staff', async (req, res) => {
  const { nombre, correo, rol, id_tercero } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO okr_staff (nombre, correo, rol, id_tercero)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [nombre, correo, rol, id_tercero]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando staff OKR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Objetivos - Obtener todos los objetivos con sus key results
app.get('/api/okr/objetivos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id_objetivo,
        o.titulo,
        o.descripcion,
        o.nivel,
        o.id_responsable,
        s.nombre as responsable_nombre,
        o.fecha_inicio,
        o.fecha_fin,
        o.estado,
        o.id_objetivo_preexistente,
        o.nivel_impacto,
        COUNT(kr.id_kr) as total_key_results,
        COALESCE(AVG(kr.porcentaje_cumplimiento), 0) as promedio_cumplimiento
      FROM okr_objetivos o
      LEFT JOIN okr_staff s ON o.id_responsable = s.id_staff
      LEFT JOIN okr_resultados_clave kr ON o.id_objetivo = kr.id_objetivo
      GROUP BY o.id_objetivo, s.nombre
      ORDER BY o.fecha_inicio DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando objetivos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Objetivos - Obtener un objetivo específico con sus key results
app.get('/api/okr/objetivos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener objetivo
    const objetivoResult = await pool.query(`
      SELECT 
        o.*,
        s.nombre as responsable_nombre,
        s.correo as responsable_correo
      FROM okr_objetivos o
      LEFT JOIN okr_staff s ON o.id_responsable = s.id_staff
      WHERE o.id_objetivo = $1
    `, [id]);

    if (objetivoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo no encontrado' });
    }

    // Obtener key results del objetivo
    const keyResultsResult = await pool.query(`
      SELECT 
        kr.*,
        s.nombre as responsable_nombre
      FROM okr_resultados_clave kr
      LEFT JOIN okr_staff s ON kr.id_responsable = s.id_staff
      WHERE kr.id_objetivo = $1
      ORDER BY kr.fecha_creacion
    `, [id]);

    const objetivo = {
      ...objetivoResult.rows[0],
      keyResults: keyResultsResult.rows
    };

    res.json(objetivo);
  } catch (error) {
    console.error('❌ Error consultando objetivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Objetivos - Crear nuevo objetivo
app.post('/api/okr/objetivos', async (req, res) => {
  const { 
    titulo, 
    descripcion, 
    nivel, 
    id_responsable, 
    fecha_inicio, 
    fecha_fin, 
    estado, 
    id_objetivo_preexistente, 
    nivel_impacto 
  } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO okr_objetivos (
        titulo, descripcion, nivel, id_responsable, fecha_inicio, 
        fecha_fin, estado, id_objetivo_preexistente, nivel_impacto
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      titulo, descripcion, nivel, id_responsable, fecha_inicio, 
      fecha_fin, estado || 'Activo', id_objetivo_preexistente, nivel_impacto
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando objetivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Objetivos - Actualizar objetivo
app.put('/api/okr/objetivos/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    titulo, 
    descripcion, 
    nivel, 
    id_responsable, 
    fecha_inicio, 
    fecha_fin, 
    estado, 
    id_objetivo_preexistente, 
    nivel_impacto 
  } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE okr_objetivos SET
        titulo = $1,
        descripcion = $2,
        nivel = $3,
        id_responsable = $4,
        fecha_inicio = $5,
        fecha_fin = $6,
        estado = $7,
        id_objetivo_preexistente = $8,
        nivel_impacto = $9
      WHERE id_objetivo = $10
      RETURNING *
    `, [
      titulo, descripcion, nivel, id_responsable, fecha_inicio, 
      fecha_fin, estado, id_objetivo_preexistente, nivel_impacto, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando objetivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Objetivos - Eliminar objetivo
app.delete('/api/okr/objetivos/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar objetivo con ID: ${id}`);
  
  try {
    // Verificar si el objetivo existe
    const checkResult = await pool.query('SELECT id_objetivo FROM okr_objetivos WHERE id_objetivo = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Objetivo ${id} no encontrado`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Objetivo no encontrado' });
    }
    
    // Eliminar el objetivo (los key results se eliminarán en cascada por FK)
    await pool.query('DELETE FROM okr_objetivos WHERE id_objetivo = $1', [id]);
    console.log(`✅ Objetivo ${id} eliminado correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Objetivo eliminado correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar objetivo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Key Results - Obtener todos los key results de un objetivo
app.get('/api/okr/objetivos/:objetivoId/key-results', async (req, res) => {
  const { objetivoId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        kr.*,
        s.nombre as responsable_nombre
      FROM okr_resultados_clave kr
      LEFT JOIN okr_staff s ON kr.id_responsable = s.id_staff
      WHERE kr.id_objetivo = $1
      ORDER BY kr.fecha_creacion
    `, [objetivoId]);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando key results:', error);
    res.status(500).json({ error: error.message });
  }
});

// Key Results - Crear nuevo key result
app.post('/api/okr/key-results', async (req, res) => {
  const { 
    id_objetivo, 
    descripcion, 
    valor_objetivo, 
    unidad, 
    fecha_limite, 
    id_responsable 
  } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO okr_resultados_clave (
        id_objetivo, descripcion, valor_objetivo, unidad, fecha_limite, id_responsable
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id_objetivo, descripcion, valor_objetivo, unidad, fecha_limite, id_responsable]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando key result:', error);
    res.status(500).json({ error: error.message });
  }
});

// Key Results - Actualizar key result
app.put('/api/okr/key-results/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    descripcion, 
    valor_objetivo, 
    unidad, 
    fecha_limite, 
    id_responsable, 
    porcentaje_cumplimiento 
  } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE okr_resultados_clave SET
        descripcion = $1,
        valor_objetivo = $2,
        unidad = $3,
        fecha_limite = $4,
        id_responsable = $5,
        porcentaje_cumplimiento = $6,
        fecha_evaluacion = NOW()
      WHERE id_kr = $7
      RETURNING *
    `, [descripcion, valor_objetivo, unidad, fecha_limite, id_responsable, porcentaje_cumplimiento, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Key Result no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando key result:', error);
    res.status(500).json({ error: error.message });
  }
});

// Key Results - Eliminar key result
app.delete('/api/okr/key-results/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Intentando eliminar key result con ID: ${id}`);
  
  try {
    const checkResult = await pool.query('SELECT id_kr FROM okr_resultados_clave WHERE id_kr = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ Key Result ${id} no encontrado`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ message: 'Key Result no encontrado' });
    }
    
    await pool.query('DELETE FROM okr_resultados_clave WHERE id_kr = $1', [id]);
    console.log(`✅ Key Result ${id} eliminado correctamente`);
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Key Result eliminado correctamente' });
    
  } catch (error) {
    console.error('💥 Error al eliminar key result:', error);
    res.status(500).json({ message: error.message });
  }
});

// Registros de avance - Crear nuevo registro de progreso
app.post('/api/okr/key-results/:krId/progress', async (req, res) => {
  const { krId } = req.params;
  const { valor_actual } = req.body;
  
  try {
    // Obtener el valor objetivo para calcular el progreso
    const krResult = await pool.query('SELECT valor_objetivo FROM okr_resultados_clave WHERE id_kr = $1', [krId]);
    
    if (krResult.rows.length === 0) {
      return res.status(404).json({ error: 'Key Result no encontrado' });
    }
    
    const valorObjetivo = krResult.rows[0].valor_objetivo;
    const progresoCalculado = (valor_actual / valorObjetivo) * 100;
    
    // Insertar registro de avance
    const result = await pool.query(`
      INSERT INTO okr_registros_avance (id_kr, valor_actual, progreso_calculado)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [krId, valor_actual, progresoCalculado]);
    
    // Actualizar el porcentaje de cumplimiento del key result
    await pool.query(`
      UPDATE okr_resultados_clave 
      SET porcentaje_cumplimiento = $1, fecha_evaluacion = NOW()
      WHERE id_kr = $2
    `, [progresoCalculado, krId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando registro de avance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard OKR - Estadísticas generales
app.get('/api/okr/dashboard/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT o.id_objetivo) as total_objetivos,
        COUNT(DISTINCT kr.id_kr) as total_key_results,
        COUNT(DISTINCT o.id_responsable) as total_responsables,
        COALESCE(AVG(kr.porcentaje_cumplimiento), 0) as promedio_cumplimiento_general,
        COUNT(CASE WHEN o.estado = 'Activo' THEN 1 END) as objetivos_activos,
        COUNT(CASE WHEN o.estado = 'Completado' THEN 1 END) as objetivos_completados,
        COUNT(CASE WHEN kr.porcentaje_cumplimiento >= 100 THEN 1 END) as key_results_completados
      FROM okr_objetivos o
      LEFT JOIN okr_resultados_clave kr ON o.id_objetivo = kr.id_objetivo
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('❌ Error consultando estadísticas OKR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor y mostrar tablas disponibles
const PORT = 8081;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`🌐 Accesible desde: http://localhost:${PORT}`);
  console.log(`🌐 Accesible desde: http://100.94.177.68:${PORT}`);
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