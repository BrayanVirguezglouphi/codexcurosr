import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CrearFacturaDialog from './facturas/CrearFacturaDialog';
import EditarFacturaDialog from './facturas/EditarFacturaDialog';
import { useToast } from "@/components/ui/use-toast";

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const { toast } = useToast();

  // Cargar facturas
  const cargarFacturas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/facturas');
      const data = await response.json();
      setFacturas(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive",
  });
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, []);

  // Eliminar factura
  const eliminarFactura = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/facturas/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Factura eliminada correctamente",
          });
          cargarFacturas();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la factura",
          variant: "destructive",
        });
      }
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
  };

  // Formatear moneda
  const formatearMoneda = (valor) => {
    if (!valor) return '0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Facturas</h1>
        <Button onClick={() => setIsCrearDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Radicado</TableHead>
              <TableHead>Fecha Est. Pago</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>IVA</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturas.map((factura) => (
              <TableRow key={factura.id_factura}>
                <TableCell>{factura.numero_factura}</TableCell>
                <TableCell>{factura.estatus_factura}</TableCell>
                <TableCell>{formatearFecha(factura.fecha_radicado)}</TableCell>
                <TableCell>{formatearFecha(factura.fecha_estimada_pago)}</TableCell>
                <TableCell>{formatearMoneda(factura.subtotal_facturado_moneda)}</TableCell>
                <TableCell>{formatearMoneda(factura.valor_tax)}</TableCell>
                <TableCell>{factura.observaciones_factura}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFacturaSeleccionada(factura);
                      setIsEditarDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarFactura(factura.id_factura)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isCrearDialogOpen && (
        <CrearFacturaDialog
          open={isCrearDialogOpen}
          onClose={() => setIsCrearDialogOpen(false)}
          onFacturaCreada={cargarFacturas}
          />
      )}

      {isEditarDialogOpen && facturaSeleccionada && (
        <EditarFacturaDialog
          open={isEditarDialogOpen}
          onClose={() => {
            setIsEditarDialogOpen(false);
            setFacturaSeleccionada(null);
          }}
          factura={facturaSeleccionada}
          onFacturaActualizada={cargarFacturas}
        />
      )}
    </div>
  );
};

export default Facturas;
