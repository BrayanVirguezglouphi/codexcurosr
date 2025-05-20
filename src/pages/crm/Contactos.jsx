import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Contactos = () => {
  const [contactos, setContactos] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      cargo: 'Director de TI',
      empresa: 'TechCorp Solutions',
      email: 'juan.perez@techcorp.com',
      telefono: '+52 555 123 4567',
      tipo: 'Decisor',
      estado: 'Activo',
      ultimoContacto: '2024-03-15',
      notas: 'Interesado en soluciones cloud'
    },
    {
      id: 2,
      nombre: 'María García',
      cargo: 'Gerente de Compras',
      empresa: 'Retail Pro',
      email: 'maria.garcia@retailpro.com',
      telefono: '+52 555 987 6543',
      tipo: 'Influenciador',
      estado: 'Activo',
      ultimoContacto: '2024-03-10',
      notas: 'Requiere cotización para nuevo proyecto'
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [contactoActual, setContactoActual] = useState({
    nombre: '',
    cargo: '',
    empresa: '',
    email: '',
    telefono: '',
    tipo: '',
    estado: '',
    ultimoContacto: '',
    notas: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contactoActual.id) {
      setContactos(contactos.map(contacto => 
        contacto.id === contactoActual.id ? {...contactoActual} : contacto
      ));
    } else {
      setContactos([...contactos, { ...contactoActual, id: contactos.length + 1 }]);
    }
    setDialogoAbierto(false);
    setContactoActual({
      nombre: '',
      cargo: '',
      empresa: '',
      email: '',
      telefono: '',
      tipo: '',
      estado: '',
      ultimoContacto: '',
      notas: ''
    });
  };

  const contactosFiltrados = contactos.filter(contacto =>
    contacto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    contacto.empresa.toLowerCase().includes(filtro.toLowerCase()) ||
    contacto.email.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Contactos</h1>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button>Nuevo Contacto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{contactoActual.id ? 'Editar' : 'Nuevo'} Contacto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    value={contactoActual.nombre}
                    onChange={(e) => setContactoActual({...contactoActual, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={contactoActual.cargo}
                    onChange={(e) => setContactoActual({...contactoActual, cargo: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    id="empresa"
                    value={contactoActual.empresa}
                    onChange={(e) => setContactoActual({...contactoActual, empresa: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactoActual.email}
                    onChange={(e) => setContactoActual({...contactoActual, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={contactoActual.telefono}
                    onChange={(e) => setContactoActual({...contactoActual, telefono: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Contacto</Label>
                  <Select
                    value={contactoActual.tipo}
                    onValueChange={(value) => setContactoActual({...contactoActual, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Decisor">Decisor</SelectItem>
                      <SelectItem value="Influenciador">Influenciador</SelectItem>
                      <SelectItem value="Usuario">Usuario</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={contactoActual.estado}
                    onValueChange={(value) => setContactoActual({...contactoActual, estado: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="En espera">En espera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ultimoContacto">Último Contacto</Label>
                  <Input
                    id="ultimoContacto"
                    type="date"
                    value={contactoActual.ultimoContacto}
                    onChange={(e) => setContactoActual({...contactoActual, ultimoContacto: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Input
                    id="notas"
                    value={contactoActual.notas}
                    onChange={(e) => setContactoActual({...contactoActual, notas: e.target.value})}
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
          <CardTitle>Contactos</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Buscar contactos..."
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
                <TableHead>Cargo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Contacto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactosFiltrados.map((contacto) => (
                <TableRow key={contacto.id}>
                  <TableCell>{contacto.nombre}</TableCell>
                  <TableCell>{contacto.cargo}</TableCell>
                  <TableCell>{contacto.empresa}</TableCell>
                  <TableCell>{contacto.email}</TableCell>
                  <TableCell>{contacto.tipo}</TableCell>
                  <TableCell>{contacto.estado}</TableCell>
                  <TableCell>{contacto.ultimoContacto}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setContactoActual(contacto);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este contacto?')) {
                            setContactos(contactos.filter(c => c.id !== contacto.id));
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

export default Contactos;
