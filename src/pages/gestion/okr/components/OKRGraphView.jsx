import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Plus, RotateCcw, ZoomIn, ZoomOut, Maximize, Move, Network, Filter, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OKRGraphView = ({ 
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
  const containerRef = useRef(null);
  
  // Estados para zoom y pan del canvas
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });

  // Estados para el grafo
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Estados para drag individual de nodos
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragVelocity, setDragVelocity] = useState({ x: 0, y: 0 });
  const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });
  const [lastDragTime, setLastDragTime] = useState(0);
  const [bouncingNodes, setBouncingNodes] = useState(new Set());

  // Estados para agrupación
  const [groupBy, setGroupBy] = useState(''); // 'nivel', 'estado', 'responsable', ''
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    cargarObjetivos();
  }, []);

  useEffect(() => {
    if (objetivos.length > 0) {
      inicializarGrafo();
    }
  }, [objetivos, filtroNivel, filtroEstado, groupBy]);

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

  // Efectos para drag individual de nodos
  useEffect(() => {
    const handleNodeMouseMove = (e) => handleNodeDragMove(e);
    const handleNodeMouseUp = () => handleNodeDragEnd();

    if (draggingNode) {
      document.addEventListener('mousemove', handleNodeMouseMove);
      document.addEventListener('mouseup', handleNodeMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleNodeMouseMove);
      document.removeEventListener('mouseup', handleNodeMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [draggingNode, dragOffset]);

  // Efecto para aplicar inercia después del drag
  useEffect(() => {
    if (!draggingNode && (Math.abs(dragVelocity.x) > 0.1 || Math.abs(dragVelocity.y) > 0.1)) {
      const applyInertia = () => {
        setNodes(prevNodes => {
          return prevNodes.map(node => {
            if (node.id === lastDragPosition.nodeId) {
              const newVx = dragVelocity.x * 0.95; // Fricción
              const newVy = dragVelocity.y * 0.95;
              
              if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1) {
                return node; // Detener inercia
              }
              
              return {
                ...node,
                x: node.x + newVx,
                y: node.y + newVy,
                vx: newVx,
                vy: newVy
              };
            }
            return node;
          });
        });
        
        setDragVelocity(prev => ({
          x: prev.x * 0.95,
          y: prev.y * 0.95
        }));
      };

      const inertiaInterval = setInterval(() => {
        if (Math.abs(dragVelocity.x) > 0.1 || Math.abs(dragVelocity.y) > 0.1) {
          applyInertia();
        } else {
          clearInterval(inertiaInterval);
          setDragVelocity({ x: 0, y: 0 });
        }
      }, 16); // ~60fps

      return () => clearInterval(inertiaInterval);
    }
  }, [draggingNode, dragVelocity, lastDragPosition]);

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

  // Crear grupos según el atributo seleccionado
  const crearGrupos = (objetivosFiltrados) => {
    if (!groupBy) return [];

    const groupsMap = {};
    const groupColors = {
      'Empresa': '#6366f1',
      'Departamento': '#8b5cf6', 
      'Equipo': '#06b6d4',
      'Individual': '#10b981',
      'Activo': '#10B981',
      'Completado': '#3B82F6',
      'En Riesgo': '#F59E0B',
      'Pausado': '#EF4444'
    };

    objetivosFiltrados.forEach(obj => {
      let groupKey;
      let groupLabel;
      
      switch (groupBy) {
        case 'nivel':
          groupKey = obj.nivel;
          groupLabel = obj.nivel;
          break;
        case 'estado':
          groupKey = obj.estado;
          groupLabel = obj.estado;
          break;
        case 'responsable':
          groupKey = obj.id_responsable;
          groupLabel = staff.find(s => s.id_staff === obj.id_responsable)?.nombre || 'Sin asignar';
          break;
        default:
          return;
      }

      if (!groupsMap[groupKey]) {
        groupsMap[groupKey] = {
          id: groupKey,
          label: groupLabel,
          color: groupColors[groupLabel] || '#6B7280',
          nodes: []
        };
      }
      
      groupsMap[groupKey].nodes.push(obj.id_objetivo);
    });

    return Object.values(groupsMap);
  };

  // Inicializar grafo con force simulation mejorada
  const inicializarGrafo = useCallback(() => {
    // Filtrar objetivos
    const objetivosFiltrados = objetivos.filter(obj => {
      const pasaNivel = !filtroNivel || obj.nivel === filtroNivel;
      const pasaEstado = !filtroEstado || obj.estado === filtroEstado;
      return pasaNivel && pasaEstado;
    });

    if (objetivosFiltrados.length === 0) {
      setNodes([]);
      setEdges([]);
      setGroups([]);
      return;
    }

    // Crear grupos si es necesario
    const newGroups = crearGrupos(objetivosFiltrados);
    setGroups(newGroups);

    // Crear mapa de conexiones para calcular grado de cada nodo
    const conexiones = new Map();
    objetivosFiltrados.forEach(obj => {
      conexiones.set(obj.id_objetivo, { inbound: 0, outbound: 0, total: 0 });
    });

    // Calcular conexiones
    objetivosFiltrados.forEach(obj => {
      if (obj.id_objetivo_preexistente && conexiones.has(obj.id_objetivo_preexistente)) {
        conexiones.get(obj.id_objetivo_preexistente).outbound += 1;
        conexiones.get(obj.id_objetivo).inbound += 1;
      }
    });

    // Calcular total de conexiones
    conexiones.forEach((conn, id) => {
      conn.total = conn.inbound + conn.outbound;
    });

    // Crear nodos con posicionamiento por grupos
    const newNodes = objetivosFiltrados.map((obj, index) => {
      const conn = conexiones.get(obj.id_objetivo) || { total: 0 };
      const responsable = staff.find(s => s.id_staff === obj.id_responsable);
      
      // Calcular tamaño del nodo basado en conexiones (min: 40, max: 80)
      const size = Math.max(40, Math.min(80, 40 + (conn.total * 8)));
      
      // Posicionamiento inicial considerando grupos
      let x, y;
      if (groupBy && newGroups.length > 0) {
        const group = newGroups.find(g => {
          switch (groupBy) {
            case 'nivel': return g.id === obj.nivel;
            case 'estado': return g.id === obj.estado;
            case 'responsable': return g.id === obj.id_responsable;
            default: return false;
          }
        });
        
        if (group) {
          const groupIndex = newGroups.indexOf(group);
          const nodeIndexInGroup = group.nodes.indexOf(obj.id_objetivo);
          const groupAngle = (groupIndex / newGroups.length) * 2 * Math.PI;
          const groupRadius = 150;
          const nodeAngle = (nodeIndexInGroup / group.nodes.length) * 2 * Math.PI;
          const nodeRadius = 60;
          
          x = 400 + Math.cos(groupAngle) * groupRadius + Math.cos(nodeAngle) * nodeRadius;
          y = 300 + Math.sin(groupAngle) * groupRadius + Math.sin(nodeAngle) * nodeRadius;
        } else {
          x = Math.random() * 600 + 100;
          y = Math.random() * 400 + 100;
        }
      } else {
        x = Math.random() * 600 + 100;
        y = Math.random() * 400 + 100;
      }
      
      return {
        id: obj.id_objetivo,
        data: obj,
        x,
        y,
        size,
        connections: conn,
        responsable_nombre: responsable?.nombre || 'Sin asignar',
        // Velocidades para la simulación
        vx: 0,
        vy: 0,
        group: groupBy ? (groupBy === 'nivel' ? obj.nivel : groupBy === 'estado' ? obj.estado : obj.id_responsable) : null
      };
    });

    // Crear edges (aristas) con puntos de conexión precisos
    const newEdges = [];
    objetivosFiltrados.forEach(obj => {
      if (obj.id_objetivo_preexistente) {
        const sourceNode = newNodes.find(n => n.id === obj.id_objetivo_preexistente);
        const targetNode = newNodes.find(n => n.id === obj.id_objetivo);
        
        if (sourceNode && targetNode) {
          newEdges.push({
            id: `${obj.id_objetivo_preexistente}-${obj.id_objetivo}`,
            source: sourceNode,
            target: targetNode,
            sourceId: obj.id_objetivo_preexistente,
            targetId: obj.id_objetivo
          });
        }
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);

    // Iniciar simulación de fuerzas
    iniciarSimulacion(newNodes, newEdges);
  }, [objetivos, filtroNivel, filtroEstado, staff, groupBy]);

  // Simulación de fuerzas mejorada
  const iniciarSimulacion = (nodes, edges) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width || 800;
    const height = containerRect.height || 600;

    let simulationNodes = [...nodes];
    
    const tick = () => {
      // Fuerzas de repulsión entre nodos
      for (let i = 0; i < simulationNodes.length; i++) {
        for (let j = i + 1; j < simulationNodes.length; j++) {
          const nodeA = simulationNodes[i];
          const nodeB = simulationNodes[j];
          
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0 && distance < 120) {
            const force = 120 / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            nodeA.vx -= fx;
            nodeA.vy -= fy;
            nodeB.vx += fx;
            nodeB.vy += fy;
          }
        }
      }

      // Fuerzas de atracción en los edges
      edges.forEach(edge => {
        const sourceNode = simulationNodes.find(n => n.id === edge.sourceId);
        const targetNode = simulationNodes.find(n => n.id === edge.targetId);
        
        if (!sourceNode || !targetNode) return;
        
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = 100;
        
        if (distance > 0) {
          const force = (distance - targetDistance) * 0.01;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // Fuerza hacia el centro (más suave)
      simulationNodes.forEach(node => {
        const centerX = width / 2;
        const centerY = height / 2;
        node.vx += (centerX - node.x) * 0.0005;
        node.vy += (centerY - node.y) * 0.0005;
      });

      // Aplicar velocidades y fricción
      simulationNodes.forEach(node => {
        // No aplicar física a nodos que se están arrastrando manualmente
        const isBeingDragged = draggingNode?.id === node.id;
        // Tampoco aplicar a nodos que tienen inercia del drag reciente
        const hasRecentInertia = Math.abs(dragVelocity.x) > 0.1 || Math.abs(dragVelocity.y) > 0.1;
        const isInertiaNode = lastDragPosition.nodeId === node.id && hasRecentInertia;
        
        if (!isBeingDragged && !isInertiaNode) {
          node.vx *= 0.95; // fricción reducida
          node.vy *= 0.95;
          node.x += node.vx;
          node.y += node.vy;
          
          // Mantener dentro de los límites con rebote suave
          let bounced = false;
          
          if (node.x < node.size) {
            node.x = node.size;
            node.vx *= -0.3; // Rebote suave
            bounced = true;
          }
          if (node.x > width - node.size) {
            node.x = width - node.size;
            node.vx *= -0.3;
            bounced = true;
          }
          if (node.y < node.size) {
            node.y = node.size;
            node.vy *= -0.3;
            bounced = true;
          }
          if (node.y > height - node.size) {
            node.y = height - node.size;
            node.vy *= -0.3;
            bounced = true;
          }
          
          // Activar efecto de rebote
          if (bounced) {
            setBouncingNodes(prev => {
              const newBouncing = new Set(prev);
              newBouncing.add(node.id);
              
              // Quitar el efecto después de 300ms
              setTimeout(() => {
                setBouncingNodes(current => {
                  const updated = new Set(current);
                  updated.delete(node.id);
                  return updated;
                });
              }, 300);
              
              return newBouncing;
            });
          }
        }
      });

      // Actualizar estados con referencias correctas para los edges
      setNodes(prevNodes => {
        const updatedNodes = [...simulationNodes];
        actualizarEdges(updatedNodes);
        return updatedNodes;
      });
    };

    // Ejecutar simulación por más tiempo para grupos
    const interval = setInterval(tick, 50);
    const duration = groupBy ? 8000 : 5000; // Más tiempo si hay grupos
    
    setTimeout(() => {
      clearInterval(interval);
    }, duration);

    return () => clearInterval(interval);
  };

  // Calcular puntos de conexión precisos en el borde del círculo
  const calcularPuntosConexion = (sourceNode, targetNode) => {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x1: sourceNode.x, y1: sourceNode.y, x2: targetNode.x, y2: targetNode.y };
    
    const sourceRadius = sourceNode.size / 2;
    const targetRadius = targetNode.size / 2;
    
    const x1 = sourceNode.x + (dx / distance) * sourceRadius;
    const y1 = sourceNode.y + (dy / distance) * sourceRadius;
    const x2 = targetNode.x - (dx / distance) * targetRadius;
    const y2 = targetNode.y - (dy / distance) * targetRadius;
    
    return { x1, y1, x2, y2 };
  };

  // Obtener color del nodo según estado (semáforo)
  const getNodeColor = (estado) => {
    switch (estado) {
      case 'Activo': return '#10B981'; // Verde
      case 'Completado': return '#3B82F6'; // Azul
      case 'En Riesgo': return '#F59E0B'; // Amarillo
      case 'Pausado': return '#EF4444'; // Rojo
      default: return '#6B7280'; // Gris
    }
  };

  // Obtener nodos conectados directamente
  const getConnectedNodes = (nodeId) => {
    const connected = new Set();
    
    edges.forEach(edge => {
      if (edge.sourceId === nodeId) {
        connected.add(edge.targetId);
      }
      if (edge.targetId === nodeId) {
        connected.add(edge.sourceId);
      }
    });
    
    return connected;
  };

  // Manejar selección de nodo
  const handleNodeClick = (node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
  };

  // Función para actualizar edges cuando los nodos cambian
  const actualizarEdges = useCallback((updatedNodes) => {
    setEdges(prevEdges => {
      return prevEdges.map(edge => {
        const sourceNode = updatedNodes.find(n => n.id === edge.sourceId);
        const targetNode = updatedNodes.find(n => n.id === edge.targetId);
        
        if (sourceNode && targetNode) {
          return {
            ...edge,
            source: sourceNode,
            target: targetNode
          };
        }
        return edge;
      });
    });
  }, []);

  // Drag individual de nodos
  const handleNodeDragStart = (e, node) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    });
    
    setDraggingNode(node);
    setDragVelocity({ x: 0, y: 0 });
    setLastDragPosition({ 
      x: e.clientX, 
      y: e.clientY, 
      nodeId: node.id,
      time: Date.now()
    });
    setLastDragTime(Date.now());
  };

  const handleNodeDragMove = (e) => {
    if (!draggingNode || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentTime = Date.now();
    
    // Calcular nueva posición considerando zoom y pan
    const newX = (e.clientX - containerRect.left - pan.x - dragOffset.x) / zoom;
    const newY = (e.clientY - containerRect.top - pan.y - dragOffset.y) / zoom;
    
    // Calcular velocidad para inercia
    const deltaTime = currentTime - lastDragTime;
    if (deltaTime > 0) {
      const deltaX = e.clientX - lastDragPosition.x;
      const deltaY = e.clientY - lastDragPosition.y;
      
      setDragVelocity({
        x: (deltaX / deltaTime) * 16, // Normalizar a 60fps
        y: (deltaY / deltaTime) * 16
      });
    }
    
    setLastDragPosition({ 
      x: e.clientX, 
      y: e.clientY, 
      nodeId: draggingNode.id,
      time: currentTime
    });
    setLastDragTime(currentTime);

    // Actualizar posición del nodo con suavizado
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node => {
        if (node.id === draggingNode.id) {
          // Aplicar un poco de suavizado al movimiento
          const smoothingFactor = 0.8;
          const smoothedX = node.x + (newX - node.x) * smoothingFactor;
          const smoothedY = node.y + (newY - node.y) * smoothingFactor;
          
          return {
            ...node,
            x: smoothedX,
            y: smoothedY,
            vx: 0,
            vy: 0
          };
        }
        return node;
      });
      
      // Actualizar las referencias en los edges
      actualizarEdges(updatedNodes);
      
      return updatedNodes;
    });
  };

  const handleNodeDragEnd = () => {
    if (draggingNode) {
      // Aplicar inercia final basada en velocidad
      setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
          if (node.id === draggingNode.id) {
            return {
              ...node,
              vx: dragVelocity.x * 0.5, // Inercia inicial
              vy: dragVelocity.y * 0.5
            };
          }
          return node;
        });
        
        actualizarEdges(updatedNodes);
        return updatedNodes;
      });
      
      toast({
        title: "Nodo reposicionado",
        description: `Objetivo "${draggingNode.data.titulo}" movido con inercia natural`,
      });
    }
    
    setDraggingNode(null);
    setDragOffset({ x: 0, y: 0 });
    
    // Mantener velocidad para inercia
    setTimeout(() => {
      setDragVelocity({ x: 0, y: 0 });
    }, 2000); // Limpiar velocidad después de 2 segundos
  };

  // Manejo de zoom y pan del canvas
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === e.currentTarget || e.target.closest('.graph-container')) {
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

  // Reorganizar nodos aleatoriamente
  const reorganizarGrafo = () => {
    const newNodes = nodes.map(node => ({
      ...node,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      vx: 0,
      vy: 0
    }));
    
    setNodes(newNodes);
    iniciarSimulacion(newNodes, edges);
    
    toast({
      title: "Grafo reorganizado",
      description: "Los nodos han sido redistribuidos aleatoriamente",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando vista de grafos...</span>
      </div>
    );
  }

  const connectedNodes = selectedNode ? getConnectedNodes(selectedNode) : new Set();

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vista de Grafos OKR</h2>
            <p className="text-sm text-gray-600">
              {nodes.length} nodos • {edges.length} conexiones • {groups.length > 0 ? `${groups.length} grupos` : 'Sin agrupación'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Agrupación */}
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Agrupar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin agrupación</SelectItem>
              <SelectItem value="nivel">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Por Nivel
                </div>
              </SelectItem>
              <SelectItem value="estado">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Por Estado
                </div>
              </SelectItem>
              <SelectItem value="responsable">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Por Responsable
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

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

          {/* Controles del grafo */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reorganizarGrafo}
            title="Reorganizar nodos"
          >
            <Move className="h-4 w-4 mr-1" />
            Reorganizar
          </Button>

          {/* Controles de zoom */}
          <div className="flex items-center gap-1 border rounded-md">
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
            onClick={handleResetView}
            title="Reset vista"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button onClick={onCreateObjective} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Objetivo
          </Button>
        </div>
      </div>

      {/* Área del grafo */}
      <div 
        ref={containerRef}
        className="bg-white rounded-lg border shadow-sm overflow-hidden relative graph-container"
        style={{ 
          height: '600px',
          cursor: isDraggingCanvas ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
      >
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Network className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium">No hay objetivos para mostrar</h3>
            <p className="text-sm">Crea tu primer objetivo o ajusta los filtros</p>
          </div>
        ) : (
          <div 
            className={`absolute inset-0 graph-canvas ${isDraggingCanvas ? 'dragging' : ''}`}
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Círculos de grupos de fondo */}
            {groups.map((group, index) => {
              const groupNodes = nodes.filter(node => node.group === group.id);
              if (groupNodes.length === 0) return null;
              
              // Calcular centro y radio del grupo
              const centerX = groupNodes.reduce((sum, node) => sum + node.x, 0) / groupNodes.length;
              const centerY = groupNodes.reduce((sum, node) => sum + node.y, 0) / groupNodes.length;
              const maxDistance = Math.max(...groupNodes.map(node => 
                Math.sqrt((node.x - centerX) ** 2 + (node.y - centerY) ** 2)
              ));
              const radius = Math.max(80, maxDistance + 50);
              
              return (
                <div
                  key={group.id}
                  className="absolute rounded-full border-2 border-dashed opacity-20"
                  style={{
                    left: centerX - radius,
                    top: centerY - radius,
                    width: radius * 2,
                    height: radius * 2,
                    backgroundColor: group.color,
                    borderColor: group.color,
                    pointerEvents: 'none'
                  }}
                />
              );
            })}

            {/* SVG para las conexiones */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <marker
                  id="arrowhead-graph-light"
                  markerWidth="6"
                  markerHeight="4"
                  refX="5"
                  refY="2"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 6 2, 0 4"
                    fill="#D1D5DB"
                  />
                </marker>
                <marker
                  id="arrowhead-graph-highlighted"
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
              
              {edges.map(edge => {
                const isHighlighted = selectedNode && (
                  edge.sourceId === selectedNode || edge.targetId === selectedNode
                );
                const isConnected = selectedNode && connectedNodes.size > 0;
                
                // Calcular puntos de conexión precisos
                const { x1, y1, x2, y2 } = calcularPuntosConexion(edge.source, edge.target);
                
                return (
                  <line
                    key={edge.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isHighlighted ? "#3B82F6" : "#D1D5DB"}
                    strokeWidth={isHighlighted ? 2 : 1}
                    opacity={isConnected && !isHighlighted ? 0.2 : 0.6}
                    markerEnd={isHighlighted ? "url(#arrowhead-graph-highlighted)" : "url(#arrowhead-graph-light)"}
                    className={`graph-edge ${isHighlighted ? 'highlighted' : ''}`}
                  />
                );
              })}
            </svg>

            {/* Nodos */}
            {nodes.map(node => {
              const isSelected = selectedNode === node.id;
              const isConnected = selectedNode && connectedNodes.has(node.id);
              const isOther = selectedNode && selectedNode !== node.id && !connectedNodes.has(node.id);
              const isDragging = draggingNode?.id === node.id;
              const isBouncing = bouncingNodes.has(node.id);
              
              return (
                <motion.div
                  key={node.id}
                  className={`absolute cursor-pointer select-none graph-node ${
                    isOther ? 'opacity-30' : 'opacity-100'
                  } ${isDragging ? 'z-50 dragging' : 'z-10'} ${
                    isSelected ? 'selected' : ''
                                     } ${Math.abs(dragVelocity.x) > 0.1 || Math.abs(dragVelocity.y) > 0.1 ? 'with-inertia' : 'smooth-movement'} ${
                     isBouncing ? 'bounce-effect' : ''
                   }`}
                  style={{
                    left: node.x - node.size / 2,
                    top: node.y - node.size / 2,
                    width: node.size,
                    height: node.size
                  }}
                  animate={{
                    scale: isSelected ? 1.2 : isConnected ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseDown={(e) => handleNodeDragStart(e, node)}
                >
                  {/* Círculo del nodo */}
                  <div
                    className={`w-full h-full rounded-full border-4 flex items-center justify-center text-white font-bold shadow-lg graph-circle ${
                      isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                    } node-${node.data.estado.toLowerCase().replace(' ', '-')}`}
                    style={{
                      backgroundColor: getNodeColor(node.data.estado),
                      borderColor: isSelected ? '#3B82F6' : 'white',
                      fontSize: `${Math.max(10, node.size / 5)}px`
                    }}
                  >
                    {/* Mostrar ID del objetivo */}
                    <span>#{node.data.id_objetivo}</span>
                  </div>

                  {/* Tooltip con información */}
                  {(hoveredNode === node.id || isSelected) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 min-w-[220px] graph-tooltip"
                    >
                      <div className="font-semibold mb-1 line-clamp-2">
                        #{node.data.id_objetivo}: {node.data.titulo}
                      </div>
                      <div className="space-y-1 text-gray-300">
                        <div>👤 {node.responsable_nombre}</div>
                        <div>📊 {node.data.nivel}</div>
                        <div>🔄 {node.data.estado}</div>
                        <div>🔗 {node.connections.total} conexiones</div>
                        <div>📈 {node.connections.inbound} ← | → {node.connections.outbound}</div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex gap-1 mt-2 pt-2 border-t border-gray-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewObjective(node.data);
                          }}
                          className="h-6 w-6 p-0 text-white hover:bg-gray-700"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditObjective(node.data);
                          }}
                          className="h-6 w-6 p-0 text-white hover:bg-gray-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Colores */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Estados (Semáforo)</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>En Riesgo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Pausado</span>
              </div>
            </div>
          </div>
          
          {/* Instrucciones */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Interacciones</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>🖱️ Click: resaltar conexiones</div>
              <div>✋ Drag nodo: mover individualmente</div>
              <div>📏 Tamaño: cantidad de conexiones</div>
              <div>#️⃣ ID dentro del círculo</div>
              <div>🔗 Flechas grises ligeras</div>
            </div>
          </div>
        </div>
        
        {/* Grupos activos */}
        {groups.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Grupos Activos ({groupBy})</h4>
            <div className="flex flex-wrap gap-2">
              {groups.map(group => (
                <Badge 
                  key={group.id} 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: group.color, color: group.color }}
                >
                  {group.label} ({group.nodes.length})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OKRGraphView; 