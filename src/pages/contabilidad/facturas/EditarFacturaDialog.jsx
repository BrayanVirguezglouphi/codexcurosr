import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';

const EditarFacturaDialog = ({ open, onClose, factura, onFacturaActualizada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const { toast } = useToast();

  useEffect(() => {
    if (factura) {
      // Formatear fechas para el input type="date"
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toISOString().split('T')[0];
      };

      setValue('numero_factura', factura.numero_factura);
      setValue('estatus_factura', factura.estatus_factura);
      setValue('fecha_radicado', formatearFecha(factura.fecha_radicado));
      setValue('fecha_estimada_pago', formatearFecha(factura.fecha_estimada_pago));
      setValue('subtotal_facturado_moneda', factura.subtotal_facturado_moneda);
      setValue('valor_tax', factura.valor_tax);
      setValue('observaciones_factura', factura.observaciones_factura);
    }
  }, [factura, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`http://localhost:5000/api/facturas/${factura.id_factura}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Factura actualizada correctamente",
        });
        onFacturaActualizada();
        onClose();
      } else {
        throw new Error('Error al actualizar la factura');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la factura",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Factura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="numero_factura">Número de Factura</Label>
              <Input
                id="numero_factura"
                {...register("numero_factura", { required: true })}
              />
              {errors.numero_factura && (
                <span className="text-red-500 text-sm">Este campo es requerido</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estatus_factura">Estado</Label>
              <Select 
                onValueChange={(value) => setValue("estatus_factura", value)}
                defaultValue={factura?.estatus_factura}
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fecha_radicado">Fecha de Radicado</Label>
              <Input
                id="fecha_radicado"
                type="date"
                {...register("fecha_radicado", { required: true })}
              />
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
                {...register("subtotal_facturado_moneda", { required: true })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valor_tax">IVA</Label>
              <Input
                id="valor_tax"
                type="number"
                step="0.01"
                {...register("valor_tax")}
              />
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarFacturaDialog; 