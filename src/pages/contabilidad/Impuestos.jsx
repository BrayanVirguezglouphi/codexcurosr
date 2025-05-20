import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Impuestos = () => {
  const [impuestos, setImpuestos] = useState([
    {
      id: 1,
      codigo: 'IVA-16',
      nombre: 'IVA General',
      tipo: 'IVA',
      porcentaje: 16,
      aplicaA: ['Productos', 'Servicios'],
      descripcion: 'Impuesto al Valor Agregado tasa general',
      cuentaContable: '2.1.3.01',
      estado: 'Activo',
      reglas: [
        { descripcion: 'Aplica a todas las ventas nacionales', excepcion: 'Exportaciones' }
      ]
    },
    {
      id: 2,
      codigo: 'RET-10',
      nombre: 'Retención ISR Servicios',
      tipo: 'Retención',
      porcentaje: 10,
      aplicaA: ['Servicios Profesionales'],
      descripcion: 'Retención de ISR por servicios profesionales',
      cuentaContable: '2.1.4.01',
      estado: 'Activo',
      reglas: [
        { descripcion: 'Aplica a servicios profesionales independientes', excepcion: 'Asalariados' }
      ]
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [impuestoActual, setImpuestoActual] = useState({
    codigo: '',
    nombre: '',
    tipo: '',
    porcentaje: '',
    aplicaA: [],
    descripcion: '',
    cuentaContable: '',
    estado: '',
    reglas: []
  });

  const [reglaActual, setReglaActual] = useState({
    descripcion: '',
    excepcion: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (impuestoActual.id) {
      setImpuestos(impuestos.map(impuesto => 
        impuesto.id === impuestoActual.id ? {...impuestoActual} : impuesto
      ));
    } else {
      setImpuestos([...impuestos, { ...impuestoActual, id: impuestos.length + 1 }]);
    }
    setDialogoAbierto(false);
    setImpuestoActual({
      codigo: '',
      nombre: '',
      tipo: '',
      porcentaje: '',
      aplicaA: [],
      descripcion: '',
      cuentaContable: '',
      estado: '',
      reglas: []
    });
  };

  const agregarRegla = () => {
    if (reglaActual.descripcion) {
      setImpuestoActual({
        ...impuestoActual,
        reglas: [...(impuestoActual.reglas || []), { ...reglaActual }]
      });
      setReglaActual({
        descripcion: '',
        excepcion: ''
      });
    }
  };

  const agregarAplicacion = (valor) => {
    if (!impuestoActual.aplicaA.includes(valor)) {
      setImpuestoActual({
        ...impuestoActual,
        aplicaA: [...impuestoActual.aplicaA, valor]
      });
    }
  };

  const removerAplicacion = (valor) => {
    setImpuestoActual({
      ...impuestoActual,
      aplicaA: impuestoActual.aplicaA.filter(item => item !== valor)
    });
  };

  const impuestosFiltrados = impuestos.filter(impuesto =>
    impuesto.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    impuesto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    impuesto.tipo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Impuestos</h1>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button>Nuevo Impuesto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{impuestoActual.id ? 'Editar' : 'Nuevo'} Impuesto</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Datos Generales</TabsTrigger>
                <TabsTrigger value="reglas">Reglas y Aplicación</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código</Label>
                      <Input
                        id="codigo"
                        value={impuestoActual.codigo}
                        onChange={(e) => setImpuestoActual({...impuestoActual, codigo: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={impuestoActual.nombre}
                        onChange={(e) => setImpuestoActual({...impuestoActual, nombre: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={impuestoActual.tipo}
                        onValueChange={(value) => setImpuestoActual({...impuestoActual, tipo: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IVA">IVA</SelectItem>
                          <SelectItem value="Retención">Retención</SelectItem>
                          <SelectItem value="ISR">ISR</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="porcentaje">Porcentaje</Label>
                      <Input
                        id="porcentaje"
                        type="number"
                        value={impuestoActual.porcentaje}
                        onChange={(e) => setImpuestoActual({...impuestoActual, porcentaje: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuentaContable">Cuenta Contable</Label>
                      <Input
                        id="cuentaContable"
                        value={impuestoActual.cuentaContable}
                        onChange={(e) => setImpuestoActual({...impuestoActual, cuentaContable: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={impuestoActual.estado}
                        onValueChange={(value) => setImpuestoActual({...impuestoActual, estado: value})}
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
                        value={impuestoActual.descripcion}
                        onChange={(e) => setImpuestoActual({...impuestoActual, descripcion: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="reglas">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Aplica a</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Productos', 'Servicios', 'Servicios Profesionales', 'Arrendamiento'].map((item) => (
                        <Button
                          key={item}
                          variant={impuestoActual.aplicaA?.includes(item) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => impuestoActual.aplicaA?.includes(item) ? 
                            removerAplicacion(item) : agregarAplicacion(item)}
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reglaDescripcion">Descripción de la Regla</Label>
                        <Input
                          id="reglaDescripcion"
                          value={reglaActual.descripcion}
                          onChange={(e) => setReglaActual({...reglaActual, descripcion: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reglaExcepcion">Excepción</Label>
                        <Input
                          id="reglaExcepcion"
                          value={reglaActual.excepcion}
                          onChange={(e) => setReglaActual({...reglaActual, excepcion: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button onClick={agregarRegla} type="button" className="w-full">
                      Agregar Regla
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Excepción</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {impuestoActual.reglas?.map((regla, index) => (
                        <TableRow key={index}>
                          <TableCell>{regla.descripcion}</TableCell>
                          <TableCell>{regla.excepcion}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setImpuestoActual({
                                  ...impuestoActual,
                                  reglas: impuestoActual.reglas.filter((_, i) => i !== index)
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
            <div className="mt-4">
              <Button onClick={handleSubmit} className="w-full">Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Impuestos</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Buscar impuestos..."
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
                <TableHead>Porcentaje</TableHead>
                <TableHead>Cuenta Contable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {impuestosFiltrados.map((impuesto) => (
                <TableRow key={impuesto.id}>
                  <TableCell>{impuesto.codigo}</TableCell>
                  <TableCell>{impuesto.nombre}</TableCell>
                  <TableCell>{impuesto.tipo}</TableCell>
                  <TableCell>{impuesto.porcentaje}%</TableCell>
                  <TableCell>{impuesto.cuentaContable}</TableCell>
                  <TableCell>{impuesto.estado}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImpuestoActual(impuesto);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este impuesto?')) {
                            setImpuestos(impuestos.filter(i => i.id !== impuesto.id));
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

export default Impuestos; 