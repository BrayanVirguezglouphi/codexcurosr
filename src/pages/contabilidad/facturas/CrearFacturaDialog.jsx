import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';

const CrearFacturaDialog = ({ open, onClose, onFacturaCreada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      numero_factura: '',
      estatus_factura: 'PENDIENTE',
      fecha_radicado: new Date().toISOString().split('T')[0],
      fecha_estimada_pago: '',
      subtotal_facturado_moneda: '',
      valor_tax: '',
      observaciones_factura: ''
    }
  });
  const { toast } = useToast();

  const onSubmit = async (data) => {
    try {
      // Asegurarse de que los valores numéricos sean números
      const formattedData = {
        ...data,
        subtotal_facturado_moneda: parseFloat(data.subtotal_facturado_moneda),
        valor_tax: data.valor_tax ? parseFloat(data.valor_tax) : null
      };

      const response = await fetch('http://localhost:5000/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Factura creada correctamente",
        });
        onFacturaCreada();
        onClose();
        reset();
      } else {
        // Manejar errores específicos del servidor
        if (responseData.field) {
          toast({
            title: "Error de validación",
            description: responseData.message,
            variant: "destructive",
          });
        } else if (responseData.details) {
          const errorMessage = responseData.details
            .map(error => `${error.field}: ${error.message}`)
            .join('\n');
          toast({
            title: "Error de validación",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          throw new Error(responseData.message || 'Error al crear la factura');
        }
      }
    } catch (error) {
      console.error('Error al crear factura:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la factura",
        variant: "destructive",
      });
    }
  };

  const handleSelectChange = (value) => {
    setValue("estatus_factura", value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Factura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="numero_factura">Número de Factura</Label>
              <Input
                id="numero_factura"
                {...register("numero_factura", { 
                  required: "El número de factura es requerido",
                  pattern: {
                    value: /^[A-Za-z0-9-]+$/,
                    message: "El número de factura solo puede contener letras, números y guiones"
                  }
                })}
              />
              {errors.numero_factura && (
                <span className="text-red-500 text-sm">{errors.numero_factura.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estatus_factura">Estado</Label>
              <Select 
                onValueChange={handleSelectChange}
                defaultValue="PENDIENTE"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="PAGADA">Pagada</SelectItem>
                  <SelectItem value="ANULADA">Anulada</SelectItem>
                </SelectContent>
              </Select>
              {errors.estatus_factura && (
                <span className="text-red-500 text-sm">{errors.estatus_factura.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fecha_radicado">Fecha de Radicado</Label>
              <Input
                id="fecha_radicado"
                type="date"
                {...register("fecha_radicado", { 
                  required: "La fecha de radicado es requerida" 
                })}
              />
              {errors.fecha_radicado && (
                <span className="text-red-500 text-sm">{errors.fecha_radicado.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fecha_estimada_pago">Fecha Estimada de Pago</Label>
              <Input
                id="fecha_estimada_pago"
                type="date"
                {...register("fecha_estimada_pago")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtotal_facturado_moneda">Subtotal</Label>
              <Input
                id="subtotal_facturado_moneda"
                type="number"
                step="0.01"
                {...register("subtotal_facturado_moneda", { 
                  required: "El subtotal es requerido",
                  min: {
                    value: 0,
                    message: "El subtotal debe ser mayor o igual a 0"
                  }
                })}
              />
              {errors.subtotal_facturado_moneda && (
                <span className="text-red-500 text-sm">{errors.subtotal_facturado_moneda.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valor_tax">IVA</Label>
              <Input
                id="valor_tax"
                type="number"
                step="0.01"
                {...register("valor_tax", {
                  min: {
                    value: 0,
                    message: "El IVA debe ser mayor o igual a 0"
                  }
                })}
              />
              {errors.valor_tax && (
                <span className="text-red-500 text-sm">{errors.valor_tax.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observaciones_factura">Observaciones</Label>
              <Input
                id="observaciones_factura"
                {...register("observaciones_factura")}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => {
              reset();
              onClose();
            }}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Factura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearFacturaDialog; 