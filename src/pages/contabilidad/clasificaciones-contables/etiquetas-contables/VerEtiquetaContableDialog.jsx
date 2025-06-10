import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tag, 
  Info,
  FileText,
  Hash,
  Bookmark
} from 'lucide-react';

const VerEtiquetaContableDialog = ({ open, onOpenChange, etiqueta }) => {
  if (!etiqueta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado Elegante */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Tag className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Detalle de la Etiqueta Contable
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  ID: {etiqueta.id_etiqueta_contable}
                </Badge>
                <Badge variant="default">
                  Etiqueta Contable
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Info className="w-5 h-5" />
              📋 Información Básica
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">ID de la Etiqueta</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 font-mono">
                    {etiqueta.id_etiqueta_contable}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Nombre de la Etiqueta</label>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-900">
                    {etiqueta.etiqueta_contable}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción y Detalles */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              📝 Descripción y Detalles
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {etiqueta.descripcion_etiqueta || 'Sin descripción disponible'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <Bookmark className="w-5 h-5" />
            ⚙️ Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Estado del Registro</label>
              <div className="flex items-center gap-2">
                <Badge variant="default">Activo</Badge>
                <span className="text-xs text-gray-500">Registro válido en el sistema</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Tipo de Clasificación</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Etiqueta Contable</Badge>
                <span className="text-xs text-gray-500">Clasificación para organización</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Uso</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Etiquetado</Badge>
                <span className="text-xs text-gray-500">Para categorizar registros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Uso */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <Hash className="w-5 h-5" />
            📊 Información de Uso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Estado</span>
                <Badge variant="default" className="bg-blue-600">Disponible</Badge>
              </div>
              <p className="text-xs text-blue-700 mt-1">Lista para ser utilizada</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-900">Categoría</span>
                <Badge variant="default" className="bg-emerald-600">Contable</Badge>
              </div>
              <p className="text-xs text-emerald-700 mt-1">Etiqueta de clasificación contable</p>
            </div>
          </div>
        </div>

        {/* Botón de Cierre */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} className="bg-gray-600 hover:bg-gray-700">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerEtiquetaContableDialog; 