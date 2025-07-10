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

// Ruta para resetear secuencia de facturas
app.post('/api/facturas/reset-sequence', async (req, res) => {
  try {
    console.log('🔧 Reseteando secuencia de facturas...');
    
    // Obtener el MAX ID actual
    const maxResult = await pool.query('SELECT MAX(id_factura) as max_id FROM adcot_facturas');
    const maxId = maxResult.rows[0].max_id || 0;
    
    console.log(`📊 MAX ID actual: ${maxId}`);
    
    // Resetear la secuencia al siguiente valor
    const nextId = maxId + 1;
    await pool.query(`SELECT setval('adcot_facturas_id_factura_seq', $1, false)`, [nextId]);
    
    console.log(`✅ Secuencia reseteada al ID ${nextId}`);
    
    res.json({ 
      message: `Secuencia reseteada correctamente. Próximo ID: ${nextId}`,
      maxId: maxId,
      nextId: nextId
    });
  } catch (error) {
    console.error('❌ Error reseteando secuencia:', error);
    res.status(500).json({ error: error.message });
  }
});

// Importar facturas desde Excel
app.post('/api/facturas/import', async (req, res) => {
  try {
    console.log('=== IMPORTACIÓN DE FACTURAS ===');
    console.log('Body recibido:', req.body);
    
    const { facturas } = req.body;
    
    if (!facturas || !Array.isArray(facturas) || facturas.length === 0) {
      console.log('Error: Array de facturas inválido');
      return res.status(400).json({ 
        message: 'Se requiere un array de facturas para importar' 
      });
    }

    console.log(`📥 Importando ${facturas.length} facturas...`);

    const resultados = {
      exitosas: [],
      errores: [],
      total: facturas.length
    };

    // Procesar cada factura individualmente
    for (let i = 0; i < facturas.length; i++) {
      const facturaData = facturas[i];
      
      try {
        // Validar campos requeridos
        const camposRequeridos = ['numero_factura', 'estatus_factura', 'fecha_radicado', 'subtotal_facturado_moneda'];
        const camposFaltantes = camposRequeridos.filter(campo => {
          const valor = facturaData[campo];
          return !valor || valor === null || valor === undefined || valor === '';
        });
        
        if (camposFaltantes.length > 0) {
          resultados.errores.push({
            fila: facturaData._rowIndex || i + 1,
            data: facturaData,
            error: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
          });
          continue;
        }

        // Limpiar campos que no deben ir a la BD (incluyendo id_factura que es auto-incremental)
        const { _rowIndex, id_factura, ...cleanData } = facturaData;
        
        // ASEGURAR que id_factura nunca esté presente (doble verificación)
        if ('id_factura' in cleanData) {
          delete cleanData.id_factura;
        }
        
        console.log('🔍 Datos originales:', facturaData);
        console.log('🧹 Datos después de limpiar:', cleanData);

        // Preparar datos para inserción
        const insertQuery = `
          INSERT INTO adcot_facturas (
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
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id_factura, numero_factura
        `;

        const valores = [
          cleanData.numero_factura,
          cleanData.estatus_factura,
          cleanData.id_contrato || null,
          cleanData.fecha_radicado,
          cleanData.fecha_estimada_pago || null,
          cleanData.id_moneda || null,
          cleanData.subtotal_facturado_moneda,
          cleanData.id_tax || null,
          cleanData.valor_tax || null,
          cleanData.observaciones_factura || null
        ];

        console.log('🔍 Datos limpios para insertar:', cleanData);
        console.log('🔍 Valores para query:', valores);

        const result = await pool.query(insertQuery, valores);
        const nuevaFactura = result.rows[0];

        resultados.exitosas.push({
          fila: facturaData._rowIndex || i + 1,
          id: nuevaFactura.id_factura,
          numero_factura: nuevaFactura.numero_factura
        });
        
        console.log(`✅ Factura ${nuevaFactura.numero_factura} importada exitosamente`);
        
             } catch (error) {
         console.error(`❌ ERROR DETALLADO en fila ${i + 1}:`);
         console.error('- Mensaje:', error.message);
         console.error('- Código:', error.code);
         console.error('- Detalle:', error.detail);
         console.error('- Constraint:', error.constraint);
         console.error('- Columna:', error.column);
         console.error('- Tabla:', error.table);
         console.error('- Error completo:', error);
         console.error('- Datos que causaron el error:', facturaData);
         if (typeof valores !== 'undefined') {
           console.error('- Valores que se intentaron insertar:', valores);
         }
         
         let mensajeError = error.message;
         
         // Manejar errores específicos de PostgreSQL
         if (error.code === '23505') { // Unique violation
           mensajeError = `Número de factura duplicado: ${facturaData.numero_factura}`;
         } else if (error.code === '23502') { // Not null violation
           mensajeError = `Campo requerido faltante: ${error.column || 'desconocido'}`;
         } else if (error.code === '23503') { // Foreign key violation
           mensajeError = `Referencia inválida: ${error.detail || error.message}`;
         } else if (error.code === '42P01') { // Undefined table
           mensajeError = `Tabla no existe: ${error.message}`;
         } else if (error.code === '42703') { // Undefined column
           mensajeError = `Columna no existe: ${error.message}`;
         }
         
         resultados.errores.push({
           fila: facturaData._rowIndex || i + 1,
           data: facturaData,
           error: mensajeError,
           errorCode: error.code,
           errorDetail: error.detail
         });
       }
    }

    // Respuesta con resultados
    const response = {
      message: `Importación completada: ${resultados.exitosas.length} exitosas, ${resultados.errores.length} errores`,
      resultados
    };

    console.log(`📊 Resultado final: ${resultados.exitosas.length}/${resultados.total} exitosas`);

    // Si hay errores, retornar código 207 (Multi-Status)
    if (resultados.errores.length > 0) {
      res.status(207).json(response);
    } else {
      res.status(201).json(response);
    }

  } catch (error) {
    console.error('💥 Error en importación masiva:', error);
    res.status(500).json({ 
      message: 'Error interno en la importación',
      error: error.message 
    });
  }
});

