import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ContratosRRHH = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    empleado: '',
    tipo: '',
    inicio: '',
    salario: '',
    comentarios: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setOpen(false);
    setFormData({
      empleado: '',
      tipo: '',
      inicio: '',
      salario: '',
      comentarios: ''
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Contratos RRHH</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Nuevo Contrato</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Contrato</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empleado">Empleado</Label>
                  <Input
                    id="empleado"
                    name="empleado"
                    value={formData.empleado}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Contrato</Label>
                  <Input
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inicio">Fecha de Inicio</Label>
                  <Input
                    id="inicio"
                    type="date"
                    name="inicio"
                    value={formData.inicio}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">Salario</Label>
                  <Input
                    id="salario"
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comentarios">Comentarios</Label>
                  <Textarea
                    id="comentarios"
                    name="comentarios"
                    value={formData.comentarios}
                    onChange={handleChange}
                  />
                </div>
                <Button type="submit" className="w-full">Guardar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay contratos registrados.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContratosRRHH;
