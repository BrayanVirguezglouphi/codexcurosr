import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Code, 
  Building, 
  Info,
  FileText,
  Tag
} from 'lucide-react';

const VerConceptoTransaccionDialog = ({ open, onOpenChange, concepto }) => {
  const [tipoTransaccion, setTipoTransaccion] = useState(null);

  useEffect(() => {
    const cargarTipoTransaccion = async () => {
      if (concepto?.id_tipotransaccion) {
        try {
          const response = await apiCall('/api/tipos-transaccion/${concepto.id_tipotransaccion}');
          const data = await response.json();
          setTipoTransaccion(data);
        } catch (error) {
          console.error('Error al cargar tipo de transacción:', error);
        }
      }
    };

    if (open && concepto) {
      cargarTipoTransaccion();
    }
  }, [open, concepto]);

  if (!concepto) return null;

  const getTipoTransaccionVariant = (tipo) => {
    switch (tipo) {
      case 'INGRESO':
        return 'default';
      case 'EGRESO':
        return 'destructive';
      case 'TRANSFERENCIA':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado Elegante */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Detalle del Concepto de Transacción
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  ID: {concepto.id_concepto}
                </Badge>
                {tipoTransaccion && (
                  <Badge variant={getTipoTransaccionVariant(tipoTransaccion.tipo_transaccion)}>
                    {tipoTransaccion.tipo_transaccion}
                  </Badge>
                )}
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
                <label className="text-sm font-medium text-gray-500">ID del Concepto</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 font-mono">
                    {concepto.id_concepto}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Tipo de Transacción</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {tipoTransaccion ? (
                    <div className="flex items-center gap-2">
                      <Badge variant={getTipoTransaccionVariant(tipoTransaccion.tipo_transaccion)}>
                        {tipoTransaccion.tipo_transaccion}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        (ID: {concepto.id_tipotransaccion})
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {concepto.id_tipotransaccion ? 'Cargando...' : 'No asignado'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información DIAN */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Building className="w-5 h-5" />
              🏛️ Información DIAN
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Código DIAN</label>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 font-mono">
                    {concepto.codigo_dian || 'No asignado'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Concepto DIAN</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    {concepto.concepto_dian || 'No asignado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información Detallada del Concepto */}
        {concepto.concepto_dian && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              📝 Descripción Detallada del Concepto
            </h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">
                {concepto.concepto_dian}
              </p>
            </div>
          </div>
        )}

        {/* Información del Sistema */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <Tag className="w-5 h-5" />
            ⚙️ Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Estado del Registro</label>
              <div className="flex items-center gap-2">
                <Badge variant="default">Activo</Badge>
                <span className="text-xs text-gray-500">Registro válido en el sistema</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">Clasificación</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Concepto de Transacción</Badge>
                <span className="text-xs text-gray-500">Tipo de clasificación contable</span>
              </div>
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

export default VerConceptoTransaccionDialog; 