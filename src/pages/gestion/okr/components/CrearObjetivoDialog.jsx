import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
    nivel_impacto: '',
    keyResults: [{ descripcion: '', valor_objetivo: '', unidad: '', fecha_limite: '', id_responsable: '' }]
  });

  const [loading, setLoading] = useState(false);
  const [objetivosExistentes, setObjetivosExistentes] = useState([]);
  const [loadingObjetivos, setLoadingObjetivos] = useState(false);

  // Cargar objetivos existentes cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      cargarObjetivosExistentes();
    }
  }, [isOpen]);

  // Función para cargar objetivos existentes
  const cargarObjetivosExistentes = async () => {
    try {
      setLoadingObjetivos(true);
      const objetivos = await apiCall('/api/okr/objetivos');
      setObjetivosExistentes(objetivos || []);
    } catch (error) {
      console.error('Error cargando objetivos existentes:', error);
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
      nivel_impacto: '',
      keyResults: [{ descripcion: '', valor_objetivo: '', unidad: '', fecha_limite: '', id_responsable: '' }]
    });
  };

  // Agregar nuevo Key Result al formulario (al inicio para que aparezca arriba)
  const agregarKeyResult = () => {
    setFormObjetivo(prev => ({
      ...prev,
      keyResults: [{ descripcion: '', valor_objetivo: '', unidad: '', fecha_limite: '', id_responsable: '' }, ...prev.keyResults]
    }));
  };

  // Eliminar Key Result del formulario
  const eliminarKeyResult = (index) => {
    if (formObjetivo.keyResults.length > 1) {
      setFormObjetivo(prev => ({
        ...prev,
        keyResults: prev.keyResults.filter((_, i) => i !== index)
      }));
    }
  };

  // Actualizar Key Result en el formulario
  const actualizarKeyResult = (index, campo, valor) => {
    setFormObjetivo(prev => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) => 
        i === index ? { ...kr, [campo]: valor } : kr
      )
    }));
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

      const relacionMessage = formObjetivo.id_objetivo_preexistente 
        ? ' y relacionado con objetivo preexistente' 
        : '';

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
        description: "No se pudo crear el objetivo. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre del diálogo
  const handleClose = () => {
    if (!loading) {
      resetFormulario();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Crear Nuevo Objetivo OKR
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica del objetivo */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Información del Objetivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="titulo">Título del Objetivo *</Label>
                <Input
                  id="titulo"
                  value={formObjetivo.titulo}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Aumentar la satisfacción del cliente en un 20%"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formObjetivo.descripcion}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el objetivo de manera detallada, incluyendo el contexto y la importancia estratégica..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="nivel">Nivel del Objetivo *</Label>
                <Select 
                  value={formObjetivo.nivel} 
                  onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, nivel: value }))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel organizacional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Empresa">🏢 Empresa</SelectItem>
                    <SelectItem value="Departamento">🏛️ Departamento</SelectItem>
                    <SelectItem value="Equipo">👥 Equipo</SelectItem>
                    <SelectItem value="Individual">👤 Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="responsable">Responsable Principal *</Label>
                <Select 
                  value={formObjetivo.id_responsable} 
                  onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, id_responsable: value }))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(person => (
                      <SelectItem key={person.id_staff} value={person.id_staff.toString()}>
                        👤 {person.nombre} - {person.rol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formObjetivo.fecha_inicio}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="fecha_fin">Fecha de Finalización</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formObjetivo.fecha_fin}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, fecha_fin: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado Inicial</Label>
                <Select 
                  value={formObjetivo.estado} 
                  onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, estado: value }))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">🟢 Activo</SelectItem>
                    <SelectItem value="Completado">✅ Completado</SelectItem>
                    <SelectItem value="En Riesgo">⚠️ En Riesgo</SelectItem>
                    <SelectItem value="Pausado">⏸️ Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nivel_impacto">Nivel de Impacto (1-10)</Label>
                <Input
                  id="nivel_impacto"
                  type="number"
                  min="1"
                  max="10"
                  value={formObjetivo.nivel_impacto}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, nivel_impacto: e.target.value }))}
                  placeholder="Escala de impacto esperado"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="objetivo_preexistente" className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-blue-600" />
                  Relacionar con Objetivo Preexistente (Opcional)
                </Label>
                <div className="space-y-2">
                  <Select 
                    value={formObjetivo.id_objetivo_preexistente} 
                    onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, id_objetivo_preexistente: value }))}
                    disabled={loading || loadingObjetivos}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingObjetivos ? "Cargando objetivos..." : "Seleccionar objetivo preexistente"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">🚫 Sin objetivo preexistente</SelectItem>
                      {objetivosExistentes.map(obj => {
                        const responsable = staff.find(s => s.id_staff === obj.id_responsable);
                        return (
                          <SelectItem key={obj.id_objetivo} value={obj.id_objetivo.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">🎯 {obj.titulo}</span>
                              <span className="text-xs text-gray-500">
                                {obj.estado} • {obj.nivel} • {responsable ? responsable.nombre : 'Sin responsable'}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 flex items-start gap-1">
                    💡 <span>Al relacionar este objetivo con uno preexistente, se crea una dependencia o jerarquía. Útil para objetivos que contribuyen a un objetivo mayor o que dependen de otro para su realización.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Results dinámicos */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Key Results (Resultados Clave)</h3>
                <p className="text-sm text-gray-600">Define métricas específicas y medibles para tu objetivo</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={agregarKeyResult}
                className="text-sm bg-white hover:bg-gray-50"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Key Result
              </Button>
            </div>

            <div className="space-y-4">
              {formObjetivo.keyResults.map((kr, index) => (
                <div key={index} className={`border rounded-lg p-4 space-y-3 shadow-sm transition-all duration-300 ${
                  index === 0 
                    ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">
                      📊 Key Result #{formObjetivo.keyResults.length - index} {index === 0 ? '(Nuevo)' : ''}
                    </h4>
                    {formObjetivo.keyResults.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarKeyResult(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Label>Descripción del Key Result *</Label>
                      <Input
                        value={kr.descripcion}
                        onChange={(e) => actualizarKeyResult(index, 'descripcion', e.target.value)}
                        placeholder="Ej: Reducir tiempo de respuesta del soporte de 24h a 8h"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label>Valor Objetivo *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={kr.valor_objetivo}
                        onChange={(e) => actualizarKeyResult(index, 'valor_objetivo', e.target.value)}
                        placeholder="100"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label>Unidad de Medida</Label>
                      <Input
                        value={kr.unidad}
                        onChange={(e) => actualizarKeyResult(index, 'unidad', e.target.value)}
                        placeholder="%, ventas, usuarios, horas..."
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label>Fecha Límite</Label>
                      <Input
                        type="date"
                        value={kr.fecha_limite}
                        onChange={(e) => actualizarKeyResult(index, 'fecha_limite', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label>Responsable del KR</Label>
                      <Select 
                        value={kr.id_responsable} 
                        onValueChange={(value) => actualizarKeyResult(index, 'id_responsable', value)}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional - Seleccionar responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin responsable específico</SelectItem>
                          {staff.map(person => (
                            <SelectItem key={person.id_staff} value={person.id_staff.toString()}>
                              👤 {person.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                'Crear Objetivo'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearObjetivoDialog; 