# 🔗 Funcionalidad de Objetivos Preexistentes

## 📋 Descripción General
Se ha implementado la funcionalidad para relacionar objetivos OKR con otros objetivos preexistentes a través del campo `id_objetivo_preexistente`. Esta característica permite crear jerarquías organizacionales y dependencias entre objetivos.

## 🎯 Propósito
- **Jerarquía Organizacional**: Crear una estructura donde objetivos de nivel inferior contribuyen a objetivos de nivel superior
- **Dependencias**: Establecer relaciones donde un objetivo depende del cumplimiento de otro
- **Alineación Estratégica**: Conectar objetivos individuales/de equipo con objetivos departamentales/empresariales
- **Trazabilidad**: Seguir el impacto de objetivos específicos en la estrategia global

## 🔧 Componentes Modificados

### Backend (`back.cjs`)
#### Endpoints Actualizados:
- **POST `/api/okr/objetivos`**: Acepta `id_objetivo_preexistente` en la creación
- **PUT `/api/okr/objetivos/:id`**: Permite actualizar la relación con objetivo preexistente

```javascript
// Estructura de datos
{
  titulo: "string",
  descripcion: "string",
  nivel: "string",
  id_responsable: "integer",
  fecha_inicio: "date",
  fecha_fin: "date", 
  estado: "string",
  id_objetivo_preexistente: "integer|null", // ← Nueva funcionalidad
  nivel_impacto: "integer"
}
```

### Frontend

#### CrearObjetivoDialog.jsx
- ✅ **Campo de selección**: Dropdown con objetivos existentes
- ✅ **Carga dinámica**: Lista actualizada de objetivos disponibles
- ✅ **Información detallada**: Muestra estado, nivel y responsable de cada objetivo
- ✅ **Validación**: Permite seleccionar "Sin objetivo preexistente"
- ✅ **UX mejorada**: Texto explicativo sobre el propósito de la relación

#### EditarObjetivoDialog.jsx
- ✅ **Edición de relación**: Permite modificar la relación existente
- ✅ **Exclusión inteligente**: No muestra el objetivo actual en la lista de opciones
- ✅ **Preservación de datos**: Mantiene la relación actual al cargar el formulario

## 🖥️ Interfaz de Usuario

### Crear Objetivo
```
┌─ Relacionar con Objetivo Preexistente (Opcional) ─────────┐
│ 🔗 [Dropdown con objetivos]                               │
│                                                           │
│ Opciones disponibles:                                     │
│ 🚫 Sin objetivo preexistente                             │
│ 🎯 Aumentar ventas en Q1                                 │
│    Activo • Empresa • Juan Pérez                         │
│ 🎯 Mejorar satisfacción del cliente                      │
│    En Riesgo • Departamento • Ana García                 │
│                                                           │
│ 💡 Al relacionar este objetivo con uno preexistente,     │
│    se crea una dependencia o jerarquía. Útil para        │
│    objetivos que contribuyen a un objetivo mayor.        │
└───────────────────────────────────────────────────────────┘
```

### Editar Objetivo
- Misma interfaz que crear, pero excluye el objetivo actual de las opciones
- Muestra la relación actual si existe
- Permite cambiar o quitar la relación

## 📊 Casos de Uso

### 1. Jerarquía Organizacional
```
🏢 Objetivo Empresa: "Aumentar ingresos 30% en 2024"
    └── 🏛️ Objetivo Departamento: "Incrementar conversión web 25%"
        └── 👥 Objetivo Equipo: "Optimizar landing pages"
            └── 👤 Objetivo Individual: "Rediseñar formulario de contacto"
```

### 2. Dependencias Estratégicas
```
🎯 Objetivo Principal: "Lanzar nuevo producto en Q2"
    ├── 🔗 Objetivo Dependiente: "Completar desarrollo del producto"
    ├── 🔗 Objetivo Dependiente: "Ejecutar campaña de marketing"
    └── 🔗 Objetivo Dependiente: "Capacitar equipo de ventas"
```

