import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  CreditCard, 
  User,
  MapPin,
  Phone,
  Mail,
  Info,
  Building
} from 'lucide-react';

const VerTerceroDialog = ({ open, onClose, tercero }) => {
  if (!tercero) return null;

  const getTipoRelacionVariant = (tipo) => {
    switch (tipo) {
      case 'CLIENTE':
        return 'default';
      case 'PROVEEDOR':
        return 'secondary';
      case 'EMPLEADO':
        return 'outline';
      case 'ACCIONISTA':
        return 'destructive';
      case 'CONTRATISTA':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getTipoPersonalidadVariant = (tipo) => {
    switch (tipo) {
      case 'NATURAL':
        return 'default';
      case 'JURIDICA':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTipoDocumentoBadge = (tipo) => {
    const tipos = {
      'CC': { variant: 'default', name: 'Cédula de Ciudadanía' },
      'TI': { variant: 'secondary', name: 'Tarjeta de Identidad' },
      'CE': { variant: 'outline', name: 'Cédula de Extranjería' },
      'NIT': { variant: 'destructive', name: 'NIT' },
      'RUT': { variant: 'default', name: 'RUT' },
      'PASAPORTE': { variant: 'secondary', name: 'Pasaporte' }
    };
    return tipos[tipo] || { variant: 'outline', name: tipo || 'No especificado' };
  };

  const getNombreCompleto = () => {
    const nombres = [
      tercero.primer_nombre,
      tercero.otros_nombres,
      tercero.primer_apellido,
      tercero.segundo_apellido
    ].filter(Boolean).join(' ');
    
    return nombres || tercero.razon_social || 'Sin nombre registrado';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Detalle del Tercero
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">ID:</span>
                <Badge variant="outline" className="text-xs">
                  #{tercero.id_tercero}
                </Badge>
                <Badge variant={getTipoRelacionVariant(tercero.tipo_relacion)} className="text-xs">
                  {tercero.tipo_relacion || 'Sin clasificar'}
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
                <label className="text-sm font-medium text-gray-500">ID del Tercero</label>
                <p className="text-base font-semibold text-gray-900 font-mono">
                  {tercero.id_tercero}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Tipo de Relación</label>
                <div className="mt-1">
                  <Badge variant={getTipoRelacionVariant(tercero.tipo_relacion)} className="text-sm">
                    {tercero.tipo_relacion || 'No especificado'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Nombre Completo / Razón Social</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-base font-semibold text-blue-900">
                    {getNombreCompleto()}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Tipo de Personalidad</label>
                <div className="mt-1">
                  <Badge variant={getTipoPersonalidadVariant(tercero.tipo_personalidad)} className="text-sm">
                    {tercero.tipo_personalidad === 'NATURAL' ? 'Persona Natural' :
                     tercero.tipo_personalidad === 'JURIDICA' ? 'Persona Jurídica' :
                     tercero.tipo_personalidad || 'No especificado'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Tipo de Documento</label>
                <div className="mt-1">
                  <Badge 
                    variant={getTipoDocumentoBadge(tercero.tipo_documento).variant} 
                    className="text-sm"
                  >
                    {getTipoDocumentoBadge(tercero.tipo_documento).name}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Identificación */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <CreditCard className="w-5 h-5" />
              🆔 Identificación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Número de Documento</label>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 font-mono">
                    {tercero.numero_documento || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Dígito de Verificación</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    {tercero.dv || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Razón Social</label>
                <p className="text-sm text-gray-700">
                  {tercero.razon_social || 'No especificada'}
                </p>
              </div>
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <User className="w-5 h-5" />
              👤 Nombres y Apellidos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Primer Nombre</label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    {tercero.primer_nombre || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Otros Nombres</label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    {tercero.otros_nombres || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Primer Apellido</label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    {tercero.primer_apellido || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Segundo Apellido</label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    {tercero.segundo_apellido || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Ubicación */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <MapPin className="w-5 h-5" />
              📍 Información de Ubicación
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">País</label>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-800">
                      {tercero.pais || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Departamento/Región</label>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-800">
                      {tercero.departamento_region || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Municipio/Ciudad</label>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-800">
                      {tercero.municipio_ciudad || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900 leading-relaxed">
                    {tercero.direccion || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Phone className="w-5 h-5" />
              📞 Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {tercero.telefono ? (
                    <a 
                      href={`tel:${tercero.telefono}`} 
                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                    >
                      {tercero.telefono}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">No especificado</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {tercero.email ? (
                    <a 
                      href={`mailto:${tercero.email}`} 
                      className="text-blue-600 hover:text-blue-800 underline break-all text-sm font-medium"
                    >
                      {tercero.email}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">No especificado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {tercero.observaciones && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Info className="w-5 h-5" />
                📝 Observaciones
              </h3>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Observaciones Adicionales</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {tercero.observaciones}
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

export default VerTerceroDialog; 