import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';

const CrearEtiquetaContableDialog = ({ open, onOpenChange, onEtiquetaCreada }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      etiqueta_contable: '',
      descripcion_etiqueta: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/etiquetas-contables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Etiqueta contable creada correctamente",
        });
        
        reset();
        onEtiquetaCreada?.();
        onOpenChange(false);
      } else {
        throw new Error('Error al crear la etiqueta contable');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la etiqueta contable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado Elegante */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Crear Nueva Etiqueta Contable
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Complete la información para crear una nueva etiqueta contable
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
                  <span className="text-sm font-medium text-blue-900">Estado</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Activo</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">La etiqueta se creará en estado activo</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Tipo</span>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Etiqueta</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Clasificación de etiqueta contable</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-900">Uso</span>
                  <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Categorización</span>
                </div>
                <p className="text-xs text-emerald-700 mt-1">Para organizar registros contables</p>
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
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Inmediata</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">Lista para usar después de la creación</p>
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
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crear Etiqueta
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearEtiquetaContableDialog; 