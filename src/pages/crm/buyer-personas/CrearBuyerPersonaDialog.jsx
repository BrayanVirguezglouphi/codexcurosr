import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
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
  User
} from 'lucide-react';

const CrearBuyerPersonaDialog = ({ open, onClose, onBuyerPersonaCreado }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      buyer: '',
      background: '',
      metas: '',
      retos: '',
      identificadores: '',
      objeciones_comunes: '',
      conductas_compra: '',
      que_podemos_hacer: '',
      posible_mensaje: '',
      que_oye: '',
      que_piensa_siente: '',
      que_ve: '',
      que_dice_hace: '',
      esfuerzos: '',
      resultados_valor: '',
      observaciones: '',
      url_file: ''
    }
  });
  const { toast } = useToast();

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        buyer: data.buyer,
        background: data.background || null,
        metas: data.metas || null,
        retos: data.retos || null,
        identificadores: data.identificadores || null,
        objeciones_comunes: data.objeciones_comunes || null,
        conductas_compra: data.conductas_compra || null,
        que_podemos_hacer: data.que_podemos_hacer || null,
        posible_mensaje: data.posible_mensaje || null,
        que_oye: data.que_oye || null,
        que_piensa_siente: data.que_piensa_siente || null,
        que_ve: data.que_ve || null,
        que_dice_hace: data.que_dice_hace || null,
        esfuerzos: data.esfuerzos || null,
        resultados_valor: data.resultados_valor || null,
        observaciones: data.observaciones || null,
        url_file: data.url_file || null
      };

      console.log('Enviando datos:', formattedData);
      
      const buyerPersona = await apiCall('/api/crm/buyer-personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      toast({
        title: "¡Éxito!",
        description: "Buyer Persona creada correctamente",
        variant: "success"
      });

      reset();
      onBuyerPersonaCreado?.(buyerPersona);
      onClose();
    } catch (error) {
      console.error('Error al crear buyer persona:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la buyer persona",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crear Nueva Buyer Persona
          </DialogTitle>
          <DialogDescription>
            Complete la información para crear un nuevo perfil de buyer persona
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="buyer" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Nombre de la Buyer Persona *
                  </Label>
                  <Input
                    id="buyer"
                    placeholder="Ej: Gerente de TI, CEO startup, etc."
                    {...register('buyer', { 
                      required: 'El nombre de la buyer persona es requerido' 
                    })}
                  />
                  {errors.buyer && (
                    <p className="text-sm text-red-500">{errors.buyer.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url_file" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    URL Archivo/Documento
                  </Label>
                  <Input
                    id="url_file"
                    type="url"
                    placeholder="https://ejemplo.com/documento"
                    {...register('url_file')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background</Label>
                <Textarea
                  id="background"
                  placeholder="Descripción del perfil, experiencia, contexto laboral..."
                  rows={3}
                  {...register('background')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs para organizar el resto de la información */}
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
                    <div className="space-y-2">
                      <Label htmlFor="metas" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Metas y Objetivos
                      </Label>
                      <Textarea
                        id="metas"
                        placeholder="¿Qué quiere lograr? ¿Cuáles son sus objetivos principales?"
                        rows={4}
                        {...register('metas')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retos" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Retos y Desafíos
                      </Label>
                      <Textarea
                        id="retos"
                        placeholder="¿Qué obstáculos enfrenta? ¿Cuáles son sus principales preocupaciones?"
                        rows={4}
                        {...register('retos')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identificadores">Identificadores/Características</Label>
                    <Textarea
                      id="identificadores"
                      placeholder="¿Cómo identificar a esta buyer persona? Características distintivas..."
                      rows={3}
                      {...register('identificadores')}
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="conductas_compra">Conductas de Compra</Label>
                    <Textarea
                      id="conductas_compra"
                      placeholder="¿Cómo toma decisiones de compra? ¿Qué proceso sigue?"
                      rows={3}
                      {...register('conductas_compra')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objeciones_comunes" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Objeciones Comunes
                    </Label>
                    <Textarea
                      id="objeciones_comunes"
                      placeholder="¿Qué objeciones suele poner? ¿Qué le preocupa al comprar?"
                      rows={3}
                      {...register('objeciones_comunes')}
                    />
                  </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="que_oye" className="flex items-center gap-2">
                        <span className="text-blue-500">👂</span>
                        ¿Qué Oye?
                      </Label>
                      <Textarea
                        id="que_oye"
                        placeholder="¿Qué dicen sus amigos, familia, colegas? ¿Qué influencias recibe?"
                        rows={3}
                        {...register('que_oye')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="que_ve" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        ¿Qué Ve?
                      </Label>
                      <Textarea
                        id="que_ve"
                        placeholder="¿Qué ve en su entorno? ¿Qué ofertas, competencia, problemas observa?"
                        rows={3}
                        {...register('que_ve')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="que_piensa_siente" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        ¿Qué Piensa y Siente?
                      </Label>
                      <Textarea
                        id="que_piensa_siente"
                        placeholder="¿Cuáles son sus pensamientos y emociones? ¿Qué le importa realmente?"
                        rows={3}
                        {...register('que_piensa_siente')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="que_dice_hace" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        ¿Qué Dice y Hace?
                      </Label>
                      <Textarea
                        id="que_dice_hace"
                        placeholder="¿Qué dice públicamente? ¿Cómo se comporta? ¿Qué acciones toma?"
                        rows={3}
                        {...register('que_dice_hace')}
                      />
                    </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="que_podemos_hacer" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        ¿Qué Podemos Hacer?
                      </Label>
                      <Textarea
                        id="que_podemos_hacer"
                        placeholder="¿Cómo podemos ayudar? ¿Qué soluciones ofrecemos?"
                        rows={3}
                        {...register('que_podemos_hacer')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="posible_mensaje">Posible Mensaje</Label>
                      <Textarea
                        id="posible_mensaje"
                        placeholder="¿Cuál sería el mensaje clave para esta buyer persona?"
                        rows={3}
                        {...register('posible_mensaje')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="esfuerzos" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Esfuerzos/Frustraciones
                      </Label>
                      <Textarea
                        id="esfuerzos"
                        placeholder="¿Qué le frustra? ¿Qué esfuerzos debe hacer? ¿Qué le cuesta trabajo?"
                        rows={3}
                        {...register('esfuerzos')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resultados_valor" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Resultados/Valor
                      </Label>
                      <Textarea
                        id="resultados_valor"
                        placeholder="¿Qué resultados busca? ¿Qué valor espera obtener?"
                        rows={3}
                        {...register('resultados_valor')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Observaciones generales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Notas y Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Cualquier información adicional relevante sobre esta buyer persona..."
                  rows={3}
                  {...register('observaciones')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Buyer Persona
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearBuyerPersonaDialog; 