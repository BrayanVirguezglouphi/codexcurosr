const { Pool } = require('pg');

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'okr_system',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function testRelacionesMultiples() {
  try {
    console.log('🚀 Iniciando pruebas de relaciones múltiples OKR...\n');

    // 1. Verificar que las tablas de relaciones existan
    console.log('1️⃣ Verificando tablas de relaciones...');
    
    const tablaObjetivos = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'okr_relaciones_objetivos'
    `);
    
    const tablaKRs = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'okr_relaciones_kr'
    `);

    if (tablaObjetivos.rows.length === 0) {
      console.log('❌ Tabla okr_relaciones_objetivos no existe');
      console.log('📋 Ejecuta primero: psql -d tu_base_de_datos -f scripts/create-okr-relations-tables.sql');
      return;
    }

    if (tablaKRs.rows.length === 0) {
      console.log('❌ Tabla okr_relaciones_kr no existe');
      console.log('📋 Ejecuta primero: psql -d tu_base_de_datos -f scripts/create-okr-relations-tables.sql');
      return;
    }

    console.log('✅ Tablas de relaciones encontradas\n');

    // 2. Crear objetivos de prueba (si no existen)
    console.log('2️⃣ Creando objetivos de prueba...');
    
    const objetivos = [
      {
        titulo: 'Aumentar Ventas Q1 2024',
        descripcion: 'Incrementar las ventas en un 25% durante el primer trimestre',
        nivel: 'Empresa',
        estado: 'Activo',
        id_responsable: 1
      },
      {
        titulo: 'Mejorar Satisfacción del Cliente',
        descripcion: 'Alcanzar un NPS de 80+ puntos',
        nivel: 'Departamento',
        estado: 'Activo',
        id_responsable: 1
      },
      {
        titulo: 'Optimizar Procesos Internos',
        descripcion: 'Reducir tiempos de procesamiento en un 30%',
        nivel: 'Equipo',
        estado: 'Activo',
        id_responsable: 1
      }
    ];

    const objetivosCreados = [];
    
    for (const objetivo of objetivos) {
      try {
        const result = await pool.query(`
          INSERT INTO okr_objetivos (titulo, descripcion, nivel, estado, id_responsable)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [objetivo.titulo, objetivo.descripcion, objetivo.nivel, objetivo.estado, objetivo.id_responsable]);
        
        objetivosCreados.push(result.rows[0]);
        console.log(`   ✅ Creado: ${objetivo.titulo}`);
      } catch (error) {
        if (error.code === '23505') { // Duplicado
          const existing = await pool.query(`
            SELECT * FROM okr_objetivos WHERE titulo = $1
          `, [objetivo.titulo]);
          objetivosCreados.push(existing.rows[0]);
          console.log(`   ℹ️  Ya existe: ${objetivo.titulo}`);
        } else {
          throw error;
        }
      }
    }

    // 3. Crear Key Results de prueba
    console.log('\n3️⃣ Creando Key Results de prueba...');
    
    const keyResults = [
      {
        id_objetivo: objetivosCreados[0].id_objetivo,
        descripcion: 'Cerrar 100 nuevas ventas',
        valor_objetivo: 100,
        unidad: 'ventas'
      },
      {
        id_objetivo: objetivosCreados[1].id_objetivo,
        descripcion: 'Alcanzar NPS de 80 puntos',
        valor_objetivo: 80,
        unidad: 'puntos'
      },
      {
        id_objetivo: objetivosCreados[2].id_objetivo,
        descripcion: 'Reducir tiempo de procesamiento a 2 horas',
        valor_objetivo: 2,
        unidad: 'horas'
      }
    ];

    const keyResultsCreados = [];
    
    for (const kr of keyResults) {
      try {
        const result = await pool.query(`
          INSERT INTO okr_resultados_clave (id_objetivo, descripcion, valor_objetivo, unidad)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [kr.id_objetivo, kr.descripcion, kr.valor_objetivo, kr.unidad]);
        
        keyResultsCreados.push(result.rows[0]);
        console.log(`   ✅ Creado KR: ${kr.descripcion}`);
      } catch (error) {
        if (error.code === '23505') { // Duplicado
          console.log(`   ℹ️  KR ya existe: ${kr.descripcion}`);
        } else {
          throw error;
        }
      }
    }

    // 4. Probar relaciones entre objetivos
    console.log('\n4️⃣ Probando relaciones entre objetivos...');
    
    const relacionesObjetivos = [
      {
        id_objetivo_origen: objetivosCreados[2].id_objetivo, // Procesos Internos
        id_objetivo_destino: objetivosCreados[0].id_objetivo, // Ventas
        tipo_relacion: 'contribuye_a',
        peso_relacion: 0.8,
        descripcion_relacion: 'Procesos optimizados contribuyen al aumento de ventas'
      },
      {
        id_objetivo_origen: objetivosCreados[1].id_objetivo, // Satisfacción Cliente
        id_objetivo_destino: objetivosCreados[0].id_objetivo, // Ventas
        tipo_relacion: 'contribuye_a',
        peso_relacion: 0.9,
        descripcion_relacion: 'Clientes satisfechos generan más ventas'
      }
    ];

    for (const relacion of relacionesObjetivos) {
      try {
        const result = await pool.query(`
          INSERT INTO okr_relaciones_objetivos 
          (id_objetivo_origen, id_objetivo_destino, tipo_relacion, peso_relacion, descripcion_relacion)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [relacion.id_objetivo_origen, relacion.id_objetivo_destino, relacion.tipo_relacion, relacion.peso_relacion, relacion.descripcion_relacion]);
        
        console.log(`   ✅ Relación creada: ${relacion.descripcion_relacion}`);
      } catch (error) {
        if (error.code === '23505') { // Duplicado
          console.log(`   ℹ️  Relación ya existe`);
        } else {
          throw error;
        }
      }
    }

    // 5. Probar relaciones con Key Results
    console.log('\n5️⃣ Probando relaciones con Key Results...');
    
    if (keyResultsCreados.length > 0) {
      const relacionesKRs = [
        {
          id_objetivo: objetivosCreados[2].id_objetivo, // Procesos Internos
          id_kr: keyResultsCreados[0]?.id_kr, // KR de Ventas
          tipo_relacion: 'impacta_en',
          peso_contribucion: 0.7,
          porcentaje_impacto: 60,
          descripcion_relacion: 'Procesos optimizados impactan en las ventas'
        },
        {
          id_objetivo: objetivosCreados[1].id_objetivo, // Satisfacción Cliente
          id_kr: keyResultsCreados[0]?.id_kr, // KR de Ventas
          tipo_relacion: 'contribuye_a',
          peso_contribucion: 0.9,
          porcentaje_impacto: 75,
          descripcion_relacion: 'Satisfacción del cliente contribuye directamente a las ventas'
        }
      ];

      for (const relacion of relacionesKRs) {
        if (relacion.id_kr) {
          try {
            const result = await pool.query(`
              INSERT INTO okr_relaciones_kr 
              (id_objetivo, id_kr, tipo_relacion, peso_contribucion, porcentaje_impacto, descripcion_relacion)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *
            `, [relacion.id_objetivo, relacion.id_kr, relacion.tipo_relacion, relacion.peso_contribucion, relacion.porcentaje_impacto, relacion.descripcion_relacion]);
            
            console.log(`   ✅ Relación KR creada: ${relacion.descripcion_relacion}`);
          } catch (error) {
            if (error.code === '23505') { // Duplicado
              console.log(`   ℹ️  Relación KR ya existe`);
            } else {
              throw error;
            }
          }
        }
      }
    }

    // 6. Verificar resultados
    console.log('\n6️⃣ Verificando resultados...');
    
    // Contar relaciones
    const totalRelacionesObjetivos = await pool.query('SELECT COUNT(*) as total FROM okr_relaciones_objetivos WHERE activo = true');
    const totalRelacionesKRs = await pool.query('SELECT COUNT(*) as total FROM okr_relaciones_kr WHERE activo = true');
    
    console.log(`   📊 Total relaciones entre objetivos: ${totalRelacionesObjetivos.rows[0].total}`);
    console.log(`   📊 Total relaciones con Key Results: ${totalRelacionesKRs.rows[0].total}`);

    // Mostrar relaciones del objetivo principal (Ventas)
    console.log(`\n📋 Relaciones del objetivo "${objetivosCreados[0].titulo}":`);
    
    const relacionesDelObjetivo = await pool.query(`
      SELECT 
        'objetivo' as tipo,
        o.titulo as relacionado_con,
        r.tipo_relacion,
        r.peso_relacion as peso,
        r.descripcion_relacion as descripcion
      FROM okr_relaciones_objetivos r
      JOIN okr_objetivos o ON r.id_objetivo_origen = o.id_objetivo
      WHERE r.id_objetivo_destino = $1 AND r.activo = true
      
      UNION ALL
      
      SELECT 
        'key_result' as tipo,
        kr.descripcion as relacionado_con,
        r.tipo_relacion,
        r.peso_contribucion as peso,
        r.descripcion_relacion as descripcion
      FROM okr_relaciones_kr r
      JOIN okr_resultados_clave kr ON r.id_kr = kr.id_kr
      JOIN okr_objetivos o ON kr.id_objetivo = o.id_objetivo
      WHERE o.id_objetivo = $1 AND r.activo = true
    `, [objetivosCreados[0].id_objetivo]);

    relacionesDelObjetivo.rows.forEach(rel => {
      console.log(`   🔗 ${rel.tipo}: ${rel.relacionado_con} (${rel.tipo_relacion}, peso: ${rel.peso})`);
    });

    console.log('\n✅ ¡Pruebas completadas exitosamente!\n');
    console.log('🎯 Puedes ahora usar el formulario para crear objetivos con relaciones múltiples');
    console.log('🌐 Las rutas de API están disponibles en:');
    console.log('   - POST /api/okr/relaciones-objetivos');
    console.log('   - POST /api/okr/relaciones-kr');
    console.log('   - GET /api/okr/objetivos/:id/relaciones');

  } catch (error) {
    console.error('💥 Error en las pruebas:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar las pruebas
testRelacionesMultiples(); 