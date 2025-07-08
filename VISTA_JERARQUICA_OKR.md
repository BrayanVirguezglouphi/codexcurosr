# Vista Jerárquica OKR - Documentación Técnica

## Descripción General

La Vista Jerárquica OKR es una funcionalidad avanzada que permite visualizar los objetivos y resultados clave (OKR) como un diagrama organizacional jerárquico, mostrando las relaciones entre objetivos de forma visual e intuitiva.

## Características Principales

### 1. Visualización Jerárquica
- **Diagrama Tipo Organigrama**: Los objetivos se muestran como nodos conectados visualmente
- **Conexiones SVG**: Líneas animadas que muestran las relaciones padre-hijo entre objetivos
- **Layout Automático**: Cálculo automático de posiciones para evitar solapamientos

### 2. Diferenciación Visual por Nivel
- **🏢 Empresa**: Gradiente azul-morado con identidad corporativa
- **🏛️ Departamento**: Gradiente rosa-rojo para nivel departamental  
- **👥 Equipo**: Gradiente azul-cian para equipos de trabajo
- **👤 Individual**: Gradiente verde-turquesa para objetivos personales

### 3. Estados Visuales
- **🟢 Activo**: Indicadores verdes con progreso normal
- **✅ Completado**: Borde verde brillante con efecto glow
- **⚠️ En Riesgo**: Borde amarillo con alerta visual
- **⏸️ Pausado**: Efectos de opacidad y escala de grises

### 4. Información Contextual
Cada nodo muestra:
- Título del objetivo
- Responsable asignado
- Nivel organizacional
- Estado actual
- Progreso de Key Results
- Relaciones con otros objetivos

### 5. Controles Interactivos
- **Filtros Inteligentes**: Por nivel y estado
- **Acciones por Nodo**: Ver, editar, eliminar
- **Navegación Fluida**: Entre vista lista y jerárquica
- **Limpieza de Filtros**: Reset rápido de filtros aplicados

### 6. Controles de Zoom y Navegación
- **Zoom In/Out**: Botones + y - para acercar/alejar (30% - 300%)
- **Zoom con Rueda**: Control preciso con scroll del mouse
- **Pan/Arrastre**: Click y arrastre para mover la vista
- **Ajustar a Pantalla**: Auto-fit para ver todos los objetivos
- **Reset Vista**: Volver al zoom y posición original
- **Indicador Visual**: Porcentaje de zoom en tiempo real

## Implementación Técnica

### Archivos Principales

```
src/pages/gestion/okr/components/OKRHierarchyView.jsx
src/styles/okr-hierarchy.css
src/pages/gestion/okr/OKRView.jsx (modificado)
```

### Algoritmo de Layout

```javascript
// Construcción de jerarquía
const construirJerarquia = () => {
  // 1. Crear mapa de objetivos
  // 2. Vincular relaciones padre-hijo usando id_objetivo_preexistente
  // 3. Identificar nodos raíz (sin padre)
  // 4. Construir estructura de árbol
}

// Cálculo de posiciones
const calcularPosiciones = (nodos, nivel, indice, espacioH, espacioV) => {
  // 1. Posicionamiento horizontal basado en índice
  // 2. Posicionamiento vertical basado en nivel
  // 3. Espaciado dinámico según cantidad de hijos
  // 4. Recursión para niveles anidados
}
```

### Generación de Conexiones SVG

```javascript
const generarConexiones = (posiciones) => {
  // 1. Para cada nodo padre
  // 2. Generar líneas hacia sus hijos
  // 3. Calcular puntos de conexión
  // 4. Crear paths SVG con curvas
}
```

## Componentes UI Utilizados

### De Shadcn/UI
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: Navegación entre vistas
- `Select`, `SelectContent`, `SelectItem`: Filtros de nivel y estado
- `Button`: Controles de acción
- `Badge`: Indicadores de estado y nivel
- `Card`: Contenedores de información

### De Lucide React
- `TreePine`: Icono principal de vista jerárquica
- `Filter`, `RotateCcw`: Controles de filtrado
- `Eye`, `Edit`, `Trash2`: Acciones por objetivo
- `Plus`: Crear nuevo objetivo

