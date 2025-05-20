import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Mercado = () => {
  const [segmentos, setSegmentos] = useState([
    { id: 1, nombre: 'Empresas Pequeñas', descripcion: 'Menos de 50 empleados', potencial: 'Alto' },
    { id: 2, nombre: 'Empresas Medianas', descripcion: '50-250 empleados', potencial: 'Medio' },
    { id: 3, nombre: 'Corporaciones', descripcion: 'Más de 250 empleados', potencial: 'Alto' },
  ]);

  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [segmentoActual, setSegmentoActual] = useState({ nombre: '', descripcion: '', potencial: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (segmentoActual.id) {
      setSegmentos(segmentos.map(seg => 
        seg.id === segmentoActual.id ? {...segmentoActual} : seg
      ));
    } else {
      setSegmentos([...segmentos, { ...segmentoActual, id: segmentos.length + 1 }]);
    }
    setDialogoAbierto(false);
    setSegmentoActual({ nombre: '', descripcion: '', potencial: '' });
  };

  const segmentosFiltrados = segmentos.filter(segmento =>
    segmento.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    segmento.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Mercado</h1>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button>Nuevo Segmento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{segmentoActual.id ? 'Editar' : 'Nuevo'} Segmento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={segmentoActual.nombre}
                  onChange={(e) => setSegmentoActual({...segmentoActual, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={segmentoActual.descripcion}
                  onChange={(e) => setSegmentoActual({...segmentoActual, descripcion: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="potencial">Potencial</Label>
                <Select
                  value={segmentoActual.potencial}
                  onValueChange={(value) => setSegmentoActual({...segmentoActual, potencial: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el potencial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alto">Alto</SelectItem>
                    <SelectItem value="Medio">Medio</SelectItem>
                    <SelectItem value="Bajo">Bajo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Guardar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segmentos de Mercado</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Buscar segmentos..."
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
                <TableHead>Descripción</TableHead>
                <TableHead>Potencial</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segmentosFiltrados.map((segmento) => (
                <TableRow key={segmento.id}>
                  <TableCell>{segmento.nombre}</TableCell>
                  <TableCell>{segmento.descripcion}</TableCell>
                  <TableCell>{segmento.potencial}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSegmentoActual(segmento);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este segmento?')) {
                            setSegmentos(segmentos.filter(s => s.id !== segmento.id));
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

export default Mercado; 