import React, { useState, useEffect } from 'react';
import { Eye, Calendar, User, Target, TrendingUp, Plus, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VerObjetivoDialog = ({ 
  isOpen, 
  onClose, 
  objetivoId = null,
  onObjetivoUpdated,
  staff = [] 
}) => {
  const { toast } = useToast();

  const [objetivo, setObjetivo] = useState(null);
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actualizandoProgreso, setActualizandoProgreso] = useState(null);

  // Cargar datos del objetivo y sus key results
  useEffect(() => {
    if (objetivoId && isOpen) {
      cargarObjetivo();
    }
  }, [objetivoId, isOpen]);

  const cargarObjetivo = async () => {
    try {
      setLoading(true);
      const [objetivoData, keyResultsData] = await Promise.all([
        apiCall(`/api/okr/objetivos/${objetivoId}`),
        apiCall(`/api/okr/objetivos/${objetivoId}/key-results`)
      ]);
      
      setObjetivo(objetivoData);
      setKeyResults(keyResultsData);
    } catch (error) {
      console.error('Error cargando objetivo:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del objetivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualizar progreso de un Key Result
  const actualizarProgreso = async (krId, nuevoValor) => {
    if (!nuevoValor || isNaN(parseFloat(nuevoValor))) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un valor numérico válido",
        variant: "destructive",
      });
      return;
    }

    try {
      setActualizandoProgreso(krId);
      
      await apiCall(`/api/okr/key-results/${krId}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          valor_actual: parseFloat(nuevoValor)
        })
      });

      toast({
        title: "Éxito",
        description: "Progreso actualizado correctamente",
      });

      // Recargar datos
      await cargarObjetivo();
      
      if (onObjetivoUpdated) {
        onObjetivoUpdated();
      }

    } catch (error) {
      console.error('Error actualizando progreso:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso",
        variant: "destructive",
      });
    } finally {
      setActualizandoProgreso(null);
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

      // Recargar datos
      await cargarObjetivo();
      
      if (onObjetivoUpdated) {
        onObjetivoUpdated();
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

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Activo':
        return 'bg-blue-100 text-blue-800';
      case 'En Riesgo':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pausado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Componente de progreso de Key Result
  const KeyResultProgress = ({ kr }) => {
    const [valorActual, setValorActual] = useState('');
    const progreso = kr.porcentaje_cumplimiento || 0;
    const responsable = staff.find(s => s.id_staff === kr.id_responsable);

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{kr.descripcion}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Meta: {kr.valor_objetivo} {kr.unidad}</span>
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
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => eliminarKeyResult(kr.id_kr)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Progreso</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(progreso)}%</span>
              </div>
              <Progress value={progreso} className="w-full" />
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                placeholder={`Valor actual (max: ${kr.valor_objetivo})`}
                value={valorActual}
                onChange={(e) => setValorActual(e.target.value)}
                className="flex-1"
                disabled={actualizandoProgreso === kr.id_kr}
              />
              <Button
                onClick={() => {
                  actualizarProgreso(kr.id_kr, valorActual);
                  setValorActual('');
                }}
                disabled={!valorActual || actualizandoProgreso === kr.id_kr}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {actualizandoProgreso === kr.id_kr ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!objetivo) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No se encontró el objetivo</h3>
            <p className="text-gray-600">El objetivo solicitado no existe o no se pudo cargar</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const responsableObjetivo = staff.find(s => s.id_staff === objetivo.id_responsable);
  const progresoGeneral = objetivo.keyResults?.length > 0 
    ? objetivo.keyResults.reduce((acc, kr) => acc + (kr.porcentaje_cumplimiento || 0), 0) / objetivo.keyResults.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-600" />
            Detalle del Objetivo OKR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información principal del objetivo */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{objetivo.titulo}</h2>
                {objetivo.descripcion && (
                  <p className="text-gray-700 mb-4">{objetivo.descripcion}</p>
                )}
                
                <div className="flex flex-wrap gap-3">
                  <Badge className={getEstadoColor(objetivo.estado)}>
                    {objetivo.estado}
                  </Badge>
                  <Badge variant="outline">
                    {objetivo.nivel}
                  </Badge>
                  {objetivo.nivel_impacto && (
                    <Badge variant="outline">
                      Impacto: {objetivo.nivel_impacto}/10
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {Math.round(progresoGeneral)}%
                </div>
                <Progress value={progresoGeneral} className="w-24" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Responsable:</span>
                <span className="font-medium">{responsableObjetivo?.nombre || 'No asignado'}</span>
              </div>
              
              {objetivo.fecha_inicio && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Inicio:</span>
                  <span className="font-medium">{new Date(objetivo.fecha_inicio).toLocaleDateString()}</span>
                </div>
              )}
              
              {objetivo.fecha_fin && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Fin:</span>
                  <span className="font-medium">{new Date(objetivo.fecha_fin).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs para Key Results y estadísticas */}
          <Tabs defaultValue="key-results" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="key-results">
                Key Results ({keyResults.length})
              </TabsTrigger>
              <TabsTrigger value="estadisticas">
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="key-results" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Resultados Clave
                </h3>
                <Badge variant="outline">
                  {keyResults.filter(kr => (kr.porcentaje_cumplimiento || 0) >= 100).length} de {keyResults.length} completados
                </Badge>
              </div>

              {keyResults.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay Key Results</h4>
                    <p className="text-gray-600">Este objetivo aún no tiene resultados clave definidos</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {keyResults.map((kr) => (
                    <KeyResultProgress key={kr.id_kr} kr={kr} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="estadisticas" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Key Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{keyResults.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Completados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {keyResults.filter(kr => (kr.porcentaje_cumplimiento || 0) >= 100).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">En Progreso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {keyResults.filter(kr => {
                        const progreso = kr.porcentaje_cumplimiento || 0;
                        return progreso > 0 && progreso < 100;
                      }).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Sin Iniciar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-600">
                      {keyResults.filter(kr => (kr.porcentaje_cumplimiento || 0) === 0).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {keyResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen de Progreso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {keyResults.map((kr) => {
                        const progreso = kr.porcentaje_cumplimiento || 0;
                        return (
                          <div key={kr.id_kr} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 truncate">
                                  {kr.descripcion}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                  {Math.round(progreso)}%
                                </span>
                              </div>
                              <Progress value={progreso} className="h-2" />
                            </div>
                            {progreso >= 100 && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerObjetivoDialog; 