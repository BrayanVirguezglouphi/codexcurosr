const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Backend con operaciones CRUD completas - v1.1 (Force deployment)
const app = express();
const PORT = process.env.PORT || 8081;

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware básico
app.use(cors());
app.use(express.json());

// Configuración de base de datos
// Función para detectar si tenemos acceso al tunnel de Cloudflare
async function detectCloudflaredAccess() {
  console.log('🔍 Detectando acceso a Cloudflare Tunnel...');
  
  // Detectar entorno
  const isCloudRun = process.env.K_SERVICE ? true : false;
  
  let configuracionesTunnel;
  
  if (isCloudRun) {
    // Para Cloud Run: NO usar tunnel, usar configuración directa
    console.log('☁️ Cloud Run detectado - usando configuración local simulada');
    return { success: false }; // Forzar uso de configuración local
  } else {
    // Para computadores locales: usar localhost (tunnel ya configurado)
    console.log('🏠 Entorno local detectado - probando localhost');
    configuracionesTunnel = [
      {
        nombre: 'localhost:8321 (tunnel local)',
        config: {
          host: 'localhost',
          port: 8321,
          database: 'SQL_DDL_ADMCOT',
          user: 'postgres',
          password: '00GP5673BD**$eG3Ve1101',
          ssl: false,
          connectionTimeoutMillis: 5000
        }
      },
      {
        nombre: '127.0.0.1:8321 (IP local directa)',
        config: {
          host: '127.0.0.1',
          port: 8321,
          database: 'SQL_DDL_ADMCOT',
          user: 'postgres', 
          password: '00GP5673BD**$eG3Ve1101',
          ssl: false,
          connectionTimeoutMillis: 5000
        }
      }
    ];
  }
  
  for (const { nombre, config } of configuracionesTunnel) {
    console.log(`🔗 Probando: ${nombre} (${config.host}:${config.port})...`);
    
    const testPool = new Pool(config);
    
    try {
      await testPool.query('SELECT 1');
      console.log(`✅ Conexión exitosa con: ${nombre}`);
      await testPool.end();
      
      return {
        success: true,
        config: config,
        method: nombre
      };
    } catch (error) {
      console.log(`❌ ${nombre} falló: ${error.message}`);
      await testPool.end();
    }
  }
  
  console.log('❌ No se detectó acceso al tunnel de Cloudflare');
  return { success: false };
}

// Configuración de base de datos con detección automática
let dbConfig;

// Detectar si estamos en Cloud Run
const isCloudRun = process.env.K_SERVICE ? true : false;

async function initializeDatabase() {
  console.log(`🌍 Entorno detectado: ${isCloudRun ? 'Cloud Run' : 'Local'}`);
  
  if (isCloudRun) {
    // Para Cloud Run: usar configuración simplificada sin tunnel
    console.log('☁️ Cloud Run - usando configuración sin tunnel');
    dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 8321,
      database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '00GP5673BD**$eG3Ve1101',
      ssl: process.env.DB_SSL === 'true',
      connectionTimeoutMillis: 10000
    };
  } else {
    // Para local: intentar detectar acceso al tunnel primero
    const tunnelResult = await detectCloudflaredAccess();
    
    if (tunnelResult.success) {
      // Usar la configuración del tunnel que funcionó
      console.log(`🚇 Usando configuración de Cloudflare Tunnel: ${tunnelResult.method}`);
      dbConfig = tunnelResult.config;
    } else {
      // Configuración local estándar como fallback
      console.log('🏠 Configuración local estándar (fallback)');
      dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 8321,
        database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '00GP5673BD**$eG3Ve1101',
        ssl: process.env.DB_SSL === 'true'
      };
    }
  }
  
  console.log('🔍 Configuración final de base de datos:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    ssl: dbConfig.ssl,
    environment: process.env.NODE_ENV || 'development'
  });
  
  return dbConfig;
}

// Inicializar pool de conexiones (se configura al arrancar el servidor)
let pool;

