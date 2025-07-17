import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiCall } from '@/config/api';
import { 
  Globe, 
  Building, 
  FileText, 
  Eye,
  ExternalLink,
  MapPin,
  Factory
} from 'lucide-react';

const VerMercadoDialog = ({ open, onClose, mercado }) => {
  const [paises, setPaises] = useState([]);
  const [industrias, setIndustrias] = useState([]);

  // Cargar catálogos para mostrar nombres en lugar de IDs
  useEffect(() => {
    if (open && mercado) {
      Promise.all([
        apiCall('/api/catalogos/paises'),
        apiCall('/api/catalogos/industrias')
      ]).then(([paisesData, industriasData]) => {
        setPaises(paisesData || []);
        setIndustrias(industriasData || []);
      }).catch(error => {
        console.error('Error cargando catálogos:', error);
        setPaises([]);
        setIndustrias([]);
      });
    }
  }, [open, mercado]);

  // Obtener nombres de catálogos
  const getNombrePais = () => {
    if (!mercado?.id_pais) return 'No especificado';
    const pais = paises.find(p => p.id === mercado.id_pais || p.id == mercado.id_pais);
    return pais ? pais.nombre : `ID: ${mercado.id_pais}`;
  };

  const getNombreIndustria = () => {
    if (!mercado?.id_industria) return 'No especificado';
    const industria = industrias.find(i => i.id === mercado.id_industria || i.id == mercado.id_industria);
    return industria ? industria.nombre : `ID: ${mercado.id_industria}`;
  };

  if (!mercado) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles del Mercado
          </DialogTitle>
          <DialogDescription>
            Información completa del mercado seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información principal */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Información Principal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID Mercado</label>
                <p className="text-sm">{mercado.id_mercado}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Segmento de Mercado</label>
                <p className="font-medium">{mercado.segmento_mercado}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  País
                </label>
                <p className="text-sm">{getNombrePais()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Factory className="h-3 w-3" />
                  Industria
                </label>
                <p className="text-sm">{getNombreIndustria()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumen del mercado */}
          {mercado.resumen_mercado && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Resumen del Mercado</h3>
              </div>
              <div className="bg-background border rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{mercado.resumen_mercado}</p>
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {mercado.recomendaciones && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Recomendaciones</h3>
              </div>
              <div className="bg-background border rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{mercado.recomendaciones}</p>
              </div>
            </div>
          )}

          {/* URL del reporte */}
          {mercado.url_reporte_mercado && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Reporte de Mercado</h3>
              </div>
              <div className="bg-background border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={mercado.url_reporte_mercado} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm break-all"
                  >
                    {mercado.url_reporte_mercado}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {mercado.observaciones && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Observaciones</h3>
              </div>
              <div className="bg-background border rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{mercado.observaciones}</p>
              </div>
            </div>
          )}

          {/* Información de auditoría (si está disponible) */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">ID:</span> {mercado.id_mercado}
              </div>
              {mercado.created_at && (
                <div>
                  <span className="font-medium">Creado:</span> {new Date(mercado.created_at).toLocaleDateString()}
                </div>
              )}
              {mercado.updated_at && (
                <div>
                  <span className="font-medium">Actualizado:</span> {new Date(mercado.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
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

export default VerMercadoDialog; 