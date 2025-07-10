import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Globe,
  MapPin,
  Users,
  ExternalLink,
  FileText,
  Linkedin,
  Eye
} from 'lucide-react';

const VerEmpresaDialog = ({ open, onClose, empresa }) => {
  if (!empresa) return null;

  const InfoField = ({ label, value, icon: Icon, isLink = false, className = "" }) => {
    if (!value) return null;
    
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3" />}
          {label}
        </label>
        <div className="bg-background border rounded-lg p-3">
          {isLink ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm break-all flex items-center gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              {value}
            </a>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles de la Empresa
          </DialogTitle>
          <DialogDescription>
            Información completa de la empresa seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información principal */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Información Principal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="text-sm">{empresa.id_empresa}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Nombre de la Empresa</label>
                <p className="font-medium text-lg">{empresa.empresa}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información comercial y ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comercial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Información Comercial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Mercado
                    </label>
                    {empresa.mercado ? (
                      <div className="bg-background border rounded-lg p-3 mt-1">
                        <p className="font-medium">{empresa.mercado.segmento_mercado}</p>
                        {empresa.mercado.resumen_mercado && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {empresa.mercado.resumen_mercado}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-background border rounded-lg p-3 mt-1">
                        <p className="text-sm text-muted-foreground">Sin mercado asignado</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Tamaño (Empleados)
                    </label>
                    <div className="bg-background border rounded-lg p-3 mt-1">
                      <Badge variant="secondary">
                        {empresa.tamano_empleados || 'No especificado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    País
                  </label>
                  {empresa.pais ? (
                    <div className="bg-background border rounded-lg p-3 mt-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {empresa.pais.codigo_iso}
                        </Badge>
                        <p className="font-medium">{empresa.pais.pais}</p>
                      </div>
                      {empresa.pais.region && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Región: {empresa.pais.region}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-background border rounded-lg p-3 mt-1">
                      <p className="text-sm text-muted-foreground">Sin país especificado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enlaces y presencia digital */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Enlaces y Presencia Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Sitio Web"
                  value={empresa.website}
                  icon={Globe}
                  isLink={true}
                />
                
                <InfoField
                  label="LinkedIn"
                  value={empresa.linkedin}
                  icon={Linkedin}
                  isLink={true}
                />
              </div>

              {!empresa.website && !empresa.linkedin && (
                <div className="text-center py-4 text-muted-foreground">
                  <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay enlaces disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observaciones */}
          {empresa.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background border rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{empresa.observaciones}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de auditoría */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">ID:</span> {empresa.id_empresa}
              </div>
              {empresa.created_at && (
                <div>
                  <span className="font-medium">Creado:</span> {new Date(empresa.created_at).toLocaleDateString()}
                </div>
              )}
              {empresa.updated_at && (
                <div>
                  <span className="font-medium">Actualizado:</span> {new Date(empresa.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Resumen de completitud */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resumen de Información
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className={`w-3 h-3 rounded-full mx-auto ${empresa.mercado ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <p className="text-xs text-muted-foreground">Mercado</p>
                  <p className="text-xs">{empresa.mercado ? 'Asignado' : 'Pendiente'}</p>
                </div>
                
                <div className="space-y-1">
                  <div className={`w-3 h-3 rounded-full mx-auto ${empresa.pais ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <p className="text-xs text-muted-foreground">País</p>
                  <p className="text-xs">{empresa.pais ? 'Asignado' : 'Pendiente'}</p>
                </div>
                
                <div className="space-y-1">
                  <div className={`w-3 h-3 rounded-full mx-auto ${empresa.website ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <p className="text-xs text-muted-foreground">Website</p>
                  <p className="text-xs">{empresa.website ? 'Disponible' : 'Pendiente'}</p>
                </div>
                
                <div className="space-y-1">
                  <div className={`w-3 h-3 rounded-full mx-auto ${empresa.linkedin ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <p className="text-xs text-muted-foreground">LinkedIn</p>
                  <p className="text-xs">{empresa.linkedin ? 'Disponible' : 'Pendiente'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerEmpresaDialog; 