// Función para probar conexión
const testConnection = async () => {
  try {
    if (!pool) {
      console.log('⚠️ Pool no inicializado, inicializando...');
      await initializeDatabase();
      pool = new Pool(dbConfig);
    }
    
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

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ENDPOINTS DE AUTENTICACIÓN

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Intento de login para:', username);

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username y contraseña son requeridos' 
      });
    }

    // Buscar usuario por username
    const query = 'SELECT * FROM "User" WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', username);
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const user = result.rows[0];
    console.log('👤 Usuario encontrado:', { id: user.id, username: user.username, email: user.email });

    // Verificar contraseña - verificar si está hasheada o no
    let passwordMatch = false;
    
    // Primero intentar comparar con bcrypt (contraseña hasheada)
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      // Si falla bcrypt, comparar directamente (contraseña en texto plano)
      passwordMatch = password === user.password;
    }
    
    if (!passwordMatch) {
      console.log('❌ Contraseña incorrecta para:', username);
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar JWT token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    console.log('✅ Login exitoso para:', username);

    // Actualizar fecha de último acceso (usando created_at como referencia si no existe updatedAt)
    try {
      await pool.query(
        'UPDATE "User" SET created_at = NOW() WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      // Si no se puede actualizar, continuar sin error
      console.log('⚠️ No se pudo actualizar fecha de acceso');
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Verificar token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout endpoint (opcional - principalmente para limpiar del lado del cliente)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  console.log('🚪 Logout para usuario:', req.user.username);
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// Endpoint para obtener perfil de usuario
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT id, username, email, created_at FROM "User" WHERE id = $1';
    const result = await pool.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({ 
      error: 'Error al obtener perfil',
      details: error.message 
    });
  }
});

// ENDPOINT PARA CREAR USUARIOS
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email y contraseña son requeridos' 
      });
    }

    // Verificar si el username ya existe
    const existingUsername = await pool.query('SELECT id FROM "User" WHERE username = $1', [username]);
    
    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El username ya está registrado' 
      });
    }

    // Verificar si el email ya existe
    const existingEmail = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Hashear contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const query = `
      INSERT INTO "User" (username, email, password, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, username, email, created_at
    `;

    const result = await pool.query(query, [username, email, hashedPassword]);
    const newUser = result.rows[0];

    console.log('✅ Usuario creado exitosamente:', { id: newUser.id, username: newUser.username });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ 
      error: 'Error al crear usuario',
      details: error.message 
    });
  }
});

