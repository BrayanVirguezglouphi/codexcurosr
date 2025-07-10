import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building2,
  Users,
  Mail,
  Phone,
  UserCheck,
  Briefcase,
  Eye,
  MapPin,
  Calendar,
  Globe
} from 'lucide-react';

const VerContactoDialog = ({ open, onClose, contacto }) => {
  if (!contacto) return null;

  const nombreCompleto = [
    contacto.nombre_primero,
    contacto.nombre_segundo,
    contacto.apellido_primero,
    contacto.apellido_segundo
  ].filter(Boolean).join(' ');

  // Función para obtener color del rol
  const getColorRol = (rol) => {
    const colores = {
      'Decisor': 'bg-red-100 text-red-800',
      'Influenciador': 'bg-yellow-100 text-yellow-800',
      'Usuario': 'bg-blue-100 text-blue-800',
      'Comprador': 'bg-green-100 text-green-800',
      'Bloqueador': 'bg-red-100 text-red-800',
      'Coach': 'bg-purple-100 text-purple-800',
      'Campeón': 'bg-emerald-100 text-emerald-800',
      'Guardián': 'bg-orange-100 text-orange-800'
    };
    return colores[rol] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Información del Contacto
          </DialogTitle>
          <DialogDescription>
            Vista detallada de la información del contacto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con información básica */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {nombreCompleto || 'Sin nombre'}
                  </h2>
                  {contacto.cargo && (
                    <p className="text-lg text-gray-600 mt-1">{contacto.cargo}</p>
                  )}
                  {contacto.empresa && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-gray-500">
                      <Building2 className="h-4 w-4" />
                      <span>{contacto.empresa.empresa}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-2">
                  {contacto.rol && (
                    <Badge className={getColorRol(contacto.rol)}>
                      <UserCheck className="h-3 w-3 mr-1" />
                      {contacto.rol}
                    </Badge>
                  )}
                  {contacto.buyer_persona && (
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {contacto.buyer_persona.buyer}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Primer Nombre</label>
                  <p className="text-gray-900 mt-1">{contacto.nombre_primero || 'No especificado'}</p>
                </div>
                {contacto.nombre_segundo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Segundo Nombre</label>
                    <p className="text-gray-900 mt-1">{contacto.nombre_segundo}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Primer Apellido</label>
                  <p className="text-gray-900 mt-1">{contacto.apellido_primero || 'No especificado'}</p>
                </div>
                {contacto.apellido_segundo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Segundo Apellido</label>
                    <p className="text-gray-900 mt-1">{contacto.apellido_segundo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información profesional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Información Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Empresa
                  </label>
                  {contacto.empresa ? (
                    <div className="mt-1">
                      <p className="text-gray-900 font-medium">{contacto.empresa.empresa}</p>
                      {contacto.empresa.mercado && (
                        <p className="text-sm text-gray-600">
                          Mercado: {contacto.empresa.mercado.segmento_mercado}
                        </p>
                      )}
                      {contacto.empresa.pais && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {contacto.empresa.pais.pais}
                        </p>
                      )}
                      {contacto.empresa.website && (
                        <p className="text-sm text-blue-600 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <a href={contacto.empresa.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {contacto.empresa.website}
                          </a>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">No especificada</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Cargo/Posición
                  </label>
                  <p className="text-gray-900 mt-1">{contacto.cargo || 'No especificado'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Rol en Proceso de Compra
                  </label>
                  {contacto.rol ? (
                    <Badge className={`${getColorRol(contacto.rol)} mt-1`}>
                      {contacto.rol}
                    </Badge>
                  ) : (
                    <p className="text-gray-500 mt-1">No especificado</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Buyer Persona
                  </label>
                  {contacto.buyer_persona ? (
                    <div className="mt-1">
                      <p className="text-gray-900 font-medium">{contacto.buyer_persona.buyer}</p>
                      {contacto.buyer_persona.background && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {contacto.buyer_persona.background}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">No especificada</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo Corporativo
                  </label>
                  {contacto.correo_corporativo ? (
                    <a 
                      href={`mailto:${contacto.correo_corporativo}`}
                      className="text-blue-600 hover:underline mt-1 block"
                    >
                      {contacto.correo_corporativo}
                    </a>
                  ) : (
                    <p className="text-gray-500 mt-1">No especificado</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo Personal
                  </label>
                  {contacto.correo_personal ? (
                    <a 
                      href={`mailto:${contacto.correo_personal}`}
                      className="text-blue-600 hover:underline mt-1 block"
                    >
                      {contacto.correo_personal}
                    </a>
                  ) : (
                    <p className="text-gray-500 mt-1">No especificado</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </label>
                  {contacto.telefono ? (
                    <a 
                      href={`tel:${contacto.telefono}`}
                      className="text-blue-600 hover:underline mt-1 block"
                    >
                      {contacto.telefono}
                    </a>
                  ) : (
                    <p className="text-gray-500 mt-1">No especificado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de auditoría */}
          {(contacto.created_at || contacto.updated_at) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Información de Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacto.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(contacto.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {contacto.updated_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Última Actualización</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(contacto.updated_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerContactoDialog; 