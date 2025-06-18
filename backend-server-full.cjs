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

// Ruta para obtener transacciones reales
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
        c.titulo_cuenta
      FROM adcot_transacciones t
      LEFT JOIN adcot_tipos_transaccion tt ON t.id_tipotransaccion = tt.id_tipotransaccion
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
        titulo_cuenta: row.titulo_cuenta
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