// Función auxiliar para obtener la tabla de contratos correcta
async function getTablaContratos() {
  try {
    // Buscar específicamente adcot_contratos_clientes primero
    let tablaContratos = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_contratos_clientes'
    `);

    console.log(`📋 Tabla específica adcot_contratos_clientes encontrada: ${tablaContratos.rows.length > 0 ? 'SÍ' : 'NO'}`);
    
    if (tablaContratos.rows.length > 0) {
      console.log(`📊 Usando tabla preferida: adcot_contratos_clientes`);
      return 'adcot_contratos_clientes';
    }
    
    // Si no existe, buscar otras tablas de contratos
    tablaContratos = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%contrato%'
      ORDER BY table_name
    `);
    
    console.log(`📋 Tablas de contratos encontradas:`, tablaContratos.rows);
    
    if (tablaContratos.rows.length === 0) {
      throw new Error('No se encontró tabla de contratos');
    }
    
    // Si hay múltiples tablas, preferir adcot_contratos_clientes
    const tablaPreferida = tablaContratos.rows.find(t => t.table_name === 'adcot_contratos_clientes');
    const nombreTabla = tablaPreferida ? tablaPreferida.table_name : tablaContratos.rows[0].table_name;
    
    console.log(`📊 Usando tabla: ${nombreTabla}`);
    return nombreTabla;
  } catch (error) {
    console.error('❌ Error en getTablaContratos:', error);
    throw error;
  }
}

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
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 8321,
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
        t.url_soporte_adjunto,
        t.id_cuenta,
        t.id_tipotransaccion,
        t.id_moneda_transaccion,
        t.id_etiqueta_contable,
        t.id_tercero,
        t.id_cuenta_destino_transf,
        t.id_concepto,
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
    console.log('📋 Primera transacción RAW:', result.rows[0]);
    console.log('📋 Columnas disponibles:', result.rows[0] ? Object.keys(result.rows[0]) : 'Sin datos');
    
    // LOG DETALLADO: Verificar IDs específicos de la transacción #2
    const transaccion2 = result.rows.find(t => t.id_transaccion === 2);
    if (transaccion2) {
      console.log('🚨 TRANSACCIÓN #2 RAW:', {
        id_cuenta: transaccion2.id_cuenta,
        id_tipotransaccion: transaccion2.id_tipotransaccion,
        id_moneda_transaccion: transaccion2.id_moneda_transaccion,
        id_etiqueta_contable: transaccion2.id_etiqueta_contable,
        id_tercero: transaccion2.id_tercero,
        id_cuenta_destino_transf: transaccion2.id_cuenta_destino_transf,
        id_concepto: transaccion2.id_concepto
      });
    }
    
    // Formatear datos para el frontend - incluir TODOS los IDs para el modo vista
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
      url_soporte_adjunto: row.url_soporte_adjunto,
      // IDs necesarios para el modo vista - manejar null correctamente
      id_cuenta: row.id_cuenta || null,
      id_tipotransaccion: row.id_tipotransaccion || null,
      id_moneda_transaccion: row.id_moneda_transaccion || null,
      id_etiqueta_contable: row.id_etiqueta_contable || null,
      id_tercero: row.id_tercero || null,
      id_cuenta_destino_transf: row.id_cuenta_destino_transf || null,
      id_concepto: row.id_concepto || null,
      // Campos directos para la tabla
      tipo_transaccion: row.tipo_transaccion,
      nombre_cuenta: row.nombre_cuenta,
      // Mantener compatibilidad con tabla (estructurado para compatibilidad)
      tipoTransaccion: {
        tipo_transaccion: row.tipo_transaccion
      },
      cuenta: {
        nombre_cuenta: row.nombre_cuenta
      }
    }));
    
    // LOG DETALLADO: Verificar transacción #2 formateada
    const transaccion2Formateada = transacciones.find(t => t.id_transaccion === 2);
    if (transaccion2Formateada) {
      console.log('🚨 TRANSACCIÓN #2 FORMATEADA PARA FRONTEND:', {
        id_cuenta: transaccion2Formateada.id_cuenta,
        id_tipotransaccion: transaccion2Formateada.id_tipotransaccion,
        id_moneda_transaccion: transaccion2Formateada.id_moneda_transaccion,
        id_etiqueta_contable: transaccion2Formateada.id_etiqueta_contable,
        id_tercero: transaccion2Formateada.id_tercero,
        id_cuenta_destino_transf: transaccion2Formateada.id_cuenta_destino_transf,
        id_concepto: transaccion2Formateada.id_concepto
      });
    }
    
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
    
    console.log(`🔍 Actualizando transacción ID: ${id}...`);
    console.log('📋 Datos recibidos (RAW):', JSON.stringify(updateFields, null, 2));
    console.log('📋 Claves recibidas:', Object.keys(updateFields));
    
    // Definir campos válidos de la tabla adcot_transacciones (basado en la estructura real de la tabla)
    const validFieldNames = [
      'id_cuenta',
      'id_tipotransaccion', 
      'fecha_transaccion',
      'titulo_transaccion',
      'id_moneda_transaccion',
      'valor_total_transaccion',
      'trm_moneda_base',
      'observacion',
      'url_soporte_adjunto',
      'registro_auxiliar',
      'registro_validado',
      'id_etiqueta_contable',
      'id_tercero',
      'id_cuenta_destino_transf',
      'aplica_retencion',
      'aplica_impuestos',
      'id_concepto'
    ];
    
    // Filtrar solo campos válidos
    const validFields = {};
    Object.keys(updateFields).forEach(key => {
      if (validFieldNames.includes(key)) {
        validFields[key] = updateFields[key];
      } else {
        console.log(`⚠️  Campo ignorado (no válido): ${key}`);
      }
    });
    
    console.log('📋 Campos válidos a actualizar:', Object.keys(validFields));
    
    // Verificar que hay campos para actualizar
    if (Object.keys(validFields).length === 0) {
      return res.status(400).json({ 
        error: 'No se proporcionaron campos válidos para actualizar' 
      });
    }
    
    console.log('📋 Campos después del filtrado:', JSON.stringify(validFields, null, 2));
    
    // Construir query dinámicamente
    const fields = Object.keys(validFields);
    const values = Object.values(validFields);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE adcot_transacciones 
      SET ${setClause}
      WHERE id_transaccion = $${fields.length + 1}
      RETURNING *
    `;
    
    console.log('🔍 Query generada:', query);
    console.log('📋 Valores:', [...values, id]);
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    console.log('✅ Transacción actualizada exitosamente');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar transacción:', error);
    res.status(500).json({ 
      error: 'Error al actualizar transacción',
      details: error.message 
    });
  }
});

// Ruta para obtener transacción individual por ID
app.get('/api/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo transacción ID: ${id}...`);
    
    const query = 'SELECT * FROM adcot_transacciones WHERE id_transaccion = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    console.log('✅ Transacción encontrada:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener transacción:', error);
    res.status(500).json({ 
      error: 'Error al obtener transacción',
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
    
    // Verificar tabla cuentas
    const tablaCuentas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%cuenta%'
    `);
    
    if (tablaCuentas.rows.length === 0) {
      console.log('⚠️  No se encontraron tablas de cuentas');
      return res.json([]); // Retornar array vacío si no existe
    }
    
    const nombreTabla = tablaCuentas.rows[0].table_name;
    console.log(`📋 Usando tabla: ${nombreTabla}`);
    
    const query = `SELECT * FROM ${nombreTabla} ORDER BY nombre_cuenta ASC`;
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} cuentas`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener cuentas:', error);
    res.json([]); // Retornar array vacío en caso de error
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
    
    // Buscar tabla de monedas disponible
    const tablasMonedas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%moneda%'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas de monedas encontradas:', tablasMonedas.rows);
    
    if (tablasMonedas.rows.length === 0) {
      console.log('❌ No se encontraron tablas de monedas');
      return res.json([]);
    }
    
    // Probar con diferentes tablas hasta encontrar una que funcione
    for (const tabla of tablasMonedas.rows) {
      try {
        const nombreTabla = tabla.table_name;
        console.log(`📊 Intentando consultar tabla: ${nombreTabla}`);
        
        // Obtener columnas de la tabla
        const columnasResult = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${nombreTabla}'
          ORDER BY ordinal_position
        `);
        
        const columnas = columnasResult.rows.map(r => r.column_name);
        console.log(`📋 Columnas de ${nombreTabla}:`, columnas);
        
        // Construir query basado en las columnas disponibles
        const query = `SELECT * FROM ${nombreTabla} ORDER BY ${columnas[1] || columnas[0]} ASC LIMIT 10`;
        const result = await pool.query(query);
        
        console.log(`✅ Encontradas ${result.rows.length} monedas en tabla ${nombreTabla}`);
        console.log('📋 Muestra de datos:', result.rows.slice(0, 2));
        
        return res.json(result.rows);
      } catch (tableError) {
        console.log(`❌ Error con tabla ${tabla.table_name}:`, tableError.message);
        continue;
      }
    }
    
    res.json([]);
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
    
    // Verificar si existe la tabla adcot_terceros_exogenos
    const verificarTabla = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_terceros_exogenos'
    `);
    
    if (verificarTabla.rows.length === 0) {
      console.log('❌ Tabla adcot_terceros_exogenos no encontrada');
      return res.json([]);
    }
    
    // Obtener columnas de la tabla
    const columnasResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'adcot_terceros_exogenos'
      ORDER BY ordinal_position
    `);
    
    const columnas = columnasResult.rows.map(r => r.column_name);
    console.log('📋 Columnas de adcot_terceros_exogenos:', columnas);
    
    const query = `SELECT * FROM adcot_terceros_exogenos ORDER BY razon_social ASC NULLS LAST, primer_nombre ASC LIMIT 20`;
    const result = await pool.query(query);
    
    console.log(`✅ Encontrados ${result.rows.length} terceros`);
    console.log('📋 Muestra de terceros:', result.rows.slice(0, 2));
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener terceros:', error);
    res.status(500).json({ 
      error: 'Error al obtener terceros',
      details: error.message 
    });
  }
});

// 7. Catálogo de contratos
app.get('/api/catalogos/contratos', async (req, res) => {
  try {
    console.log('🔍 Consultando contratos...');
    const query = `
      SELECT 
        id_contrato,
        numero_contrato_os,
        descripcion_servicio_contratado,
        estatus_contrato
      FROM adcot_contratos_clientes 
      ORDER BY numero_contrato_os ASC
    `;
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

// 8. Catálogo de impuestos/taxes
app.get('/api/catalogos/taxes', async (req, res) => {
  try {
    console.log('🔍 Consultando impuestos...');
    const query = `
      SELECT 
        id_tax,
        titulo_impuesto
      FROM adcot_taxes 
      ORDER BY titulo_impuesto ASC
    `;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} impuestos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener impuestos:', error);
    res.status(500).json({ 
      error: 'Error al obtener impuestos',
      details: error.message 
    });
  }
});

// 9. Catálogo de tipos de documento
app.get('/api/catalogos/tipos-documento', async (req, res) => {
  try {
    console.log('🔍 Consultando tipos de documento...');
    
    // Buscar tablas que contengan "tipo" y "documento"
    const buscarTablas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%tipo%documento%' OR table_name LIKE '%documento%tipo%'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas relacionadas con tipos de documento:', buscarTablas.rows);
    
    if (buscarTablas.rows.length === 0) {
      console.log('❌ No se encontraron tablas de tipos de documento');
      // Retornar tipos hardcodeados como fallback
      const tiposFallback = [
        { id_tipo_documento: 'CC', tipo_documento: 'Cédula de Ciudadanía', codigo: 'CC' },
        { id_tipo_documento: 'NIT', tipo_documento: 'NIT', codigo: 'NIT' },
        { id_tipo_documento: 'CE', tipo_documento: 'Cédula de Extranjería', codigo: 'CE' },
        { id_tipo_documento: 'PA', tipo_documento: 'Pasaporte', codigo: 'PA' },
        { id_tipo_documento: 'TI', tipo_documento: 'Tarjeta de Identidad', codigo: 'TI' }
      ];
      return res.json(tiposFallback);
    }
    
    // Probar cada tabla encontrada
    for (const tabla of buscarTablas.rows) {
      try {
        const nombreTabla = tabla.table_name;
        console.log(`📊 Intentando consultar tabla: ${nombreTabla}`);
        
        // Obtener columnas de la tabla
        const columnasResult = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${nombreTabla}'
          ORDER BY ordinal_position
        `);
        
        const columnas = columnasResult.rows.map(r => r.column_name);
        console.log(`📋 Columnas de ${nombreTabla}:`, columnas);
        
        // Construir query basado en las columnas disponibles
        let orderBy = 'id';
        if (columnas.includes('id_tipo_documento')) {
          orderBy = 'id_tipo_documento';
        } else if (columnas.includes('codigo')) {
          orderBy = 'codigo';
        } else if (columnas.includes('tipo_documento')) {
          orderBy = 'tipo_documento';
        } else if (columnas.length > 0) {
          orderBy = columnas[0];
        }
        
        const query = `SELECT * FROM ${nombreTabla} ORDER BY ${orderBy} ASC LIMIT 20`;
        const result = await pool.query(query);
        
        console.log(`✅ Encontrados ${result.rows.length} tipos de documento en tabla ${nombreTabla}`);
        console.log('📋 Muestra de tipos de documento:', result.rows.slice(0, 3));
        
        return res.json(result.rows);
      } catch (tableError) {
        console.log(`❌ Error con tabla ${tabla.table_name}:`, tableError.message);
        continue;
      }
    }
    
    // Si no funcionó ninguna tabla, retornar fallback
    console.log('⚠️ Ninguna tabla funcionó, usando tipos fallback');
    const tiposFallback = [
      { id_tipo_documento: 'CC', tipo_documento: 'Cédula de Ciudadanía', codigo: 'CC' },
      { id_tipo_documento: 'NIT', tipo_documento: 'NIT', codigo: 'NIT' },
      { id_tipo_documento: 'CE', tipo_documento: 'Cédula de Extranjería', codigo: 'CE' },
      { id_tipo_documento: 'PA', tipo_documento: 'Pasaporte', codigo: 'PA' },
      { id_tipo_documento: 'TI', tipo_documento: 'Tarjeta de Identidad', codigo: 'TI' }
    ];
    res.json(tiposFallback);
    
  } catch (error) {
    console.error('❌ Error al obtener tipos de documento:', error);
    // En caso de error, retornar tipos fallback
    const tiposFallback = [
      { id_tipo_documento: 'CC', tipo_documento: 'Cédula de Ciudadanía', codigo: 'CC' },
      { id_tipo_documento: 'NIT', tipo_documento: 'NIT', codigo: 'NIT' },
      { id_tipo_documento: 'CE', tipo_documento: 'Cédula de Extranjería', codigo: 'CE' },
      { id_tipo_documento: 'PA', tipo_documento: 'Pasaporte', codigo: 'PA' },
      { id_tipo_documento: 'TI', tipo_documento: 'Tarjeta de Identidad', codigo: 'TI' }
    ];
    res.json(tiposFallback);
  }
});

