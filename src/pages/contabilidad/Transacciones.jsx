import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import CrearTransaccionDialog from './transacciones/CrearTransaccionDialog';
import EditarTransaccionDialog from './transacciones/EditarTransaccionDialog';

const Transacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState({ campo: 'fecha_transaccion', direccion: 'desc' });
  const { toast } = useToast();

  // Cargar transacciones
  const cargarTransacciones = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transacciones');
      const data = await response.json();
      setTransacciones(data);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarTransacciones();
  }, []);

  // Eliminar (anular) transacción
  const eliminarTransaccion = async (id) => {
    if (window.confirm('¿Está seguro de que desea anular esta transacción?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/transacciones/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Transacción anulada correctamente",
          });
          cargarTransacciones();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo anular la transacción",
          variant: "destructive",
        });
      }
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear monto
  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  // Ordenar transacciones
  const ordenarTransacciones = (campo) => {
    const direccion = ordenamiento.campo === campo && ordenamiento.direccion === 'asc' ? 'desc' : 'asc';
    setOrdenamiento({ campo, direccion });
    
    const transaccionesOrdenadas = [...transacciones].sort((a, b) => {
      if (campo === 'fecha_transaccion') {
        return direccion === 'asc' 
          ? new Date(a[campo]) - new Date(b[campo])
          : new Date(b[campo]) - new Date(a[campo]);
      }
      if (campo === 'monto') {
        return direccion === 'asc'
          ? parseFloat(a[campo]) - parseFloat(b[campo])
          : parseFloat(b[campo]) - parseFloat(a[campo]);
      }
      return direccion === 'asc'
        ? a[campo].localeCompare(b[campo])
        : b[campo].localeCompare(a[campo]);
    });
    
    setTransacciones(transaccionesOrdenadas);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <Button onClick={() => setIsCrearDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => ordenarTransacciones('fecha_transaccion')}>
                <div className="flex items-center">
                  Fecha
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => ordenarTransacciones('tipo_transaccion')}>
                <div className="flex items-center">
                  Tipo
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => ordenarTransacciones('monto')}>
                <div className="flex items-center">
                  Monto
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Cuenta Origen</TableHead>
              <TableHead>Cuenta Destino</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacciones.map((transaccion) => (
              <TableRow key={transaccion.id_transaccion}>
                <TableCell>{formatearFecha(transaccion.fecha_transaccion)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaccion.tipo_transaccion === 'INGRESO' ? 'bg-green-100 text-green-800' :
                    transaccion.tipo_transaccion === 'EGRESO' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {transaccion.tipo_transaccion}
                  </span>
                </TableCell>
                <TableCell>{formatearMonto(transaccion.monto)}</TableCell>
                <TableCell>{transaccion.categoria}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaccion.estado === 'COMPLETADA' ? 'bg-green-100 text-green-800' :
                    transaccion.estado === 'ANULADA' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaccion.estado}
                  </span>
                </TableCell>
                <TableCell>{transaccion.cuenta_origen}</TableCell>
                <TableCell>{transaccion.cuenta_destino || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setTransaccionSeleccionada(transaccion);
                        setIsEditarDialogOpen(true);
                      }}
                      disabled={transaccion.estado === 'ANULADA'}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarTransaccion(transaccion.id_transaccion)}
                      disabled={transaccion.estado === 'ANULADA'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CrearTransaccionDialog
        open={isCrearDialogOpen}
        onClose={() => setIsCrearDialogOpen(false)}
        onTransaccionCreada={cargarTransacciones}
      />

      <EditarTransaccionDialog
        open={isEditarDialogOpen}
        onClose={() => {
          setIsEditarDialogOpen(false);
          setTransaccionSeleccionada(null);
        }}
        transaccion={transaccionSeleccionada}
        onTransaccionActualizada={cargarTransacciones}
      />
    </div>
  );
};

export default Transacciones; 