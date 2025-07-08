import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '@/styles/okr-hierarchy.css';
import { TreePine, Eye, Edit, Trash2, Plus, Filter, RotateCcw, ZoomIn, ZoomOut, Maximize, Move, GripVertical, ArrowRight, ArrowDown } from 'lucide-react';
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
  
  // Estados para zoom y pan del canvas
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Estados para drag and drop individual de OKRs
  const [draggingOKR, setDraggingOKR] = useState(null);
  const [okrPositions, setOkrPositions] = useState(new Map());
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Estado para orientación del layout
  const [layoutOrientation, setLayoutOrientation] = useState('vertical'); // 'vertical' o 'horizontal'

  useEffect(() => {
    cargarObjetivos();
  }, []);

  // Efectos para manejo de eventos globales del canvas
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleCanvasMouseMove(e);
    const handleGlobalMouseUp = () => handleCanvasMouseUp();

    if (isDraggingCanvas) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingCanvas, canvasDragStart]);

  // Efectos para manejo de drag and drop de OKRs individuales
  useEffect(() => {
    const handleOKRMouseMove = (e) => handleOKRDragMove(e);
    const handleOKRMouseUp = () => handleOKRDragEnd();

    if (draggingOKR) {
      document.addEventListener('mousemove', handleOKRMouseMove);
      document.addEventListener('mouseup', handleOKRMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleOKRMouseMove);
      document.removeEventListener('mouseup', handleOKRMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [draggingOKR, dragOffset]);

  const cargarObjetivos = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/okr/objetivos');
      setObjetivos(data || []);
      
      // Cargar posiciones personalizadas si existen
      try {
        const savedPositions = localStorage.getItem('okr-custom-positions');
        if (savedPositions) {
          const positions = JSON.parse(savedPositions);
          setOkrPositions(new Map(Object.entries(positions)));
        }
      } catch (error) {
        console.log('No hay posiciones guardadas');
      }
      
      // Cargar orientación guardada
      try {
        const savedOrientation = localStorage.getItem('okr-layout-orientation');
        if (savedOrientation) {
          setLayoutOrientation(savedOrientation);
        }
      } catch (error) {
        console.log('No hay orientación guardada');
      }
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

  // Mejorado: Calcular posiciones sin solapamientos
  const calcularPosicionesAvanzadas = (nodos) => {
    const posiciones = [];
    const nodosConNivel = [];
    
    // Función recursiva para asignar niveles
    const asignarNiveles = (nodos, nivel = 0) => {
      nodos.forEach(nodo => {
        nodosConNivel.push({ nodo, nivel });
        if (nodo.children && nodo.children.length > 0) {
          asignarNiveles(nodo.children, nivel + 1);
        }
      });
    };
    
    asignarNiveles(nodos);
    
    // Agrupar por niveles
    const nivelesAgrupados = {};
    nodosConNivel.forEach(({ nodo, nivel }) => {
      if (!nivelesAgrupados[nivel]) {
        nivelesAgrupados[nivel] = [];
      }
      nivelesAgrupados[nivel].push(nodo);
    });
    
    // Configuración según orientación
    const cardWidth = 240;
    const cardHeight = 80;
    const horizontalSpacing = cardWidth + 60; // Más espacio horizontal
    const verticalSpacing = cardHeight + 40; // Más espacio vertical
    
    Object.keys(nivelesAgrupados).forEach(nivel => {
      const nodosEnNivel = nivelesAgrupados[nivel];
      const nivelNum = parseInt(nivel);
      
      nodosEnNivel.forEach((nodo, index) => {
        // Usar posición personalizada si existe
        const customPos = okrPositions.get(nodo.id_objetivo.toString());
        
        let x, y;
        
        if (customPos) {
          x = customPos.x;
          y = customPos.y;
        } else {
          if (layoutOrientation === 'horizontal') {
            // Layout horizontal: niveles de izquierda a derecha
            x = nivelNum * horizontalSpacing + 50;
            y = index * verticalSpacing + 50;
          } else {
            // Layout vertical: niveles de arriba a abajo
            x = index * horizontalSpacing + 50;
            y = nivelNum * verticalSpacing + 50;
          }
        }
        
        posiciones.push({
          nodo,
          x,
          y,
          nivel: nivelNum,
          isCustomPosition: !!customPos
        });
      });
    });
    
    return posiciones;
  };

  // Generar líneas de conexión curvas y delgadas
  const generarConexiones = (posiciones) => {
    const conexiones = [];
    
    posiciones.forEach(pos => {
      if (pos.nodo.children && pos.nodo.children.length > 0) {
        pos.nodo.children.forEach(hijo => {
          const posHijo = posiciones.find(p => p.nodo.id_objetivo === hijo.id_objetivo);
          if (posHijo) {
            let colorLinea = '#3B82F6';
            
            if (pos.nodo.estado === 'Completado' && hijo.estado === 'Completado') {
              colorLinea = '#10B981';
            } else if (pos.nodo.estado === 'En Riesgo' || hijo.estado === 'En Riesgo') {
              colorLinea = '#F59E0B';
            } else if (pos.nodo.estado === 'Pausado' || hijo.estado === 'Pausado') {
              colorLinea = '#6B7280';
            }
            
            // Puntos de conexión mejorados
            const cardWidth = 240;
            const cardHeight = 80;
            
            let x1, y1, x2, y2;
            
            if (layoutOrientation === 'horizontal') {
              // Conexiones horizontales: de derecha a izquierda
              x1 = pos.x + cardWidth;
              y1 = pos.y + cardHeight / 2;
              x2 = posHijo.x;
              y2 = posHijo.y + cardHeight / 2;
            } else {
              // Conexiones verticales: de abajo a arriba
              x1 = pos.x + cardWidth / 2;
              y1 = pos.y + cardHeight;
              x2 = posHijo.x + cardWidth / 2;
              y2 = posHijo.y;
            }
            
            conexiones.push({
              x1, y1, x2, y2,
              id: `${pos.nodo.id_objetivo}-${hijo.id_objetivo}`,
              colorLinea,
              estadoPadre: pos.nodo.estado,
              estadoHijo: hijo.estado,
              orientacion: layoutOrientation
            });
          }
        });
      }
    });

    return conexiones;
  };

  const jerarquia = construirJerarquia();
  const posiciones = calcularPosicionesAvanzadas(jerarquia);
  const conexiones = generarConexiones(posiciones);

  // Calcular dimensiones del SVG con más padding
  const maxX = Math.max(...posiciones.map(p => p.x + 300), 1000);
  const maxY = Math.max(...posiciones.map(p => p.y + 150), 600);

  // Obtener color según estado (simplificado)
  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Activo': return 'bg-green-50 border-green-200 text-green-800';
      case 'Completado': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'En Riesgo': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Pausado': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Obtener emoji según nivel (profesional)
  const getEmojiNivel = (nivel) => {
    switch (nivel) {
      case 'Empresa': return '🏢';
      case 'Departamento': return '🏬';
      case 'Equipo': return '👥';
      case 'Individual': return '👤';
      default: return '📋';
    }
  };

  // Obtener emoji según estado (profesional)
  const getEmojiEstado = (estado) => {
    switch (estado) {
      case 'Activo': return '🟢';
      case 'Completado': return '🔵';
      case 'En Riesgo': return '🟡';
      case 'Pausado': return '⚫';
      default: return '⚪';
    }
  };

  // Manejo de zoom y controles de canvas
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
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const contentWidth = maxX;
    const contentHeight = maxY;
    
    const scaleX = (containerWidth - 40) / contentWidth;
    const scaleY = (containerHeight - 40) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1);
    
    setZoom(newZoom);
    setPan({
      x: (containerWidth - contentWidth * newZoom) / 2,
      y: (containerHeight - contentHeight * newZoom) / 2
    });
  };

  // Manejo de drag del canvas
  const handleCanvasMouseDown = (e) => {
    if (e.target === e.currentTarget || e.target.closest('.okr-hierarchy-container')) {
      setIsDraggingCanvas(true);
      setCanvasDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingCanvas) return;
    setPan({
      x: e.clientX - canvasDragStart.x,
      y: e.clientY - canvasDragStart.y
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomPoint = {
      x: (mouseX - pan.x) / zoom,
      y: (mouseY - pan.y) / zoom
    };

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.3), 3);
    
    setPan({
      x: mouseX - zoomPoint.x * newZoom,
      y: mouseY - zoomPoint.y * newZoom
    });
    
    setZoom(newZoom);
  };

  // Manejo de drag and drop individual de OKRs
  const handleOKRDragStart = (e, objetivo) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDraggingOKR(objetivo);
  };

  const handleOKRDragMove = (e) => {
    if (!draggingOKR || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calcular nueva posición considerando zoom y pan
    const newX = (e.clientX - containerRect.left - pan.x - dragOffset.x) / zoom;
    const newY = (e.clientY - containerRect.top - pan.y - dragOffset.y) / zoom;

    // Actualizar posición en el mapa
    setOkrPositions(prev => {
      const newMap = new Map(prev);
      newMap.set(draggingOKR.id_objetivo.toString(), { x: newX, y: newY });
      return newMap;
    });
  };

  const handleOKRDragEnd = () => {
    if (draggingOKR) {
      // Guardar posiciones en localStorage
      const positionsObj = Object.fromEntries(okrPositions.entries());
      localStorage.setItem('okr-custom-positions', JSON.stringify(positionsObj));
      
      toast({
        title: "Posición actualizada",
        description: `El objetivo "${draggingOKR.titulo}" ha sido reposicionado`,
      });
    }
    
    setDraggingOKR(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Cambiar orientación del layout
  const cambiarOrientacion = () => {
    const nuevaOrientacion = layoutOrientation === 'vertical' ? 'horizontal' : 'vertical';
    setLayoutOrientation(nuevaOrientacion);
    localStorage.setItem('okr-layout-orientation', nuevaOrientacion);
    
    toast({
      title: "Orientación cambiada",
      description: `Layout cambiado a ${nuevaOrientacion === 'vertical' ? 'vertical' : 'horizontal'}`,
    });
  };

  // Resetear posiciones a layout automático
  const resetearPosiciones = () => {
    setOkrPositions(new Map());
    localStorage.removeItem('okr-custom-positions');
    toast({
      title: "Posiciones restablecidas",
      description: "Los objetivos han vuelto al layout automático",
    });
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
              {objetivos.length} objetivos • {jerarquia.length} objetivo(s) raíz • Layout {layoutOrientation}
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
              <SelectItem value="Departamento">🏬 Departamento</SelectItem>
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
              <SelectItem value="Completado">🔵 Completado</SelectItem>
              <SelectItem value="En Riesgo">🟡 En Riesgo</SelectItem>
              <SelectItem value="Pausado">⚫ Pausado</SelectItem>
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

          {/* Controles de layout mejorados */}
          <div className="flex items-center gap-1 border rounded-md">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cambiarOrientacion}
              title={`Cambiar a layout ${layoutOrientation === 'vertical' ? 'horizontal' : 'vertical'}`}
              className="border-0"
            >
              {layoutOrientation === 'vertical' ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Horizontal
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 mr-1" />
                  Vertical
                </>
              )}
            </Button>
            
            <div className="border-l h-6 mx-1"></div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetearPosiciones}
              title="Restablecer posiciones automáticas"
              className="border-0"
            >
              <Move className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

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
            <RotateCcw className="h-4 w-4" />
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
        className={`okr-viewport bg-white rounded-lg border shadow-sm overflow-hidden relative ${
          isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ height: '600px' }}
        onMouseDown={handleCanvasMouseDown}
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
              transition: isDraggingCanvas ? 'none' : 'transform 0.2s ease'
            }}
          >
            {/* SVG para las líneas de conexión curvas y delgadas */}
            <svg
              ref={svgRef}
              className="absolute top-0 left-0 pointer-events-none z-0"
              width={maxX}
              height={maxY}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 8 3, 0 6"
                    fill="#3B82F6"
                  />
                </marker>
              </defs>
              
              {conexiones.map(conexion => (
                <g key={conexion.id}>
                  {/* Línea de conexión curva y delgada */}
                  <path
                    d={
                      conexion.orientacion === 'horizontal' 
                        ? `M ${conexion.x1} ${conexion.y1} 
                           C ${conexion.x1 + 60} ${conexion.y1} 
                           ${conexion.x2 - 60} ${conexion.y2} 
                           ${conexion.x2} ${conexion.y2}`
                        : `M ${conexion.x1} ${conexion.y1} 
                           C ${conexion.x1} ${conexion.y1 + 40} 
                           ${conexion.x2} ${conexion.y2 - 40} 
                           ${conexion.x2} ${conexion.y2}`
                    }
                    stroke={conexion.colorLinea}
                    strokeWidth="1.5"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    opacity="0.8"
                    className="connection-curve"
                  />
                </g>
              ))}
            </svg>

            {/* Nodos de objetivos simplificados */}
            {posiciones.map((pos, index) => (
              <motion.div
                key={pos.nodo.id_objetivo}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={`okr-node-simple absolute border rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200 ${
                  getColorEstado(pos.nodo.estado)
                } ${
                  draggingOKR?.id_objetivo === pos.nodo.id_objetivo ? 'ring-2 ring-blue-400 shadow-xl' : ''
                } ${
                  pos.isCustomPosition ? 'ring-1 ring-indigo-300' : ''
                }`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: '240px',
                  height: '80px',
                  zIndex: draggingOKR?.id_objetivo === pos.nodo.id_objetivo ? 1000 : 10,
                  cursor: 'grab'
                }}
                onMouseDown={(e) => handleOKRDragStart(e, pos.nodo)}
              >
                {/* Header simplificado */}
                <div className="flex items-center justify-between p-2 h-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{getEmojiNivel(pos.nodo.nivel)}</span>
                      <span className="text-xs">{getEmojiEstado(pos.nodo.estado)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                        {pos.nodo.titulo}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        👤 {pos.nodo.responsable_nombre}
                      </p>
                    </div>
                  </div>

                  {/* Handle para drag */}
                  <div className="flex flex-col gap-1 opacity-60 hover:opacity-100">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* Acciones compactas */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewObjective(pos.nodo);
                      }}
                      className="h-6 w-6 p-0"
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
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Indicador de posición personalizada */}
                {pos.isCustomPosition && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" 
                       title="Posición personalizada" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Leyenda simplificada */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>💡 Arrastra cualquier OKR para reposicionarlo</span>
          <span>🔄 Cambia entre layout horizontal y vertical</span>
          <span>🖱️ Usa la rueda del mouse para zoom</span>
          <span>📱 Arrastra el fondo para mover la vista</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default OKRHierarchyView; 