// RUTAS PRINCIPALES PARA OTRAS ENTIDADES

// 7. Ruta principal de terceros con detalles completos
app.get('/api/terceros', async (req, res) => {
  try {
    console.log('🔍 Consultando terceros completos...');
    
    // Verificar tabla terceros
    const tablaTerceros = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%tercero%'
    `);
    
    if (tablaTerceros.rows.length === 0) {
      return res.json([]);
    }
    
    const nombreTabla = tablaTerceros.rows[0].table_name;
    const query = `SELECT * FROM ${nombreTabla} ORDER BY id_tercero DESC LIMIT 100`;
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} terceros`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener terceros:', error);
    res.json([]);
  }
});

// Crear tercero
app.post('/api/terceros', async (req, res) => {
  try {
    console.log('🔍 Creando tercero...');
    
    // Verificar tabla terceros
    const tablaTerceros = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%tercero%'
    `);
    
    if (tablaTerceros.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de terceros no encontrada' });
    }
    
    const nombreTabla = tablaTerceros.rows[0].table_name;
    
    // Obtener columnas de la tabla para construir INSERT dinámicamente
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_tercero'
      ORDER BY ordinal_position
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos' });
    }
    
    const valores = camposDelBody.map(campo => req.body[campo]);
    const placeholders = camposDelBody.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${nombreTabla} (${camposDelBody.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await pool.query(query, valores);
    console.log('✅ Tercero creado exitosamente');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear tercero:', error);
    res.status(500).json({ 
      error: 'Error al crear tercero',
      details: error.message 
    });
  }
});

// Actualizar tercero
app.put('/api/terceros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Actualizando tercero ID: ${id}...`);
    
    // Verificar tabla terceros
    const tablaTerceros = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%tercero%'
    `);
    
    if (tablaTerceros.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de terceros no encontrada' });
    }
    
    const nombreTabla = tablaTerceros.rows[0].table_name;
    
    // Obtener columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_tercero'
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
    }
    
    const setClause = camposDelBody.map((campo, index) => `${campo} = $${index + 1}`).join(', ');
    const valores = camposDelBody.map(campo => req.body[campo]);
    
    const query = `
      UPDATE ${nombreTabla} 
      SET ${setClause}
      WHERE id_tercero = $${camposDelBody.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...valores, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }
    
    console.log('✅ Tercero actualizado exitosamente');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar tercero:', error);
    res.status(500).json({ 
      error: 'Error al actualizar tercero',
      details: error.message 
    });
  }
});

