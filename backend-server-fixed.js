import express from 'express';
import cors from 'cors';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

// Importar rutas
import facturasRoutes from './src/routes/facturas.js';
import transaccionesRoutes from './src/routes/transacciones.js';
import catalogosRouter from './src/routes/catalogos.js';
import setupRelationships from './src/models/relationships.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '12345',
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
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario aún existe en la base de datos
    const result = await pool.query('SELECT id, name, email, role FROM "Users" WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Usuario no encontrado' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// ENDPOINTS DE AUTENTICACIÓN

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Intento de login para:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email
    const query = 'SELECT * FROM "Users" WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const user = result.rows[0];
    console.log('👤 Usuario encontrado:', { id: user.id, email: user.email, name: user.name });

    // Verificar contraseña
    if (password !== user.password) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    console.log('✅ Login exitoso para:', email);

    // Actualizar fecha de último acceso
    try {
      await pool.query(
        'UPDATE "Users" SET "updatedAt" = NOW() WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.log('⚠️ No se pudo actualizar fecha de acceso');
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
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
    const query = 'SELECT id, name, email, role, "createdAt", "updatedAt" FROM "Users" WHERE id = $1';
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
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nombre, email y contraseña son requeridos' 
      });
    }

    // Verificar si el email ya existe
    const existingUser = await pool.query('SELECT id FROM "Users" WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Insertar nuevo usuario
    const result = await pool.query(
      'INSERT INTO "Users" (name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, name, email, role, "createdAt", "updatedAt"',
      [name, email, password, role || 'user']
    );

    const newUser = result.rows[0];

    // Generar JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
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
    dbConnected,
    relationshipsInitialized,
    timestamp: new Date().toISOString()
  });
});

// Rutas API
app.use('/api/facturas', facturasRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/catalogos', catalogosRouter);

// Servir SPA build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: err.message });
});

// Inicializar relaciones de la base de datos
let relationshipsInitialized = false;

// Middleware de base de datos
app.use(async (req, res, next) => {
  try {
    if (!pool) {
      await initializeDatabase();
      pool = new Pool(dbConfig);
    }
    if (!relationshipsInitialized) {
      setupRelationships();
      relationshipsInitialized = true;
    }
    next();
  } catch (err) {
    console.error('❌ DB error:', err);
    next();
  }
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