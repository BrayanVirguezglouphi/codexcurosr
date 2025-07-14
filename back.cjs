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

// Ruta para resetear secuencia de contratos
app.post('/api/contratos/reset-sequence', async (req, res) => {
  try {
    console.log('🔧 Reseteando secuencia de contratos...');
    
    // Obtener el MAX ID actual
    const maxResult = await pool.query('SELECT MAX(id_contrato) as max_id FROM adcot_contratos_clientes');
    const maxId = maxResult.rows[0].max_id || 0;
    
    console.log(`📊 MAX ID actual de contratos: ${maxId}`);
    
    // Resetear la secuencia al siguiente valor
    const nextId = maxId + 1;
    await pool.query(`SELECT setval('adcot_contratos_clientes_id_contrato_seq', $1, false)`, [nextId]);
    
    console.log(`✅ Secuencia de contratos reseteada al ID ${nextId}`);
    
    res.json({ 
      message: `Secuencia de contratos reseteada correctamente. Próximo ID: ${nextId}`,
      maxId: maxId,
      nextId: nextId
    });
  } catch (error) {
    console.error('❌ Error reseteando secuencia de contratos:', error);
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

// Crear un nuevo contrato
app.post('/api/contratos', async (req, res) => {
  try {
    console.log('📝 Creando nuevo contrato:', req.body);
    
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
    
    // Validar campos obligatorios
    const camposRequeridos = [];
    if (!numero_contrato_os || numero_contrato_os.trim() === '') {
      camposRequeridos.push('numero_contrato_os');
    }
    if (!id_tercero) {
      camposRequeridos.push('id_tercero (Cliente/Tercero)');
    }
    if (!fecha_contrato) {
      camposRequeridos.push('fecha_contrato');
    }
    
    if (camposRequeridos.length > 0) {
      return res.status(400).json({ 
        error: `Los siguientes campos son obligatorios: ${camposRequeridos.join(', ')}` 
      });
    }
    
    // Preparar datos con valores por defecto seguros para evitar errores NOT NULL
    const safeData = {
      numero_contrato_os: numero_contrato_os.trim(),
      id_tercero: parseInt(id_tercero),
      descripcion_servicio_contratado: descripcion_servicio_contratado || '',
      estatus_contrato: estatus_contrato || 'ACTIVO',
      fecha_contrato: fecha_contrato,
      fecha_inicio_servicio: fecha_inicio_servicio || null,
      fecha_final_servicio: fecha_final_servicio || null,
      id_moneda_cotizacion: id_moneda_cotizacion ? parseInt(id_moneda_cotizacion) : null,
      valor_cotizado: valor_cotizado ? parseFloat(valor_cotizado) : 0.0, // Valor por defecto 0 en lugar de null
      valor_descuento: valor_descuento ? parseFloat(valor_descuento) : 0.0,
      trm: trm ? parseFloat(trm) : 1.0, // TRM por defecto 1.0
      id_tax: id_tax ? parseInt(id_tax) : null,
      valor_tax: valor_tax ? parseFloat(valor_tax) : 0.0,
      modo_de_pago: modo_de_pago || 'CONTADO',
      url_cotizacion: url_cotizacion || '',
      url_contrato: url_contrato || '',
      observaciones_contrato: observaciones_contrato || ''
    };
    
    console.log('🛡️ Datos procesados con valores seguros:', safeData);
    
    const result = await pool.query(`
      INSERT INTO adcot_contratos_clientes (
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      safeData.numero_contrato_os,
      safeData.id_tercero,
      safeData.descripcion_servicio_contratado,
      safeData.estatus_contrato,
      safeData.fecha_contrato,
      safeData.fecha_inicio_servicio,
      safeData.fecha_final_servicio,
      safeData.id_moneda_cotizacion,
      safeData.valor_cotizado,
      safeData.valor_descuento,
      safeData.trm,
      safeData.id_tax,
      safeData.valor_tax,
      safeData.modo_de_pago,
      safeData.url_cotizacion,
      safeData.url_contrato,
      safeData.observaciones_contrato
    ]);
    
    console.log('✅ Contrato creado exitosamente:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando contrato:', error);
    
    // Manejo específico de errores de base de datos
    let errorMessage = 'Error interno del servidor al crear el contrato';
    
    if (error.code === '23502') { // NOT NULL violation
      errorMessage = `Campo requerido faltante: ${error.column || 'campo desconocido'}`;
    } else if (error.code === '23503') { // Foreign key violation
      errorMessage = `Referencia inválida: ${error.detail || 'verifique que los datos relacionados existan'}`;
    } else if (error.code === '23505') { // Unique violation
      errorMessage = `Ya existe un registro con estos datos: ${error.detail || 'datos duplicados'}`;
    } else if (error.code === '22P02') { // Invalid text representation
      errorMessage = `Formato de datos inválido: ${error.message}`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
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
    
    // Estructura consistente para React
    const tipos = result.rows.map(tipo => ({
      id: tipo.id,
      nombre: tipo.nombre,
      label: tipo.nombre,
      value: tipo.id
    }));
    
    console.log(`✅ ${tipos.length} tipos de documento encontrados`);
    res.json(tipos);
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
    
    // Estructura consistente para React
    const tipos = result.rows.map(tipo => ({
      id: tipo.id,
      nombre: tipo.nombre,
      label: tipo.nombre,
      value: tipo.id
    }));
    
    console.log(`✅ ${tipos.length} tipos de relación encontrados`);
    res.json(tipos);
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

// Crear un nuevo tercero
app.post('/api/terceros', async (req, res) => {
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
  try {
    console.log('📝 Creando nuevo tercero:', req.body);
    
    // Validar campos requeridos básicos
    if (!numero_documento) {
      return res.status(400).json({ 
        error: 'El campo numero_documento es obligatorio' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO adcot_terceros_exogenos (
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
      observaciones
    ]);
    
    console.log('✅ Tercero creado exitosamente:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando tercero:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/terceros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`📝 PUT /api/terceros/${id}`);
    console.log('🔍 Datos recibidos:', req.body);
    
    // Primero obtener los datos actuales del tercero
    const currentResult = await pool.query('SELECT * FROM adcot_terceros_exogenos WHERE id_tercero = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }
    
    const currentTercero = currentResult.rows[0];
    console.log('📋 Datos actuales del tercero:', currentTercero);
    
    // Hacer merge de los datos actuales con los nuevos cambios
    const updatedData = { ...currentTercero, ...req.body };
    console.log('🔄 Datos después del merge:', updatedData);
    
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
    } = updatedData;

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

    console.log('✅ Tercero actualizado exitosamente');
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

// Crear una nueva factura
app.post('/api/facturas', async (req, res) => {
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
    console.log('📝 Creando nueva factura:', req.body);
    
    // Validar campos requeridos
    if (!numero_factura || !estatus_factura || !fecha_radicado || !subtotal_facturado_moneda) {
      return res.status(400).json({ 
        error: 'Los campos numero_factura, estatus_factura, fecha_radicado y subtotal_facturado_moneda son obligatorios' 
      });
    }
    
    const result = await pool.query(`
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
      observaciones_factura
    ]);
    
    console.log('✅ Factura creada exitosamente:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando factura:', error);
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
    // Mapear los campos para estructura consistente con React
    const monedas = result.rows.map(m => ({
      id: m.id_moneda,
      id_moneda: m.id_moneda,
      nombre: `${m.codigo_iso} - ${m.nombre_moneda}`,
      label: `${m.codigo_iso} - ${m.nombre_moneda}`,
      value: m.id_moneda,
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

// Crear nuevo impuesto
app.post('/api/impuestos', async (req, res) => {
  try {
    console.log('📝 Creando impuesto:', req.body);
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
    
    // Valores por defecto para campos obligatorios
    const safeData = {
      tipo_obligacion: tipo_obligacion || 'IMPUESTO',
      institucion_reguladora: institucion_reguladora || 'DIAN',
      titulo_impuesto: titulo_impuesto || 'Impuesto General',
      formula_aplicacion: formula_aplicacion || '',
      periodicidad_declaracion: periodicidad_declaracion || 'MENSUAL',
      estado: estado || 'ACTIVO',
      observaciones: observaciones || '',
      url_referencia_normativa: url_referencia_normativa || '',
      fecha_inicio_impuesto: fecha_inicio_impuesto || null,
      fecha_final_impuesto: fecha_final_impuesto || null,
      url_instrucciones: url_instrucciones || '',
      fecha_fin: fecha_fin || null
    };
    
    const result = await pool.query(`
      INSERT INTO adcot_taxes (
        tipo_obligacion, institucion_reguladora, titulo_impuesto, formula_aplicacion,
        periodicidad_declaracion, estado, observaciones, url_referencia_normativa,
        fecha_inicio_impuesto, fecha_final_impuesto, url_instrucciones, fecha_fin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      safeData.tipo_obligacion,
      safeData.institucion_reguladora,
      safeData.titulo_impuesto,
      safeData.formula_aplicacion,
      safeData.periodicidad_declaracion,
      safeData.estado,
      safeData.observaciones,
      safeData.url_referencia_normativa,
      safeData.fecha_inicio_impuesto,
      safeData.fecha_final_impuesto,
      safeData.url_instrucciones,
      safeData.fecha_fin
    ]);
    
    console.log('✅ Impuesto creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando impuesto:', error);
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

// Contratos (catálogo para dropdowns)
app.get('/api/catalogos/contratos', async (req, res) => {
  console.log('🔍 Consultando catálogo de contratos...');
  try {
    const result = await pool.query(`
      SELECT 
        c.id_contrato,
        c.numero_contrato_os,
        c.descripcion_servicio_contratado,
        c.estatus_contrato,
        t.razon_social as tercero_nombre,
        c.valor_cotizado
      FROM adcot_contratos_clientes c
      LEFT JOIN adcot_terceros_exogenos t ON c.id_tercero = t.id_tercero
      WHERE c.id_contrato IS NOT NULL
      ORDER BY c.numero_contrato_os NULLS LAST, c.id_contrato
    `);
    
    // Crear un nombre más descriptivo para cada contrato
    const contratos = result.rows.map(contrato => {
      // Crear un nombre descriptivo basado en los datos disponibles
      let nombreContrato = '';
      
      if (contrato.numero_contrato_os && contrato.numero_contrato_os.trim() !== '') {
        nombreContrato = contrato.numero_contrato_os.trim();
      } else {
        nombreContrato = `Contrato-${contrato.id_contrato}`;
      }
      
      // Agregar información del tercero si está disponible
      if (contrato.tercero_nombre) {
        nombreContrato += ` (${contrato.tercero_nombre})`;
      }
      
      // Si no hay número de contrato, usar descripción truncada
      if (!contrato.numero_contrato_os && contrato.descripcion_servicio_contratado) {
        const descripcionCorta = contrato.descripcion_servicio_contratado.length > 50 
          ? contrato.descripcion_servicio_contratado.substring(0, 50) + '...'
          : contrato.descripcion_servicio_contratado;
        nombreContrato = `${nombreContrato} - ${descripcionCorta}`;
      }

      return {
        id: contrato.id_contrato,
        value: contrato.id_contrato,
        label: nombreContrato,
        nombre: nombreContrato,
        numero_contrato_os: contrato.numero_contrato_os,
        descripcion_servicio_contratado: contrato.descripcion_servicio_contratado,
        estatus_contrato: contrato.estatus_contrato,
        tercero_nombre: contrato.tercero_nombre,
        valor_cotizado: contrato.valor_cotizado
      };
    });
    
    console.log(`✅ ${contratos.length} contratos encontrados para catálogo`);
    console.log(`📋 Ejemplo de contrato:`, contratos[0]);
    res.json(contratos);
  } catch (error) {
    console.error('❌ Error consultando catálogo de contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Terceros (catálogo para dropdowns)
app.get('/api/catalogos/terceros', async (req, res) => {
  console.log('🔍 Consultando catálogo de terceros...');
  try {
    const result = await pool.query(`
      SELECT 
        id_tercero as id,
        COALESCE(razon_social, CONCAT(primer_nombre, ' ', primer_apellido)) as nombre,
        numero_documento,
        tipo_personalidad,
        direccion,
        telefono
      FROM adcot_terceros_exogenos
      WHERE id_tercero IS NOT NULL
      ORDER BY COALESCE(razon_social, CONCAT(primer_nombre, ' ', primer_apellido))
    `);
    
    // Asegurar estructura consistente para React
    const terceros = result.rows.map(tercero => ({
      id: tercero.id,
      nombre: tercero.nombre || `Tercero-${tercero.id}`,
      label: tercero.nombre || `Tercero-${tercero.id}`,
      value: tercero.id,
      numero_documento: tercero.numero_documento,
      tipo_personalidad: tercero.tipo_personalidad,
      direccion: tercero.direccion,
      telefono: tercero.telefono
    }));
    
    console.log(`✅ ${terceros.length} terceros encontrados para catálogo`);
    res.json(terceros);
  } catch (error) {
    console.error('❌ Error consultando catálogo de terceros:', error);
    res.status(500).json({ error: error.message });
  }
});

// Modelos de negocio (catálogo para dropdowns)
app.get('/api/catalogos/modelos-negocio', async (req, res) => {
  console.log('🔍 Consultando catálogo de modelos de negocio...');
  try {
    const result = await pool.query(`
      SELECT 
        id_modelonegocio as id,
        modelo as nombre,
        descripcion
      FROM adcot_modelos_servicios
      ORDER BY modelo
    `);
    console.log(`✅ ${result.rows.length} modelos de negocio encontrados para catálogo`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando catálogo de modelos de negocio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff OKR (catálogo para dropdowns)
app.get('/api/catalogos/staff-okr', async (req, res) => {
  console.log('🔍 Consultando catálogo de staff OKR...');
  try {
    const result = await pool.query(`
      SELECT 
        id_staff as id,
        nombre,
        correo,
        rol
      FROM okr_staff
      ORDER BY nombre
    `);
    console.log(`✅ ${result.rows.length} staff encontrado para catálogo`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando catálogo de staff OKR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Objetivos OKR (catálogo para dropdowns de relaciones)
app.get('/api/catalogos/objetivos-okr', async (req, res) => {
  console.log('🔍 Consultando catálogo de objetivos OKR...');
  try {
    const result = await pool.query(`
      SELECT 
        id_objetivo as id,
        titulo as nombre,
        nivel,
        estado,
        fecha_inicio,
        fecha_fin
      FROM okr_objetivos
      WHERE estado = 'Activo' OR estado IS NULL
      ORDER BY titulo
    `);
    console.log(`✅ ${result.rows.length} objetivos encontrados para catálogo`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error consultando catálogo de objetivos OKR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Estados de contrato (catálogo para dropdowns)
app.get('/api/catalogos/estados-contrato', async (req, res) => {
  try {
    const estados = [
      { id: 'ACTIVO', nombre: 'Activo' },
      { id: 'FINALIZADO', nombre: 'Finalizado' },
      { id: 'CANCELADO', nombre: 'Cancelado' },
      { id: 'SUSPENDIDO', nombre: 'Suspendido' },
      { id: 'EN_PROCESO', nombre: 'En Proceso' }
    ];
    res.json(estados);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Modos de pago (catálogo para dropdowns)
app.get('/api/catalogos/modos-pago', async (req, res) => {
  try {
    const modos = [
      { id: 'CONTADO', nombre: 'Contado' },
      { id: 'CREDITO_30', nombre: 'Crédito 30 días' },
      { id: 'CREDITO_60', nombre: 'Crédito 60 días' },
      { id: 'CREDITO_90', nombre: 'Crédito 90 días' },
      { id: 'ANTICIPO', nombre: 'Anticipo' },
      { id: 'CUOTAS', nombre: 'Cuotas' }
    ];
    res.json(modos);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tipos de personalidad (catálogo para dropdowns)
app.get('/api/catalogos/tipos-personalidad', async (req, res) => {
  try {
    const tipos = [
      { id: 'NATURAL', nombre: 'Persona Natural' },
      { id: 'JURIDICA', nombre: 'Persona Jurídica' }
    ];
    res.json(tipos);
  } catch (error) {
    console.error('❌ Error:', error);
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

// Crear nuevo concepto de transacción
app.post('/api/conceptos-transacciones', async (req, res) => {
  try {
    console.log('📝 Creando concepto de transacción:', req.body);
    const { id_tipo_transaccion, codigo_dian, concepto_dian } = req.body;
    
    if (!concepto_dian) {
      return res.status(400).json({ 
        error: 'El campo concepto_dian es obligatorio' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO adcot_conceptos_transacciones (id_tipo_transaccion, codigo_dian, concepto_dian)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id_tipo_transaccion, codigo_dian, concepto_dian]);
    
    console.log('✅ Concepto de transacción creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando concepto de transacción:', error);
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

// Crear nueva línea de servicio
app.post('/api/lineas-servicios', async (req, res) => {
  try {
    console.log('📝 Creando línea de servicio:', req.body);
    const { nombre, servicio, descripcion_servicio, id_modelonegocio } = req.body;
    
    // El nombre puede venir como 'nombre' o 'servicio'
    const servicioNombre = nombre || servicio;
    
    if (!servicioNombre) {
      return res.status(400).json({ 
        error: 'El campo servicio/nombre es obligatorio' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO adcot_lineas_de_servicios (servicio, descripcion_servicio, id_modelonegocio)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [servicioNombre, descripcion_servicio, id_modelonegocio]);
    
    console.log('✅ Línea de servicio creada:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando línea de servicio:', error);
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

// Crear nuevo centro de costos
app.post('/api/centros-costos', async (req, res) => {
  try {
    console.log('📝 Creando centro de costos:', req.body);
    const { sub_centro_costo, centro_costo_macro, descripcion_cc } = req.body;
    
    if (!sub_centro_costo) {
      return res.status(400).json({ 
        error: 'El campo sub_centro_costo es obligatorio' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO adcot_centro_costos (sub_centro_costo, centro_costo_macro, descripcion_cc)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [sub_centro_costo, centro_costo_macro, descripcion_cc]);
    
    console.log('✅ Centro de costos creado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando centro de costos:', error);
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

// Crear nueva etiqueta contable
app.post('/api/etiquetas-contables', async (req, res) => {
  try {
    console.log('📝 Creando etiqueta contable:', req.body);
    const { etiqueta_contable, descripcion_etiqueta } = req.body;
    
    if (!etiqueta_contable) {
      return res.status(400).json({ 
        error: 'El campo etiqueta_contable es obligatorio' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO adcot_etiquetas_contables (etiqueta_contable, descripcion_etiqueta)
      VALUES ($1, $2)
      RETURNING *
    `, [etiqueta_contable, descripcion_etiqueta]);
    
    console.log('✅ Etiqueta contable creada:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando etiqueta contable:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva transacción
app.post('/api/transacciones', async (req, res) => {
  try {
    console.log('📝 Creando nueva transacción:', req.body);
    
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
    
    // Validar campos obligatorios
    const camposRequeridos = [];
    if (!titulo_transaccion || titulo_transaccion.trim() === '') {
      camposRequeridos.push('titulo_transaccion');
    }
    if (!fecha_transaccion) {
      camposRequeridos.push('fecha_transaccion');
    }
    if (!valor_total_transaccion && valor_total_transaccion !== 0) {
      camposRequeridos.push('valor_total_transaccion');
    }
    
    if (camposRequeridos.length > 0) {
      return res.status(400).json({ 
        error: `Los siguientes campos son obligatorios: ${camposRequeridos.join(', ')}` 
      });
    }
    
    // Preparar datos con valores por defecto seguros
    const safeData = {
      id_cuenta: id_cuenta ? parseInt(id_cuenta) : null,
      id_tipotransaccion: id_tipotransaccion ? parseInt(id_tipotransaccion) : null,
      fecha_transaccion: fecha_transaccion,
      titulo_transaccion: titulo_transaccion.trim(),
      id_moneda_transaccion: id_moneda_transaccion ? parseInt(id_moneda_transaccion) : null,
      valor_total_transaccion: parseFloat(valor_total_transaccion),
      trm_moneda_base: trm_moneda_base ? parseFloat(trm_moneda_base) : 1.0,
      observacion: observacion || '',
      url_soporte_adjunto: url_soporte_adjunto || '',
      registro_auxiliar: registro_auxiliar || false,
      registro_validado: registro_validado || false,
      id_etiqueta_contable: id_etiqueta_contable ? parseInt(id_etiqueta_contable) : null,
      id_tercero: id_tercero ? parseInt(id_tercero) : null,
      id_cuenta_destino_transf: id_cuenta_destino_transf ? parseInt(id_cuenta_destino_transf) : null,
      aplica_retencion: aplica_retencion || false,
      aplica_impuestos: aplica_impuestos || false,
      id_concepto: id_concepto ? parseInt(id_concepto) : null
    };
    
    console.log('🛡️ Datos procesados con valores seguros:', safeData);
    
    const result = await pool.query(`
      INSERT INTO adcot_transacciones (
        id_cuenta, id_tipotransaccion, fecha_transaccion, titulo_transaccion, id_moneda_transaccion, valor_total_transaccion, trm_moneda_base, observacion, url_soporte_adjunto, registro_auxiliar, registro_validado, id_etiqueta_contable, id_tercero, id_cuenta_destino_transf, aplica_retencion, aplica_impuestos, id_concepto
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `, [
      safeData.id_cuenta,
      safeData.id_tipotransaccion,
      safeData.fecha_transaccion,
      safeData.titulo_transaccion,
      safeData.id_moneda_transaccion,
      safeData.valor_total_transaccion,
      safeData.trm_moneda_base,
      safeData.observacion,
      safeData.url_soporte_adjunto,
      safeData.registro_auxiliar,
      safeData.registro_validado,
      safeData.id_etiqueta_contable,
      safeData.id_tercero,
      safeData.id_cuenta_destino_transf,
      safeData.aplica_retencion,
      safeData.aplica_impuestos,
      safeData.id_concepto
    ]);
    
    console.log('✅ Transacción creada exitosamente:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando transacción:', error);
    
    // Manejo específico de errores de base de datos
    let errorMessage = 'Error interno del servidor al crear la transacción';
    
    if (error.code === '23502') { // NOT NULL violation
      errorMessage = `Campo requerido faltante: ${error.column || 'campo desconocido'}`;
    } else if (error.code === '23503') { // Foreign key violation
      errorMessage = `Referencia inválida: ${error.detail || 'verifique que los datos relacionados existan'}`;
    } else if (error.code === '23505') { // Unique violation
      errorMessage = `Ya existe un registro con estos datos: ${error.detail || 'datos duplicados'}`;
    } else if (error.code === '22P02') { // Invalid text representation
      errorMessage = `Formato de datos inválido: ${error.message}`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
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
  try {
    console.log(`📝 PUT /api/contratos/${id}`);
    console.log('🔍 Datos recibidos:', req.body);
    
    // Primero obtener los datos actuales del contrato
    const currentResult = await pool.query('SELECT * FROM adcot_contratos_clientes WHERE id_contrato = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    const currentContrato = currentResult.rows[0];
    console.log('📋 Datos actuales del contrato:', currentContrato);
    
    // Hacer merge de los datos actuales con los nuevos cambios
    const updatedData = { ...currentContrato, ...req.body };
    console.log('🔄 Datos después del merge:', updatedData);
    
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
    } = updatedData;

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

    console.log('✅ Contrato actualizado exitosamente');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error actualizando contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una línea de servicio existente
app.put('/api/lineas-servicios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`📝 PUT /api/lineas-servicios/${id}`);
    console.log('🔍 Datos recibidos:', req.body);
    
    // Primero obtener los datos actuales de la línea de servicio
    const currentResult = await pool.query('SELECT * FROM adcot_lineas_de_servicios WHERE id_servicio = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Línea de servicio no encontrada' });
    }
    
    const currentLinea = currentResult.rows[0];
    console.log('📋 Datos actuales de la línea:', currentLinea);
    
    // Hacer merge de los datos actuales con los nuevos cambios
    const updatedData = { ...currentLinea, ...req.body };
    console.log('🔄 Datos después del merge:', updatedData);
    
    // Mapear campos del body que podrían venir como 'nombre' en lugar de 'servicio'
    const nombre = updatedData.nombre || updatedData.servicio;
    const {
      descripcion_servicio,
      id_modelonegocio
    } = updatedData;

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

    console.log('✅ Línea de servicio actualizada exitosamente');
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
  try {
    console.log(`📝 PUT /api/impuestos/${id}`);
    console.log('🔍 Datos recibidos:', req.body);
    
    // Primero obtener los datos actuales del impuesto
    const currentResult = await pool.query('SELECT * FROM adcot_taxes WHERE id_tax = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Impuesto no encontrado' });
    }
    
    const currentImpuesto = currentResult.rows[0];
    console.log('📋 Datos actuales del impuesto:', currentImpuesto);
    
    // Hacer merge de los datos actuales con los nuevos cambios
    const updatedData = { ...currentImpuesto, ...req.body };
    console.log('🔄 Datos después del merge:', updatedData);
    
    // Asegurar valores por defecto para campos obligatorios en la DB
    // Usar verificación robusta que maneje null, undefined y strings vacíos
    const safeData = {
      tipo_obligacion: (updatedData.tipo_obligacion && updatedData.tipo_obligacion.trim()) || 'IMPUESTO',
      institucion_reguladora: (updatedData.institucion_reguladora && updatedData.institucion_reguladora.trim()) || 'DIAN',
      titulo_impuesto: (updatedData.titulo_impuesto && updatedData.titulo_impuesto.trim()) || 'Impuesto General',
      formula_aplicacion: updatedData.formula_aplicacion || '',
      periodicidad_declaracion: (updatedData.periodicidad_declaracion && updatedData.periodicidad_declaracion.trim()) || 'MENSUAL',
      estado: (updatedData.estado && updatedData.estado.trim()) || 'ACTIVO',
      observaciones: updatedData.observaciones || '',
      url_referencia_normativa: updatedData.url_referencia_normativa || '',
      fecha_inicio_impuesto: updatedData.fecha_inicio_impuesto || null,
      fecha_final_impuesto: updatedData.fecha_final_impuesto || null,
      url_instrucciones: updatedData.url_instrucciones || '',
      fecha_fin: updatedData.fecha_fin || null
    };
    
    console.log('🛡️ Datos con valores por defecto:', safeData);
    
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
    } = safeData;

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

    console.log('✅ Impuesto actualizado exitosamente');
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
  try {
    console.log(`📝 PUT /api/centros-costos/${id}`);
    console.log('🔍 Datos recibidos:', req.body);
    
    // Primero obtener los datos actuales del centro de costos
    const currentResult = await pool.query('SELECT * FROM adcot_centro_costos WHERE id_centro_costo = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Centro de costos no encontrado' });
    }
    
    const currentCentro = currentResult.rows[0];
    console.log('📋 Datos actuales del centro:', currentCentro);
    
    // Hacer merge de los datos actuales con los nuevos cambios
    const updatedData = { ...currentCentro, ...req.body };
    console.log('🔄 Datos después del merge:', updatedData);
    
    const {
      sub_centro_costo,
      centro_costo_macro,
      descripcion_cc
    } = updatedData;

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

    console.log('✅ Centro de costos actualizado exitosamente');
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
  try {
    console.log(`📝 PUT /api/etiquetas-contables/${id}`);
    console.log('🔍 Datos recibidos:', req.body);
    
    // Primero obtener los datos actuales de la etiqueta contable
    const currentResult = await pool.query('SELECT * FROM adcot_etiquetas_contables WHERE id_etiqueta_contable = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Etiqueta contable no encontrada' });
    }
    
    const currentEtiqueta = currentResult.rows[0];
    console.log('📋 Datos actuales de la etiqueta:', currentEtiqueta);
    
    // Hacer merge de los datos actuales con los nuevos cambios
    const updatedData = { ...currentEtiqueta, ...req.body };
    console.log('🔄 Datos después del merge:', updatedData);
    
    const {
      etiqueta_contable,
      descripcion_etiqueta
    } = updatedData;

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

    console.log('✅ Etiqueta contable actualizada exitosamente');
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
  try {
    console.log(`📝 PUT /api/conceptos-transacciones/${id}`);
    console.log('🔍 Datos recibidos:', req.body);
    
    // Primero obtener los datos actuales del concepto de transacción
    const currentResult = await pool.query('SELECT * FROM adcot_conceptos_transacciones WHERE id_concepto = $1', [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Concepto de transacción no encontrado' });
    }
    
    const currentConcepto = currentResult.rows[0];
    console.log('📋 Datos actuales del concepto:', currentConcepto);
    
    // Hacer merge de los datos actuales con los nuevos cambios
    const updatedData = { ...currentConcepto, ...req.body };
    console.log('🔄 Datos después del merge:', updatedData);
    
    const {
      id_tipo_transaccion,
      codigo_dian,
      concepto_dian
    } = updatedData;

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

    console.log('✅ Concepto de transacción actualizado exitosamente');
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
  console.log(`📋 Rutas principales disponibles:`);
  console.log(`   📊 FACTURAS: GET/POST/PUT/DELETE /api/facturas`);
  console.log(`   🤝 CONTRATOS: GET/POST/PUT/DELETE /api/contratos`);
  console.log(`   👥 TERCEROS: GET/POST/PUT/DELETE /api/terceros`);
  console.log(`   💰 TRANSACCIONES: GET/POST/PUT/DELETE /api/transacciones`);
  console.log(`   🎯 OKR: GET/POST/PUT/DELETE /api/okr/*`);
  console.log(`   📋 CATÁLOGOS disponibles:`);
  console.log(`      • /api/catalogos/contratos`);
  console.log(`      • /api/catalogos/terceros`);
  console.log(`      • /api/catalogos/monedas`);
  console.log(`      • /api/catalogos/tipos-documento`);
  console.log(`      • /api/catalogos/tipos-relacion`);
  console.log(`      • /api/catalogos/tipos-transaccion`);
  console.log(`      • /api/catalogos/estados-factura`);
  console.log(`      • /api/catalogos/estados-contrato`);
  console.log(`      • /api/catalogos/modos-pago`);
  console.log(`      • /api/catalogos/tipos-personalidad`);
  console.log(`      • /api/catalogos/etiquetas-contables`);
  console.log(`      • /api/catalogos/conceptos-transacciones`);
  console.log(`      • /api/catalogos/modelos-negocio`);
  console.log(`      • /api/catalogos/staff-okr`);
  console.log(`      • /api/catalogos/objetivos-okr`);
  console.log(`   🏢 CRM: GET/POST/PUT/DELETE /api/crm/*`);
}); 