// Importar transacciones desde Excel
app.post('/api/transacciones/import', async (req, res) => {
  try {
    console.log('=== IMPORTACIÓN DE TRANSACCIONES ===');
    console.log('Body recibido:', req.body);
    
    const { transacciones } = req.body;
    
    if (!transacciones || !Array.isArray(transacciones) || transacciones.length === 0) {
      console.log('Error: Array de transacciones inválido');
      return res.status(400).json({ 
        message: 'Se requiere un array de transacciones para importar' 
      });
    }

    console.log(`📥 Importando ${transacciones.length} transacciones...`);

    const resultados = {
      exitosas: [],
      errores: [],
      total: transacciones.length
    };

    // Procesar cada transacción individualmente
    for (let i = 0; i < transacciones.length; i++) {
      const transaccionData = transacciones[i];
      
      try {
        // Validar campos requeridos
        const camposRequeridos = ['titulo_transaccion', 'valor_total_transaccion', 'fecha_transaccion'];
        const camposFaltantes = camposRequeridos.filter(campo => {
          const valor = transaccionData[campo];
          return !valor || valor === null || valor === undefined || valor === '';
        });
        
        if (camposFaltantes.length > 0) {
          resultados.errores.push({
            fila: transaccionData._rowIndex || i + 1,
            data: transaccionData,
            error: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
          });
          continue;
        }

        // Limpiar campos que no deben ir a la BD (incluyendo id_transaccion que es auto-incremental)
        const { _rowIndex, id_transaccion, ...cleanData } = transaccionData;
        
        // ASEGURAR que id_transaccion nunca esté presente
        if ('id_transaccion' in cleanData) {
          delete cleanData.id_transaccion;
        }
        
        console.log('🔍 Datos originales:', transaccionData);
        console.log('🧹 Datos después de limpiar:', cleanData);

        // Preparar datos para inserción
        const insertQuery = `
          INSERT INTO adcot_transacciones (
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
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id_transaccion, titulo_transaccion
        `;

        const valores = [
          cleanData.id_cuenta || null,
          cleanData.id_tipotransaccion || null,
          cleanData.fecha_transaccion,
          cleanData.titulo_transaccion,
          cleanData.id_moneda_transaccion || null,
          cleanData.valor_total_transaccion,
          cleanData.trm_moneda_base || 1.0,
          cleanData.observacion || null,
          cleanData.url_soporte_adjunto || null,
          cleanData.registro_auxiliar || false,
          cleanData.registro_validado || false,
          cleanData.id_etiqueta_contable || null,
          cleanData.id_tercero || null,
          cleanData.id_cuenta_destino_transf || null,
          cleanData.aplica_retencion || false,
          cleanData.aplica_impuestos || false,
          cleanData.id_concepto || null
        ];

        console.log('🔍 Datos limpios para insertar:', cleanData);
        console.log('🔍 Valores para query:', valores);

        const result = await pool.query(insertQuery, valores);
        const nuevaTransaccion = result.rows[0];

        resultados.exitosas.push({
          fila: transaccionData._rowIndex || i + 1,
          id: nuevaTransaccion.id_transaccion,
          titulo_transaccion: nuevaTransaccion.titulo_transaccion
        });
        
        console.log(`✅ Transacción "${nuevaTransaccion.titulo_transaccion}" importada exitosamente`);
        
      } catch (error) {
        console.error(`❌ ERROR DETALLADO en fila ${i + 1}:`);
        console.error('- Mensaje:', error.message);
        console.error('- Código:', error.code);
        console.error('- Detalle:', error.detail);
        console.error('- Constraint:', error.constraint);
        console.error('- Columna:', error.column);
        console.error('- Tabla:', error.table);
        console.error('- Error completo:', error);
        console.error('- Datos que causaron el error:', transaccionData);
        if (typeof valores !== 'undefined') {
          console.error('- Valores que se intentaron insertar:', valores);
        }
        
        let mensajeError = error.message;
        
        // Manejar errores específicos de PostgreSQL
        if (error.code === '23505') { // Unique violation
          mensajeError = `Transacción duplicada: ${transaccionData.titulo_transaccion}`;
        } else if (error.code === '23502') { // Not null violation
          mensajeError = `Campo requerido faltante: ${error.column || 'desconocido'}`;
        } else if (error.code === '23503') { // Foreign key violation
          mensajeError = `Referencia inválida: ${error.detail || error.message}`;
        } else if (error.code === '42P01') { // Undefined table
          mensajeError = `Tabla no existe: ${error.message}`;
        } else if (error.code === '42703') { // Undefined column
          mensajeError = `Columna no existe: ${error.message}`;
        }
        
        resultados.errores.push({
          fila: transaccionData._rowIndex || i + 1,
          data: transaccionData,
          error: mensajeError,
          errorCode: error.code,
          errorDetail: error.detail
        });
      }
    }

    // Respuesta con resultados
    const response = {
      message: `Importación completada: ${resultados.exitosas.length} exitosas, ${resultados.errores.length} errores`,
      resultados
    };

    console.log(`📊 Resultado final: ${resultados.exitosas.length}/${resultados.total} exitosas`);

    // Si hay errores, retornar código 207 (Multi-Status)
    if (resultados.errores.length > 0) {
      res.status(207).json(response);
    } else {
      res.status(201).json(response);
    }

  } catch (error) {
    console.error('💥 Error en importación masiva de transacciones:', error);
    res.status(500).json({ 
      message: 'Error interno en la importación de transacciones',
      error: error.message 
    });
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

// Países
app.get('/api/catalogos/paises', async (req, res) => {
  console.log('🔍 Consultando países...');
  try {
    const result = await pool.query(`
      SELECT 
        id_pais as id,
        pais as nombre,
        codigo_pais,
        moneda_oficial,
        id_moneda_oficial
      FROM crm_paises 
      WHERE id_pais IS NOT NULL 
      ORDER BY pais
    `);
    console.log(`✅ ${result.rows.length} países encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando países:', error);
    res.status(500).json({ error: error.message });
  }
});

// Industrias
app.get('/api/catalogos/industrias', async (req, res) => {
  console.log('🔍 Consultando industrias...');
  try {
    const result = await pool.query(`
      SELECT 
        id_industria as id,
        nombre_industria as nombre,
        descripcion
      FROM crm_industrias 
      WHERE id_industria IS NOT NULL 
      ORDER BY nombre_industria
    `);
    console.log(`✅ ${result.rows.length} industrias encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando industrias:', error);
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
  console.log('🔄 BACKEND - PUT /api/transacciones/:id llamado');
  console.log('🆔 BACKEND - ID recibido:', id);
  console.log('📋 BACKEND - Body completo recibido:', JSON.stringify(req.body, null, 2));
  
  try {
    // Obtener la transacción actual para preservar valores existentes
    const currentResult = await pool.query('SELECT * FROM adcot_transacciones WHERE id_transaccion = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      console.log('❌ BACKEND - Transacción no encontrada con ID:', id);
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    const currentTransaction = currentResult.rows[0];
    console.log('📋 BACKEND - Transacción actual:', Object.keys(currentTransaction));
    
    // Crear objeto con valores actuales + valores nuevos (solo los que se enviaron)
    const updatedTransaction = {
      ...currentTransaction,
      ...req.body  // Solo sobrescribir los campos que se enviaron
    };
    
    console.log('📝 BACKEND - Campos a actualizar:', Object.keys(req.body));
    console.log('📝 BACKEND - Valores finales para UPDATE:', {
      titulo_transaccion: updatedTransaction.titulo_transaccion,
      valor_total_transaccion: updatedTransaction.valor_total_transaccion,
      id_tipotransaccion: updatedTransaction.id_tipotransaccion,
      registro_validado: updatedTransaction.registro_validado
    });
    
    console.log('💾 BACKEND - Ejecutando query UPDATE...');
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
      updatedTransaction.id_cuenta,
      updatedTransaction.id_tipotransaccion,
      updatedTransaction.fecha_transaccion,
      updatedTransaction.titulo_transaccion,
      updatedTransaction.id_moneda_transaccion,
      updatedTransaction.valor_total_transaccion,
      updatedTransaction.trm_moneda_base,
      updatedTransaction.observacion,
      updatedTransaction.url_soporte_adjunto,
      updatedTransaction.registro_auxiliar,
      updatedTransaction.registro_validado,
      updatedTransaction.id_etiqueta_contable,
      updatedTransaction.id_tercero,
      updatedTransaction.id_cuenta_destino_transf,
      updatedTransaction.aplica_retencion,
      updatedTransaction.aplica_impuestos,
      updatedTransaction.id_concepto,
      id
    ]);
    
    console.log('📊 BACKEND - Resultado del query:', {
      rowCount: result.rowCount,
      rows: result.rows.length,
      firstRow: result.rows[0] ? Object.keys(result.rows[0]) : 'No hay filas'
    });
    
    console.log('✅ BACKEND - Transacción actualizada exitosamente');
    console.log('📤 BACKEND - Enviando respuesta:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ BACKEND - Error actualizando transacción:', error);
    console.error('❌ BACKEND - Error completo:', error.stack);
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

// ===== RELACIONES MÚLTIPLES OKR =====

// Crear relación entre objetivos (OKR → múltiples OKRs)
app.post('/api/okr/relaciones-objetivos', async (req, res) => {
  const { 
    id_objetivo_origen, 
    id_objetivo_destino, 
    tipo_relacion, 
    peso_relacion, 
    descripcion_relacion 
  } = req.body;

  try {
    console.log('🔗 Creando relación entre objetivos:', { id_objetivo_origen, id_objetivo_destino, tipo_relacion });

    // Validaciones
    if (!id_objetivo_origen || !id_objetivo_destino) {
      return res.status(400).json({ 
        error: 'Los IDs de objetivo origen y destino son obligatorios' 
      });
    }

    if (id_objetivo_origen === id_objetivo_destino) {
      return res.status(400).json({ 
        error: 'Un objetivo no puede relacionarse consigo mismo' 
      });
    }

    // Verificar que ambos objetivos existan
    const objetivoOrigen = await pool.query(
      'SELECT id_objetivo FROM okr_objetivos WHERE id_objetivo = $1',
      [id_objetivo_origen]
    );

    const objetivoDestino = await pool.query(
      'SELECT id_objetivo FROM okr_objetivos WHERE id_objetivo = $1',
      [id_objetivo_destino]
    );

    if (objetivoOrigen.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo origen no encontrado' });
    }

    if (objetivoDestino.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo destino no encontrado' });
    }

    // Verificar si la relación ya existe
    const relacionExistente = await pool.query(
      'SELECT id_relacion FROM okr_relaciones_objetivos WHERE id_objetivo_origen = $1 AND id_objetivo_destino = $2 AND tipo_relacion = $3',
      [id_objetivo_origen, id_objetivo_destino, tipo_relacion || 'contribuye_a']
    );

    if (relacionExistente.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Esta relación ya existe entre estos objetivos' 
      });
    }

    // Insertar la relación
    const result = await pool.query(
      `INSERT INTO okr_relaciones_objetivos 
       (id_objetivo_origen, id_objetivo_destino, tipo_relacion, peso_relacion, descripcion_relacion) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        id_objetivo_origen,
        id_objetivo_destino,
        tipo_relacion || 'contribuye_a',
        peso_relacion || 1.0,
        descripcion_relacion || null
      ]
    );

    // Obtener la relación creada con información adicional
    const relacionCreada = await pool.query(
      `SELECT 
        r.*,
        o1.titulo as titulo_origen,
        o2.titulo as titulo_destino
       FROM okr_relaciones_objetivos r
       JOIN okr_objetivos o1 ON r.id_objetivo_origen = o1.id_objetivo
       JOIN okr_objetivos o2 ON r.id_objetivo_destino = o2.id_objetivo
       WHERE r.id_relacion = $1`,
      [result.rows[0].id_relacion]
    );

    console.log('✅ Relación entre objetivos creada exitosamente');
    res.status(201).json({
      success: true,
      message: 'Relación entre objetivos creada exitosamente',
      relacion: relacionCreada.rows[0]
    });

  } catch (error) {
    console.error('💥 Error creando relación entre objetivos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al crear la relación',
      details: error.message 
    });
  }
});

// Crear relación entre objetivo y Key Result (OKR → múltiples KRs)
app.post('/api/okr/relaciones-kr', async (req, res) => {
  const { 
    id_objetivo, 
    id_kr, 
    tipo_relacion, 
    peso_contribucion, 
    porcentaje_impacto, 
    descripcion_relacion 
  } = req.body;

  try {
    console.log('🔗 Creando relación objetivo-KR:', { id_objetivo, id_kr, tipo_relacion });

    // Validaciones
    if (!id_objetivo || !id_kr) {
      return res.status(400).json({ 
        error: 'Los IDs de objetivo y Key Result son obligatorios' 
      });
    }

    // Verificar que el objetivo exista
    const objetivo = await pool.query(
      'SELECT id_objetivo FROM okr_objetivos WHERE id_objetivo = $1',
      [id_objetivo]
    );

    if (objetivo.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo no encontrado' });
    }

    // Verificar que el Key Result exista
    const keyResult = await pool.query(
      'SELECT id_kr FROM okr_resultados_clave WHERE id_kr = $1',
      [id_kr]
    );

    if (keyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Key Result no encontrado' });
    }

    // Verificar si la relación ya existe
    const relacionExistente = await pool.query(
      'SELECT id_relacion FROM okr_relaciones_kr WHERE id_objetivo = $1 AND id_kr = $2 AND tipo_relacion = $3',
      [id_objetivo, id_kr, tipo_relacion || 'contribuye_a']
    );

    if (relacionExistente.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Esta relación ya existe entre este objetivo y Key Result' 
      });
    }

    // Validar porcentaje si se proporciona
    if (porcentaje_impacto !== null && porcentaje_impacto !== undefined) {
      if (porcentaje_impacto < 1 || porcentaje_impacto > 100) {
        return res.status(400).json({ 
          error: 'El porcentaje de impacto debe estar entre 1 y 100' 
        });
      }
    }

    // Insertar la relación
    const result = await pool.query(
      `INSERT INTO okr_relaciones_kr 
       (id_objetivo, id_kr, tipo_relacion, peso_contribucion, porcentaje_impacto, descripcion_relacion) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id_objetivo,
        id_kr,
        tipo_relacion || 'contribuye_a',
        peso_contribucion || 1.0,
        porcentaje_impacto || null,
        descripcion_relacion || null
      ]
    );

    // Obtener la relación creada con información adicional
    const relacionCreada = await pool.query(
      `SELECT 
        r.*,
        o.titulo as titulo_objetivo,
        kr.descripcion as descripcion_kr
       FROM okr_relaciones_kr r
       JOIN okr_objetivos o ON r.id_objetivo = o.id_objetivo
       JOIN okr_resultados_clave kr ON r.id_kr = kr.id_kr
       WHERE r.id_relacion = $1`,
      [result.rows[0].id_relacion]
    );

    console.log('✅ Relación objetivo-KR creada exitosamente');
    res.status(201).json({
      success: true,
      message: 'Relación entre objetivo y Key Result creada exitosamente',
      relacion: relacionCreada.rows[0]
    });

  } catch (error) {
    console.error('💥 Error creando relación objetivo-KR:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al crear la relación',
      details: error.message 
    });
  }
});

// Obtener relaciones de un objetivo específico
app.get('/api/okr/objetivos/:id/relaciones', async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`📋 Obteniendo relaciones del objetivo ${id}`);

    // Obtener relaciones con otros objetivos (como origen)
    const relacionesObjetivos = await pool.query(
      `SELECT 
        r.*,
        o.titulo as titulo_destino,
        o.nivel as nivel_destino,
        o.estado as estado_destino
       FROM okr_relaciones_objetivos r
       JOIN okr_objetivos o ON r.id_objetivo_destino = o.id_objetivo
       WHERE r.id_objetivo_origen = $1 AND r.activo = true
       ORDER BY r.peso_relacion DESC, r.fecha_creacion ASC`,
      [id]
    );

    // Obtener relaciones con Key Results
    const relacionesKRs = await pool.query(
      `SELECT 
        r.*,
        kr.descripcion as descripcion_kr,
        kr.valor_objetivo,
        kr.unidad,
        o_padre.titulo as titulo_objetivo_padre
       FROM okr_relaciones_kr r
       JOIN okr_resultados_clave kr ON r.id_kr = kr.id_kr
       JOIN okr_objetivos o_padre ON kr.id_objetivo = o_padre.id_objetivo
       WHERE r.id_objetivo = $1 AND r.activo = true
       ORDER BY r.peso_contribucion DESC, r.fecha_creacion ASC`,
      [id]
    );

    console.log(`✅ Encontradas ${relacionesObjetivos.rows.length} relaciones con objetivos y ${relacionesKRs.rows.length} relaciones con KRs`);

    res.json({
      success: true,
      relacionesObjetivos: relacionesObjetivos.rows,
      relacionesKRs: relacionesKRs.rows,
      total: relacionesObjetivos.rows.length + relacionesKRs.rows.length
    });

  } catch (error) {
    console.error('💥 Error obteniendo relaciones del objetivo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener las relaciones',
      details: error.message 
    });
  }
});

