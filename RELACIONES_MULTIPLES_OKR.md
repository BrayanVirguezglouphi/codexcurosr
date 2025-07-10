# 🔗 Sistema de Relaciones Múltiples OKR

## 📋 **Resumen**
Se ha implementado un sistema completo de **relaciones múltiples** para el sistema OKR que permite:
- Un objetivo puede asociarse a **múltiples objetivos** existentes
- Un objetivo puede asociarse a **múltiples Key Results** existentes
- Configuración avanzada de tipos de relación, pesos e impactos

---

## 🗄️ **Base de Datos - Nuevas Tablas**

### **Tabla: `okr_relaciones_objetivos`**
Maneja relaciones **muchos-a-muchos** entre objetivos.

```sql
CREATE TABLE okr_relaciones_objetivos (
    id_relacion SERIAL PRIMARY KEY,
    id_objetivo_origen INTEGER NOT NULL REFERENCES okr_objetivos(id_objetivo) ON DELETE CASCADE,
    id_objetivo_destino INTEGER NOT NULL REFERENCES okr_objetivos(id_objetivo) ON DELETE CASCADE,
    tipo_relacion VARCHAR(50) NOT NULL DEFAULT 'contribuye_a',
    -- Tipos: 'contribuye_a', 'depende_de', 'alineado_con', 'bloquea_a', 'sucede_a'
    peso_relacion DECIMAL(3,2) DEFAULT 1.0, 
    -- Peso 0.1-1.0 para priorizar relaciones
    descripcion_relacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_modificacion TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT true
);
```

### **Tabla: `okr_relaciones_kr`**
Maneja relaciones **muchos-a-muchos** entre objetivos y Key Results.

```sql
CREATE TABLE okr_relaciones_kr (
    id_relacion SERIAL PRIMARY KEY,
    id_objetivo INTEGER NOT NULL REFERENCES okr_objetivos(id_objetivo) ON DELETE CASCADE,
    id_kr INTEGER NOT NULL REFERENCES okr_resultados_clave(id_kr) ON DELETE CASCADE,
    tipo_relacion VARCHAR(50) NOT NULL DEFAULT 'contribuye_a',
    -- Tipos: 'contribuye_a', 'impacta_en', 'depende_de', 'influye_en'
    peso_contribucion DECIMAL(3,2) DEFAULT 1.0,
    porcentaje_impacto INTEGER DEFAULT NULL, -- % estimado (1-100)
    descripcion_relacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_modificacion TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT true
);
```

---

## 🚀 **Instalación y Configuración**

### **1. Crear las Tablas**
```bash
# Ejecutar el script SQL en PostgreSQL
psql -d tu_base_de_datos -f scripts/create-okr-relations-tables.sql
```

### **2. Probar la Funcionalidad**
```bash
# Ejecutar script de pruebas
node scripts/test-relaciones-multiples.js
```

### **3. Reiniciar el Backend**
```bash
# Reiniciar para cargar las nuevas rutas API
npm run start:backend
# o
node back.cjs
```

---

## 🌐 **APIs Disponibles**

### **POST `/api/okr/relaciones-objetivos`**
Crear relación entre dos objetivos.

**Request Body:**
```json
{
  "id_objetivo_origen": 1,
  "id_objetivo_destino": 2,
  "tipo_relacion": "contribuye_a",
  "peso_relacion": 0.8,
  "descripcion_relacion": "El objetivo individual contribuye al objetivo de equipo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Relación entre objetivos creada exitosamente",
  "relacion": {
    "id_relacion": 1,
    "titulo_origen": "Objetivo Individual",
    "titulo_destino": "Objetivo de Equipo",
    "tipo_relacion": "contribuye_a",
    "peso_relacion": 0.8
  }
}
```

### **POST `/api/okr/relaciones-kr`**
Crear relación entre objetivo y Key Result.

**Request Body:**
```json
{
  "id_objetivo": 1,
  "id_kr": 5,
  "tipo_relacion": "contribuye_a",
  "peso_contribucion": 0.9,
  "porcentaje_impacto": 75,
  "descripcion_relacion": "Este objetivo contribuye significativamente al KR"
}
```

### **GET `/api/okr/objetivos/:id/relaciones`**
Obtener todas las relaciones de un objetivo específico.

**Response:**
```json
{
  "success": true,
  "relacionesObjetivos": [...],
  "relacionesKRs": [...],
  "total": 5
}
```

---

## 🎨 **Interfaz de Usuario**

