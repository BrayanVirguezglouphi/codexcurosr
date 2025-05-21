import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

const CapacitacionesSkills = () => {
  const [items, setItems] = useState([
    { id: 1, nombre: 'React Básico', tipo: 'Capacitación' },
    { id: 2, nombre: 'Liderazgo', tipo: 'Skill' }
  ]);
  const [nuevo, setNuevo] = useState({ nombre: '', tipo: 'Capacitación' });

  const agregar = () => {
    if (!nuevo.nombre) return;
    setItems([...items, { ...nuevo, id: items.length + 1 }]);
    setNuevo({ nombre: '', tipo: 'Capacitación' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Capacitaciones y Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre"
              value={nuevo.nombre}
              onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
            />
            <Input
              placeholder="Tipo"
              value={nuevo.tipo}
              onChange={e => setNuevo({ ...nuevo, tipo: e.target.value })}
            />
            <Button onClick={agregar}>Agregar</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacitacionesSkills;
