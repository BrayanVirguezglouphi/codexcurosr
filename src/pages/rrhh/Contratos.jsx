import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const Contratos = () => {
  const [contratos, setContratos] = useState([
    {
      id: 1,
      empleado: 'Juan Pérez',
      tipoContrato: 'Indefinido',
      fechaInicio: '2024-01-15',
      fechaFin: null,
      cargo: 'Desarrollador Senior',
      salarioBase: 45000,
      moneda: 'MXN',
      jornada: 'Tiempo Completo',
      beneficios: ['Seguro Médico', 'Bonos', 'Home Office'],
      estado: 'Activo',
      observaciones: 'Contrato inicial con período de prueba de 3 meses'
    },
    {
      id: 2,
      empleado: 'María García',
      tipoContrato: 'Temporal',
      fechaInicio: '2024-02-01',
      fechaFin: '2024-07-31',
      cargo: 'Analista de Marketing',
      salarioBase: 35000,
      moneda: 'MXN',
      jornada: 'Tiempo Completo',
      beneficios: ['Seguro Médico', 'Vales de Despensa'],
      estado: 'Activo',
      observaciones: 'Contrato por proyecto específico'
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [contratoActual, setContratoActual] = useState({
    empleado: '',
    tipoContrato: '',
    fechaInicio: '',
    fechaFin: '',
    cargo: '',
    salarioBase: '',
    moneda: '',
    jornada: '',
    beneficios: [],
    estado: '',
    observaciones: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contratoActual.id) {
      setContratos(contratos.map(contrato => 
        contrato.id === contratoActual.id ? {...contratoActual} : contrato
      ));
    } else {
      setContratos([...contratos, { ...contratoActual, id: contratos.length + 1 }]);
    }
    setDialogoAbierto(false);
    setContratoActual({
      empleado: '',
      tipoContrato: '',
      fechaInicio: '',
      fechaFin: '',
      cargo: '',
      salarioBase: '',
      moneda: '',
      jornada: '',
      beneficios: [],
      estado: '',
      observaciones: ''
    });
  };

  const agregarBeneficio = (beneficio) => {
    if (!contratoActual.beneficios.includes(beneficio)) {
      setContratoActual({
        ...contratoActual,
        beneficios: [...contratoActual.beneficios, beneficio]
      });
    }
  };

  const removerBeneficio = (beneficio) => {
    setContratoActual({
      ...contratoActual,
      beneficios: contratoActual.beneficios.filter(b => b !== beneficio)
    });
  };

  const contratosFiltrados = contratos.filter(contrato =>
    contrato.empleado.toLowerCase().includes(filtro.toLowerCase()) ||
    contrato.cargo.toLowerCase().includes(filtro.toLowerCase()) ||
    contrato.tipoContrato.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contratos Laborales</h1>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button>Nuevo Contrato</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{contratoActual.id ? 'Editar' : 'Nuevo'} Contrato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empleado">Empleado</Label>
                  <Input
                    id="empleado"
                    value={contratoActual.empleado}
                    onChange={(e) => setContratoActual({...contratoActual, empleado: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                  <Select
                    value={contratoActual.tipoContrato}
                    onValueChange={(value) => setContratoActual({...contratoActual, tipoContrato: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indefinido">Indefinido</SelectItem>
                      <SelectItem value="Temporal">Temporal</SelectItem>
                      <SelectItem value="Por Obra">Por Obra</SelectItem>
                      <SelectItem value="Medio Tiempo">Medio Tiempo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={contratoActual.fechaInicio}
                    onChange={(e) => setContratoActual({...contratoActual, fechaInicio: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha de Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={contratoActual.fechaFin}
                    onChange={(e) => setContratoActual({...contratoActual, fechaFin: e.target.value})}
                    disabled={contratoActual.tipoContrato === 'Indefinido'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={contratoActual.cargo}
                    onChange={(e) => setContratoActual({...contratoActual, cargo: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salarioBase">Salario Base</Label>
                  <Input
                    id="salarioBase"
                    type="number"
                    value={contratoActual.salarioBase}
                    onChange={(e) => setContratoActual({...contratoActual, salarioBase: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={contratoActual.moneda}
                    onValueChange={(value) => setContratoActual({...contratoActual, moneda: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jornada">Jornada</Label>
                  <Select
                    value={contratoActual.jornada}
                    onValueChange={(value) => setContratoActual({...contratoActual, jornada: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la jornada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tiempo Completo">Tiempo Completo</SelectItem>
                      <SelectItem value="Medio Tiempo">Medio Tiempo</SelectItem>
                      <SelectItem value="Por Horas">Por Horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={contratoActual.estado}
                    onValueChange={(value) => setContratoActual({...contratoActual, estado: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Beneficios</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Seguro Médico', 'Bonos', 'Home Office', 'Vales de Despensa', 'Seguro de Vida', 'Fondo de Ahorro'].map((beneficio) => (
                      <Button
                        key={beneficio}
                        type="button"
                        variant={contratoActual.beneficios?.includes(beneficio) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => contratoActual.beneficios?.includes(beneficio) ?
                          removerBeneficio(beneficio) : agregarBeneficio(beneficio)}
                      >
                        {beneficio}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={contratoActual.observaciones}
                    onChange={(e) => setContratoActual({...contratoActual, observaciones: e.target.value})}
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
          <CardTitle>Contratos</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Buscar contratos..."
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
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosFiltrados.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell>{contrato.empleado}</TableCell>
                  <TableCell>{contrato.tipoContrato}</TableCell>
                  <TableCell>{contrato.cargo}</TableCell>
                  <TableCell>{contrato.fechaInicio}</TableCell>
                  <TableCell>{contrato.fechaFin || 'N/A'}</TableCell>
                  <TableCell>{contrato.salarioBase} {contrato.moneda}</TableCell>
                  <TableCell>{contrato.estado}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setContratoActual(contrato);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este contrato?')) {
                            setContratos(contratos.filter(c => c.id !== contrato.id));
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

export default Contratos; 