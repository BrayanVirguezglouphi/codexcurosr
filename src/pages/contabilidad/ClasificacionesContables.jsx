import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CentroCostosView from './clasificaciones-contables/CentroCostosView';
import EtiquetasContablesView from './clasificaciones-contables/EtiquetasContablesView';
import ConceptosTransaccionesView from './clasificaciones-contables/ConceptosTransaccionesView';

const ClasificacionesContables = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clasificaciones Contables</h1>
        <p className="text-gray-600 mt-1">Gestiona los centros de costos, etiquetas contables y conceptos de transacciones</p>
      </div>

      <Tabs defaultValue="centros-costos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="centros-costos" className="text-sm">
            Centro de Costos
          </TabsTrigger>
          <TabsTrigger value="etiquetas-contables" className="text-sm">
            Etiquetas Contables
          </TabsTrigger>
          <TabsTrigger value="conceptos-transacciones" className="text-sm">
            Conceptos Transacciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="centros-costos">
          <CentroCostosView />
        </TabsContent>

        <TabsContent value="etiquetas-contables">
          <EtiquetasContablesView />
        </TabsContent>

        <TabsContent value="conceptos-transacciones">
          <ConceptosTransaccionesView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClasificacionesContables; 