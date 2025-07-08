import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '@/styles/okr-hierarchy.css';
import { TreePine, Eye, Edit, Trash2, Plus, Filter, RotateCcw, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OKRHierarchyView = ({ 
  onViewObjective, 
  onEditObjective, 
  onDeleteObjective, 
  onCreateObjective,
  staff = [] 
}) => {
  const { toast } = useToast();
  const [objetivos, setObjetivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const svgRef = useRef(null);
  
  // Estados para zoom y pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    cargarObjetivos();
  }, []);

  // Efectos para manejo de eventos globales
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  const cargarObjetivos = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/okr/objetivos');
      setObjetivos(data || []);
    } catch (error) {
      console.error('Error cargando objetivos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los objetivos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Construir estructura jerárquica
  const construirJerarquia = () => {
    const objetivosFiltrados = objetivos.filter(obj => {
      const pasaNivel = !filtroNivel || obj.nivel === filtroNivel;
      const pasaEstado = !filtroEstado || obj.estado === filtroEstado;
      return pasaNivel && pasaEstado;
    });

    const mapa = new Map();
    const raices = [];

    // Crear mapa de objetivos
    objetivosFiltrados.forEach(obj => {
      mapa.set(obj.id_objetivo, {
        ...obj,
        children: [],
        responsable_nombre: staff.find(s => s.id_staff === obj.id_responsable)?.nombre || 'Sin asignar'
      });
    });

    // Construir relaciones
    objetivosFiltrados.forEach(obj => {
      if (obj.id_objetivo_preexistente && mapa.has(obj.id_objetivo_preexistente)) {
        mapa.get(obj.id_objetivo_preexistente).children.push(mapa.get(obj.id_objetivo));
      } else {
        raices.push(mapa.get(obj.id_objetivo));
      }
    });

    return raices;
  };

  // Calcular posiciones para el layout del árbol
  const calcularPosiciones = (nodos, nivel = 0, indice = 0, espacioH = 300, espacioV = 180) => {
    const posiciones = [];
    
    nodos.forEach((nodo, i) => {
      const x = indice * espacioH + i * espacioH;
      const y = nivel * espacioV + 50;
      
      posiciones.push({
        nodo,
        x,
        y,
        nivel
      });

      if (nodo.children && nodo.children.length > 0) {
        const posicionesHijos = calcularPosiciones(
          nodo.children, 
          nivel + 1, 
          i * nodo.children.length, 
          espacioH / Math.max(nodo.children.length, 1),
          espacioV
        );
        posiciones.push(...posicionesHijos);
      }
    });

    return posiciones;
  };

  // Generar líneas de conexión SVG
  const generarConexiones = (posiciones) => {
    const conexiones = [];
    
    posiciones.forEach(pos => {
      if (pos.nodo.children && pos.nodo.children.length > 0) {
        pos.nodo.children.forEach(hijo => {
          const posHijo = posiciones.find(p => p.nodo.id_objetivo === hijo.id_objetivo);
          if (posHijo) {
            // Determinar el tipo de flecha según los estados
            let tipoFlecha = 'arrowhead';
            let colorLinea = '#3B82F6';
            let estiloLinea = 'solid';
            
            if (pos.nodo.estado === 'Completado' && hijo.estado === 'Completado') {
              tipoFlecha = 'arrowhead-completed';
              colorLinea = '#10B981';
            } else if (pos.nodo.estado === 'En Riesgo' || hijo.estado === 'En Riesgo') {
              tipoFlecha = 'arrowhead-risk';
              colorLinea = '#F59E0B';
            } else if (pos.nodo.estado === 'Pausado' || hijo.estado === 'Pausado') {
              colorLinea = '#6B7280';
              estiloLinea = 'dashed';
            }
            
            conexiones.push({
              x1: pos.x + 150, // Centro del nodo padre
              y1: pos.y + 120, // Bottom del nodo padre
              x2: posHijo.x + 150, // Centro del nodo hijo
              y2: posHijo.y, // Top del nodo hijo
              id: `${pos.nodo.id_objetivo}-${hijo.id_objetivo}`,
              tipoFlecha,
              colorLinea,
              estiloLinea,
              estadoPadre: pos.nodo.estado,
              estadoHijo: hijo.estado
            });
          }
        });
      }
    });

    return conexiones;
  };

  const jerarquia = construirJerarquia();
  const posiciones = calcularPosiciones(jerarquia);
  const conexiones = generarConexiones(posiciones);

  // Calcular dimensiones del SVG
  const maxX = Math.max(...posiciones.map(p => p.x + 300), 800);
  const maxY = Math.max(...posiciones.map(p => p.y + 150), 400);

  // Obtener color según estado
  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Activo': return 'bg-green-100 border-green-300 text-green-800';
      case 'Completado': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'En Riesgo': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'Pausado': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Obtener icono según nivel
  const getIconoNivel = (nivel) => {
    switch (nivel) {
      case 'Empresa': return '🏢';
      case 'Departamento': return '🏛️';
      case 'Equipo': return '👥';
      case 'Individual': return '👤';
      default: return '🎯';
    }
  };

  // Funciones para zoom y pan
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    if (posiciones.length === 0) return;
    
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    
    const margin = 50;
    const contentWidth = maxX + margin * 2;
    const contentHeight = maxY + margin * 2;
    
    const scaleX = (containerWidth - margin * 2) / contentWidth;
    const scaleY = (containerHeight - margin * 2) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1);
    
    setZoom(newZoom);
    setPan({ 
      x: (containerWidth - contentWidth * newZoom) / 2,
      y: (containerHeight - contentHeight * newZoom) / 2
    });
  };

  // Manejo de arrastre
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Solo botón izquierdo
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom con rueda del mouse
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, zoom * delta));
    
    // Zoom hacia el cursor
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomPoint = {
      x: (mouseX - pan.x) / zoom,
      y: (mouseY - pan.y) / zoom
    };
    
    setPan({
      x: mouseX - zoomPoint.x * newZoom,
      y: mouseY - zoomPoint.y * newZoom
    });
    
    setZoom(newZoom);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando vista jerárquica...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <TreePine className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vista Jerárquica OKR</h2>
            <p className="text-sm text-gray-600">
              {objetivos.length} objetivos • {jerarquia.length} objetivo(s) raíz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtros */}
          <Select value={filtroNivel} onValueChange={setFiltroNivel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los niveles</SelectItem>
              <SelectItem value="Empresa">🏢 Empresa</SelectItem>
              <SelectItem value="Departamento">🏛️ Departamento</SelectItem>
              <SelectItem value="Equipo">👥 Equipo</SelectItem>
              <SelectItem value="Individual">👤 Individual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              <SelectItem value="Activo">🟢 Activo</SelectItem>
              <SelectItem value="Completado">✅ Completado</SelectItem>
              <SelectItem value="En Riesgo">⚠️ En Riesgo</SelectItem>
              <SelectItem value="Pausado">⏸️ Pausado</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setFiltroNivel('');
              setFiltroEstado('');
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpiar Filtros
          </Button>

          {/* Controles de zoom */}
          <div className="okr-zoom-controls flex items-center gap-1 border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.3}
              className="h-8 px-2"
              title="Alejar"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="px-2 py-1 text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="h-8 px-2"
              title="Acercar"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFitToScreen}
            title="Ajustar a pantalla"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetView}
            title="Vista original"
          >
            <Move className="h-4 w-4" />
          </Button>

          <Button onClick={onCreateObjective} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Objetivo
          </Button>
        </div>
      </div>

      {/* Área del diagrama */}
      <div 
        ref={containerRef}
        className={`okr-viewport bg-white rounded-lg border shadow-sm overflow-hidden relative ${isDragging ? 'dragging' : ''}`}
        style={{ height: '600px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {posiciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <TreePine className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium">No hay objetivos para mostrar</h3>
            <p className="text-sm">Crea tu primer objetivo o ajusta los filtros</p>
          </div>
        ) : (
          <div 
            className="okr-hierarchy-container absolute"
            style={{ 
              width: maxX, 
              height: maxY, 
              minHeight: '500px',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
          >
            {/* SVG para las líneas de conexión */}
            <svg
              ref={svgRef}
              className="absolute top-0 left-0 pointer-events-none z-0"
              width={maxX}
              height={maxY}
            >
              <defs>
                {/* Flecha principal */}
                <marker
                  id="arrowhead"
                  markerWidth="12"
                  markerHeight="10"
                  refX="11"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 12 5, 0 10"
                    fill="#3B82F6"
                    stroke="#2563EB"
                    strokeWidth="1"
                  />
                </marker>
                
                {/* Flecha para objetivos completados */}
                <marker
                  id="arrowhead-completed"
                  markerWidth="12"
                  markerHeight="10"
                  refX="11"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 12 5, 0 10"
                    fill="#10B981"
                    stroke="#059669"
                    strokeWidth="1"
                  />
                </marker>
                
                {/* Flecha para objetivos en riesgo */}
                <marker
                  id="arrowhead-risk"
                  markerWidth="12"
                  markerHeight="10"
                  refX="11"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 12 5, 0 10"
                    fill="#F59E0B"
                    stroke="#D97706"
                    strokeWidth="1"
                  />
                </marker>
                
                {/* Patrón de línea punteada */}
                <pattern id="dots" patternUnits="userSpaceOnUse" width="8" height="8">
                  <circle cx="4" cy="4" r="1" fill="#3B82F6" opacity="0.6"/>
                </pattern>
              </defs>
              
              {conexiones.map(conexion => (
                <g key={conexion.id}>
                  {/* Línea principal con curva */}
                  <path
                    d={`M ${conexion.x1} ${conexion.y1 + 5} 
                        C ${conexion.x1} ${conexion.y1 + 40} 
                        ${conexion.x2} ${conexion.y2 - 40} 
                        ${conexion.x2} ${conexion.y2 - 5}`}
                    stroke={conexion.colorLinea}
                    strokeWidth="3"
                    fill="none"
                    markerEnd={`url(#${conexion.tipoFlecha})`}
                    strokeDasharray={conexion.estiloLinea === 'dashed' ? '8,4' : 'none'}
                    className={`connection-line ${
                      conexion.estadoPadre === 'Completado' && conexion.estadoHijo === 'Completado' 
                        ? 'connection-completed' 
                        : conexion.estadoPadre === 'En Riesgo' || conexion.estadoHijo === 'En Riesgo'
                        ? 'connection-risk'
                        : 'connection-active'
                    }`}
                    opacity="0.8"
                  />
                  
                  {/* Línea de fondo para mejor visibilidad */}
                  <path
                    d={`M ${conexion.x1} ${conexion.y1 + 5} 
                        C ${conexion.x1} ${conexion.y1 + 40} 
                        ${conexion.x2} ${conexion.y2 - 40} 
                        ${conexion.x2} ${conexion.y2 - 5}`}
                    stroke="white"
                    strokeWidth="5"
                    fill="none"
                    opacity="0.3"
                    className="connection-background"
                  />
                  
                  {/* Indicador de relación en el medio */}
                  <circle
                    cx={(conexion.x1 + conexion.x2) / 2}
                    cy={(conexion.y1 + conexion.y2) / 2}
                    r="4"
                    fill={conexion.colorLinea}
                    stroke="white"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  
                  {/* Texto indicativo de la relación */}
                  <text
                    x={(conexion.x1 + conexion.x2) / 2 + 12}
                    y={(conexion.y1 + conexion.y2) / 2 + 4}
                    fontSize="10"
                    fill={conexion.colorLinea}
                    fontWeight="bold"
                    opacity="0.7"
                  >
                    ↓
                  </text>
                </g>
              ))}
            </svg>

            {/* Nodos de objetivos */}
            {posiciones.map((pos, index) => (
              <motion.div
                key={pos.nodo.id_objetivo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`okr-node absolute border-2 rounded-lg p-4 bg-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer nivel-${pos.nodo.nivel.toLowerCase()} estado-${pos.nodo.estado.toLowerCase().replace(' ', '-')} ${getColorEstado(pos.nodo.estado)}`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: '300px',
                  zIndex: 10
                }}
              >
                {/* Header del nodo */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getIconoNivel(pos.nodo.nivel)}</span>
                    <Badge variant="outline" className="text-xs">
                      {pos.nodo.nivel}
                    </Badge>
                  </div>
                  <Badge className={`text-xs ${getColorEstado(pos.nodo.estado)}`}>
                    {pos.nodo.estado}
                  </Badge>
                </div>

                {/* Contenido del nodo */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                    {pos.nodo.titulo}
                  </h3>
                  
                  <div className="text-xs text-gray-600">
                    <p>👤 {pos.nodo.responsable_nombre}</p>
                    {pos.nodo.total_key_results && (
                      <p>📊 {pos.nodo.total_key_results} Key Results</p>
                    )}
                    {pos.nodo.promedio_cumplimiento !== null && (
                      <p>📈 {Math.round(pos.nodo.promedio_cumplimiento)}% progreso</p>
                    )}
                  </div>

                  {/* Información de relación */}
                  {pos.nodo.id_objetivo_preexistente && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded">
                      🔗 Relacionado con objetivo #{pos.nodo.id_objetivo_preexistente}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewObjective(pos.nodo);
                    }}
                    className="h-7 w-7 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditObjective(pos.nodo);
                    }}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObjective(pos.nodo);
                    }}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Leyenda</h4>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>📱 Usa la rueda del mouse para hacer zoom</span>
            <span>🖱️ Arrastra para mover la vista</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>🏢</span>
            <span>Empresa</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏛️</span>
            <span>Departamento</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>Equipo</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>Individual</span>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>🔗 Las flechas indican relaciones jerárquicas</span>
            <span>📊 Los colores representan el estado del objetivo</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500 relative">
                <div className="absolute right-0 top-[-2px] w-0 h-0 border-l-[4px] border-l-blue-500 border-t-[2px] border-b-[2px] border-t-transparent border-b-transparent"></div>
              </div>
              <span className="text-blue-600">Activo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500 relative">
                <div className="absolute right-0 top-[-2px] w-0 h-0 border-l-[4px] border-l-green-500 border-t-[2px] border-b-[2px] border-t-transparent border-b-transparent"></div>
              </div>
              <span className="text-green-600">Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-yellow-500 relative">
                <div className="absolute right-0 top-[-2px] w-0 h-0 border-l-[4px] border-l-yellow-500 border-t-[2px] border-b-[2px] border-t-transparent border-b-transparent"></div>
              </div>
              <span className="text-yellow-600">En Riesgo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-500 border-dashed border-b-2 relative">
                <div className="absolute right-0 top-[-2px] w-0 h-0 border-l-[4px] border-l-gray-500 border-t-[2px] border-b-[2px] border-t-transparent border-b-transparent"></div>
              </div>
              <span className="text-gray-600">Pausado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OKRHierarchyView; 