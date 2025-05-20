import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ClasificacionesContables = () => {
  const [cuentas, setCuentas] = useState([
    {
      id: 1,
      codigo: '1000',
      nombre: 'Activos',
      tipo: 'Activo',
      naturaleza: 'Deudora',
      nivel: 1,
      descripcion: 'Recursos controlados por la entidad',
      estado: 'Activo'
    },
    {
      id: 2,
      codigo: '1100',
      nombre: 'Activos Corrientes',
      tipo: 'Activo',
      naturaleza: 'Deudora',
      nivel: 2,
      descripcion: 'Activos que se esperan realizar en un ciclo normal de operación',
      estado: 'Activo'
    },
    {
      id: 3,
      codigo: '2000',
      nombre: 'Pasivos',
      tipo: 'Pasivo',
      naturaleza: 'Acreedora',
      nivel: 1,
      descripcion: 'Obligaciones presentes de la entidad',
      estado: 'Activo'
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [cuentaActual, setCuentaActual] = useState({
    codigo: '',
    nombre: '',
    tipo: '',
    naturaleza: '',
    nivel: '',
    descripcion: '',
    estado: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cuentaActual.id) {
      setCuentas(cuentas.map(cuenta => 
        cuenta.id === cuentaActual.id ? {...cuentaActual} : cuenta
      ));
    } else {
      setCuentas([...cuentas, { ...cuentaActual, id: cuentas.length + 1 }]);
    }
    setDialogoAbierto(false);
    setCuentaActual({
      codigo: '',
      nombre: '',
      tipo: '',
      naturaleza: '',
      nivel: '',
      descripcion: '',
      estado: ''
    });
  };

  const cuentasFiltradas = cuentas.filter(cuenta =>
    cuenta.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    cuenta.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Plan de Cuentas</h1>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button>Nueva Cuenta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{cuentaActual.id ? 'Editar' : 'Nueva'} Cuenta Contable</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={cuentaActual.codigo}
                    onChange={(e) => setCuentaActual({...cuentaActual, codigo: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={cuentaActual.nombre}
                    onChange={(e) => setCuentaActual({...cuentaActual, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={cuentaActual.tipo}
                    onValueChange={(value) => setCuentaActual({...cuentaActual, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Pasivo">Pasivo</SelectItem>
                      <SelectItem value="Patrimonio">Patrimonio</SelectItem>
                      <SelectItem value="Ingreso">Ingreso</SelectItem>
                      <SelectItem value="Gasto">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naturaleza">Naturaleza</Label>
                  <Select
                    value={cuentaActual.naturaleza}
                    onValueChange={(value) => setCuentaActual({...cuentaActual, naturaleza: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la naturaleza" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deudora">Deudora</SelectItem>
                      <SelectItem value="Acreedora">Acreedora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nivel</Label>
                  <Input
                    id="nivel"
                    type="number"
                    min="1"
                    max="5"
                    value={cuentaActual.nivel}
                    onChange={(e) => setCuentaActual({...cuentaActual, nivel: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={cuentaActual.estado}
                    onValueChange={(value) => setCuentaActual({...cuentaActual, estado: value})}
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
                  <Input
                    id="descripcion"
                    value={cuentaActual.descripcion}
                    onChange={(e) => setCuentaActual({...cuentaActual, descripcion: e.target.value})}
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
          <CardTitle>Plan de Cuentas</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Buscar cuentas..."
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
                <TableHead>Tipo</TableHead>
                <TableHead>Naturaleza</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuentasFiltradas.map((cuenta) => (
                <TableRow key={cuenta.id}>
                  <TableCell>{cuenta.codigo}</TableCell>
                  <TableCell>{cuenta.nombre}</TableCell>
                  <TableCell>{cuenta.tipo}</TableCell>
                  <TableCell>{cuenta.naturaleza}</TableCell>
                  <TableCell>{cuenta.nivel}</TableCell>
                  <TableCell>{cuenta.estado}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCuentaActual(cuenta);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar esta cuenta?')) {
                            setCuentas(cuentas.filter(c => c.id !== cuenta.id));
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

export default ClasificacionesContables; 