// Obtener jerarquía completa OKR usando las nuevas tablas de relaciones
app.get('/api/okr/jerarquia', async (req, res) => {
  try {
    console.log('🌳 Obteniendo jerarquía completa OKR con nuevas relaciones...');

    // Primero verificar la estructura de las tablas
    console.log('🔍 Verificando estructura de tablas...');

    // Obtener todos los objetivos con información del staff
    const objetivos = await pool.query(`
      SELECT 
        o.*,
        s.nombre as responsable_nombre
      FROM okr_objetivos o
      LEFT JOIN okr_staff s ON o.id_responsable = s.id_staff
      ORDER BY o.id_objetivo
    `);

    // Obtener todas las relaciones entre objetivos usando la estructura real
    const relacionesObjetivos = await pool.query(`
      SELECT 
        r.id_relacion,
        r.id_objetivo_origen,
        r.id_objetivo_destino,
        r.tipo_relacion,
        r.peso_relacion,
        r.descripcion_relacion,
        r.fecha_creacion,
        r.fecha_modificacion,
        r.activo,
        o_origen.titulo as titulo_origen,
        o_origen.nivel as nivel_origen,
        o_destino.titulo as titulo_destino,
        o_destino.nivel as nivel_destino
      FROM okr_relaciones_objetivos r
      JOIN okr_objetivos o_origen ON r.id_objetivo_origen = o_origen.id_objetivo
      JOIN okr_objetivos o_destino ON r.id_objetivo_destino = o_destino.id_objetivo
      WHERE r.activo = true
      ORDER BY r.peso_relacion DESC
    `);

    // Obtener todas las relaciones con Key Results usando la estructura real
    const relacionesKRs = await pool.query(`
      SELECT 
        r.id_relacion,
        r.id_objetivo,
        r.id_kr,
        r.tipo_relacion,
        r.peso_contribucion,
        r.porcentaje_impacto,
        r.descripcion_relacion,
        r.fecha_creacion,
        r.fecha_modificacion,
        r.activo,
        o.titulo as titulo_objetivo,
        o.nivel as nivel_objetivo,
        kr.descripcion as descripcion_kr,
        kr.valor_objetivo,
        kr.unidad,
        kr.porcentaje_cumplimiento,
        o_padre.titulo as titulo_objetivo_kr_padre
      FROM okr_relaciones_kr r
      JOIN okr_objetivos o ON r.id_objetivo = o.id_objetivo
      JOIN okr_resultados_clave kr ON r.id_kr = kr.id_kr
      JOIN okr_objetivos o_padre ON kr.id_objetivo = o_padre.id_objetivo
      WHERE r.activo = true
      ORDER BY r.peso_contribucion DESC
    `);

    // Obtener todos los Key Results para información adicional
    const keyResults = await pool.query(`
      SELECT 
        kr.*,
        o.titulo as titulo_objetivo_padre,
        s.nombre as responsable_nombre
      FROM okr_resultados_clave kr
      JOIN okr_objetivos o ON kr.id_objetivo = o.id_objetivo
      LEFT JOIN okr_staff s ON kr.id_responsable = s.id_staff
      ORDER BY kr.id_kr
    `);

    console.log(`✅ Jerarquía obtenida: ${objetivos.rows.length} objetivos, ${relacionesObjetivos.rows.length} relaciones OKR-OKR, ${relacionesKRs.rows.length} relaciones OKR-KR`);

    res.json({
      success: true,
      objetivos: objetivos.rows,
      relacionesObjetivos: relacionesObjetivos.rows,
      relacionesKRs: relacionesKRs.rows,
      keyResults: keyResults.rows,
      resumen: {
        total_objetivos: objetivos.rows.length,
        total_relaciones_objetivos: relacionesObjetivos.rows.length,
        total_relaciones_krs: relacionesKRs.rows.length,
        total_key_results: keyResults.rows.length
      }
    });

  } catch (error) {
    console.error('💥 Error obteniendo jerarquía OKR:', error);
    console.error('📋 Detalles completos del error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener la jerarquía',
      details: error.message 
    });
  }
});

