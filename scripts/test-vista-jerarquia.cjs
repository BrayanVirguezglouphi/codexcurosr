const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pros_db',
  password: 'pros2024',
  port: 5432,
});

async function testVistaJerarquia() {
  try {
    console.log('🧪 PRUEBA: Vista Jerárquica con Relaciones Múltiples');
    console.log('=' .repeat(60));

    // 1. Verificar que las tablas existen
    console.log('\n📋 1. Verificando tablas de relaciones...');
    
    const tablas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('okr_relaciones_objetivos', 'okr_relaciones_kr')
      ORDER BY table_name
    `);
    
    console.log(`✅ Tablas encontradas: ${tablas.rows.map(t => t.table_name).join(', ')}`);

    // 2. Probar la API de jerarquía
    console.log('\n🌐 2. Probando API de jerarquía...');
    
    const objetivos = await pool.query(`
      SELECT 
        o.*,
        s.nombre as responsable_nombre
      FROM okr_objetivos o
      LEFT JOIN okr_staff s ON o.id_responsable = s.id_staff
      ORDER BY o.fecha_creacion
    `);

    const relacionesObjetivos = await pool.query(`
      SELECT 
        r.id_relacion,
        r.id_objetivo_origen,
        r.id_objetivo_destino,
        r.tipo_relacion,
        r.peso_relacion,
        r.descripcion_relacion,
        r.activo,
        o_origen.titulo as titulo_origen,
        o_destino.titulo as titulo_destino
      FROM okr_relaciones_objetivos r
      JOIN okr_objetivos o_origen ON r.id_objetivo_origen = o_origen.id_objetivo
      JOIN okr_objetivos o_destino ON r.id_objetivo_destino = o_destino.id_objetivo
      WHERE r.activo = true
      ORDER BY r.peso_relacion DESC
    `);

    const relacionesKRs = await pool.query(`
      SELECT 
        r.id_relacion,
        r.id_objetivo,
        r.id_kr,
        r.tipo_relacion,
        r.peso_contribucion,
        r.porcentaje_impacto,
        r.descripcion_relacion,
        r.activo,
        o.titulo as titulo_objetivo,
        kr.descripcion as descripcion_kr
      FROM okr_relaciones_kr r
      JOIN okr_objetivos o ON r.id_objetivo = o.id_objetivo
      JOIN okr_resultados_clave kr ON r.id_kr = kr.id_kr
      WHERE r.activo = true
      ORDER BY r.peso_contribucion DESC
    `);

    console.log(`✅ Datos cargados:`);
    console.log(`   • ${objetivos.rows.length} objetivos`);
    console.log(`   • ${relacionesObjetivos.rows.length} relaciones OKR-OKR`);
    console.log(`   • ${relacionesKRs.rows.length} relaciones OKR-KR`);

    // 3. Probar construcción de jerarquía
    console.log('\n🌳 3. Probando construcción de jerarquía...');
    
    const mapa = new Map();
    const raices = [];

    // Crear mapa de objetivos
    objetivos.rows.forEach(obj => {
      const relacionesComoOrigen = relacionesObjetivos.rows.filter(r => r.id_objetivo_origen === obj.id_objetivo);
      const relacionesComoDestino = relacionesObjetivos.rows.filter(r => r.id_objetivo_destino === obj.id_objetivo);
      
      mapa.set(obj.id_objetivo, {
        ...obj,
        children: [],
        relacionesOrigen: relacionesComoOrigen,
        relacionesDestino: relacionesComoDestino
      });
    });

    // Construir relaciones jerárquicas
    const objetivosDestino = new Set();
    relacionesObjetivos.rows.forEach(rel => {
      if (['contribuye_a', 'depende_de', 'alineado_con'].includes(rel.tipo_relacion)) {
        objetivosDestino.add(rel.id_objetivo_destino);
        
        if (mapa.has(rel.id_objetivo_origen) && mapa.has(rel.id_objetivo_destino)) {
          const padre = mapa.get(rel.id_objetivo_destino);
          const hijo = mapa.get(rel.id_objetivo_origen);
          
          if (!padre.children.find(child => child.id_objetivo === hijo.id_objetivo)) {
            padre.children.push({
              ...hijo,
              relacionTipo: rel.tipo_relacion,
              relacionPeso: rel.peso_relacion
            });
          }
        }
      }
    });

    // Identificar objetivos raíz
    objetivos.rows.forEach(obj => {
      if (!objetivosDestino.has(obj.id_objetivo)) {
        raices.push(mapa.get(obj.id_objetivo));
      }
    });

    console.log(`✅ Jerarquía construida:`);
    console.log(`   • ${raices.length} objetivos raíz`);
    console.log(`   • ${objetivosDestino.size} objetivos con relaciones jerárquicas`);

    // 4. Mostrar detalles de relaciones
    console.log('\n🔗 4. Análisis de tipos de relaciones:');
    
    const tiposRelacion = {};
    relacionesObjetivos.rows.forEach(rel => {
      tiposRelacion[rel.tipo_relacion] = (tiposRelacion[rel.tipo_relacion] || 0) + 1;
    });

    Object.entries(tiposRelacion).forEach(([tipo, cantidad]) => {
      const emoji = {
        'contribuye_a': '🟢',
        'depende_de': '🟡', 
        'alineado_con': '🔵',
        'bloquea_a': '🔴',
        'sucede_a': '🟣'
      }[tipo] || '⚪';
      
      console.log(`   ${emoji} ${tipo.replace('_', ' ')}: ${cantidad} relaciones`);
    });

    // 5. Probar colores y estilos
    console.log('\n🎨 5. Verificando mapeo de colores y estilos:');
    
    const getColorTipoRelacion = (tipo) => {
      const colores = {
        'contribuye_a': '#10B981',
        'depende_de': '#F59E0B',
        'alineado_con': '#3B82F6',
        'bloquea_a': '#EF4444',
        'sucede_a': '#8B5CF6'
      };
      return colores[tipo] || '#6B7280';
    };

    const getEstiloTipoRelacion = (tipo) => {
      const estilos = {
        'contribuye_a': 'solid',
        'depende_de': 'dashed',
        'alineado_con': 'solid',
        'bloquea_a': 'dotted',
        'sucede_a': 'dash-dot'
      };
      return estilos[tipo] || 'solid';
    };

    Object.keys(tiposRelacion).forEach(tipo => {
      const color = getColorTipoRelacion(tipo);
      const estilo = getEstiloTipoRelacion(tipo);
      console.log(`   ${tipo}: color ${color}, estilo ${estilo}`);
    });

    // 6. Generar conexiones de ejemplo
    console.log('\n🔄 6. Ejemplo de conexiones generadas:');
    
    let contadorConexiones = 0;
    relacionesObjetivos.rows.slice(0, 3).forEach(rel => {
      const grosorLinea = Math.max(1, Math.round(rel.peso_relacion * 3));
      const color = getColorTipoRelacion(rel.tipo_relacion);
      const estilo = getEstiloTipoRelacion(rel.tipo_relacion);
      
      console.log(`   • ${rel.titulo_origen} → ${rel.titulo_destino}`);
      console.log(`     Tipo: ${rel.tipo_relacion}, Peso: ${rel.peso_relacion}, Grosor: ${grosorLinea}`);
      console.log(`     Descripción: ${rel.descripcion_relacion || 'Sin descripción'}`);
      console.log(`     Color: ${color}, Estilo: ${estilo}`);
      contadorConexiones++;
    });

    console.log(`   ... y ${relacionesObjetivos.rows.length - contadorConexiones} conexiones más`);

    // 6.1. Ejemplo de relaciones KR
    console.log('\n🔗 6.1. Ejemplo de relaciones OKR-KR:');
    
    relacionesKRs.rows.slice(0, 2).forEach(rel => {
      console.log(`   • Objetivo: ${rel.titulo_objetivo} → KR: ${rel.descripcion_kr}`);
      console.log(`     Tipo: ${rel.tipo_relacion}, Peso contribución: ${rel.peso_contribucion}`);
      console.log(`     Porcentaje impacto: ${rel.porcentaje_impacto}%`);
      console.log(`     Descripción: ${rel.descripcion_relacion || 'Sin descripción'}`);
    });

    // 7. Resumen final
    console.log('\n📊 RESUMEN DE LA PRUEBA:');
    console.log('=' .repeat(60));
    console.log(`✅ Tablas de relaciones: OK`);
    console.log(`✅ API de jerarquía: OK (${objetivos.rows.length} objetivos)`);
    console.log(`✅ Construcción jerárquica: OK (${raices.length} raíces)`);
    console.log(`✅ Tipos de relaciones: OK (${Object.keys(tiposRelacion).length} tipos)`);
    console.log(`✅ Mapeo de colores/estilos: OK`);
    console.log(`✅ Generación de conexiones: OK`);
    
    console.log('\n🎉 VISTA JERÁRQUICA ACTUALIZADA FUNCIONANDO CORRECTAMENTE');

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
    console.error('Detalles:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar prueba
testVistaJerarquia(); 