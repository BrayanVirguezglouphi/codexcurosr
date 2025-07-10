import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link, Save, X, Search, ChevronDown, ChevronRight, Target, CheckCircle2, TrendingUp, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const CrearObjetivoDialog = ({ 
  isOpen, 
  onClose, 
  onObjetivoCreated, 
  staff = [] 
}) => {
  const { toast } = useToast();

  // Estado del formulario de objetivo
  const [formObjetivo, setFormObjetivo] = useState({
    titulo: '',
    descripcion: '',
    nivel: '',
    id_responsable: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activo',
    nivel_impacto: '',
    keyResults: [],
    // NUEVAS RELACIONES MÚLTIPLES
    relacionesObjetivos: [], // Array de {id_objetivo, tipo_relacion, peso_relacion, descripcion}
    relacionesKRs: []        // Array de {id_kr, id_objetivo_padre, tipo_relacion, peso_contribucion, porcentaje_impacto, descripcion}
  });

  const [loading, setLoading] = useState(false);
  const [objetivosConKRs, setObjetivosConKRs] = useState([]);
  const [loadingObjetivos, setLoadingObjetivos] = useState(false);
  
  // Estados para el selector múltiple
  const [modalRelacionesOpen, setModalRelacionesOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedObjetivos, setExpandedObjetivos] = useState(new Set());
  const [selectedItems, setSelectedItems] = useState([]);

  // Cargar objetivos con sus Key Results cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      cargarObjetivosConKeyResults();
    }
  }, [isOpen]);

  // Función para cargar objetivos con sus Key Results
  const cargarObjetivosConKeyResults = async () => {
    try {
      setLoadingObjetivos(true);
      
      // Cargar objetivos
      const objetivos = await apiCall('/api/okr/objetivos');
      
      // Para cada objetivo, cargar sus Key Results
      const objetivosConKRs = await Promise.all(
        objetivos.map(async (objetivo) => {
          try {
            const keyResults = await apiCall(`/api/okr/objetivos/${objetivo.id_objetivo}/key-results`);
            return {
              ...objetivo,
              keyResults: keyResults || []
            };
          } catch (error) {
            console.error(`Error cargando KRs para objetivo ${objetivo.id_objetivo}:`, error);
            return {
              ...objetivo,
              keyResults: []
            };
          }
        })
      );
      
      setObjetivosConKRs(objetivosConKRs);
    } catch (error) {
      console.error('Error cargando objetivos:', error);
      toast({
        title: "Advertencia",
        description: "No se pudieron cargar los objetivos existentes",
        variant: "destructive",
      });
    } finally {
      setLoadingObjetivos(false);
    }
  };

  // Resetear formulario
  const resetFormulario = () => {
    setFormObjetivo({
      titulo: '',
      descripcion: '',
      nivel: '',
      id_responsable: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'Activo',
      nivel_impacto: '',
      keyResults: [],
      relacionesObjetivos: [],
      relacionesKRs: []
    });
    setSelectedItems([]);
    setSearchTerm('');
    setExpandedObjetivos(new Set());
    setModalRelacionesOpen(false);
  };

  // Agregar nuevo Key Result
  const agregarKeyResult = () => {
    const nuevoKeyResult = {
      id: Date.now(), // ID temporal para el key
      descripcion: '',
      valor_objetivo: '',
      unidad: '',
      fecha_limite: '',
      id_responsable: ''
    };

    setFormObjetivo(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, nuevoKeyResult]
    }));
  };

  // Eliminar Key Result
  const eliminarKeyResult = (id) => {
    setFormObjetivo(prev => ({
      ...prev,
      keyResults: prev.keyResults.filter(kr => kr.id !== id)
    }));
  };

  // Actualizar Key Result
  const actualizarKeyResult = (id, campo, valor) => {
    setFormObjetivo(prev => ({
      ...prev,
      keyResults: prev.keyResults.map(kr => 
        kr.id === id ? { ...kr, [campo]: valor } : kr
      )
    }));
  };

  // ===== NUEVAS FUNCIONES PARA RELACIONES MÚLTIPLES =====

  // Agregar relación con objetivo
  const agregarRelacionObjetivo = (objetivo) => {
    const nuevaRelacion = {
      id: Date.now(),
      id_objetivo: objetivo.id_objetivo,
      titulo_objetivo: objetivo.titulo,
      nivel_objetivo: objetivo.nivel,
      tipo_relacion: 'contribuye_a',
      peso_relacion: 1.0,
      descripcion_relacion: ''
    };

    setFormObjetivo(prev => ({
      ...prev,
      relacionesObjetivos: [...prev.relacionesObjetivos, nuevaRelacion]
    }));
  };

  // Agregar relación con Key Result
  const agregarRelacionKR = (kr, objetivo) => {
    const nuevaRelacion = {
      id: Date.now(),
      id_kr: kr.id_kr,
      id_objetivo_padre: objetivo.id_objetivo,
      descripcion_kr: kr.descripcion,
      titulo_objetivo_padre: objetivo.titulo,
      tipo_relacion: 'contribuye_a',
      peso_contribucion: 1.0,
      porcentaje_impacto: null,
      descripcion_relacion: ''
    };

    setFormObjetivo(prev => ({
      ...prev,
      relacionesKRs: [...prev.relacionesKRs, nuevaRelacion]
    }));
  };

  // Eliminar relación de objetivo
  const eliminarRelacionObjetivo = (id) => {
    setFormObjetivo(prev => ({
      ...prev,
      relacionesObjetivos: prev.relacionesObjetivos.filter(rel => rel.id !== id)
    }));
  };

  // Eliminar relación de KR
  const eliminarRelacionKR = (id) => {
    setFormObjetivo(prev => ({
      ...prev,
      relacionesKRs: prev.relacionesKRs.filter(rel => rel.id !== id)
    }));
  };

  // Actualizar relación de objetivo
  const actualizarRelacionObjetivo = (id, campo, valor) => {
    setFormObjetivo(prev => ({
      ...prev,
      relacionesObjetivos: prev.relacionesObjetivos.map(rel => 
        rel.id === id ? { ...rel, [campo]: valor } : rel
      )
    }));
  };

  // Actualizar relación de KR
  const actualizarRelacionKR = (id, campo, valor) => {
    setFormObjetivo(prev => ({
      ...prev,
      relacionesKRs: prev.relacionesKRs.map(rel => 
        rel.id === id ? { ...rel, [campo]: valor } : rel
      )
    }));
  };

  // Verificar si un objetivo ya está seleccionado
  const objetivoYaSeleccionado = (objetivoId) => {
    return formObjetivo.relacionesObjetivos.some(rel => rel.id_objetivo === objetivoId);
  };

  // Verificar si un KR ya está seleccionado
  const krYaSeleccionado = (krId) => {
    return formObjetivo.relacionesKRs.some(rel => rel.id_kr === krId);
  };

  // Filtrar objetivos y Key Results según búsqueda
  const filtrarItems = () => {
    if (!searchTerm.trim()) return objetivosConKRs;
    
    const termino = searchTerm.toLowerCase();
    return objetivosConKRs.filter(objetivo => {
      const objetivoMatch = objetivo.titulo.toLowerCase().includes(termino) ||
                           objetivo.descripcion?.toLowerCase().includes(termino);
      const krMatch = objetivo.keyResults.some(kr => 
        kr.descripcion.toLowerCase().includes(termino)
      );
      return objetivoMatch || krMatch;
    }).map(objetivo => ({
      ...objetivo,
      keyResults: objetivo.keyResults.filter(kr =>
        kr.descripcion.toLowerCase().includes(termino) ||
        objetivo.titulo.toLowerCase().includes(termino) ||
        objetivo.descripcion?.toLowerCase().includes(termino)
      )
    }));
  };

  // Manejar expansión/colapso de objetivos
  const toggleExpansion = (objetivoId) => {
    const newExpanded = new Set(expandedObjetivos);
    if (newExpanded.has(objetivoId)) {
      newExpanded.delete(objetivoId);
    } else {
      newExpanded.add(objetivoId);
    }
    setExpandedObjetivos(newExpanded);
  };

  // Función auxiliar para guardar relaciones en la base de datos
  const guardarRelaciones = async (objetivoId) => {
    try {
      // Guardar relaciones con objetivos
      if (formObjetivo.relacionesObjetivos.length > 0) {
        const relacionesObjetivosPromises = formObjetivo.relacionesObjetivos.map(relacion => 
          apiCall('/api/okr/relaciones-objetivos', {
            method: 'POST',
            body: JSON.stringify({
              id_objetivo_origen: objetivoId,
              id_objetivo_destino: relacion.id_objetivo,
              tipo_relacion: relacion.tipo_relacion,
              peso_relacion: relacion.peso_relacion,
              descripcion_relacion: relacion.descripcion_relacion || null
            })
          })
        );
        
        await Promise.all(relacionesObjetivosPromises);
      }

      // Guardar relaciones con Key Results
      if (formObjetivo.relacionesKRs.length > 0) {
        const relacionesKRsPromises = formObjetivo.relacionesKRs.map(relacion => 
          apiCall('/api/okr/relaciones-kr', {
            method: 'POST',
            body: JSON.stringify({
              id_objetivo: objetivoId,
              id_kr: relacion.id_kr,
              tipo_relacion: relacion.tipo_relacion,
              peso_contribucion: relacion.peso_contribucion,
              porcentaje_impacto: relacion.porcentaje_impacto,
              descripcion_relacion: relacion.descripcion_relacion || null
            })
          })
        );
        
        await Promise.all(relacionesKRsPromises);
      }
      
      return true;
    } catch (error) {
      console.error('Error guardando relaciones:', error);
      return false;
    }
  };

  // Manejar envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validaciones básicas
      if (!formObjetivo.titulo.trim()) {
        toast({
          title: "Error",
          description: "El título del objetivo es obligatorio",
          variant: "destructive",
        });
        return;
      }

      if (!formObjetivo.nivel) {
        toast({
          title: "Error",
          description: "El nivel del objetivo es obligatorio",
          variant: "destructive",
        });
        return;
      }

      if (!formObjetivo.id_responsable) {
        toast({
          title: "Error",
          description: "El responsable del objetivo es obligatorio",
          variant: "destructive",
        });
        return;
      }

      const objetivoData = {
        titulo: formObjetivo.titulo.trim(),
        descripcion: formObjetivo.descripcion.trim(),
        nivel: formObjetivo.nivel,
        id_responsable: parseInt(formObjetivo.id_responsable),
        fecha_inicio: formObjetivo.fecha_inicio || null,
        fecha_fin: formObjetivo.fecha_fin || null,
        estado: formObjetivo.estado,
        nivel_impacto: formObjetivo.nivel_impacto ? parseInt(formObjetivo.nivel_impacto) : null
      };

      // Crear objetivo
      const objetivoCreado = await apiCall('/api/okr/objetivos', {
        method: 'POST',
        body: JSON.stringify(objetivoData)
      });

      // Crear Key Results válidos
      const keyResultsValidos = formObjetivo.keyResults.filter(kr => 
        kr.descripcion.trim() && kr.valor_objetivo && !isNaN(parseFloat(kr.valor_objetivo))
      );

      if (keyResultsValidos.length > 0) {
        const keyResultsPromises = keyResultsValidos.map(kr => 
          apiCall('/api/okr/key-results', {
            method: 'POST',
            body: JSON.stringify({
              id_objetivo: objetivoCreado.id_objetivo,
              descripcion: kr.descripcion.trim(),
              valor_objetivo: parseFloat(kr.valor_objetivo),
              unidad: kr.unidad.trim() || 'unidades',
              fecha_limite: kr.fecha_limite || null,
              id_responsable: kr.id_responsable ? parseInt(kr.id_responsable) : null
            })
          })
        );
        
        await Promise.all(keyResultsPromises);
      }

      // Guardar relaciones múltiples
      const relacionesGuardadas = await guardarRelaciones(objetivoCreado.id_objetivo);
      
      // Construir mensaje de éxito
      let relacionMessage = '';
      const totalRelaciones = formObjetivo.relacionesObjetivos.length + formObjetivo.relacionesKRs.length;
      
      if (totalRelaciones > 0) {
        if (relacionesGuardadas) {
          relacionMessage = ` y ${totalRelaciones} relación${totalRelaciones > 1 ? 'es' : ''} configurada${totalRelaciones > 1 ? 's' : ''}`;
        } else {
          relacionMessage = ' (advertencia: algunas relaciones no se pudieron guardar)';
        }
      }

      toast({
        title: "Éxito",
        description: `Objetivo creado correctamente${keyResultsValidos.length > 0 ? ` con ${keyResultsValidos.length} Key Result(s)` : ''}${relacionMessage}`,
      });

      // Notificar creación y cerrar
      if (onObjetivoCreated) {
        onObjetivoCreated();
      }
      
      resetFormulario();
      onClose();

    } catch (error) {
      console.error('Error creando objetivo:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el objetivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetFormulario();
    onClose();
  };

  const objetivosFiltrados = filtrarItems();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Crear Nuevo Objetivo OKR
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full">
            {/* Layout Horizontal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6">
              
              {/* LADO IZQUIERDO: Formulario del Objetivo */}
              <div className="space-y-6 overflow-y-auto pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Save className="h-5 w-5" />
                      Información del Objetivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Título */}
                    <div>
                      <Label htmlFor="titulo">Título del Objetivo *</Label>
                      <Input
                        id="titulo"
                        value={formObjetivo.titulo}
                        onChange={(e) => setFormObjetivo(prev => ({ ...prev, titulo: e.target.value }))}
                        required
                        placeholder="Ej: Incrementar las ventas en un 20% durante Q1"
                        className="mt-1"
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formObjetivo.descripcion}
                        onChange={(e) => setFormObjetivo(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Describe el objetivo y su propósito..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Nivel y Responsable */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nivel">Nivel del Objetivo *</Label>
                        <Select value={formObjetivo.nivel} onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, nivel: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Empresa">Empresa</SelectItem>
                            <SelectItem value="Departamento">Departamento</SelectItem>
                            <SelectItem value="Equipo">Equipo</SelectItem>
                            <SelectItem value="Individual">Individual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="responsable">Responsable *</Label>
                        <Select value={formObjetivo.id_responsable} onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, id_responsable: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar responsable" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map(person => (
                              <SelectItem key={person.id_staff} value={person.id_staff.toString()}>
                                {person.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                        <Input
                          type="date"
                          id="fecha_inicio"
                          value={formObjetivo.fecha_inicio}
                          onChange={(e) => setFormObjetivo(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                        <Input
                          type="date"
                          id="fecha_fin"
                          value={formObjetivo.fecha_fin}
                          onChange={(e) => setFormObjetivo(prev => ({ ...prev, fecha_fin: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Estado e Impacto */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Select value={formObjetivo.estado} onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, estado: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Completado">Completado</SelectItem>
                            <SelectItem value="En Riesgo">En Riesgo</SelectItem>
                            <SelectItem value="Pausado">Pausado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="nivel_impacto">Nivel de Impacto (1-10)</Label>
                        <Input
                          type="number"
                          id="nivel_impacto"
                          value={formObjetivo.nivel_impacto}
                          onChange={(e) => setFormObjetivo(prev => ({ ...prev, nivel_impacto: e.target.value }))}
                          min="1"
                          max="10"
                          step="1"
                          placeholder="5"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Sección Relaciones Múltiples */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Relaciones con OKRs (Opcional)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setModalRelacionesOpen(true)}
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>

                      {/* Resumen de relaciones */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">Objetivos</span>
                            </div>
                            <Badge variant="secondary">{formObjetivo.relacionesObjetivos.length}</Badge>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Key Results</span>
                            </div>
                            <Badge variant="secondary">{formObjetivo.relacionesKRs.length}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Lista compacta de relaciones */}
                      {(formObjetivo.relacionesObjetivos.length > 0 || formObjetivo.relacionesKRs.length > 0) && (
                        <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg border">
                          {formObjetivo.relacionesObjetivos.map((rel) => (
                            <div key={rel.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Target className="h-3 w-3 text-orange-500 flex-shrink-0" />
                                <span className="truncate">{rel.titulo_objetivo}</span>
                                <Badge variant="outline" className="text-xs">{rel.tipo_relacion}</Badge>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarRelacionObjetivo(rel.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          
                          {formObjetivo.relacionesKRs.map((rel) => (
                            <div key={rel.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <TrendingUp className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{rel.descripcion_kr}</span>
                                <Badge variant="outline" className="text-xs">{rel.tipo_relacion}</Badge>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarRelacionKR(rel.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700" 
                    disabled={loading}
                  >
                    {loading ? 'Creando...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Crear Objetivo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* LADO DERECHO: Lista de Key Results */}
              <div className="space-y-6 border-l pl-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Plus className="h-5 w-5" />
                        Key Results ({formObjetivo.keyResults.length})
                      </CardTitle>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={agregarKeyResult}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar KR
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {formObjetivo.keyResults.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="mb-3">No hay Key Results agregados</p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={agregarKeyResult}
                            size="sm"
                          >
                            Agregar primer Key Result
                          </Button>
                        </div>
                      ) : (
                        formObjetivo.keyResults.map((kr, index) => (
                          <Card key={kr.id} className="border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  Key Result #{index + 1}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => eliminarKeyResult(kr.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {/* Descripción */}
                              <div>
                                <Label className="text-xs">Descripción del Key Result *</Label>
                                <Textarea
                                  placeholder="Ej: Cerrar 50 nuevas ventas"
                                  value={kr.descripcion}
                                  onChange={(e) => actualizarKeyResult(kr.id, 'descripcion', e.target.value)}
                                  rows={2}
                                  className="mt-1 text-sm"
                                />
                              </div>

                              {/* Valor objetivo y Unidad */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Valor Objetivo *</Label>
                                  <Input
                                    type="number"
                                    placeholder="50"
                                    value={kr.valor_objetivo}
                                    onChange={(e) => actualizarKeyResult(kr.id, 'valor_objetivo', e.target.value)}
                                    className="mt-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Unidad</Label>
                                  <Input
                                    placeholder="ventas, %, etc."
                                    value={kr.unidad}
                                    onChange={(e) => actualizarKeyResult(kr.id, 'unidad', e.target.value)}
                                    className="mt-1 text-sm"
                                  />
                                </div>
                              </div>

                              {/* Fecha límite y Responsable */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Fecha Límite</Label>
                                  <Input
                                    type="date"
                                    value={kr.fecha_limite}
                                    onChange={(e) => actualizarKeyResult(kr.id, 'fecha_limite', e.target.value)}
                                    className="mt-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Responsable</Label>
                                  <Select
                                    value={kr.id_responsable}
                                    onValueChange={(value) => actualizarKeyResult(kr.id, 'id_responsable', value)}
                                  >
                                    <SelectTrigger className="mt-1 text-sm">
                                      <SelectValue placeholder="Opcional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">Sin asignar</SelectItem>
                                      {staff.map(person => (
                                        <SelectItem key={person.id_staff} value={person.id_staff.toString()}>
                                          {person.nombre}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Resumen */}
                {formObjetivo.keyResults.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h4 className="font-semibold text-blue-900 mb-2">Resumen</h4>
                        <p className="text-sm text-blue-700">
                          Se crearán <strong>{formObjetivo.keyResults.filter(kr => kr.descripcion.trim() && kr.valor_objetivo).length}</strong> Key Results válidos
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>

      {/* Modal para Agregar Relaciones Múltiples */}
      <Dialog open={modalRelacionesOpen} onOpenChange={setModalRelacionesOpen}>
        <DialogContent className="max-w-6xl w-full h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-purple-600" />
              Agregar Relaciones OKR
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar objetivos o Key Results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de objetivos - área scrolleable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loadingObjetivos ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Cargando objetivos...</p>
                </div>
              ) : (
                <div className="space-y-3 pr-2">
                {filtrarItems().map((objetivo) => (
                  <div key={objetivo.id_objetivo} className="border rounded-lg p-4 bg-white shadow-sm">
                    {/* Objetivo principal */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleExpansion(objetivo.id_objetivo)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          {expandedObjetivos.has(objetivo.id_objetivo) ? 
                            <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          }
                        </button>
                        
                        <Target className={`h-4 w-4 ${objetivo.nivel === 'Empresa' ? 'text-red-500' : 
                          objetivo.nivel === 'Departamento' ? 'text-yellow-500' : 
                          objetivo.nivel === 'Equipo' ? 'text-blue-500' : 'text-green-500'}`} />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {objetivo.titulo}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {objetivo.nivel} • {objetivo.estado} • {objetivo.keyResults?.length || 0} KRs
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => agregarRelacionObjetivo(objetivo)}
                        disabled={objetivoYaSeleccionado(objetivo.id_objetivo)}
                        variant={objetivoYaSeleccionado(objetivo.id_objetivo) ? "secondary" : "outline"}
                        size="sm"
                        className={objetivoYaSeleccionado(objetivo.id_objetivo) ? 
                          'bg-green-100 text-green-700 border-green-300' : 
                          'text-purple-600 border-purple-300 hover:bg-purple-50'
                        }
                      >
                        {objetivoYaSeleccionado(objetivo.id_objetivo) ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Agregado
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Relacionar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Key Results (mostrar solo si está expandido) */}
                    {expandedObjetivos.has(objetivo.id_objetivo) && objetivo.keyResults?.length > 0 && (
                      <div className="ml-8 space-y-2 border-l-2 border-blue-200 pl-4">
                        {objetivo.keyResults.map((kr) => (
                          <div key={kr.id_kr} 
                               className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3 flex-1">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {kr.descripcion}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Meta: {kr.valor_objetivo} {kr.unidad || 'unidades'}
                                </p>
                              </div>
                            </div>

                            <Button
                              type="button"
                              onClick={() => agregarRelacionKR(kr, objetivo)}
                              disabled={krYaSeleccionado(kr.id_kr)}
                              variant={krYaSeleccionado(kr.id_kr) ? "secondary" : "outline"}
                              size="sm"
                              className={krYaSeleccionado(kr.id_kr) ? 
                                'bg-green-100 text-green-700 border-green-300' : 
                                'text-blue-600 border-blue-300 hover:bg-blue-50'
                              }
                            >
                              {krYaSeleccionado(kr.id_kr) ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Agregado
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Relacionar
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {filtrarItems().length === 0 && searchTerm && (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No se encontraron resultados</p>
                    <p className="text-sm">Intenta con otros términos de búsqueda</p>
                  </div>
                )}
                </div>
              )}
            </div>

            {/* Resumen de selecciones en el modal */}
            <div className="border-t pt-4 flex-shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Objetivos seleccionados</span>
                  </div>
                  <Badge variant="secondary">{formObjetivo.relacionesObjetivos.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Key Results seleccionados</span>
                  </div>
                  <Badge variant="secondary">{formObjetivo.relacionesKRs.length}</Badge>
                </div>
              </div>
            </div>

            {/* Botones del modal */}
            <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalRelacionesOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
              <Button 
                type="button" 
                onClick={() => setModalRelacionesOpen(false)}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={formObjetivo.relacionesObjetivos.length === 0 && formObjetivo.relacionesKRs.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Aplicar Relaciones ({formObjetivo.relacionesObjetivos.length + formObjetivo.relacionesKRs.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CrearObjetivoDialog; 