import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiCall } from '@/config/api';
import { 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Building, 
  FileCheck,
  Link
} from 'lucide-react';

const VerContratoDialog = ({ open, onClose, contratoId }) => {
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(false);
  const [terceros, setTerceros] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [impuestos, setImpuestos] = useState([]);

  useEffect(() => {
    if (open && contratoId) {
      cargarContrato();
    }
  }, [open, contratoId]);

  const cargarContrato = async () => {
    setLoading(true);
    try {
      // Cargar el contrato y los catálogos en paralelo
      const [contratoRes, tercerosRes, monedasRes, impuestosRes] = await Promise.all([
        apiCall(`/api/contratos/${contratoId}`),
        apiCall('/api/catalogos/terceros'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/catalogos/taxes')
      ]);

      const contratoData = await contratoRes.json();
      const tercerosData = await tercerosRes.json();
      const monedasData = await monedasRes.json();
      const impuestosData = await impuestosRes.json();

      setContrato(contratoData);
      setTerceros(Array.isArray(tercerosData) ? tercerosData : []);
      setMonedas(Array.isArray(monedasData) ? monedasData : []);
      setImpuestos(Array.isArray(impuestosData) ? impuestosData : []);
    } catch (error) {
      console.error('Error al cargar contrato:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares para obtener nombres legibles
  const getNombreTercero = (id) => {
    if (!id) return 'No asignado';
    const tercero = terceros.find(t => t.id_tercero === id);
    if (!tercero) return `ID: ${id}`;
    
    return tercero.razon_social || 
           `${tercero.primer_nombre || ''} ${tercero.primer_apellido || ''}`.trim() || 
           `Tercero ${id}`;
  };

  const getDocumentoTercero = (id) => {
    if (!id) return 'No disponible';
    const tercero = terceros.find(t => t.id_tercero === id);
    if (!tercero) return 'No disponible';
    
    return tercero.numero_documento ? 
      `${tercero.numero_documento} (${tercero.tipo_personalidad || 'N/A'})` : 
      'No disponible';
  };

  const getNombreMoneda = (id) => {
    if (!id) return 'No especificada';
    const moneda = monedas.find(m => m.id_moneda === id);
    if (!moneda) return `ID: ${id}`;
    
    return `${moneda.codigo_iso || 'N/A'} - ${moneda.nombre_moneda || 'Sin nombre'}`;
  };

  const getNombreImpuesto = (id) => {
    if (!id) return 'No especificado';
    const impuesto = impuestos.find(i => i.id_tax === id);
    if (!impuesto) return `ID: ${id}`;
    
    return impuesto.titulo_impuesto || 'Sin nombre';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearMoneda = (valor) => {
    if (!valor || isNaN(valor)) return 'No especificado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(parseFloat(valor));
  };

  const getBadgeVariant = (estado) => {
    const variantes = {
      'ACTIVO': 'default',
      'FINALIZADO': 'secondary', 
      'SUSPENDIDO': 'destructive',
      'CANCELADO': 'outline',
      'EN_NEGOCIACION': 'default'
    };
    return variantes[estado] || 'outline';
  };

  const abrirEnlace = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Cargando Contrato</DialogTitle>
            <DialogDescription>Por favor espere mientras se cargan los datos del contrato</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="text-sm text-gray-500">Cargando contrato...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!contrato) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Detalles del Contrato
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Contrato #{contrato.id_contrato} - {contrato.numero_contrato_os || 'Sin número'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileCheck className="w-5 h-5" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">ID del Contrato</p>
                <p className="text-sm text-gray-900 font-mono">{contrato.id_contrato}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Número de Contrato/OS</p>
                <p className="text-sm text-gray-900 font-medium">{contrato.numero_contrato_os || 'Sin número'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Estado del Contrato</p>
                <Badge variant={getBadgeVariant(contrato.estatus_contrato)} className="text-xs">
                  {contrato.estatus_contrato || 'Sin estado'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <User className="w-5 h-5" />
              Cliente y Tercero Asociado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Cliente/Tercero</p>
                <p className="text-sm text-gray-900">
                  {getNombreTercero(contrato.id_tercero)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Documento del Tercero</p>
                <p className="text-sm text-gray-900">
                  {getDocumentoTercero(contrato.id_tercero)}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción del Servicio Contratado */}
          {contrato.descripcion_servicio_contratado && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Building className="w-5 h-5" />
                Descripción del Servicio Contratado
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {contrato.descripcion_servicio_contratado}
                </p>
              </div>
            </div>
          )}

          {/* Fechas del Contrato */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5" />
              Fechas del Contrato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Fecha del Contrato</p>
                <p className="text-sm text-gray-900">{formatearFecha(contrato.fecha_contrato)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Fecha Inicio del Servicio</p>
                <p className="text-sm text-gray-900">{formatearFecha(contrato.fecha_inicio_servicio)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Fecha Final del Servicio</p>
                <p className="text-sm text-gray-900">{formatearFecha(contrato.fecha_final_servicio)}</p>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              Información Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Valor Cotizado</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatearMoneda(contrato.valor_cotizado)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Valor de Descuento</p>
                  <p className="text-sm font-medium text-orange-600">
                    {formatearMoneda(contrato.valor_descuento)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Valor del Impuesto</p>
                  <p className="text-sm font-medium text-red-600">
                    {formatearMoneda(contrato.valor_tax)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">TRM (Tasa de Cambio)</p>
                  <p className="text-sm text-gray-900">
                    {contrato.trm && !isNaN(contrato.trm) ? `$${parseFloat(contrato.trm).toFixed(4)}` : 'No especificada'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Modo de Pago</p>
                  <p className="text-sm text-gray-900">{contrato.modo_de_pago || 'No especificado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Moneda de Cotización</p>
                  <p className="text-sm text-gray-900">
                    {getNombreMoneda(contrato.id_moneda_cotizacion)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Impuesto/Tax</p>
                  <p className="text-sm text-gray-900">
                    {getNombreImpuesto(contrato.id_tax)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enlaces y Documentos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Link className="w-5 h-5" />
              Enlaces y Documentos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">URL de Cotización</p>
                  {contrato.url_cotizacion ? (
                    <a
                      href={contrato.url_cotizacion}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver cotización
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">Sin cotización adjunta</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">URL del Contrato</p>
                  {contrato.url_contrato ? (
                    <a
                      href={contrato.url_contrato}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver contrato
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">Sin contrato adjunto</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              Observaciones
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-900 leading-relaxed">
                {contrato.observaciones_contrato || 'Sin observaciones'}
              </p>
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

export default VerContratoDialog; 