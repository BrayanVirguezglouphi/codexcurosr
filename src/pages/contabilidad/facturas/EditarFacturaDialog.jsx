import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { FileText, User, Calendar, DollarSign, X } from 'lucide-react';

const EditarFacturaDialog = ({ open, onClose, factura, onFacturaActualizada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { toast } = useToast();

  const [contratos, setContratos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [taxes, setTaxes] = useState([]);

  // Watch para valores actuales
  const currentEstatus = watch('estatus_factura');
  const currentContrato = watch('id_contrato');
  const currentMoneda = watch('id_moneda');
  const currentTax = watch('id_tax');

  useEffect(() => {
    if (open) {
      console.log('🔄 Cargando catálogos en EditarFactura...');
      Promise.all([
        apiCall('/api/catalogos/contratos'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/catalogos/taxes')
      ]).then(([contratosData, monedasData, taxesData]) => {
        console.log('✅ Catálogos cargados en EditarFactura:', { contratos: contratosData.length, monedas: monedasData.length, taxes: taxesData.length });
        setContratos(contratosData);
        setMonedas(monedasData);
        setTaxes(taxesData);
      }).catch(error => {
        console.error('❌ Error cargando catálogos en EditarFactura:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los catálogos",
          variant: "destructive",
        });
      });
    }
  }, [open]);

  useEffect(() => {
    if (factura) {
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toISOString().split('T')[0];
      };
      
      // Establecer todos los valores del formulario
      setValue('numero_factura', factura.numero_factura || '');
      setValue('estatus_factura', factura.estatus_factura || 'PENDIENTE');
      setValue('id_contrato', factura.id_contrato || '');
      setValue('fecha_radicado', formatearFecha(factura.fecha_radicado));
      setValue('fecha_estimada_pago', formatearFecha(factura.fecha_estimada_pago));
      setValue('id_moneda', factura.id_moneda || '');
      setValue('subtotal_facturado_moneda', factura.subtotal_facturado_moneda || '');
      setValue('id_tax', factura.id_tax || '');
      setValue('valor_tax', factura.valor_tax || '');
      setValue('observaciones_factura', factura.observaciones_factura || '');
    }
  }, [factura, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log('📝 Datos del formulario antes de formatear:', data);
      
      const formattedData = {
        numero_factura: data.numero_factura || '',
        estatus_factura: data.estatus_factura || 'PENDIENTE',
        id_contrato: data.id_contrato ? parseInt(data.id_contrato) : null,
        id_moneda: data.id_moneda ? parseInt(data.id_moneda) : null,
        id_tax: data.id_tax ? parseInt(data.id_tax) : null,
        fecha_radicado: data.fecha_radicado ? new Date(data.fecha_radicado).toISOString().split('T')[0] : null,
        fecha_estimada_pago: data.fecha_estimada_pago ? new Date(data.fecha_estimada_pago).toISOString().split('T')[0] : null,
        subtotal_facturado_moneda: data.subtotal_facturado_moneda ? parseFloat(data.subtotal_facturado_moneda) : 0,
        valor_tax: data.valor_tax ? parseFloat(data.valor_tax) : null,
        observaciones_factura: (data.observaciones_factura || '').trim()
      };
      
      console.log('📤 Datos formateados para enviar:', formattedData);
      
      const response = await apiCall(`/api/facturas/${factura.id_factura}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      console.log('📨 Respuesta recibida:', response);
      
      if (response && response.success !== false) {
        toast({ title: "Éxito", description: "Factura actualizada correctamente" });
        onFacturaActualizada();
        onClose();
        reset();
      } else {
        throw new Error(response?.message || 'Error al actualizar la factura');
      }
    } catch (error) {
      console.error('❌ Error en onSubmit:', error);
      toast({ 
        title: "Error", 
        description: `No se pudo actualizar la factura: ${error.message}`, 
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Editar Factura
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {factura?.numero_factura}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Información General */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Información General
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numero_factura">Número de Factura *</Label>
                <Input 
                  id="numero_factura" 
                  {...register("numero_factura", { required: "El número de factura es requerido" })}
                  className="w-full"
                />
                {errors.numero_factura && <span className="text-red-500 text-sm">{errors.numero_factura.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="estatus_factura">Estado *</Label>
                <select 
                  id="estatus_factura" 
                  {...register("estatus_factura", { required: "El estado es requerido" })}
                  value={currentEstatus || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione estado</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="ANULADA">Anulada</option>
                  <option value="VENCIDA">Vencida</option>
                </select>
                {errors.estatus_factura && <span className="text-red-500 text-sm">{errors.estatus_factura.message}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_contrato">Contrato</Label>
                <select 
                  id="id_contrato" 
                  {...register("id_contrato")}
                  value={currentContrato || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione un contrato</option>
                  {contratos.map(c => (
                    <option key={c.id_contrato} value={c.id_contrato}>
                      {c.numero_contrato_os} - {c.descripcion_servicio_contratado?.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5" />
              Fechas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha_radicado">Fecha de Radicado *</Label>
                <Input 
                  id="fecha_radicado" 
                  type="date" 
                  {...register("fecha_radicado", { required: "La fecha de radicado es requerida" })}
                />
                {errors.fecha_radicado && <span className="text-red-500 text-sm">{errors.fecha_radicado.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fecha_estimada_pago">Fecha Estimada de Pago</Label>
                <Input 
                  id="fecha_estimada_pago" 
                  type="date" 
                  {...register("fecha_estimada_pago")}
                />
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              Información Financiera
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subtotal_facturado_moneda">Subtotal Facturado *</Label>
                <Input 
                  id="subtotal_facturado_moneda" 
                  type="number" 
                  step="0.01" 
                  {...register("subtotal_facturado_moneda", { 
                    required: "El subtotal es requerido", 
                    min: { value: 0, message: "El subtotal debe ser mayor o igual a 0" } 
                  })}
                />
                {errors.subtotal_facturado_moneda && <span className="text-red-500 text-sm">{errors.subtotal_facturado_moneda.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="valor_tax">Valor del IVA</Label>
                <Input 
                  id="valor_tax" 
                  type="number" 
                  step="0.01" 
                  {...register("valor_tax", { 
                    min: { value: 0, message: "El IVA debe ser mayor o igual a 0" } 
                  })}
                />
                {errors.valor_tax && <span className="text-red-500 text-sm">{errors.valor_tax.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_moneda">Moneda</Label>
                <select 
                  id="id_moneda" 
                  {...register("id_moneda")}
                  value={currentMoneda || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione una moneda</option>
                  {monedas.map(m => (
                    <option key={m.id_moneda} value={m.id_moneda}>{m.nombre_moneda}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_tax">Impuesto (Tax)</Label>
                <select 
                  id="id_tax" 
                  {...register("id_tax")}
                  value={currentTax || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione un impuesto</option>
                  {taxes.map(t => (
                    <option key={t.id_tax} value={t.id_tax}>{t.titulo_impuesto}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Observaciones
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="observaciones_factura">Observaciones</Label>
              <Textarea 
                id="observaciones_factura" 
                {...register("observaciones_factura")}
                placeholder="Ingrese observaciones adicionales sobre la factura"
                rows={3}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarFacturaDialog; 