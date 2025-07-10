import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '@/styles/okr-hierarchy.css';
import { TreePine, Eye, Edit, Trash2, Plus, Filter, RotateCcw, ZoomIn, ZoomOut, Maximize, Move, GripVertical, ArrowRight, ArrowDown, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const OKRHierarchyView = ({ 
  onViewObjective, 
  onEditObjective, 
  onDeleteObjective, 
  onCreateObjective,
  staff = [] 
}) => {
  const { toast } = useToast();
  const [objetivos, setObjetivos] = useState([]);
  const [relacionesObjetivos, setRelacionesObjetivos] = useState([]);
  const [relacionesKRs, setRelacionesKRs] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroOKRSeleccionado, setFiltroOKRSeleccionado] = useState('');
  const [mostrarKRsNativos, setMostrarKRsNativos] = useState(true);
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
      console.log('🔄 Cargando jerarquía con nuevas relaciones...');
      
      // Intentar usar la nueva API de jerarquía primero
      try {
        const data = await apiCall('/api/okr/jerarquia');
        if (data.success) {
          setObjetivos(data.objetivos || []);
          setRelacionesObjetivos(data.relacionesObjetivos || []);
          setRelacionesKRs(data.relacionesKRs || []);
          setKeyResults(data.keyResults || []);
          console.log('✅ Jerarquía cargada con éxito:', {
            objetivos: data.objetivos?.length || 0,
            relacionesObjetivos: data.relacionesObjetivos?.length || 0,
            relacionesKRs: data.relacionesKRs?.length || 0,
            keyResults: data.keyResults?.length || 0
          });
        } else {
          throw new Error('API de jerarquía no disponible');
        }
      } catch (hierarchyError) {
        console.log('⚠️  Usando API simple como fallback');
        const data = await apiCall('/api/okr/objetivos');
        setObjetivos(data || []);
        setRelacionesObjetivos([]);
        setRelacionesKRs([]);
        setKeyResults([]);
      }
      
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

  // Construir estructura jerárquica con OKRs y KRs
  const construirJerarquia = () => {
    let objetivosFiltrados = objetivos.filter(obj => {
      const pasaNivel = !filtroNivel || obj.nivel === filtroNivel;
      const pasaEstado = !filtroEstado || obj.estado === filtroEstado;
      return pasaNivel && pasaEstado;
    });

    // Aplicar filtro por OKR seleccionado - mostrar solo los relacionados
    if (filtroOKRSeleccionado) {
      const okrSeleccionadoId = parseInt(filtroOKRSeleccionado);
      const okrsRelacionados = new Set([okrSeleccionadoId]);
      
      // Buscar todos los OKRs relacionados (hijos y padres)
      relacionesObjetivos.forEach(rel => {
        if (rel.id_objetivo_destino === okrSeleccionadoId) {
          okrsRelacionados.add(rel.id_objetivo_origen);
        }
        if (rel.id_objetivo_origen === okrSeleccionadoId) {
          okrsRelacionados.add(rel.id_objetivo_destino);
        }
      });

      // Filtrar objetivos para mostrar solo los relacionados
      objetivosFiltrados = objetivosFiltrados.filter(obj => 
        okrsRelacionados.has(obj.id_objetivo)
      );

      console.log(`🎯 Filtro por OKR ${okrSeleccionadoId}: Mostrando ${objetivosFiltrados.length} OKRs relacionados`, 
        Array.from(okrsRelacionados));
    }

    const mapa = new Map();
    const raices = [];

    // 1. Crear mapa de objetivos OKR
    objetivosFiltrados.forEach(obj => {
      mapa.set(`OKR-${obj.id_objetivo}`, {
        ...obj,
        children: [],
        tipo: 'OKR',
        responsable_nombre: obj.responsable_nombre || 'Sin asignar'
      });
    });

    // 2. Agregar Key Results como nodos - Solo si mostrarKRsNativos está activo
    if (mostrarKRsNativos) {
      console.log(`📊 KRs disponibles: ${keyResults.length}`, keyResults.map(kr => `KR-${kr.id_kr}: ${kr.descripcion} (OKR: ${kr.id_objetivo})`));
      
      let krsAgregados = 0;
      keyResults.forEach(kr => {
        const objetivoPadre = objetivos.find(obj => obj.id_objetivo === kr.id_objetivo);
        if (objetivoPadre && objetivosFiltrados.find(obj => obj.id_objetivo === kr.id_objetivo)) {
          mapa.set(`KR-${kr.id_kr}`, {
            id_objetivo: `KR-${kr.id_kr}`,
            id_kr: kr.id_kr,
            titulo: kr.descripcion || `KR ${kr.id_kr}`,
            descripcion: `${kr.valor_objetivo || 0} ${kr.unidad || ''}`,
            estado: kr.porcentaje_cumplimiento >= 100 ? 'Completado' : 
                   kr.porcentaje_cumplimiento >= 70 ? 'Activo' : 'En Riesgo',
            nivel: 'Key Result',
            children: [],
            tipo: 'KR',
            porcentaje_cumplimiento: kr.porcentaje_cumplimiento || 0,
            responsable_nombre: kr.responsable_nombre || 'Sin asignar',
            objetivo_padre_id: kr.id_objetivo
          });
          krsAgregados++;
          console.log(`✅ KR agregado: ${kr.descripcion} -> OKR ${kr.id_objetivo}`);
        } else {
          console.log(`❌ KR no agregado: ${kr.descripcion} -> OKR ${kr.id_objetivo} (objetivo padre no encontrado o filtrado)`);
        }
      });
      
      console.log(`📈 Total KRs agregados como nodos: ${krsAgregados}/${keyResults.length}`);
    } else {
      console.log(`🚫 KRs nativos no se agregan como nodos (configuración del usuario)`);
    }

    // 3. Construir relaciones OKR → OKR (VERDE)
    relacionesObjetivos.forEach(rel => {
      const padreKey = `OKR-${rel.id_objetivo_destino}`;
      const hijoKey = `OKR-${rel.id_objetivo_origen}`;
      
      if (mapa.has(padreKey) && mapa.has(hijoKey)) {
        const padre = mapa.get(padreKey);
        const hijo = mapa.get(hijoKey);
        
        // Crear ID único para comparación
        const hijoIdUnico = hijo.tipo === 'KR' ? `KR-${hijo.id_kr}` : `OKR-${hijo.id_objetivo}`;
        if (!padre.children.find(child => {
          const childIdUnico = child.tipo === 'KR' ? `KR-${child.id_kr}` : `OKR-${child.id_objetivo}`;
          return childIdUnico === hijoIdUnico;
        })) {
          padre.children.push({
            ...hijo,
            tipoRelacion: 'OKR_TO_OKR',
            colorRelacion: '#10B981' // Verde
          });
        }
      }
    });

    // 4. Construir relaciones OKR → KR (ROJO) - Solo si mostrarKRsNativos está activo
    if (mostrarKRsNativos) {
      console.log(`🔗 Construyendo relaciones OKR → KR para ${keyResults.length} KRs`);
      
      let relacionesKRsCreadas = 0;
      keyResults.forEach(kr => {
        const objetivoPadre = objetivos.find(obj => obj.id_objetivo === kr.id_objetivo);
        if (objetivoPadre && objetivosFiltrados.find(obj => obj.id_objetivo === kr.id_objetivo)) {
          const padreKey = `OKR-${kr.id_objetivo}`;
          const hijoKey = `KR-${kr.id_kr}`;
          
          console.log(`🔍 Buscando: ${padreKey} -> ${hijoKey}`);
          console.log(`   Padre en mapa: ${mapa.has(padreKey)}, Hijo en mapa: ${mapa.has(hijoKey)}`);
          
          if (mapa.has(padreKey) && mapa.has(hijoKey)) {
            const padre = mapa.get(padreKey);
            const hijo = mapa.get(hijoKey);
            
            // Verificar si ya existe (por relaciones explícitas)
            const hijoIdUnico = hijo.tipo === 'KR' ? `KR-${hijo.id_kr}` : `OKR-${hijo.id_objetivo}`;
            const yaExiste = padre.children.find(child => {
              const childIdUnico = child.tipo === 'KR' ? `KR-${child.id_kr}` : `OKR-${child.id_objetivo}`;
              return childIdUnico === hijoIdUnico;
            });
            if (!yaExiste) {
              padre.children.push({
                ...hijo,
                tipoRelacion: 'OKR_TO_KR_DIRECTO',
                colorRelacion: '#EF4444' // Rojo - Relación directa natural
              });
              relacionesKRsCreadas++;
              console.log(`✅ Relación KR nativo creada: ${padre.titulo} → ${hijo.titulo}`);
            } else {
              console.log(`⚠️  Relación ya existe: ${padre.titulo} → ${hijo.titulo}`);
            }
          } else {
            console.log(`❌ Nodos no encontrados en mapa: ${padreKey} -> ${hijoKey}`);
          }
        } else {
          console.log(`❌ OKR padre no válido para KR ${kr.id_kr}`);
        }
      });
      
      console.log(`📊 Total relaciones OKR→KR nativas creadas: ${relacionesKRsCreadas}`);
    } else {
      console.log(`🚫 KRs nativos ocultos por configuración del usuario`);
    }

    // 4.1. Agregar relaciones explícitas OKR → KR adicionales (si las hay)
    relacionesKRs.forEach(rel => {
      const padreKey = `OKR-${rel.id_objetivo}`;
      const hijoKey = `KR-${rel.id_kr}`;
      
      if (mapa.has(padreKey) && mapa.has(hijoKey)) {
        const padre = mapa.get(padreKey);
        const hijo = mapa.get(hijoKey);
        
        // Solo agregar si no existe ya (evitar duplicados)
        const hijoIdUnico = hijo.tipo === 'KR' ? `KR-${hijo.id_kr}` : `OKR-${hijo.id_objetivo}`;
        if (!padre.children.find(child => {
          const childIdUnico = child.tipo === 'KR' ? `KR-${child.id_kr}` : `OKR-${child.id_objetivo}`;
          return childIdUnico === hijoIdUnico;
        })) {
          padre.children.push({
            ...hijo,
            tipoRelacion: 'OKR_TO_KR_EXPLICIT',
            colorRelacion: '#3B82F6', // Azul
            relacionExplicita: true
          });
        }
      }
    });

    // 5. Identificar objetivos raíz (OKRs sin relaciones de entrada)
    const objetivosDestino = new Set();
    relacionesObjetivos.forEach(rel => {
      objetivosDestino.add(rel.id_objetivo_origen);
    });

    objetivosFiltrados.forEach(obj => {
      if (!objetivosDestino.has(obj.id_objetivo)) {
        const okrKey = `OKR-${obj.id_objetivo}`;
        if (mapa.has(okrKey)) {
          raices.push(mapa.get(okrKey));
        }
      }
    });

    // 6. Si no hay relaciones, mostrar todos los OKRs como raíces
    if (raices.length === 0 && objetivosFiltrados.length > 0) {
      objetivosFiltrados.forEach(obj => {
        const okrKey = `OKR-${obj.id_objetivo}`;
        if (mapa.has(okrKey)) {
          raices.push(mapa.get(okrKey));
        }
      });
    }

    console.log('🌳 Jerarquía construida:', {
      objetivos_totales: objetivos.length,
      objetivos_filtrados: objetivosFiltrados.length,
      key_results: keyResults.length,
      krs_nativos_mostrados: mostrarKRsNativos,
      filtro_okr_activo: !!filtroOKRSeleccionado,
      okr_seleccionado: filtroOKRSeleccionado ? objetivos.find(o => o.id_objetivo.toString() === filtroOKRSeleccionado)?.titulo : null,
      relaciones_okr_okr: relacionesObjetivos.length,
      relaciones_okr_kr: relacionesKRs.length,
      objetivos_raiz: raices.length
    });

    return raices;
  };

  // Mejorado: Calcular posiciones sin solapamientos
  const calcularPosicionesAvanzadas = (nodos) => {
    const posiciones = [];
    const nodosConNivel = [];
    const nodosVistos = new Set(); // Para evitar duplicados
    
    // Función recursiva para asignar niveles
    const asignarNiveles = (nodos, nivel = 0) => {
      nodos.forEach(nodo => {
        // Crear ID único para verificar duplicados
        const nodoIdUnico = nodo.tipo === 'KR' ? `KR-${nodo.id_kr}` : `OKR-${nodo.id_objetivo}`;
        
        if (!nodosVistos.has(nodoIdUnico)) {
          nodosVistos.add(nodoIdUnico);
          nodosConNivel.push({ nodo, nivel });
        }
        
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
        // Usar posición personalizada si existe (solo para OKRs, los KRs no tienen posiciones personalizadas)
        const nodoKey = nodo.tipo === 'OKR' ? nodo.id_objetivo.toString() : null;
        const customPos = nodoKey ? okrPositions.get(nodoKey) : null;
        
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
    
    console.log('📍 Posiciones calculadas:', {
      total_nodos: nodosConNivel.length,
      total_posiciones: posiciones.length,
      nodos_unicos: nodosVistos.size,
      okrs: posiciones.filter(p => p.nodo.tipo === 'OKR').length,
      krs: posiciones.filter(p => p.nodo.tipo === 'KR').length
    });
    
    return posiciones;
  };

  // Generar líneas de conexión diferenciadas: Verde OKR→OKR, Azul OKR→KR
  const generarConexiones = (posiciones) => {
    const conexiones = [];
    
    posiciones.forEach(pos => {
      if (pos.nodo.children && pos.nodo.children.length > 0) {
        pos.nodo.children.forEach(hijo => {
          const hijoIdUnico = hijo.tipo === 'KR' ? `KR-${hijo.id_kr}` : `OKR-${hijo.id_objetivo}`;
          const posHijo = posiciones.find(p => {
            const pIdUnico = p.nodo.tipo === 'KR' ? `KR-${p.nodo.id_kr}` : `OKR-${p.nodo.id_objetivo}`;
            return pIdUnico === hijoIdUnico;
          });
          if (posHijo) {
            // Color según tipo de relación
            let colorLinea = '#6B7280'; // Gris por defecto
            let grosorLinea = 2;
            let tipoConexion = 'desconocida';
            
            if (hijo.tipoRelacion === 'OKR_TO_OKR') {
              colorLinea = '#10B981'; // Verde para OKR → OKR
              grosorLinea = 3;
              tipoConexion = 'OKR → OKR';
            } else if (hijo.tipoRelacion === 'OKR_TO_KR_DIRECTO') {
              colorLinea = '#EF4444'; // Rojo para OKR → KR directo
              grosorLinea = 2;
              tipoConexion = 'OKR → KR Directo';
            } else if (hijo.tipoRelacion === 'OKR_TO_KR_EXPLICIT') {
              colorLinea = '#3B82F6'; // Azul para OKR → KR explícito
              grosorLinea = 2;
              tipoConexion = 'OKR → KR Explícito';
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
            
            // Generar ID único para la conexión
            const padreId = pos.nodo.tipo === 'KR' ? `KR-${pos.nodo.id_kr}` : `OKR-${pos.nodo.id_objetivo}`;
            const hijoId = hijo.tipo === 'KR' ? `KR-${hijo.id_kr}` : `OKR-${hijo.id_objetivo}`;
            
            conexiones.push({
              x1, y1, x2, y2,
              id: `${padreId}-${hijoId}`,
              colorLinea,
              grosorLinea,
              tipoConexion,
              tipoRelacion: hijo.tipoRelacion,
              estadoPadre: pos.nodo.estado,
              estadoHijo: hijo.estado,
              orientacion: layoutOrientation
            });
          }
        });
      }
    });

    console.log('🔗 Conexiones generadas:', {
      total: conexiones.length,
      okr_to_okr: conexiones.filter(c => c.tipoRelacion === 'OKR_TO_OKR').length,
      okr_to_kr_directo: conexiones.filter(c => c.tipoRelacion === 'OKR_TO_KR_DIRECTO').length,
      okr_to_kr_explicito: conexiones.filter(c => c.tipoRelacion === 'OKR_TO_KR_EXPLICIT').length
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
      case 'Key Result': return '🎯';
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
              {objetivos.length} OKRs • {keyResults.length} KRs • {jerarquia.length} nodo(s) raíz • Layout {layoutOrientation}
              {filtroOKRSeleccionado && (
                <span className="text-blue-600 font-medium">
                  • Enfocado en: {objetivos.find(o => o.id_objetivo.toString() === filtroOKRSeleccionado)?.titulo}
                </span>
              )}
              {!mostrarKRsNativos && (
                <span className="text-orange-600 font-medium">
                  • KRs nativos ocultos
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtros básicos */}
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

          {/* Nuevo: Filtro por OKR específico */}
          <Select value={filtroOKRSeleccionado} onValueChange={setFiltroOKRSeleccionado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="🎯 Filtrar por OKR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los OKRs</SelectItem>
              {objetivos.map(okr => (
                <SelectItem key={okr.id_objetivo} value={okr.id_objetivo.toString()}>
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{okr.titulo}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Nuevo: Toggle para mostrar/ocultar KRs nativos */}
          <div className="flex items-center gap-2 px-3 py-1 border rounded-md bg-gray-50" 
               title="Los KRs nativos son los que vienen directamente asociados a cada OKR. Desactivar esta opción permite centrarse solo en las relaciones entre OKRs.">
            <Switch
              id="mostrar-krs-nativos"
              checked={mostrarKRsNativos}
              onCheckedChange={setMostrarKRsNativos}
            />
            <Label htmlFor="mostrar-krs-nativos" className="text-sm font-medium cursor-pointer">
              Mostrar KRs nativos
            </Label>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setFiltroNivel('');
              setFiltroEstado('');
              setFiltroOKRSeleccionado('');
              setMostrarKRsNativos(true);
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

      {/* Leyenda de tipos de conexiones */}
      {!loading && posiciones.length > 0 && (
        <div className="bg-white p-3 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tipos de conexiones:</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span>OKR → OKR (Relaciones estratégicas)</span>
            </div>
            {mostrarKRsNativos && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500"></div>
                <span>OKR → KR (Resultados clave nativos)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span>OKR → KR (Relaciones explícitas)</span>
            </div>
          </div>
        </div>
      )}

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
                    strokeWidth={conexion.grosorLinea || 1.5}
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
                key={pos.nodo.tipo === 'KR' ? `KR-${pos.nodo.id_kr}` : `OKR-${pos.nodo.id_objetivo}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={`okr-node-simple absolute border rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                  pos.nodo.tipo === 'KR' ? 'bg-blue-50 border-blue-200' : 'bg-white'
                } ${
                  getColorEstado(pos.nodo.estado)
                } ${
                  draggingOKR && (
                    (pos.nodo.tipo === 'KR' && draggingOKR.id_kr === pos.nodo.id_kr) ||
                    (pos.nodo.tipo === 'OKR' && draggingOKR.id_objetivo === pos.nodo.id_objetivo)
                  ) ? 'ring-2 ring-blue-400 shadow-xl' : ''
                } ${
                  pos.isCustomPosition ? 'ring-1 ring-indigo-300' : ''
                }`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: '240px',
                  height: '80px',
                  zIndex: draggingOKR && (
                    (pos.nodo.tipo === 'KR' && draggingOKR.id_kr === pos.nodo.id_kr) ||
                    (pos.nodo.tipo === 'OKR' && draggingOKR.id_objetivo === pos.nodo.id_objetivo)
                  ) ? 1000 : 10,
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
                      {pos.nodo.tipo === 'KR' ? (
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <span>📊</span>
                            <span className="font-medium">{pos.nodo.porcentaje_cumplimiento || 0}%</span>
                          </div>
                          <p className="truncate">👤 {pos.nodo.responsable_nombre}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600 truncate">
                          👤 {pos.nodo.responsable_nombre}
                        </p>
                      )}
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

      {/* Leyenda diferencial OKR-KR */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tipos de nodos */}
          <div>
            <h4 className="font-semibold text-sm text-gray-800 mb-2">📊 Tipos de Nodos</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>🏢 <strong>OKR (Objetivos)</strong> - Fondo blanco</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                <span>🎯 <strong>Key Results</strong> - Fondo azul claro con %</span>
              </div>
            </div>
          </div>
          
          {/* Tipos de conexiones */}
          <div>
            <h4 className="font-semibold text-sm text-gray-800 mb-2">🔗 Tipos de Conexiones</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-green-500 rounded" style={{ height: '3px' }}></div>
                <span>🟢 <strong>OKR → OKR</strong> - Relación explícita (verde)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-red-500 rounded" style={{ height: '2px' }}></div>
                <span>🔴 <strong>OKR → KR</strong> - Relación directa (rojo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-blue-500 rounded" style={{ height: '2px' }}></div>
                <span>🔵 <strong>OKR → KR</strong> - Relación explícita (azul)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas en tiempo real */}
        <div className="bg-white p-3 rounded border">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs text-center">
            <div>
              <div className="font-bold text-lg text-indigo-600">{objetivos.length}</div>
              <div className="text-gray-600">OKRs</div>
            </div>
            <div>
              <div className="font-bold text-lg text-indigo-600">{keyResults.length}</div>
              <div className="text-gray-600">Key Results</div>
            </div>
            <div>
              <div className="font-bold text-lg text-green-600">{relacionesObjetivos.length}</div>
              <div className="text-gray-600">🟢 OKR↔OKR</div>
            </div>
            <div>
              <div className="font-bold text-lg text-red-600">{conexiones.filter(c => c.tipoRelacion === 'OKR_TO_KR_DIRECTO').length}</div>
              <div className="text-gray-600">🔴 OKR→KR</div>
            </div>
            <div>
              <div className="font-bold text-lg text-blue-600">{relacionesKRs.length}</div>
              <div className="text-gray-600">🔵 OKR⇄KR</div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
          <span>💡 Arrastra cualquier nodo para reposicionarlo</span>
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