-- Script para crear tablas de relaciones múltiples en PostgreSQL
-- Sistema OKR: Un objetivo puede asociarse a múltiples objetivos y Key Results

-- ===== TABLA 1: Relaciones entre Objetivos (OKR → múltiples OKRs) =====
CREATE TABLE IF NOT EXISTS okr_relaciones_objetivos (
    id_relacion SERIAL PRIMARY KEY,
    id_objetivo_origen INTEGER NOT NULL REFERENCES okr_objetivos(id_objetivo) ON DELETE CASCADE,
    id_objetivo_destino INTEGER NOT NULL REFERENCES okr_objetivos(id_objetivo) ON DELETE CASCADE,
    tipo_relacion VARCHAR(50) NOT NULL DEFAULT 'contribuye_a',
    -- Tipos: 'contribuye_a', 'depende_de', 'alineado_con', 'bloquea_a', 'sucede_a'
    peso_relacion DECIMAL(3,2) DEFAULT 1.0, 
    -- Peso 0.1-1.0 para priorizar relaciones (1.0 = alta importancia)
    descripcion_relacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_modificacion TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT true,
    
    -- Evitar duplicados
    CONSTRAINT uk_relacion_objetivos UNIQUE (id_objetivo_origen, id_objetivo_destino, tipo_relacion),
    -- Evitar auto-referencias
    CONSTRAINT ck_no_self_reference CHECK (id_objetivo_origen != id_objetivo_destino)
);

-- ===== TABLA 2: Relaciones OKR → múltiples Key Results =====
CREATE TABLE IF NOT EXISTS okr_relaciones_kr (
    id_relacion SERIAL PRIMARY KEY,
    id_objetivo INTEGER NOT NULL REFERENCES okr_objetivos(id_objetivo) ON DELETE CASCADE,
    id_kr INTEGER NOT NULL REFERENCES okr_resultados_clave(id_kr) ON DELETE CASCADE,
    tipo_relacion VARCHAR(50) NOT NULL DEFAULT 'contribuye_a',
    -- Tipos: 'contribuye_a', 'impacta_en', 'depende_de', 'influye_en'
    peso_contribucion DECIMAL(3,2) DEFAULT 1.0,
    -- Peso de cómo este objetivo contribuye al KR (0.1-1.0)
    porcentaje_impacto INTEGER DEFAULT NULL,
    -- % estimado de impacto (opcional, 1-100)
    descripcion_relacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_modificacion TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT true,
    
    -- Evitar duplicados
    CONSTRAINT uk_relacion_kr UNIQUE (id_objetivo, id_kr, tipo_relacion),
    -- Validar porcentaje
    CONSTRAINT ck_porcentaje_valido CHECK (porcentaje_impacto IS NULL OR (porcentaje_impacto >= 1 AND porcentaje_impacto <= 100))
);

-- ===== ÍNDICES para mejorar rendimiento =====
CREATE INDEX IF NOT EXISTS idx_relaciones_objetivos_origen ON okr_relaciones_objetivos(id_objetivo_origen);
CREATE INDEX IF NOT EXISTS idx_relaciones_objetivos_destino ON okr_relaciones_objetivos(id_objetivo_destino);
CREATE INDEX IF NOT EXISTS idx_relaciones_objetivos_tipo ON okr_relaciones_objetivos(tipo_relacion);
CREATE INDEX IF NOT EXISTS idx_relaciones_objetivos_activo ON okr_relaciones_objetivos(activo);

CREATE INDEX IF NOT EXISTS idx_relaciones_kr_objetivo ON okr_relaciones_kr(id_objetivo);
CREATE INDEX IF NOT EXISTS idx_relaciones_kr_kr ON okr_relaciones_kr(id_kr);
CREATE INDEX IF NOT EXISTS idx_relaciones_kr_tipo ON okr_relaciones_kr(tipo_relacion);
CREATE INDEX IF NOT EXISTS idx_relaciones_kr_activo ON okr_relaciones_kr(activo);

-- ===== TRIGGERS para actualizar fecha_modificacion automáticamente =====
CREATE OR REPLACE FUNCTION update_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_update_relaciones_objetivos_fecha
    BEFORE UPDATE ON okr_relaciones_objetivos
    FOR EACH ROW EXECUTE FUNCTION update_fecha_modificacion();

CREATE TRIGGER tr_update_relaciones_kr_fecha
    BEFORE UPDATE ON okr_relaciones_kr
    FOR EACH ROW EXECUTE FUNCTION update_fecha_modificacion();

-- ===== COMENTARIOS para documentar las tablas =====
COMMENT ON TABLE okr_relaciones_objetivos IS 'Relaciones muchos-a-muchos entre objetivos OKR';
COMMENT ON COLUMN okr_relaciones_objetivos.tipo_relacion IS 'Tipo de relación: contribuye_a, depende_de, alineado_con, bloquea_a, sucede_a';
COMMENT ON COLUMN okr_relaciones_objetivos.peso_relacion IS 'Peso de la relación (0.1-1.0), donde 1.0 es alta importancia';

COMMENT ON TABLE okr_relaciones_kr IS 'Relaciones muchos-a-muchos entre objetivos OKR y Key Results';
COMMENT ON COLUMN okr_relaciones_kr.tipo_relacion IS 'Tipo de relación: contribuye_a, impacta_en, depende_de, influye_en';
COMMENT ON COLUMN okr_relaciones_kr.peso_contribucion IS 'Peso de contribución del objetivo al KR (0.1-1.0)';
COMMENT ON COLUMN okr_relaciones_kr.porcentaje_impacto IS 'Porcentaje estimado de impacto del objetivo en el KR (1-100%)';

-- ===== DATOS DE PRUEBA (opcional) =====
-- Descomenta para insertar datos de ejemplo
/*
-- Ejemplo: Objetivo 1 contribuye a objetivos 2 y 3
INSERT INTO okr_relaciones_objetivos (id_objetivo_origen, id_objetivo_destino, tipo_relacion, peso_relacion, descripcion_relacion)
VALUES 
(1, 2, 'contribuye_a', 0.8, 'El objetivo individual contribuye al objetivo de equipo'),
(1, 3, 'alineado_con', 0.6, 'Alineado con el objetivo departamental');

-- Ejemplo: Objetivo 1 impacta en Key Results específicos
INSERT INTO okr_relaciones_kr (id_objetivo, id_kr, tipo_relacion, peso_contribucion, porcentaje_impacto, descripcion_relacion)
VALUES 
(1, 5, 'contribuye_a', 0.9, 75, 'Contribuye significativamente a este KR'),
(1, 8, 'impacta_en', 0.5, 30, 'Impacto moderado en este KR');
*/

-- ===== VERIFICACIÓN =====
-- Ver estructura de las tablas creadas
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('okr_relaciones_objetivos', 'okr_relaciones_kr')
ORDER BY table_name, ordinal_position; 