// ===== RUTAS CRM =====

// 🎯 MERCADOS CRM
app.get('/api/crm/mercados', async (req, res) => {
  try {
    console.log('🔍 Obteniendo mercados CRM...');
    const result = await pool.query('SELECT * FROM crm_mercados ORDER BY segmento_mercado ASC');
    console.log(`✅ Encontrados ${result.rows.length} mercados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener mercados:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/crm/mercados/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM crm_mercados WHERE id_mercado = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mercado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener mercado:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/crm/mercados', async (req, res) => {
  try {
    console.log('📝 Creando mercado:', req.body);
    const { segmento_mercado, id_pais, id_industria, resumen_mercado, recomendaciones, url_reporte_mercado, observaciones } = req.body;
    
    if (!segmento_mercado) {
      return res.status(400).json({ message: 'El campo segmento_mercado es requerido' });
    }
    
    const result = await pool.query(
      `INSERT INTO crm_mercados (segmento_mercado, id_pais, id_industria, resumen_mercado, recomendaciones, url_reporte_mercado, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [segmento_mercado, id_pais, id_industria, resumen_mercado, recomendaciones, url_reporte_mercado, observaciones]
    );
    console.log('✅ Mercado creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear mercado:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/crm/mercados/:id', async (req, res) => {
  try {
    console.log('🔄 Actualizando mercado:', req.params.id, req.body);
    const { segmento_mercado, id_pais, id_industria, resumen_mercado, recomendaciones, url_reporte_mercado, observaciones } = req.body;
    
    const result = await pool.query(
      `UPDATE crm_mercados SET 
       segmento_mercado = $1, id_pais = $2, id_industria = $3, resumen_mercado = $4, 
       recomendaciones = $5, url_reporte_mercado = $6, observaciones = $7
       WHERE id_mercado = $8 RETURNING *`,
      [segmento_mercado, id_pais, id_industria, resumen_mercado, recomendaciones, url_reporte_mercado, observaciones, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mercado no encontrado' });
    }
    
    console.log('✅ Mercado actualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar mercado:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/crm/mercados/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando mercado:', req.params.id);
    const result = await pool.query('DELETE FROM crm_mercados WHERE id_mercado = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mercado no encontrado' });
    }
    
    console.log('✅ Mercado eliminado');
    res.json({ message: 'Mercado eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar mercado:', error);
    res.status(500).json({ message: error.message });
  }
});

// 👤 BUYER PERSONAS CRM - PENDIENTE ESTRUCTURA
// TODO: Necesito la estructura de la tabla crm_buyer_persona para implementar correctamente
app.get('/api/crm/buyer-personas', async (req, res) => {
  try {
    console.log('🔍 Obteniendo buyer personas...');
    const result = await pool.query('SELECT * FROM crm_buyer_persona ORDER BY id_buyer ASC');
    console.log(`✅ Encontradas ${result.rows.length} buyer personas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener buyer personas:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/crm/buyer-personas/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM crm_buyer_persona WHERE id_buyer = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Buyer persona no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener buyer persona:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/crm/buyer-personas', async (req, res) => {
  try {
    console.log('📝 Creando buyer persona - ENDPOINT PENDIENTE DE IMPLEMENTAR');
    res.status(501).json({ message: 'Endpoint pendiente - necesito estructura de crm_buyer_persona' });
  } catch (error) {
    console.error('❌ Error al crear buyer persona:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/crm/buyer-personas/:id', async (req, res) => {
  try {
    console.log('🔄 Actualizando buyer persona - ENDPOINT PENDIENTE DE IMPLEMENTAR');
    res.status(501).json({ message: 'Endpoint pendiente - necesito estructura de crm_buyer_persona' });
  } catch (error) {
    console.error('❌ Error al actualizar buyer persona:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/crm/buyer-personas/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando buyer persona - ENDPOINT PENDIENTE DE IMPLEMENTAR');
    res.status(501).json({ message: 'Endpoint pendiente - necesito estructura de crm_buyer_persona' });
  } catch (error) {
    console.error('❌ Error al eliminar buyer persona:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🏢 EMPRESAS CRM  
app.get('/api/crm/empresas', async (req, res) => {
  try {
    console.log('🔍 Obteniendo empresas CRM...');
    const result = await pool.query(`
      SELECT 
        e.*,
        m.segmento_mercado,
        m.resumen_mercado
      FROM crm_empresas e
      LEFT JOIN crm_mercados m ON e.id_mercado = m.id_mercado
      ORDER BY e.empresa ASC
    `);
    
    // Transformar para compatibilidad con frontend
    const empresas = result.rows.map(row => ({
      id: row.id_empresa, // Mapear para DataTable
      ...row,
      mercado: row.segmento_mercado ? {
        segmento_mercado: row.segmento_mercado,
        resumen_mercado: row.resumen_mercado
      } : null
    }));
    
    console.log(`✅ Encontradas ${empresas.length} empresas`);
    res.json(empresas);
  } catch (error) {
    console.error('❌ Error al obtener empresas:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/crm/empresas/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        m.segmento_mercado,
        m.resumen_mercado
      FROM crm_empresas e
      LEFT JOIN crm_mercados m ON e.id_mercado = m.id_mercado
      WHERE e.id_empresa = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }
    
    const row = result.rows[0];
    const empresa = {
      id: row.id_empresa,
      ...row,
      mercado: row.segmento_mercado ? {
        segmento_mercado: row.segmento_mercado,
        resumen_mercado: row.resumen_mercado
      } : null
    };
    
    res.json(empresa);
  } catch (error) {
    console.error('❌ Error al obtener empresa:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/crm/empresas', async (req, res) => {
  try {
    console.log('📝 Creando empresa:', req.body);
    const { empresa, id_mercado, id_pais, tamano_empleados, website, linkedin, observaciones } = req.body;
    
    if (!empresa) {
      return res.status(400).json({ message: 'El campo empresa es requerido' });
    }
    
    const result = await pool.query(
      `INSERT INTO crm_empresas (empresa, id_mercado, id_pais, tamano_empleados, website, linkedin, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [empresa, id_mercado, id_pais, tamano_empleados, website, linkedin, observaciones]
    );
    
    console.log('✅ Empresa creada:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear empresa:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/crm/empresas/:id', async (req, res) => {
  try {
    console.log('🔄 Actualizando empresa:', req.params.id);
    const { empresa, id_mercado, id_pais, tamano_empleados, website, linkedin, observaciones } = req.body;
    
    const result = await pool.query(
      `UPDATE crm_empresas SET 
       empresa = $1, id_mercado = $2, id_pais = $3, tamano_empleados = $4,
       website = $5, linkedin = $6, observaciones = $7
       WHERE id_empresa = $8 RETURNING *`,
      [empresa, id_mercado, id_pais, tamano_empleados, website, linkedin, observaciones, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }
    
    console.log('✅ Empresa actualizada');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar empresa:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/crm/empresas/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando empresa:', req.params.id);
    const result = await pool.query('DELETE FROM crm_empresas WHERE id_empresa = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }
    
    console.log('✅ Empresa eliminada');
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar empresa:', error);
    res.status(500).json({ message: error.message });
  }
});

// 👥 CONTACTOS CRM
app.get('/api/crm/contactos', async (req, res) => {
  try {
    console.log('🔍 Obteniendo contactos CRM...');
    const result = await pool.query(`
      SELECT 
        c.*,
        e.empresa as empresa_nombre,
        CONCAT(c.nombre_primero, ' ', c.apellido_primero) as nombre_completo
      FROM crm_personas_interes c
      LEFT JOIN crm_empresas e ON c.id_empresa = e.id_empresa
      ORDER BY c.nombre_primero ASC
    `);
    
    // Transformar para compatibilidad con frontend
    const contactos = result.rows.map(row => ({
      id: row.id_persona, // Mapear para DataTable
      ...row,
      empresa: row.empresa_nombre ? { empresa: row.empresa_nombre } : null
    }));
    
    console.log(`✅ Encontrados ${contactos.length} contactos`);
    res.json(contactos);
  } catch (error) {
    console.error('❌ Error al obtener contactos:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/crm/contactos/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        e.empresa as empresa_nombre,
        CONCAT(c.nombre_primero, ' ', c.apellido_primero) as nombre_completo
      FROM crm_personas_interes c
      LEFT JOIN crm_empresas e ON c.id_empresa = e.id_empresa
      WHERE c.id_persona = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }
    
    const row = result.rows[0];
    const contacto = {
      id: row.id_persona,
      ...row,
      empresa: row.empresa_nombre ? { empresa: row.empresa_nombre } : null
    };
    
    res.json(contacto);
  } catch (error) {
    console.error('❌ Error al obtener contacto:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/crm/contactos', async (req, res) => {
  try {
    console.log('📝 Creando contacto:', req.body);
    const {
      nombre_primero, nombre_segundo, apellido_primero, apellido_segundo,
      id_empresa, cargo, correo_corporativo, correo_personal, telefono, rol, id_buyer
    } = req.body;
    
    if (!nombre_primero || !apellido_primero) {
      return res.status(400).json({ message: 'Los campos nombre_primero y apellido_primero son requeridos' });
    }
    
    const result = await pool.query(
      `INSERT INTO crm_personas_interes (
        nombre_primero, nombre_segundo, apellido_primero, apellido_segundo,
        id_empresa, cargo, correo_corporativo, correo_personal, telefono, rol, id_buyer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [nombre_primero, nombre_segundo, apellido_primero, apellido_segundo,
       id_empresa, cargo, correo_corporativo, correo_personal, telefono, rol, id_buyer]
    );
    
    console.log('✅ Contacto creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear contacto:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/crm/contactos/:id', async (req, res) => {
  try {
    console.log('🔄 Actualizando contacto:', req.params.id);
    const {
      nombre_primero, nombre_segundo, apellido_primero, apellido_segundo,
      id_empresa, cargo, correo_corporativo, correo_personal, telefono, rol, id_buyer
    } = req.body;
    
    const result = await pool.query(
      `UPDATE crm_personas_interes SET 
       nombre_primero = $1, nombre_segundo = $2, apellido_primero = $3, apellido_segundo = $4,
       id_empresa = $5, cargo = $6, correo_corporativo = $7, correo_personal = $8,
       telefono = $9, rol = $10, id_buyer = $11
       WHERE id_persona = $12 RETURNING *`,
      [nombre_primero, nombre_segundo, apellido_primero, apellido_segundo,
       id_empresa, cargo, correo_corporativo, correo_personal, telefono, rol, id_buyer, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }
    
    console.log('✅ Contacto actualizado');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar contacto:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/crm/contactos/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando contacto:', req.params.id);
    const result = await pool.query('DELETE FROM crm_personas_interes WHERE id_persona = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }
    
    console.log('✅ Contacto eliminado');
    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar contacto:', error);
    res.status(500).json({ message: error.message });
  }
});

// Iniciar servidor y mostrar tablas disponibles
const PORT = 8081;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`🌐 Accesible desde: http://localhost:${PORT}`);
  console.log(`🌐 Accesible desde cualquier IP de la red en puerto ${PORT}`);
  console.log(`📋 Rutas CRM disponibles:`);
  console.log(`   GET    /api/crm/mercados`);
  console.log(`   GET    /api/crm/buyer-personas`); 
  console.log(`   GET    /api/crm/empresas`);
  console.log(`   GET    /api/crm/contactos`);
}); 