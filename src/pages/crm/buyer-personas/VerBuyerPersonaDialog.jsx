import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Target, 
  Brain, 
  Eye,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  ExternalLink
} from 'lucide-react';

const VerBuyerPersonaDialog = ({ open, onClose, buyerPersona }) => {
  if (!buyerPersona) return null;

  const InfoField = ({ label, value, icon: Icon, className = "" }) => {
    if (!value) return null;
    
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3" />}
          {label}
        </label>
        <div className="bg-background border rounded-lg p-3">
          <p className="text-sm whitespace-pre-wrap">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles de la Buyer Persona
          </DialogTitle>
          <DialogDescription>
            Información completa de la buyer persona seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información principal */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Información Principal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="text-sm">{buyerPersona.id_buyer}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Buyer Persona</label>
                <p className="font-medium text-lg">{buyerPersona.buyer}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Archivo</label>
                {buyerPersona.url_file ? (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={buyerPersona.url_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      Ver documento
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin archivo</p>
                )}
              </div>
            </div>

            {buyerPersona.background && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Background</label>
                <div className="bg-background border rounded-lg p-3 mt-1">
                  <p className="text-sm whitespace-pre-wrap">{buyerPersona.background}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Tabs para organizar la información */}
          <Tabs defaultValue="objetivos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="objetivos">Objetivos & Retos</TabsTrigger>
              <TabsTrigger value="comportamiento">Comportamiento</TabsTrigger>
              <TabsTrigger value="psicologia">Perfil Psicológico</TabsTrigger>
              <TabsTrigger value="estrategia">Estrategia</TabsTrigger>
            </TabsList>

            {/* Tab: Objetivos y Retos */}
            <TabsContent value="objetivos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivos y Desafíos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="Metas y Objetivos"
                      value={buyerPersona.metas}
                      icon={CheckCircle}
                    />
                    
                    <InfoField
                      label="Retos y Desafíos"
                      value={buyerPersona.retos}
                      icon={AlertTriangle}
                    />
                  </div>

                  <InfoField
                    label="Identificadores/Características"
                    value={buyerPersona.identificadores}
                    icon={User}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Comportamiento */}
            <TabsContent value="comportamiento" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Comportamiento de Compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoField
                    label="Conductas de Compra"
                    value={buyerPersona.conductas_compra}
                    icon={TrendingUp}
                  />

                  <InfoField
                    label="Objeciones Comunes"
                    value={buyerPersona.objeciones_comunes}
                    icon={AlertTriangle}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Perfil Psicológico */}
            <TabsContent value="psicologia" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Perfil Psicológico (Mapa de Empatía)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="¿Qué Oye?"
                      value={buyerPersona.que_oye}
                      icon={() => <span className="text-blue-500">👂</span>}
                    />
                    
                    <InfoField
                      label="¿Qué Ve?"
                      value={buyerPersona.que_ve}
                      icon={Eye}
                    />
                    
                    <InfoField
                      label="¿Qué Piensa y Siente?"
                      value={buyerPersona.que_piensa_siente}
                      icon={Brain}
                    />
                    
                    <InfoField
                      label="¿Qué Dice y Hace?"
                      value={buyerPersona.que_dice_hace}
                      icon={MessageSquare}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Estrategia */}
            <TabsContent value="estrategia" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Estrategia y Propuesta de Valor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="¿Qué Podemos Hacer?"
                      value={buyerPersona.que_podemos_hacer}
                      icon={CheckCircle}
                    />
                    
                    <InfoField
                      label="Posible Mensaje"
                      value={buyerPersona.posible_mensaje}
                      icon={MessageSquare}
                    />
                    
                    <InfoField
                      label="Esfuerzos/Frustraciones"
                      value={buyerPersona.esfuerzos}
                      icon={AlertTriangle}
                    />
                    
                    <InfoField
                      label="Resultados/Valor"
                      value={buyerPersona.resultados_valor}
                      icon={TrendingUp}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Observaciones */}
          {buyerPersona.observacion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background border rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{buyerPersona.observacion}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de auditoría */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">ID:</span> {buyerPersona.id_buyer}
              </div>
              {buyerPersona.created_at && (
                <div>
                  <span className="font-medium">Creado:</span> {new Date(buyerPersona.created_at).toLocaleDateString()}
                </div>
              )}
              {buyerPersona.updated_at && (
                <div>
                  <span className="font-medium">Actualizado:</span> {new Date(buyerPersona.updated_at).toLocaleDateString()}
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

export default VerBuyerPersonaDialog; 