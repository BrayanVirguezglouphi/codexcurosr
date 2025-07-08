import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link, Save, X, Search, ChevronDown, ChevronRight, Target, CheckCircle2 } from 'lucide-react';
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
    id_objetivo_preexistente: '',
    id_key_result_preexistente: '',
    tipo_relacion: '', // 'objetivo' o 'key_result'
    nivel_impacto: '',
    keyResults: []
  });

  const [loading, setLoading] = useState(false);
  const [objetivosConKRs, setObjetivosConKRs] = useState([]);
  const [loadingObjetivos, setLoadingObjetivos] = useState(false);
  
  // Estados para el dropdown avanzado
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedObjetivos, setExpandedObjetivos] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);

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
      id_objetivo_preexistente: '',
      id_key_result_preexistente: '',
      tipo_relacion: '',
      nivel_impacto: '',
      keyResults: []
    });
    setSelectedItem(null);
    setSearchTerm('');
    setExpandedObjetivos(new Set());
    setDropdownOpen(false);
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

  // Manejar selección de item
  const handleSelectItem = (item, tipo) => {
    setSelectedItem(item);
    setFormObjetivo(prev => ({
      ...prev,
      tipo_relacion: tipo,
      id_objetivo_preexistente: tipo === 'objetivo' ? item.id_objetivo : item.id_objetivo_padre || '',
      id_key_result_preexistente: tipo === 'key_result' ? item.id_key_result : ''
    }));
    setDropdownOpen(false);
  };

  // Obtener texto del item seleccionado
  const getSelectedText = () => {
    if (!selectedItem) return "Seleccionar objetivo o Key Result";
    
    if (formObjetivo.tipo_relacion === 'objetivo') {
      return `🎯 ${selectedItem.titulo}`;
    } else if (formObjetivo.tipo_relacion === 'key_result') {
      const objetivo = objetivosConKRs.find(obj => 
        obj.keyResults.some(kr => kr.id_key_result === selectedItem.id_key_result)
      );
      return `📊 ${selectedItem.descripcion} (${objetivo?.titulo || 'Objetivo'})`;
    }
    
    return "Seleccionar objetivo o Key Result";
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
        id_objetivo_preexistente: formObjetivo.id_objetivo_preexistente ? parseInt(formObjetivo.id_objetivo_preexistente) : null,
        id_key_result_preexistente: formObjetivo.id_key_result_preexistente ? parseInt(formObjetivo.id_key_result_preexistente) : null,
        tipo_relacion: formObjetivo.tipo_relacion || null,
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

      let relacionMessage = '';
      if (formObjetivo.tipo_relacion === 'objetivo') {
        relacionMessage = ' y relacionado con objetivo preexistente';
      } else if (formObjetivo.tipo_relacion === 'key_result') {
        relacionMessage = ' y relacionado con Key Result preexistente';
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

                    {/* Dropdown Simplificado para Objetivos/Key Results */}
                    <div>
                      <Label>Relacionar con OKR o Key Result (Opcional)</Label>
                      <div className="relative mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          disabled={loadingObjetivos}
                        >
                          <span className="truncate">
                            {loadingObjetivos ? "Cargando..." : getSelectedText()}
                          </span>
                          <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </Button>

                        {dropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[400px] overflow-hidden">
                            {/* Barra de búsqueda */}
                            <div className="p-3 border-b">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder="Buscar objetivos o Key Results..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>

                            {/* Lista de opciones */}
                            <div className="max-h-[300px] overflow-y-auto">
                              {/* Opción sin relación */}
                              <div 
                                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b"
                                onClick={() => {
                                  setSelectedItem(null);
                                  setFormObjetivo(prev => ({
                                    ...prev,
                                    tipo_relacion: '',
                                    id_objetivo_preexistente: '',
                                    id_key_result_preexistente: ''
                                  }));
                                  setDropdownOpen(false);
                                }}
                              >
                                <X className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">Sin relación</span>
                              </div>

                              {objetivosFiltrados.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                  No se encontraron resultados
                                </div>
                              ) : (
                                objetivosFiltrados.map((objetivo) => (
                                  <div key={objetivo.id_objetivo}>
                                    {/* Objetivo */}
                                    <div className="flex items-center p-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 mr-2"
                                        onClick={() => toggleExpansion(objetivo.id_objetivo)}
                                        disabled={objetivo.keyResults.length === 0}
                                      >
                                        {objetivo.keyResults.length > 0 ? (
                                          expandedObjetivos.has(objetivo.id_objetivo) ? (
                                            <ChevronDown className="h-3 w-3" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3" />
                                          )
                                        ) : (
                                          <div className="h-3 w-3" />
                                        )}
                                      </Button>
                                      
                                      <div
                                        className="flex items-center flex-1 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                        onClick={() => handleSelectItem(objetivo, 'objetivo')}
                                      >
                                        <Target className="h-4 w-4 text-blue-600 mr-2" />
                                        <div className="flex-1">
                                          <div className="font-medium">{objetivo.titulo}</div>
                                          <div className="text-xs text-gray-500">
                                            {objetivo.nivel} • {objetivo.estado} • {objetivo.keyResults.length} KRs
                                          </div>
                                        </div>
                                        {selectedItem?.id_objetivo === objetivo.id_objetivo && formObjetivo.tipo_relacion === 'objetivo' && (
                                          <Badge variant="default" className="text-xs">Seleccionado</Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Key Results (expandidos) */}
                                    {expandedObjetivos.has(objetivo.id_objetivo) && objetivo.keyResults.map((kr) => (
                                      <div
                                        key={kr.id_key_result}
                                        className="flex items-center ml-10 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                        onClick={() => handleSelectItem(kr, 'key_result')}
                                      >
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">{kr.descripcion}</div>
                                          <div className="text-xs text-gray-500">
                                            Meta: {kr.valor_objetivo} {kr.unidad || 'unidades'}
                                          </div>
                                        </div>
                                        {selectedItem?.id_key_result === kr.id_key_result && formObjetivo.tipo_relacion === 'key_result' && (
                                          <Badge variant="default" className="text-xs">Seleccionado</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Mostrar selección actual */}
                      {selectedItem && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-center gap-2 text-sm">
                            {formObjetivo.tipo_relacion === 'objetivo' ? (
                              <>
                                <Target className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Relacionado con objetivo:</span>
                                <span>{selectedItem.titulo}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Relacionado con Key Result:</span>
                                <span>{selectedItem.descripcion}</span>
                              </>
                            )}
                          </div>
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
    </Dialog>
  );
};

export default CrearObjetivoDialog; 