// Eliminar tercero
app.delete('/api/terceros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Eliminando tercero ID: ${id}...`);
    
    // Verificar tabla terceros
    const tablaTerceros = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%tercero%'
    `);
    
    if (tablaTerceros.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de terceros no encontrada' });
    }
    
    const nombreTabla = tablaTerceros.rows[0].table_name;
    const query = `DELETE FROM ${nombreTabla} WHERE id_tercero = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }
    
    console.log('✅ Tercero eliminado exitosamente');
    res.json({ message: 'Tercero eliminado', tercero: result.rows[0] });
  } catch (error) {
    console.error('❌ Error al eliminar tercero:', error);
    res.status(500).json({ 
      error: 'Error al eliminar tercero',
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

// 12. Ruta de contratos - USAR adcot_contratos_clientes
app.get('/api/contratos', async (req, res) => {
  try {
    console.log('🔍 Consultando contratos...');
    
    const nombreTabla = await getTablaContratos();
    
    console.log(`📊 Usando tabla de contratos: ${nombreTabla}`);
    
    const query = `SELECT * FROM ${nombreTabla} ORDER BY id_contrato DESC LIMIT 100`;
    console.log(`🔍 Ejecutando query: ${query}`);
    
    const result = await pool.query(query);
    console.log(`✅ Encontrados ${result.rows.length} contratos`);
    console.log(`📋 Primeros 2 contratos:`, result.rows.slice(0, 2));
    
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener contratos:', error);
    res.status(500).json({ 
      error: 'Error al obtener contratos',
      details: error.message 
    });
  }
});

// Obtener contrato individual por ID
app.get('/api/contratos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Consultando contrato ID: ${id}...`);
    
    const nombreTabla = await getTablaContratos();
    console.log(`📊 Usando tabla de contratos: ${nombreTabla}`);
    
    const query = `SELECT * FROM ${nombreTabla} WHERE id_contrato = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    console.log(`✅ Contrato encontrado: ${result.rows[0].numero_contrato_os}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener contrato:', error);
    res.status(500).json({ 
      error: 'Error al obtener contrato',
      details: error.message 
    });
  }
});

// Crear contrato
app.post('/api/contratos', async (req, res) => {
  try {
    console.log('🔍 Creando contrato...');
    
    const nombreTabla = await getTablaContratos();
    
    // Obtener columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_contrato'
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos' });
    }
    
    const valores = camposDelBody.map(campo => req.body[campo]);
    const placeholders = camposDelBody.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${nombreTabla} (${camposDelBody.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await pool.query(query, valores);
    console.log('✅ Contrato creado exitosamente');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear contrato:', error);
    res.status(500).json({ 
      error: 'Error al crear contrato',
      details: error.message 
    });
  }
});

// Actualizar contrato
app.put('/api/contratos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Actualizando contrato ID: ${id}...`);
    
    const nombreTabla = await getTablaContratos();
    
    // Obtener columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_contrato'
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
    }
    
    const setClause = camposDelBody.map((campo, index) => `${campo} = $${index + 1}`).join(', ');
    const valores = camposDelBody.map(campo => req.body[campo]);
    
    const query = `
      UPDATE ${nombreTabla} 
      SET ${setClause}
      WHERE id_contrato = $${camposDelBody.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...valores, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    console.log('✅ Contrato actualizado exitosamente');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar contrato:', error);
    res.status(500).json({ 
      error: 'Error al actualizar contrato',
      details: error.message 
    });
  }
});

// Eliminar contrato
app.delete('/api/contratos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Eliminando contrato ID: ${id}...`);
    
    const nombreTabla = await getTablaContratos();
    const query = `DELETE FROM ${nombreTabla} WHERE id_contrato = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    console.log('✅ Contrato eliminado exitosamente');
    res.json({ message: 'Contrato eliminado', contrato: result.rows[0] });
  } catch (error) {
    console.error('❌ Error al eliminar contrato:', error);
    res.status(500).json({ 
      error: 'Error al eliminar contrato',
      details: error.message 
    });
  }
});

// 13. Ruta de facturas - VERIFICAR ESTRUCTURA
app.get('/api/facturas', async (req, res) => {
  try {
    console.log('🔍 Consultando facturas...');
    
    // Verificar tabla facturas - buscar específicamente adcot_facturas primero
    let tablaFacturas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_facturas'
    `);
    
    // Si no existe adcot_facturas, buscar otras tablas de facturas
    if (tablaFacturas.rows.length === 0) {
      tablaFacturas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%factura%' AND table_name != 'adcot_facturas_electronicas'
        ORDER BY table_name
      `);
    }
    
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

// Crear factura
app.post('/api/facturas', async (req, res) => {
  try {
    console.log('🔍 Creando factura...');
    
    // Verificar tabla facturas - buscar específicamente adcot_facturas primero
    let tablaFacturas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_facturas'
    `);
    
    // Si no existe adcot_facturas, buscar otras tablas de facturas
    if (tablaFacturas.rows.length === 0) {
      tablaFacturas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%factura%' AND table_name != 'adcot_facturas_electronicas'
        ORDER BY table_name
      `);
    }
    
    if (tablaFacturas.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de facturas no encontrada' });
    }
    
    const nombreTabla = tablaFacturas.rows[0].table_name;
    
    // Obtener columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_factura'
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos' });
    }
    
    const valores = camposDelBody.map(campo => req.body[campo]);
    const placeholders = camposDelBody.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${nombreTabla} (${camposDelBody.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await pool.query(query, valores);
    console.log('✅ Factura creada exitosamente');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear factura:', error);
    res.status(500).json({ 
      error: 'Error al crear factura',
      details: error.message 
    });
  }
});

// Actualizar factura
app.put('/api/facturas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Actualizando factura ID: ${id}...`);
    
    // Verificar tabla facturas - buscar específicamente adcot_facturas primero
    let tablaFacturas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_facturas'
    `);
    
    // Si no existe adcot_facturas, buscar otras tablas de facturas
    if (tablaFacturas.rows.length === 0) {
      tablaFacturas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%factura%' AND table_name != 'adcot_facturas_electronicas'
        ORDER BY table_name
      `);
    }
    
    if (tablaFacturas.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de facturas no encontrada' });
    }
    
    const nombreTabla = tablaFacturas.rows[0].table_name;
    
    // Obtener columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_factura'
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
    }
    
    const setClause = camposDelBody.map((campo, index) => `${campo} = $${index + 1}`).join(', ');
    const valores = camposDelBody.map(campo => req.body[campo]);
    
    const query = `
      UPDATE ${nombreTabla} 
      SET ${setClause}
      WHERE id_factura = $${camposDelBody.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...valores, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    console.log('✅ Factura actualizada exitosamente');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar factura:', error);
    res.status(500).json({ 
      error: 'Error al actualizar factura',
      details: error.message 
    });
  }
});

// Eliminar factura
app.delete('/api/facturas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Eliminando factura ID: ${id}...`);
    
    // Verificar tabla facturas - buscar específicamente adcot_facturas primero
    let tablaFacturas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_facturas'
    `);
    
    // Si no existe adcot_facturas, buscar otras tablas de facturas
    if (tablaFacturas.rows.length === 0) {
      tablaFacturas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%factura%' AND table_name != 'adcot_facturas_electronicas'
        ORDER BY table_name
      `);
    }
    
    if (tablaFacturas.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de facturas no encontrada' });
    }
    
    const nombreTabla = tablaFacturas.rows[0].table_name;
    const query = `DELETE FROM ${nombreTabla} WHERE id_factura = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    console.log('✅ Factura eliminada exitosamente');
    res.json({ message: 'Factura eliminada', factura: result.rows[0] });
  } catch (error) {
    console.error('❌ Error al eliminar factura:', error);
    res.status(500).json({ 
      error: 'Error al eliminar factura',
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
    
    // Buscar específicamente adcot_lineas_de_servicios primero
    let tablaLineas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_lineas_de_servicios'
    `);
    
    // Si no existe, buscar otras tablas relacionadas
    if (tablaLineas.rows.length === 0) {
      tablaLineas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%linea%' OR table_name LIKE '%servicio%'
        ORDER BY table_name
      `);
    }
    
    if (tablaLineas.rows.length === 0) {
      console.log('❌ No se encontraron tablas de líneas de servicios');
      return res.json([]);
    }
    
    const nombreTabla = tablaLineas.rows[0].table_name;
    console.log(`📊 Usando tabla de líneas de servicios: ${nombreTabla}`);
    
    const query = `SELECT * FROM ${nombreTabla} ORDER BY id_servicio DESC LIMIT 100`;
    const result = await pool.query(query);
    console.log(`✅ Encontradas ${result.rows.length} líneas de servicios`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener líneas de servicios:', error);
    res.status(500).json({ 
      error: 'Error al obtener líneas de servicios',
      details: error.message 
    });
  }
});

// Crear línea de servicio
app.post('/api/lineas-servicios', async (req, res) => {
  try {
    console.log('🔍 Creando línea de servicio...');
    
    // Buscar tabla de líneas de servicios
    let tablaLineas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_lineas_de_servicios'
    `);
    
    if (tablaLineas.rows.length === 0) {
      tablaLineas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%linea%' OR table_name LIKE '%servicio%'
        ORDER BY table_name
      `);
    }
    
    if (tablaLineas.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de líneas de servicios no encontrada' });
    }
    
    const nombreTabla = tablaLineas.rows[0].table_name;
    
    // Obtener columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_servicio'
      ORDER BY ordinal_position
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos' });
    }
    
    const valores = camposDelBody.map(campo => req.body[campo]);
    const placeholders = camposDelBody.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${nombreTabla} (${camposDelBody.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await pool.query(query, valores);
    console.log('✅ Línea de servicio creada exitosamente');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear línea de servicio:', error);
    res.status(500).json({ 
      error: 'Error al crear línea de servicio',
      details: error.message 
    });
  }
});

// Actualizar línea de servicio
app.put('/api/lineas-servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Actualizando línea de servicio ID: ${id}...`);
    console.log('📋 Datos recibidos:', req.body);
    
    // Buscar tabla de líneas de servicios
    let tablaLineas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_lineas_de_servicios'
    `);
    
    if (tablaLineas.rows.length === 0) {
      tablaLineas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%linea%' OR table_name LIKE '%servicio%'
        ORDER BY table_name
      `);
    }
    
    if (tablaLineas.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de líneas de servicios no encontrada' });
    }
    
    const nombreTabla = tablaLineas.rows[0].table_name;
    
    // Obtener columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND column_name != 'id_servicio'
    `);
    
    const camposDisponibles = columnas.rows.map(r => r.column_name);
    const camposDelBody = Object.keys(req.body).filter(key => camposDisponibles.includes(key));
    
    if (camposDelBody.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
    }
    
    const setClause = camposDelBody.map((campo, index) => `${campo} = $${index + 1}`).join(', ');
    const valores = camposDelBody.map(campo => req.body[campo]);
    
    const query = `
      UPDATE ${nombreTabla} 
      SET ${setClause}
      WHERE id_servicio = $${camposDelBody.length + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...valores, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Línea de servicio no encontrada' });
    }
    
    console.log('✅ Línea de servicio actualizada exitosamente');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar línea de servicio:', error);
    res.status(500).json({ 
      error: 'Error al actualizar línea de servicio',
      details: error.message 
    });
  }
});

