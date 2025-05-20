import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const LineasServicios = () => {
  const [servicios, setServicios] = useState([
    {
      id: 1,
      codigo: 'CONS-001',
      nombre: 'Consultoría Estratégica',
      categoria: 'Consultoría',
      descripcion: 'Servicios de consultoría para planificación estratégica empresarial',
      precioBase: 1500,
      unidadMedida: 'Hora',
      impuesto: 16,
      estado: 'Activo'
    },
    {
      id: 2,
      codigo: 'DES-001',
      nombre: 'Desarrollo de Software',
      categoria: 'Desarrollo',
      descripcion: 'Servicios de desarrollo de software a medida',
      precioBase: 2000,
      unidadMedida: 'Hora',
      impuesto: 16,
      estado: 'Activo'
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [servicioActual, setServicioActual] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    descripcion: '',
    precioBase: '',
    unidadMedida: '',
    impuesto: '',
    estado: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (servicioActual.id) {
      setServicios(servicios.map(servicio => 
        servicio.id === servicioActual.id ? {...servicioActual} : servicio
      ));
    } else {
      setServicios([...servicios, { ...servicioActual, id: servicios.length + 1 }]);
    }
    setDialogoAbierto(false);
    setServicioActual({
      codigo: '',
      nombre: '',
      categoria: '',
      descripcion: '',
      precioBase: '',
      unidadMedida: '',
      impuesto: '',
      estado: ''
    });
  };

  const serviciosFiltrados = servicios.filter(servicio =>
    servicio.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    servicio.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    servicio.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Líneas de Servicios</h1>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button>Nuevo Servicio</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{servicioActual.id ? 'Editar' : 'Nuevo'} Servicio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={servicioActual.codigo}
                    onChange={(e) => setServicioActual({...servicioActual, codigo: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={servicioActual.nombre}
                    onChange={(e) => setServicioActual({...servicioActual, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={servicioActual.categoria}
                    onValueChange={(value) => setServicioActual({...servicioActual, categoria: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultoría">Consultoría</SelectItem>
                      <SelectItem value="Desarrollo">Desarrollo</SelectItem>
                      <SelectItem value="Soporte">Soporte</SelectItem>
                      <SelectItem value="Capacitación">Capacitación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precioBase">Precio Base</Label>
                  <Input
                    id="precioBase"
                    type="number"
                    value={servicioActual.precioBase}
                    onChange={(e) => setServicioActual({...servicioActual, precioBase: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                  <Select
                    value={servicioActual.unidadMedida}
                    onValueChange={(value) => setServicioActual({...servicioActual, unidadMedida: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hora">Hora</SelectItem>
                      <SelectItem value="Día">Día</SelectItem>
                      <SelectItem value="Mes">Mes</SelectItem>
                      <SelectItem value="Proyecto">Proyecto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impuesto">Impuesto (%)</Label>
                  <Input
                    id="impuesto"
                    type="number"
                    value={servicioActual.impuesto}
                    onChange={(e) => setServicioActual({...servicioActual, impuesto: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={servicioActual.estado}
                    onValueChange={(value) => setServicioActual({...servicioActual, estado: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={servicioActual.descripcion}
                    onChange={(e) => setServicioActual({...servicioActual, descripcion: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Guardar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Líneas de Servicios</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Buscar servicios..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviciosFiltrados.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell>{servicio.codigo}</TableCell>
                  <TableCell>{servicio.nombre}</TableCell>
                  <TableCell>{servicio.categoria}</TableCell>
                  <TableCell>${servicio.precioBase}</TableCell>
                  <TableCell>{servicio.unidadMedida}</TableCell>
                  <TableCell>{servicio.estado}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setServicioActual(servicio);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este servicio?')) {
                            setServicios(servicios.filter(s => s.id !== servicio.id));
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LineasServicios; 