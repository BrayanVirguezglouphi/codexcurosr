import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, User, Calendar, DollarSign, Info, Building, X, Hash, CreditCard } from 'lucide-react';

export default function VerFacturaDialog({ open, onClose, factura }) {
  if (!factura) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearMoneda = (valor) => {
    if (!valor) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAGADA':
        return 'bg-green-100 text-green-800';
      case 'ANULADA':
        return 'bg-red-100 text-red-800';
      case 'VENCIDA':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerNombreCliente = () => {
    if (!factura.contrato?.tercero) return 'No asignado';
    
    const tercero = factura.contrato.tercero;
    if (tercero.razon_social) {
      return tercero.razon_social;
    }
    
    const nombres = [
      tercero.primer_nombre,
      tercero.primer_apellido
    ].filter(Boolean).join(' ');
    
    return nombres || 'Sin nombre';
  };

  const calcularTotal = () => {
    const subtotal = parseFloat(factura.subtotal_facturado_moneda) || 0;
    const iva = parseFloat(factura.valor_tax) || 0;
    return subtotal + iva;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Detalles de la Factura
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {factura.numero_factura}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(factura.estatus_factura)}`}>
                {factura.estatus_factura || 'PENDIENTE'}
              </span>
              <div className="text-right">
                <div className="text-sm text-gray-600">ID de la Factura</div>
                <div className="font-bold text-lg text-blue-600">
                  {factura.id_factura}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Información Básica de la Factura */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Hash className="w-5 h-5" />
              Información Básica
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">ID Factura</div>
                <div className="font-medium">
                  {factura.id_factura}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Número de Factura</div>
                <div className="font-medium">
                  {factura.numero_factura}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estado de la Factura</div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getEstadoColor(factura.estatus_factura)}`}>
                  {factura.estatus_factura || 'PENDIENTE'}
                </span>
              </div>
            </div>
          </div>

          {/* Información del Cliente y Contrato Asociado */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <User className="w-5 h-5" />
              Cliente y Contrato Asociado
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">ID del Contrato</div>
                <div className="font-medium">
                  {factura.id_contrato || 'No asignado'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Número del Contrato</div>
                <div className="font-medium">
                  {factura.contrato?.numero_contrato_os || 'No disponible'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cliente/Tercero</div>
                <div className="font-medium">
                  {obtenerNombreCliente()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ID del Tercero</div>
                <div className="font-medium">
                  {factura.contrato?.tercero?.id_tercero || 'No asignado'}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción del Servicio */}
          {factura.contrato?.descripcion_servicio_contratado && (
            <div className="bg-white border rounded-lg p-6">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Building className="w-5 h-5" />
                Descripción del Servicio
              </h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {factura.contrato.descripcion_servicio_contratado}
              </p>
            </div>
          )}

          {/* Fechas de la Factura */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5" />
              Fechas de la Factura
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Fecha de Radicado</div>
                <div className="font-medium">
                  {formatearFecha(factura.fecha_radicado)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fecha Estimada de Pago</div>
                <div className="font-medium">
                  {formatearFecha(factura.fecha_estimada_pago)}
                </div>
              </div>
            </div>
          </div>

          {/* Información Financiera de la Factura */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              Información Financiera
            </h4>
            <div className="grid grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Subtotal Facturado</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatearMoneda(factura.subtotal_facturado_moneda)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Valor del IVA</div>
                  <div className="font-medium">
                    {formatearMoneda(factura.valor_tax)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total de la Factura</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatearMoneda(calcularTotal())}
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">ID Moneda</div>
                  <div className="font-medium">
                    {factura.id_moneda || 'No especificado'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Moneda</div>
                  <div className="font-medium">
                    {factura.moneda?.nombre_moneda || 'Pesos Colombianos (COP)'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">ID Tax</div>
                  <div className="font-medium">
                    {factura.id_tax || 'No especificado'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Impuesto Aplicado</div>
                  <div className="font-medium">
                    {factura.tax?.titulo_impuesto || 'IVA General'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enlaces y Documentos */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Info className="w-5 h-5" />
              Enlaces y Documentos
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">URL de Cotización</div>
                <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                  {factura.contrato?.url_cotizacion ? (
                    <a href={factura.contrato.url_cotizacion} target="_blank" rel="noopener noreferrer">
                      Ver Cotización ↗
                    </a>
                  ) : (
                    'No disponible'
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">URL del Contrato</div>
                <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                  {factura.contrato?.url_contrato ? (
                    <a href={factura.contrato.url_contrato} target="_blank" rel="noopener noreferrer">
                      Ver Contrato ↗
                    </a>
                  ) : (
                    'No disponible'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones de la Factura */}
          {factura.observaciones_factura && (
            <div className="bg-white border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Observaciones de la Factura
              </h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {factura.observaciones_factura}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 