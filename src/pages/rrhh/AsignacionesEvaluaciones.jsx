import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

const AsignacionesEvaluaciones = () => {
  const [items, setItems] = useState([
    { id: 1, empleado: 'Juan Pérez', evaluacion: 'A' },
    { id: 2, empleado: 'María García', evaluacion: 'B' }
  ]);
  const [nuevo, setNuevo] = useState({ empleado: '', evaluacion: '' });

  const agregar = () => {
    if (!nuevo.empleado || !nuevo.evaluacion) return;
    setItems([...items, { ...nuevo, id: items.length + 1 }]);
    setNuevo({ empleado: '', evaluacion: '' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Asignaciones y Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Empleado"
              value={nuevo.empleado}
              onChange={e => setNuevo({ ...nuevo, empleado: e.target.value })}
            />
            <Input
              placeholder="Evaluación"
              value={nuevo.evaluacion}
              onChange={e => setNuevo({ ...nuevo, evaluacion: e.target.value })}
            />
            <Button onClick={agregar}>Agregar</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Evaluación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.empleado}</TableCell>
                  <TableCell>{item.evaluacion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AsignacionesEvaluaciones;
