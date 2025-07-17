import express from 'express';
import Tercero from '../models/Tercero.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Obtener todos los terceros
router.get('/', async (req, res) => {
  try {
    const { tipo_documento, numero_documento } = req.query;
    let query = `
      SELECT 
        t.*,
        r.tipo_relacion as nombre_tipo_relacion,
        d.tipo_documento as nombre_tipo_documento
      FROM adcot_terceros_exogenos t
      LEFT JOIN adcot_relacion_contractual r ON t.tipo_relacion = r.id_tiporelacion
      LEFT JOIN adcot_tipo_documento d ON t.tipo_documento = d.id_tipodocumento
    `;
    const params = [];
    if (tipo_documento && numero_documento) {
      query += ` WHERE t.id_tipo_documento = $1 AND t.numero_documento = $2`;
      params.push(tipo_documento, numero_documento);
    }
    query += ` ORDER BY t.id_tercero DESC`;
    
    // Log de depuración
    console.log('--- FILTRO TERCEROS ---');
    console.log('tipo_documento:', tipo_documento, 'numero_documento:', numero_documento);
    console.log('SQL:', query);
    console.log('params:', params);
    //

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener terceros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener un tercero por ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        r.tipo_relacion as nombre_tipo_relacion,
        d.tipo_documento as nombre_tipo_documento
      FROM adcot_terceros_exogenos t
      LEFT JOIN adcot_relacion_contractual r ON t.tipo_relacion = r.id_tiporelacion
      LEFT JOIN adcot_tipo_documento d ON t.tipo_documento = d.id_tipodocumento
      WHERE t.id_tercero = $1
    `;
    
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tercero no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener tercero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo tercero
router.post('/', async (req, res) => {
  try {
    // Eliminar id_tercero si viene en el body
    if ('id_tercero' in req.body) {
      delete req.body.id_tercero;
    }
    const nuevoTercero = await Tercero.create(req.body);
    res.status(201).json(nuevoTercero);
  } catch (error) {
    console.error('Error al crear tercero:', error);
    res.status(400).json({ message: 'Error al crear tercero', error: error.message });
  }
});

// Crear múltiples terceros (bulk-create)
router.post('/bulk-create', async (req, res) => {
  try {
    const { terceros } = req.body;
    
    if (!Array.isArray(terceros) || terceros.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de terceros no vacío' 
      });
    }

    // Validar datos requeridos
    for (const tercero of terceros) {
      if (!tercero.numero_documento || !tercero.tipo_relacion) {
        return res.status(400).json({ 
          error: 'Cada tercero debe tener al menos numero_documento y tipo_relacion' 
        });
      }
    }

    const nuevosTerceros = await Tercero.bulkCreate(terceros, {
      returning: true,
      validate: true
    });

    res.status(201).json({
      message: `${nuevosTerceros.length} terceros creados exitosamente`,
      terceros: nuevosTerceros
    });
  } catch (error) {
    console.error('Error al crear terceros en bulk:', error);
    res.status(400).json({ 
      error: 'Error al crear terceros', 
      details: error.message 
    });
  }
});

// Actualizar un tercero
router.put('/:id', async (req, res) => {
  try {
    console.log('BODY PUT TERCERO:', JSON.stringify(req.body, null, 2)); // Log completo
    const { nombre_consolidado, ...datosActualizar } = req.body;
    
    // Construir la consulta de actualización
    const setClauses = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(datosActualizar)) {
      if (value !== undefined && value !== null) {
        setClauses.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    // LOG de depuración para ver qué campos y valores se van a actualizar
    console.log('🟡 CAMPOS A ACTUALIZAR:', setClauses);
    console.log('🟡 VALORES A ACTUALIZAR:', values);

    // Agregar el ID a los valores
    values.push(req.params.id);
    
    const updateQuery = `
      UPDATE adcot_terceros_exogenos 
      SET ${setClauses.join(', ')}
      WHERE id_tercero = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tercero no encontrado' });
    }
    
    // Obtener el tercero actualizado con los datos de las tablas relacionadas
    const selectQuery = `
      SELECT 
        t.*,
        r.tipo_relacion as nombre_tipo_relacion,
        d.tipo_documento as nombre_tipo_documento
      FROM adcot_terceros_exogenos t
      LEFT JOIN adcot_relacion_contractual r ON t.tipo_relacion = r.id_tiporelacion
      LEFT JOIN adcot_tipo_documento d ON t.tipo_documento = d.id_tipodocumento
      WHERE t.id_tercero = $1
    `;
    
    const terceroActualizado = await pool.query(selectQuery, [req.params.id]);
    res.json(terceroActualizado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar tercero:', error);
    res.status(400).json({ message: 'Error al actualizar tercero', error: error.message });
  }
});

// Eliminar un tercero
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await Tercero.destroy({
      where: { id_tercero: req.params.id }
    });
    
    if (filasEliminadas === 0) {
      console.warn(`⚠️ Intento de eliminar un tercero que no existe o ya fue eliminado. ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Tercero no encontrado' });
    }
    
    res.json({ message: 'Tercero eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tercero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router; 