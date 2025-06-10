import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Info,
  FileText,
  Hash,
  Target,
  Layers
} from 'lucide-react';

const VerCentroCostoDialog = ({ open, onClose, centroCosto }) => {
  if (!centroCosto) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado Elegante */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Detalle del Centro de Costo
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  ID: {centroCosto.id_centro_costo}
                </Badge>
                <Badge variant="default">
                  Centro de Costo
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
                <label className="text-sm font-medium text-gray-500">ID del Centro de Costo</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 font-mono">
                    {centroCosto.id_centro_costo}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Sub Centro de Costo</label>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900">
                    {centroCosto.sub_centro_costo || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Jerarquía y Organización */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Layers className="w-5 h-5" />
              🏗️ Jerarquía y Organización
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Centro Costo Macro</label>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-semibold text-orange-900">
                    {centroCosto.centro_costo_macro || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Nivel en Jerarquía</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {centroCosto.centro_costo_macro ? 'Sub-centro' : 'Centro Principal'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Nivel organizacional
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción Detallada */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FileText className="w-5 h-5" />
            📝 Descripción Detallada
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {centroCosto.descripcion_cc || 'Sin descripción disponible'}
            </p>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <Target className="w-5 h-5" />
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
                <Badge variant="secondary">Centro de Costo</Badge>
                <span className="text-xs text-gray-500">Para distribución de costos</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Propósito</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Control de Costos</Badge>
                <span className="text-xs text-gray-500">Seguimiento financiero</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas y Uso */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <Hash className="w-5 h-5" />
            📊 Información de Configuración
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Estado</span>
                <Badge variant="default" className="bg-blue-600">Operativo</Badge>
              </div>
              <p className="text-xs text-blue-700 mt-1">Centro de costo activo y funcional</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">Categoría</span>
                <Badge variant="default" className="bg-purple-600">Contable</Badge>
              </div>
              <p className="text-xs text-purple-700 mt-1">Para seguimiento de costos operacionales</p>
            </div>
          </div>
        </div>

        {/* Botón de Cierre */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerCentroCostoDialog; 