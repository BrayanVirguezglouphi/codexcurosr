import React, { useState, useEffect } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EditarObjetivoDialog = ({ 
  isOpen, 
  onClose, 
  onObjetivoUpdated, 
  objetivo = null,
  staff = [] 
}) => {
  const { toast } = useToast();

  // Estado del formulario de edición
  const [formObjetivo, setFormObjetivo] = useState({
    titulo: '',
    descripcion: '',
    nivel: '',
    id_responsable: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activo',
    nivel_impacto: ''
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos del objetivo cuando se abre el diálogo
  useEffect(() => {
    if (objetivo && isOpen) {
      setFormObjetivo({
        titulo: objetivo.titulo || '',
        descripcion: objetivo.descripcion || '',
        nivel: objetivo.nivel || '',
        id_responsable: objetivo.id_responsable ? objetivo.id_responsable.toString() : '',
        fecha_inicio: objetivo.fecha_inicio ? objetivo.fecha_inicio.split('T')[0] : '',
        fecha_fin: objetivo.fecha_fin ? objetivo.fecha_fin.split('T')[0] : '',
        estado: objetivo.estado || 'Activo',
        nivel_impacto: objetivo.nivel_impacto ? objetivo.nivel_impacto.toString() : ''
      });
    }
  }, [objetivo, isOpen]);

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
      nivel_impacto: ''
    });
  };

  // Manejar envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!objetivo || !objetivo.id_objetivo) {
      toast({
        title: "Error",
        description: "No se pudo identificar el objetivo a actualizar",
        variant: "destructive",
      });
      return;
    }

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

      // Actualizar objetivo
      await apiCall(`/api/okr/objetivos/${objetivo.id_objetivo}`, {
        method: 'PUT',
        body: JSON.stringify(objetivoData)
      });

      toast({
        title: "Éxito",
        description: "Objetivo actualizado correctamente",
      });

      // Notificar actualización y cerrar
      if (onObjetivoUpdated) {
        onObjetivoUpdated();
      }
      
      onClose();

    } catch (error) {
      console.error('Error actualizando objetivo:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el objetivo. Por favor, inténtalo de nuevo.",
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

  // Obtener el responsable actual
  const responsableActual = staff.find(person => 
    person.id_staff.toString() === formObjetivo.id_responsable
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-indigo-600" />
            Editar Objetivo OKR
          </DialogTitle>
          {objetivo && (
            <p className="text-sm text-gray-600">
              Editando: {objetivo.titulo}
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica del objetivo */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Información del Objetivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="titulo-edit">Título del Objetivo *</Label>
                <Input
                  id="titulo-edit"
                  value={formObjetivo.titulo}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Aumentar la satisfacción del cliente en un 20%"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="descripcion-edit">Descripción</Label>
                <Textarea
                  id="descripcion-edit"
                  value={formObjetivo.descripcion}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el objetivo de manera detallada..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="nivel-edit">Nivel del Objetivo *</Label>
                <Select 
                  value={formObjetivo.nivel} 
                  onValueChange={(value) => setFormObjetivo(prev => ({ ...prev, nivel: value }))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
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
                <Label htmlFor="responsable-edit">Responsable Principal *</Label>
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
                        {person.id_staff.toString() === formObjetivo.id_responsable && ' (Actual)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fecha_inicio-edit">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio-edit"
                  type="date"
                  value={formObjetivo.fecha_inicio}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="fecha_fin-edit">Fecha de Finalización</Label>
                <Input
                  id="fecha_fin-edit"
                  type="date"
                  value={formObjetivo.fecha_fin}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, fecha_fin: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="estado-edit">Estado</Label>
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
                <Label htmlFor="nivel_impacto-edit">Nivel de Impacto (1-10)</Label>
                <Input
                  id="nivel_impacto-edit"
                  type="number"
                  min="1"
                  max="10"
                  value={formObjetivo.nivel_impacto}
                  onChange={(e) => setFormObjetivo(prev => ({ ...prev, nivel_impacto: e.target.value }))}
                  placeholder="Escala de impacto esperado"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Información adicional */}
          {objetivo && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ID del Objetivo:</span>
                  <span className="ml-2 text-gray-600">{objetivo.id_objetivo}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Key Results:</span>
                  <span className="ml-2 text-gray-600">{objetivo.total_key_results || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Progreso Actual:</span>
                  <span className="ml-2 text-gray-600">{Math.round(objetivo.promedio_cumplimiento || 0)}%</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Responsable Actual:</span>
                  <span className="ml-2 text-gray-600">{objetivo.responsable_nombre}</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Para gestionar los Key Results de este objetivo, utiliza la vista detallada del objetivo.
                  Los cambios en este formulario solo afectan la información básica del objetivo.
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Actualizar Objetivo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarObjetivoDialog; 