### 3. Contribución Cross-Funcional
```
🎯 Objetivo CRM: "Mejorar retención de clientes"
    ├── 🔗 Objetivo RRHH: "Capacitar equipo atención al cliente"
    ├── 🔗 Objetivo Tech: "Implementar sistema de tickets"
    └── 🔗 Objetivo Marketing: "Crear programa de fidelización"
```

## 🗄️ Estructura de Base de Datos

### Tabla: `okr_objetivos`
```sql
CREATE TABLE okr_objetivos (
    id_objetivo SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    nivel VARCHAR(50) NOT NULL,
    id_responsable INTEGER NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'Activo',
    id_objetivo_preexistente INTEGER REFERENCES okr_objetivos(id_objetivo), -- ← Relación
    nivel_impacto INTEGER,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

### Relación Self-Join
- **Tipo**: Uno a Muchos (1:N)
- **Descripción**: Un objetivo puede tener múltiples objetivos dependientes
- **Constraint**: Un objetivo no puede relacionarse consigo mismo (validado en frontend)

## 🔍 Consultas Útiles

### Obtener jerarquía completa
```sql
WITH RECURSIVE jerarquia_objetivos AS (
    -- Objetivos raíz (sin preexistente)
    SELECT id_objetivo, titulo, nivel, id_objetivo_preexistente, 0 as nivel_jerarquia
    FROM okr_objetivos 
    WHERE id_objetivo_preexistente IS NULL
    
    UNION ALL
    
    -- Objetivos dependientes
    SELECT o.id_objetivo, o.titulo, o.nivel, o.id_objetivo_preexistente, j.nivel_jerarquia + 1
    FROM okr_objetivos o
    INNER JOIN jerarquia_objetivos j ON o.id_objetivo_preexistente = j.id_objetivo
)
SELECT * FROM jerarquia_objetivos ORDER BY nivel_jerarquia, titulo;
```

### Objetivos por nivel jerárquico
```sql
SELECT 
    CASE 
        WHEN id_objetivo_preexistente IS NULL THEN 'Objetivo Raíz'
        ELSE 'Objetivo Dependiente'
    END as tipo_objetivo,
    COUNT(*) as cantidad
FROM okr_objetivos 
GROUP BY (id_objetivo_preexistente IS NULL);
```

## 🚀 Beneficios Implementados

### Para la Organización
- ✅ **Alineación Estratégica**: Todos los objetivos conectados con la estrategia empresarial
- ✅ **Visibilidad**: Clara comprensión de cómo contribuye cada objetivo al plan general
- ✅ **Responsabilidad**: Identificación de dependencias entre equipos/personas

### Para los Usuarios
- ✅ **Contexto Claro**: Entienden cómo su trabajo impacta objetivos mayores
- ✅ **Priorización**: Facilita la toma de decisiones sobre qué objetivos priorizar
- ✅ **Colaboración**: Identifica oportunidades de trabajo conjunto

### Para el Sistema
- ✅ **Trazabilidad**: Seguimiento del impacto en cascada
- ✅ **Reportes**: Posibilidad de generar dashboards jerárquicos
- ✅ **Flexibilidad**: Estructura adaptable a diferentes organizaciones

## 🔄 Próximas Mejoras Sugeridas

### Visualización
- [ ] Dashboard de jerarquía visual (árbol/organigrama)
- [ ] Indicadores de progreso en cascada
- [ ] Vista de dependencias críticas

### Funcionalidad Avanzada
- [ ] Alertas cuando un objetivo preexistente cambia de estado
- [ ] Cálculo automático de impacto en objetivos dependientes
- [ ] Validación de fechas coherentes en la jerarquía

### Reportes
- [ ] Reporte de alineación estratégica
- [ ] Dashboard de contribución por nivel organizacional
- [ ] Métricas de interdependencia

---
*Documentación técnica generada: ${new Date().toLocaleDateString('es-ES')}* 