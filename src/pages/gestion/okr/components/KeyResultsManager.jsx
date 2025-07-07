import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, TrendingUp, Calendar, User, Target, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const KeyResultsManager = ({ 
  objetivoId, 
  isOpen, 
  onClose, 
  onKeyResultsUpdated,
  staff = [] 
}) => {
  const { toast } = useToast();

  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreandoKR, setIsCreandoKR] = useState(false);
  const [isEditandoKR, setIsEditandoKR] = useState(false);
  const [krSeleccionado, setKrSeleccionado] = useState(null);
  
  // Formulario para Key Result
  const [formKR, setFormKR] = useState({
    descripcion: '',
    valor_objetivo: '',
    unidad: '',
    fecha_limite: '',
    id_responsable: ''
  });

  // Cargar Key Results
  useEffect(() => {
    if (objetivoId && isOpen) {
      cargarKeyResults();
    }
  }, [objetivoId, isOpen]);

  const cargarKeyResults = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/api/okr/objetivos/${objetivoId}/key-results`);
      // Ordenar Key Results por fecha de creación (más recientes primero)
      const keyResultsOrdenados = data.sort((a, b) => {
        const fechaA = new Date(a.fecha_creacion || a.createdAt);
        const fechaB = new Date(b.fecha_creacion || b.createdAt);
        return fechaB - fechaA;
      });
      setKeyResults(keyResultsOrdenados);
    } catch (error) {
      console.error('Error cargando Key Results:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los Key Results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetFormKR = () => {
    setFormKR({
      descripcion: '',
      valor_objetivo: '',
      unidad: '',
      fecha_limite: '',
      id_responsable: ''
    });
    setKrSeleccionado(null);
  };

  // Crear Key Result
  const crearKeyResult = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (!formKR.descripcion.trim() || !formKR.valor_objetivo) {
        toast({
          title: "Error",
          description: "La descripción y el valor objetivo son obligatorios",
          variant: "destructive",
        });
        return;
      }

      const keyResultData = {
        id_objetivo: objetivoId,
        descripcion: formKR.descripcion.trim(),
        valor_objetivo: parseFloat(formKR.valor_objetivo),
        unidad: formKR.unidad.trim() || 'unidades',
        fecha_limite: formKR.fecha_limite || null,
        id_responsable: formKR.id_responsable ? parseInt(formKR.id_responsable) : null
      };

      await apiCall('/api/okr/key-results', {
        method: 'POST',
        body: JSON.stringify(keyResultData)
      });

      toast({
        title: "Éxito",
        description: "Key Result creado correctamente",
      });

      resetFormKR();
      setIsCreandoKR(false);
      await cargarKeyResults();
      
      if (onKeyResultsUpdated) {
        onKeyResultsUpdated();
      }

    } catch (error) {
      console.error('Error creando Key Result:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el Key Result",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Editar Key Result
  const editarKeyResult = (kr) => {
    setKrSeleccionado(kr);
    setFormKR({
      descripcion: kr.descripcion,
      valor_objetivo: kr.valor_objetivo.toString(),
      unidad: kr.unidad || '',
      fecha_limite: kr.fecha_limite ? kr.fecha_limite.split('T')[0] : '',
      id_responsable: kr.id_responsable ? kr.id_responsable.toString() : ''
    });
    setIsEditandoKR(true);
  };

  // Actualizar Key Result
  const actualizarKeyResult = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const keyResultData = {
        descripcion: formKR.descripcion.trim(),
        valor_objetivo: parseFloat(formKR.valor_objetivo),
        unidad: formKR.unidad.trim() || 'unidades',
        fecha_limite: formKR.fecha_limite || null,
        id_responsable: formKR.id_responsable ? parseInt(formKR.id_responsable) : null
      };

      await apiCall(`/api/okr/key-results/${krSeleccionado.id_kr}`, {
        method: 'PUT',
        body: JSON.stringify(keyResultData)
      });

      toast({
        title: "Éxito",
        description: "Key Result actualizado correctamente",
      });

      resetFormKR();
      setIsEditandoKR(false);
      await cargarKeyResults();
      
      if (onKeyResultsUpdated) {
        onKeyResultsUpdated();
      }

    } catch (error) {
      console.error('Error actualizando Key Result:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el Key Result",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Key Result
  const eliminarKeyResult = async (krId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este Key Result?')) {
      return;
    }

    try {
      await apiCall(`/api/okr/key-results/${krId}`, { method: 'DELETE' });
      
      toast({
        title: "Éxito",
        description: "Key Result eliminado correctamente",
      });

      await cargarKeyResults();
      
      if (onKeyResultsUpdated) {
        onKeyResultsUpdated();
      }

    } catch (error) {
      console.error('Error eliminando Key Result:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el Key Result",
        variant: "destructive",
      });
    }
  };

  // Actualizar progreso
  const actualizarProgreso = async (krId, valorActual) => {
    try {
      await apiCall(`/api/okr/key-results/${krId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ valor_actual: parseFloat(valorActual) })
      });

      toast({
        title: "Éxito",
        description: "Progreso actualizado correctamente",
      });

      await cargarKeyResults();
      
      if (onKeyResultsUpdated) {
        onKeyResultsUpdated();
      }

    } catch (error) {
      console.error('Error actualizando progreso:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso",
        variant: "destructive",
      });
    }
  };

  // Componente de tarjeta de Key Result
  const KeyResultCard = ({ kr, index }) => {
    const [valorProgreso, setValorProgreso] = useState('');
    const progreso = kr.porcentaje_cumplimiento || 0;
    const responsable = staff.find(s => s.id_staff === kr.id_responsable);

    // Destacar los Key Results más recientes (los primeros 2)
    const esReciente = index < 2;

    return (
      <Card className={`mb-4 transition-all duration-300 ${
        esReciente 
          ? 'hover:shadow-lg border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50' 
          : 'hover:shadow-md border-gray-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-start gap-2 mb-2">
                <h4 className="font-semibold text-gray-900 flex-1">
                  {kr.descripcion}
                  {esReciente && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                      Reciente
                    </span>
                  )}
                </h4>
                {progreso >= 100 && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Meta: {kr.valor_objetivo} {kr.unidad}
                </span>
                
                {kr.fecha_limite && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(kr.fecha_limite).toLocaleDateString()}
                  </span>
                )}
                
                {responsable && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {responsable.nombre}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Progreso</span>
                  <Badge variant={progreso >= 100 ? "default" : "outline"}>
                    {Math.round(progreso)}%
                  </Badge>
                </div>
                <Progress value={progreso} className="h-2" />
                
                <div className="flex gap-2 mt-3">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Nuevo valor"
                    value={valorProgreso}
                    onChange={(e) => setValorProgreso(e.target.value)}
                    className="flex-1"
                    size="sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (valorProgreso) {
                        actualizarProgreso(kr.id_kr, valorProgreso);
                        setValorProgreso('');
                      }
                    }}
                    disabled={!valorProgreso}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editarKeyResult(kr)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => eliminarKeyResult(kr.id_kr)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Gestión de Key Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con estadísticas */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Resumen</h3>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span>Total: {keyResults.length}</span>
                  <span>Completados: {keyResults.filter(kr => (kr.porcentaje_cumplimiento || 0) >= 100).length}</span>
                  <span>
                    Progreso promedio: {keyResults.length > 0 
                      ? Math.round(keyResults.reduce((acc, kr) => acc + (kr.porcentaje_cumplimiento || 0), 0) / keyResults.length)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <Dialog open={isCreandoKR} onOpenChange={setIsCreandoKR}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Key Result
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Key Result</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={crearKeyResult} className="space-y-4">
                    <div>
                      <Label htmlFor="descripcion-kr">Descripción *</Label>
                      <Input
                        id="descripcion-kr"
                        value={formKR.descripcion}
                        onChange={(e) => setFormKR(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Ej: Reducir tiempo de respuesta de 24h a 8h"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valor_objetivo-kr">Valor Objetivo *</Label>
                        <Input
                          id="valor_objetivo-kr"
                          type="number"
                          step="0.01"
                          value={formKR.valor_objetivo}
                          onChange={(e) => setFormKR(prev => ({ ...prev, valor_objetivo: e.target.value }))}
                          placeholder="100"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="unidad-kr">Unidad de Medida</Label>
                        <Input
                          id="unidad-kr"
                          value={formKR.unidad}
                          onChange={(e) => setFormKR(prev => ({ ...prev, unidad: e.target.value }))}
                          placeholder="%, ventas, usuarios, horas..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fecha_limite-kr">Fecha Límite</Label>
                        <Input
                          id="fecha_limite-kr"
                          type="date"
                          value={formKR.fecha_limite}
                          onChange={(e) => setFormKR(prev => ({ ...prev, fecha_limite: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="responsable-kr">Responsable</Label>
                        <Select 
                          value={formKR.id_responsable} 
                          onValueChange={(value) => setFormKR(prev => ({ ...prev, id_responsable: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar responsable (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin responsable específico</SelectItem>
                            {staff.map(person => (
                              <SelectItem key={person.id_staff} value={person.id_staff.toString()}>
                                {person.nombre} - {person.rol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetFormKR();
                          setIsCreandoKR(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Key Result'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lista de Key Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando Key Results...</p>
              </div>
            ) : keyResults.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay Key Results</h3>
                  <p className="text-gray-600 mb-4">
                    Comienza agregando resultados clave para este objetivo
                  </p>
                  <Button 
                    onClick={() => setIsCreandoKR(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Key Result
                  </Button>
                </CardContent>
              </Card>
            ) : (
              keyResults.map((kr, index) => (
                <KeyResultCard key={kr.id_kr} kr={kr} index={index} />
              ))
            )}
          </div>

          {/* Dialog para editar Key Result */}
          <Dialog open={isEditandoKR} onOpenChange={setIsEditandoKR}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Key Result</DialogTitle>
              </DialogHeader>
              <form onSubmit={actualizarKeyResult} className="space-y-4">
                <div>
                  <Label htmlFor="descripcion-edit-kr">Descripción *</Label>
                  <Input
                    id="descripcion-edit-kr"
                    value={formKR.descripcion}
                    onChange={(e) => setFormKR(prev => ({ ...prev, descripcion: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor_objetivo-edit-kr">Valor Objetivo *</Label>
                    <Input
                      id="valor_objetivo-edit-kr"
                      type="number"
                      step="0.01"
                      value={formKR.valor_objetivo}
                      onChange={(e) => setFormKR(prev => ({ ...prev, valor_objetivo: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="unidad-edit-kr">Unidad de Medida</Label>
                    <Input
                      id="unidad-edit-kr"
                      value={formKR.unidad}
                      onChange={(e) => setFormKR(prev => ({ ...prev, unidad: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha_limite-edit-kr">Fecha Límite</Label>
                    <Input
                      id="fecha_limite-edit-kr"
                      type="date"
                      value={formKR.fecha_limite}
                      onChange={(e) => setFormKR(prev => ({ ...prev, fecha_limite: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsable-edit-kr">Responsable</Label>
                    <Select 
                      value={formKR.id_responsable} 
                      onValueChange={(value) => setFormKR(prev => ({ ...prev, id_responsable: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar responsable (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin responsable específico</SelectItem>
                        {staff.map(person => (
                          <SelectItem key={person.id_staff} value={person.id_staff.toString()}>
                            {person.nombre} - {person.rol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetFormKR();
                      setIsEditandoKR(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar Key Result'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Botón para cerrar */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyResultsManager; 