// Eliminar línea de servicio
app.delete('/api/lineas-servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Eliminando línea de servicio ID: ${id}...`);
    
    // Buscar tabla de líneas de servicios
    let tablaLineas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'adcot_lineas_de_servicios'
    `);
    
    if (tablaLineas.rows.length === 0) {
      tablaLineas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%linea%' OR table_name LIKE '%servicio%'
        ORDER BY table_name
      `);
    }
    
    if (tablaLineas.rows.length === 0) {
      return res.status(404).json({ error: 'Tabla de líneas de servicios no encontrada' });
    }
    
    const nombreTabla = tablaLineas.rows[0].table_name;
    const query = `DELETE FROM ${nombreTabla} WHERE id_servicio = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Línea de servicio no encontrada' });
    }
    
    console.log('✅ Línea de servicio eliminada exitosamente');
    res.json({ message: 'Línea de servicio eliminada', lineaServicio: result.rows[0] });
  } catch (error) {
    console.error('❌ Error al eliminar línea de servicio:', error);
    res.status(500).json({ 
      error: 'Error al eliminar línea de servicio',
      details: error.message 
    });
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback para SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor usando PORT de Cloud Run
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
  
  // Configurar base de datos al arrancar
  try {
    console.log('🔧 Inicializando configuración de base de datos...');
    await initializeDatabase();
    pool = new Pool(dbConfig);
    
    // Probar conexión inicial
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('🎉 Servidor completamente inicializado y conectado a BD');
    } else {
      console.log('⚠️ Servidor iniciado pero sin conexión a BD');
    }
  } catch (error) {
    console.error('❌ Error al inicializar BD:', error);
  }
  
  console.log(`📊 Configuración final: ${dbConfig?.host}:${dbConfig?.port}`);
}); 