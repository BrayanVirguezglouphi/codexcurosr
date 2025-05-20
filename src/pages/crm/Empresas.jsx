import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([
    {
      id: 1,
      nombre: 'TechCorp Solutions',
      industria: 'Tecnología',
      tamano: 'Grande',
      ingresos: '$10M - $50M',
      ubicacion: 'Ciudad de México',
      estructura: [
        { departamento: 'TI', empleados: 50, director: 'Juan Pérez' },
        { departamento: 'Ventas', empleados: 30, director: 'María García' }
      ],
      contactoPrincipal: 'Carlos Rodríguez',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'Retail Pro',
      industria: 'Comercio',
      tamano: 'Mediana',
      ingresos: '$1M - $5M',
      ubicacion: 'Guadalajara',
      estructura: [
        { departamento: 'Operaciones', empleados: 20, director: 'Ana López' },
        { departamento: 'Marketing', empleados: 10, director: 'Pedro Sánchez' }
      ],
      contactoPrincipal: 'Laura Martínez',
      estado: 'Prospecto'
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [empresaActual, setEmpresaActual] = useState({
    nombre: '',
    industria: '',
    tamano: '',
    ingresos: '',
    ubicacion: '',
    estructura: [],
    contactoPrincipal: '',
    estado: ''
  });

  const [departamentoActual, setDepartamentoActual] = useState({
    departamento: '',
    empleados: '',
    director: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (empresaActual.id) {
      setEmpresas(empresas.map(empresa => 
        empresa.id === empresaActual.id ? {...empresaActual} : empresa
      ));
    } else {
      setEmpresas([...empresas, { ...empresaActual, id: empresas.length + 1 }]);
    }
    setDialogoAbierto(false);
    setEmpresaActual({
      nombre: '',
      industria: '',
      tamano: '',
      ingresos: '',
      ubicacion: '',
      estructura: [],
      contactoPrincipal: '',
      estado: ''
    });
  };

  const agregarDepartamento = () => {
    if (departamentoActual.departamento && departamentoActual.director) {
      setEmpresaActual({
        ...empresaActual,
        estructura: [...(empresaActual.estructura || []), { ...departamentoActual }]
      });
      setDepartamentoActual({
        departamento: '',
        empleados: '',
        director: ''
      });
    }
  };

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    empresa.industria.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Empresas</h1>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button>Nueva Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{empresaActual.id ? 'Editar' : 'Nueva'} Empresa</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Datos Generales</TabsTrigger>
                <TabsTrigger value="estructura">Estructura Organizativa</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={empresaActual.nombre}
                        onChange={(e) => setEmpresaActual({...empresaActual, nombre: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industria">Industria</Label>
                      <Input
                        id="industria"
                        value={empresaActual.industria}
                        onChange={(e) => setEmpresaActual({...empresaActual, industria: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tamano">Tamaño</Label>
                      <Select
                        value={empresaActual.tamano}
                        onValueChange={(value) => setEmpresaActual({...empresaActual, tamano: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pequeña">Pequeña</SelectItem>
                          <SelectItem value="Mediana">Mediana</SelectItem>
                          <SelectItem value="Grande">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ingresos">Ingresos Anuales</Label>
                      <Input
                        id="ingresos"
                        value={empresaActual.ingresos}
                        onChange={(e) => setEmpresaActual({...empresaActual, ingresos: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion">Ubicación</Label>
                      <Input
                        id="ubicacion"
                        value={empresaActual.ubicacion}
                        onChange={(e) => setEmpresaActual({...empresaActual, ubicacion: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoPrincipal">Contacto Principal</Label>
                      <Input
                        id="contactoPrincipal"
                        value={empresaActual.contactoPrincipal}
                        onChange={(e) => setEmpresaActual({...empresaActual, contactoPrincipal: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={empresaActual.estado}
                        onValueChange={(value) => setEmpresaActual({...empresaActual, estado: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Prospecto">Prospecto</SelectItem>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Guardar</Button>
                </form>
              </TabsContent>
              <TabsContent value="estructura">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        value={departamentoActual.departamento}
                        onChange={(e) => setDepartamentoActual({...departamentoActual, departamento: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empleados">Número de Empleados</Label>
                      <Input
                        id="empleados"
                        type="number"
                        value={departamentoActual.empleados}
                        onChange={(e) => setDepartamentoActual({...departamentoActual, empleados: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="director">Director</Label>
                      <Input
                        id="director"
                        value={departamentoActual.director}
                        onChange={(e) => setDepartamentoActual({...departamentoActual, director: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={agregarDepartamento} type="button" className="w-full">
                    Agregar Departamento
                  </Button>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Empleados</TableHead>
                        <TableHead>Director</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresaActual.estructura?.map((dep, index) => (
                        <TableRow key={index}>
                          <TableCell>{dep.departamento}</TableCell>
                          <TableCell>{dep.empleados}</TableCell>
                          <TableCell>{dep.director}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setEmpresaActual({
                                  ...empresaActual,
                                  estructura: empresaActual.estructura.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Buscar empresas..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Industria</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresasFiltradas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell>{empresa.nombre}</TableCell>
                  <TableCell>{empresa.industria}</TableCell>
                  <TableCell>{empresa.tamano}</TableCell>
                  <TableCell>{empresa.ubicacion}</TableCell>
                  <TableCell>{empresa.estado}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEmpresaActual(empresa);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar esta empresa?')) {
                            setEmpresas(empresas.filter(e => e.id !== empresa.id));
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

export default Empresas; 