import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  FileText, 
  Building, 
  Calendar,
  Info,
  Link,
  Settings,
  DollarSign
} from 'lucide-react';

const VerImpuestoDialog = ({ open, onClose, impuesto }) => {
  if (!impuesto) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoVariant = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return 'default';
      case 'INACTIVO':
        return 'secondary';
      case 'SUSPENDIDO':
        return 'outline';
      case 'DEROGADO':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPeriodicidadBadge = (periodicidad) => {
    const periodicidades = {
      'MENSUAL': { variant: 'default', color: 'text-blue-700' },
      'BIMESTRAL': { variant: 'secondary', color: 'text-green-700' },
      'TRIMESTRAL': { variant: 'outline', color: 'text-purple-700' },
      'SEMESTRAL': { variant: 'default', color: 'text-orange-700' },
      'ANUAL': { variant: 'destructive', color: 'text-red-700' },
      'QUINCENAL': { variant: 'secondary', color: 'text-indigo-700' },
      'DIARIO': { variant: 'outline', color: 'text-pink-700' }
    };
    return periodicidades[periodicidad] || { variant: 'secondary', color: 'text-gray-700' };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Detalle del Impuesto
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">ID:</span>
                <Badge variant="outline" className="text-xs">
                  #{impuesto.id_tax}
                </Badge>
                <Badge variant={getEstadoVariant(impuesto.estado)} className="text-xs">
                  {impuesto.estado || 'ACTIVO'}
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
                <label className="text-sm font-medium text-gray-500">ID del Impuesto</label>
                <p className="text-base font-semibold text-gray-900 font-mono">
                  {impuesto.id_tax}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Estado del Impuesto</label>
                <div className="mt-1">
                  <Badge variant={getEstadoVariant(impuesto.estado)} className="text-sm">
                    {impuesto.estado || 'ACTIVO'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Título del Impuesto</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-base font-semibold text-blue-900">
                    {impuesto.titulo_impuesto}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Institucional */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Building className="w-5 h-5" />
              🏢 Información Institucional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Tipo de Obligación</label>
                <p className="text-base text-gray-700">
                  {impuesto.tipo_obligacion || 'No especificado'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Institución Reguladora</label>
                <p className="text-base text-gray-700">
                  {impuesto.institucion_reguladora || 'No especificada'}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Periodicidad de Declaración</label>
                <div className="mt-1">
                  {impuesto.periodicidad_declaracion ? (
                    <Badge 
                      variant={getPeriodicidadBadge(impuesto.periodicidad_declaracion).variant} 
                      className="text-sm"
                    >
                      {impuesto.periodicidad_declaracion}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm text-gray-500">
                      No especificada
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fechas Importantes */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5" />
              📅 Fechas Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Fecha Inicio</label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    {formatearFecha(impuesto.fecha_inicio_impuesto)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Fecha Final</label>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800">
                    {formatearFecha(impuesto.fecha_final_impuesto)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Fecha Fin</label>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">
                    {formatearFecha(impuesto.fecha_fin)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Técnica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              💰 Información Técnica y Fiscal
            </h3>
            <div className="space-y-4">
              {impuesto.formula_aplicacion && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Fórmula de Aplicación</label>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">
                      {impuesto.formula_aplicacion}
                    </p>
                  </div>
                </div>
              )}

              {impuesto.oportunidades_optimizacion && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Oportunidades de Optimización</label>
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
                      {impuesto.oportunidades_optimizacion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enlaces de Referencia */}
          {(impuesto.url_referencia_normativa || impuesto.url_instrucciones) && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Link className="w-5 h-5" />
                📎 Enlaces y Documentos
              </h3>
              <div className="space-y-4">
                {impuesto.url_referencia_normativa && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">URL Referencia Normativa</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <a 
                        href={impuesto.url_referencia_normativa} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                      >
                        {impuesto.url_referencia_normativa}
                      </a>
                    </div>
                  </div>
                )}

                {impuesto.url_instrucciones && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">URL Instrucciones</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <a 
                        href={impuesto.url_instrucciones} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                      >
                        {impuesto.url_instrucciones}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {impuesto.observaciones && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Info className="w-5 h-5" />
                📝 Observaciones
              </h3>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Observaciones Adicionales</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {impuesto.observaciones}
                  </p>
                </div>
              </div>
            </div>
          )}
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

export default VerImpuestoDialog; 