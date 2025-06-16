import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';
import { 
  Tag, 
  Info,
  FileText,
  Hash,
  Bookmark,
  Edit
} from 'lucide-react';

const EditarEtiquetaContableDialog = ({ open, onOpenChange, etiqueta, onEtiquetaActualizada }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    defaultValues: {
      etiqueta_contable: '',
      descripcion_etiqueta: ''
    }
  });

  // Precargar datos de la etiqueta cuando se abre el diálogo
  useEffect(() => {
    if (open && etiqueta) {
      setValue('etiqueta_contable', etiqueta.etiqueta_contable || '');
      setValue('descripcion_etiqueta', etiqueta.descripcion_etiqueta || '');
    }
  }, [open, etiqueta, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/etiquetas-contables/${etiqueta.id_etiqueta_contable}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Etiqueta contable actualizada correctamente",
        });
        
        onEtiquetaActualizada?.();
        onOpenChange(false);
      } else {
        throw new Error('Error al actualizar la etiqueta contable');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la etiqueta contable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!etiqueta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado Elegante */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Editar Etiqueta Contable
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Modifique la información de la etiqueta contable ID: {etiqueta.id_etiqueta_contable}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Info className="w-5 h-5" />
              📋 Información Básica
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="etiqueta_contable">Nombre de la Etiqueta *</Label>
                <Input 
                  id="etiqueta_contable" 
                  {...register("etiqueta_contable", { 
                    required: "El nombre de la etiqueta es requerido",
                    maxLength: { value: 100, message: "No puede exceder 100 caracteres" },
                    minLength: { value: 3, message: "Debe tener al menos 3 caracteres" }
                  })} 
                  placeholder="Ingrese el nombre de la etiqueta contable"
                />
                {errors.etiqueta_contable && (
                  <p className="text-sm text-red-500">{errors.etiqueta_contable.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Descripción y Detalles */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              📝 Descripción y Detalles
            </h3>
            <div className="space-y-2">
              <Label htmlFor="descripcion_etiqueta">Descripción</Label>
              <Textarea 
                id="descripcion_etiqueta" 
                {...register("descripcion_etiqueta", { 
                  maxLength: { value: 500, message: "No puede exceder 500 caracteres" }
                })} 
                placeholder="Describa el propósito y uso de esta etiqueta contable (opcional)"
                rows={4}
              />
              {errors.descripcion_etiqueta && (
                <p className="text-sm text-red-500">{errors.descripcion_etiqueta.message}</p>
              )}
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Bookmark className="w-5 h-5" />
              ⚙️ Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">ID de Etiqueta</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-mono">
                    {etiqueta.id_etiqueta_contable}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">Identificador único de la etiqueta</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Estado</span>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Activo</span>
                </div>
                <p className="text-xs text-green-700 mt-1">La etiqueta se mantendrá activa</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-900">Tipo</span>
                  <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Etiqueta</span>
                </div>
                <p className="text-xs text-emerald-700 mt-1">Clasificación contable</p>
              </div>
            </div>
          </div>

          {/* Información de Configuración */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Hash className="w-5 h-5" />
              📊 Información de Configuración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Disponibilidad</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Activa</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">Lista para usar en el sistema</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-900">Categoría</span>
                  <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Contable</span>
                </div>
                <p className="text-xs text-emerald-700 mt-1">Etiqueta de clasificación contable</p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Actualizando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Actualizar Etiqueta
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarEtiquetaContableDialog; 