### **Nueva Sección en Formulario de Creación**
- **Resumen visual**: Muestra contadores de objetivos y KRs relacionados
- **Botón "Agregar Relaciones"**: Abre modal para selección múltiple
- **Lista compacta**: Muestra relaciones seleccionadas con opciones de edición

### **Modal de Selección Múltiple**
- **Búsqueda avanzada**: Filtra objetivos y Key Results
- **Vista expandible**: Muestra KRs dentro de cada objetivo
- **Selección inteligente**: Previene duplicados
- **Estados visuales**: Indica items ya seleccionados

### **Configuración por Relación**
- **Tipo de relación**: Dropdown con opciones predefinidas
- **Peso/Importancia**: Slider numérico (0.1 - 1.0)
- **Porcentaje de impacto**: Campo opcional para KRs (1-100%)
- **Descripción**: Campo de texto libre

---

## 📊 **Tipos de Relaciones**

### **Entre Objetivos:**
- **`contribuye_a`**: El objetivo origen ayuda al destino
- **`depende_de`**: El objetivo origen necesita del destino
- **`alineado_con`**: Ambos objetivos están alineados
- **`bloquea_a`**: El objetivo origen impide al destino
- **`sucede_a`**: El objetivo origen viene después del destino

### **Con Key Results:**
- **`contribuye_a`**: El objetivo ayuda a lograr el KR
- **`impacta_en`**: El objetivo tiene impacto en el KR
- **`depende_de`**: El objetivo necesita del KR
- **`influye_en`**: El objetivo influye en el KR

---

## 🔧 **Características Técnicas**

### **Validaciones**
- ✅ Prevención de auto-referencias
- ✅ Verificación de existencia de objetivos/KRs
- ✅ Prevención de relaciones duplicadas
- ✅ Validación de rangos (peso, porcentaje)

### **Performance**
- 🚀 Índices optimizados en columnas clave
- 🚀 Consultas con JOINs eficientes
- 🚀 Búsqueda con filtros rápidos

### **Integridad**
- 🔒 Claves foráneas con CASCADE
- 🔒 Constraints de validación
- 🔒 Triggers automáticos para timestamps

---

## 🎯 **Casos de Uso**

### **Ejemplo 1: Cascada de Objetivos**
```
Objetivo Empresa → Objetivo Departamento → Objetivo Equipo → Objetivo Individual
```

### **Ejemplo 2: Matriz de Impacto**
```
Objetivo "Mejorar Procesos" → KR "Aumentar Ventas 20%"
                           → KR "Reducir Costos 15%"
                           → KR "Mejorar NPS a 80"
```

### **Ejemplo 3: Dependencias**
```
Objetivo "Lanzar Producto" depende_de Objetivo "Completar I+D"
```

---

## 📈 **Beneficios**

### **Para Gestores**
- 📊 **Visibilidad completa** de cómo los objetivos se interrelacionan
- 🎯 **Priorización inteligente** basada en pesos e impactos
- 📈 **Análisis de dependencias** para planificación estratégica

### **Para Equipos**
- 🤝 **Alineación clara** entre objetivos de diferentes niveles
- 💡 **Comprensión del impacto** de cada objetivo en los resultados
- 🔄 **Trazabilidad** de cómo el trabajo individual contribuye a metas mayores

### **Para la Organización**
- 🌐 **Coherencia estratégica** en toda la organización
- 📊 **Métricas avanzadas** de interconexión de objetivos
- 🚀 **Escalabilidad** para organizaciones complejas

---

## 🔍 **Próximos Pasos Sugeridos**

### **Visualización**
- [ ] Gráfico de red interactivo de relaciones
- [ ] Dashboard de impacto y dependencias
- [ ] Vista jerárquica de cascada de objetivos

### **Analytics**
- [ ] Métricas de alineación organizacional
- [ ] Análisis de cuellos de botella
- [ ] Recomendaciones automáticas de relaciones

### **Automatización**
- [ ] Propagación automática de progreso
- [ ] Alertas de dependencias en riesgo
- [ ] Sugerencias de relaciones basadas en ML

---

## 📞 **Soporte**

Si encuentras algún problema o tienes sugerencias:

1. **Revisa los logs** del backend para errores específicos
2. **Ejecuta el script de pruebas** para verificar la configuración
3. **Verifica las tablas** con el query de verificación incluido en el script SQL

**¡El sistema de relaciones múltiples está listo para usar! 🎉** 