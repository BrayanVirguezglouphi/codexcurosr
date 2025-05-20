import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';

const CrearTransaccionDialog = ({ open, onClose, onTransaccionCreada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      fecha_transaccion: new Date().toISOString().split('T')[0],
      tipo_transaccion: 'INGRESO',
      monto: '',
      descripcion: '',
      categoria: '',
      estado: 'PENDIENTE',
      cuenta_origen: '',
      cuenta_destino: '',
      referencia: ''
    }
  });
  const { toast } = useToast();

  const onSubmit = async (data) => {
    try {
      // Asegurarse de que los valores numéricos sean números
      const formattedData = {
        ...data,
        monto: parseFloat(data.monto)
      };

      const response = await fetch('http://localhost:5000/api/transacciones', {
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
          description: "Transacción creada correctamente",
        });
        onTransaccionCreada();
        onClose();
        reset();
      } else {
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
          throw new Error(responseData.message || 'Error al crear la transacción');
        }
      }
    } catch (error) {
      console.error('Error al crear transacción:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la transacción",
        variant: "destructive",
      });
    }
  };

  const handleSelectChange = (field, value) => {
    setValue(field, value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Transacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha_transaccion">Fecha</Label>
              <Input
                id="fecha_transaccion"
                type="date"
                {...register("fecha_transaccion", { 
                  required: "La fecha es requerida" 
                })}
              />
              {errors.fecha_transaccion && (
                <span className="text-red-500 text-sm">{errors.fecha_transaccion.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo_transaccion">Tipo</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("tipo_transaccion", value)}
                defaultValue="INGRESO"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INGRESO">Ingreso</SelectItem>
                  <SelectItem value="EGRESO">Egreso</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                {...register("monto", { 
                  required: "El monto es requerido",
                  min: {
                    value: 0.01,
                    message: "El monto debe ser mayor que 0"
                  }
                })}
              />
              {errors.monto && (
                <span className="text-red-500 text-sm">{errors.monto.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                {...register("categoria", { 
                  required: "La categoría es requerida" 
                })}
              />
              {errors.categoria && (
                <span className="text-red-500 text-sm">{errors.categoria.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cuenta_origen">Cuenta Origen</Label>
              <Input
                id="cuenta_origen"
                {...register("cuenta_origen", { 
                  required: "La cuenta origen es requerida" 
                })}
              />
              {errors.cuenta_origen && (
                <span className="text-red-500 text-sm">{errors.cuenta_origen.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cuenta_destino">Cuenta Destino</Label>
              <Input
                id="cuenta_destino"
                {...register("cuenta_destino")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                {...register("referencia")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                {...register("descripcion")}
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
              Crear Transacción
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearTransaccionDialog; 