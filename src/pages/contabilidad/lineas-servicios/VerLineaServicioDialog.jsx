import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  FileText, 
  Building, 
  Tag,
  Info
} from 'lucide-react';

const VerLineaServicioDialog = ({ open, onClose, lineaServicio }) => {
  if (!lineaServicio) return null;

  const getTipoServicioLabel = (tipo) => {
    const tipos = {
      'CONSULTORIA': 'Consultoría',
      'DESARROLLO': 'Desarrollo',
      'SOPORTE': 'Soporte',
      'MANTENIMIENTO': 'Mantenimiento',
      'CAPACITACION': 'Capacitación',
      'ANALISIS': 'Análisis',
      'IMPLEMENTACION': 'Implementación',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoServicioVariant = (tipo) => {
    const variants = {
      'CONSULTORIA': 'default',
      'DESARROLLO': 'secondary',
      'SOPORTE': 'outline',
      'MANTENIMIENTO': 'destructive',
      'CAPACITACION': 'default',
      'ANALISIS': 'secondary',
      'IMPLEMENTACION': 'outline',
      'OTRO': 'destructive'
    };
    return variants[tipo] || 'default';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Detalle de Línea de Servicio
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">ID:</span>
                <Badge variant="outline" className="text-xs">
                  #{lineaServicio.id}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              📋 Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">ID del Servicio</label>
                <p className="text-base font-semibold text-gray-900">
                  {lineaServicio.id}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Nombre del Servicio</label>
                <p className="text-base font-semibold text-gray-900">
                  {lineaServicio.nombre}
                </p>
              </div>
            </div>
          </div>

          {/* Modelo de Negocio */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Tag className="w-5 h-5" />
              🏷️ Modelo de Negocio
            </h3>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Modelo de Negocio</label>
              <div className="mt-2">
                {lineaServicio.nombre_modelonegocio ? (
                  <Badge variant="secondary" className="text-sm">
                    {lineaServicio.nombre_modelonegocio}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm text-gray-500">
                    Sin modelo de negocio
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Descripción Detallada */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Info className="w-5 h-5" />
              📝 Descripción Detallada del Servicio
            </h3>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Descripción</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {lineaServicio.descripcion_servicio || 'Sin descripción disponible'}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Building className="w-5 h-5" />
              ⚙️ Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <Badge variant="secondary" className="text-sm">
                  Activo
                </Badge>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Módulo</label>
                <p className="text-sm text-gray-700">
                  Líneas de Servicios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerLineaServicioDialog; 