### Framer Motion
- Animaciones de entrada por nodo
- Transiciones suaves entre estados
- Efectos hover y interacción

## Estilos CSS Personalizados

### Clases Principales
```css
.okr-hierarchy-container  /* Contenedor principal con gradiente */
.okr-node                 /* Nodo base con glassmorphism */
.okr-node:hover          /* Efectos hover con elevación */
.connection-line         /* Líneas animadas de conexión */
```

### Clases por Nivel
```css
.nivel-empresa           /* Gradiente azul-morado */
.nivel-departamento      /* Gradiente rosa-rojo */
.nivel-equipo           /* Gradiente azul-cian */
.nivel-individual       /* Gradiente verde-turquesa */
```

### Clases por Estado
```css
.estado-completado      /* Borde verde con glow */
.estado-en-riesgo       /* Borde amarillo con alerta */
.estado-pausado         /* Opacidad reducida + grayscale */
```

## Funcionalidades Avanzadas

### 1. Filtrado Inteligente
- Mantiene relaciones jerárquicas al filtrar
- Actualización en tiempo real
- Preserva contexto visual

### 2. Responsive Design
- Adaptación a pantallas móviles
- Ajuste automático de tamaños de nodo
- Navegación optimizada para touch

### 3. Animaciones Fluidas
- Entrada escalonada de nodos
- Líneas de conexión animadas
- Transiciones suaves entre estados

### 4. Información Contextual
- Tooltips informativos
- Progreso visual de Key Results
- Indicadores de responsabilidad

## Casos de Uso

### 1. Planificación Estratégica
```
🏢 Empresa: "Aumentar ventas 25%"
  └── 🏛️ Departamento: "Mejorar marketing digital"
      └── 👥 Equipo: "Campaña redes sociales"
          └── 👤 Individual: "Crear contenido viral"
```

### 2. Seguimiento de Progreso
- Vista rápida del estado de toda la jerarquía
- Identificación de riesgos y bloqueos
- Progreso cascada desde individual hasta empresa

### 3. Gestión de Dependencias
- Visualización clara de objetivos relacionados
- Impacto de cambios en la cadena
- Coordinación entre equipos

## Mejoras Futuras Sugeridas

### Funcionalidades Adicionales
1. ✅ **Zoom y Pan**: ~~Navegación en diagramas grandes~~ **IMPLEMENTADO**
2. **Minimap**: Vista general con navegación rápida
3. **Exportación**: Generar PNG/PDF del diagrama
4. **Vista Cronológica**: Timeline de objetivos
5. **Colaboración**: Comentarios en tiempo real
6. **Gestos Táctiles**: Pinch-to-zoom en dispositivos móviles

### Optimizaciones Técnicas
1. **Virtualización**: Para grandes cantidades de nodos
2. **Lazy Loading**: Carga progresiva de niveles
3. **WebGL**: Renderizado acelerado por hardware
4. **Clustering**: Agrupación automática de nodos

## Configuración y Personalización

### Variables CSS Personalizables
```css
:root {
  --okr-spacing-horizontal: 300px;
  --okr-spacing-vertical: 180px;
  --okr-node-width: 300px;
  --okr-animation-duration: 0.3s;
}
```

### Props del Componente
```javascript
<OKRHierarchyView
  onViewObjective={function}      // Callback ver objetivo
  onEditObjective={function}      // Callback editar objetivo  
  onDeleteObjective={function}    // Callback eliminar objetivo
  onCreateObjective={function}    // Callback crear objetivo
  staff={array}                   // Lista de personal
/>
```

## Compatibilidad

### Navegadores Soportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Dispositivos
- Desktop: Completa funcionalidad
- Tablet: Adaptado con gestos touch
- Mobile: Interfaz simplificada

## Conclusión

La Vista Jerárquica OKR transforma la gestión de objetivos de una lista plana a una representación visual intuitiva que:

1. **Facilita la comprensión** de relaciones complejas entre objetivos
2. **Mejora la planificación estratégica** mediante visualización clara
3. **Acelera la toma de decisiones** con información contextual inmediata
4. **Optimiza el seguimiento** de progreso a todos los niveles organizacionales

Esta implementación establece las bases para un sistema de OKR verdaderamente visual y colaborativo. 