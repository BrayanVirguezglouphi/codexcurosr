
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/lib/storage';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';

const Gastos = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [gastos, setGastos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentGastoId, setCurrentGastoId] = useState(null);
  const [formData, setFormData] = useState({
    concepto: '',
    categoria: '',
    fecha: '',
    monto: '',
    proveedor: '',
    estado: '',
    notas: ''
  });

  useEffect(() => {
    // Inicializar datos de ejemplo si no existen
    if (!localStorage.getItem('gastos')) {
      const gastosEjemplo = [
        {
          id: '1',
          concepto: 'Alquiler de oficina',
          categoria: 'Alquiler',
          fecha: '2023-05-01',
          monto: 1200.00,
          proveedor: 'Inmobiliaria XYZ',
          estado: 'Pagado',
          notas: 'Pago mensual de alquiler',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          concepto: 'Servicios de internet',
          categoria: 'Servicios',
          fecha: '2023-05-05',
          monto: 89.99,
          proveedor: 'Proveedor Internet',
          estado: 'Pendiente',
          notas: 'Servicio mensual de internet de alta velocidad',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('gastos', JSON.stringify(gastosEjemplo));
    }
    
    loadGastos();
  }, []);

  const loadGastos = () => {
    const data = getItems('gastos');
    setGastos(data);
  };

  const handleOpenDialog = (gasto = null) => {
    if (gasto) {
      setFormData({
        concepto: gasto.concepto || '',
        categoria: gasto.categoria || '',
        fecha: gasto.fecha || '',
        monto: gasto.monto || '',
        proveedor: gasto.proveedor || '',
        estado: gasto.estado || '',
        notas: gasto.notas || ''
      });
      setCurrentGastoId(gasto.id);
    } else {
      setFormData({
        concepto: '',
        categoria: '',
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        proveedor: '',
        estado: 'Pendiente',
        notas: ''
      });
      setCurrentGastoId(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentGastoId) {
      // Actualizar gasto existente
      updateItem('gastos', currentGastoId, formData);
    } else {
      // Crear nuevo gasto
      createItem('gastos', formData);
    }
    
    loadGastos();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentGastoId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('gastos', currentGastoId);
    loadGastos();
    setIsConfirmDialogOpen(false);
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'Pagado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Anulado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns = [
    {
      header: 'Concepto',
      accessor: 'concepto',
    },
    {
      header: 'Categoría',
      accessor: 'categoria',
    },
    {
      header: 'Fecha',
      accessor: 'fecha',
      cell: (row) => new Date(row.fecha).toLocaleDateString(),
    },
    {
      header: 'Monto',
      accessor: 'monto',
      cell: (row) => `$${Number(row.monto).toLocaleString()}`,
    },
    {
      header: 'Proveedor',
      accessor: 'proveedor',
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (row) => (
        <Badge variant="outline" className={getEstadoBadgeColor(row.estado)}>
          {row.estado}
        </Badge>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Gastos</h1>
        <p className="text-muted-foreground mt-2">
          Administre los gastos de su empresa
        </p>
      </motion.div>

      <DataTable
        data={gastos}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Gastos"
        description="Lista de todos los gastos registrados"
      />

      {/* Formulario de Gasto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentGastoId ? 'Editar Gasto' : 'Nuevo Gasto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Concepto"
                name="concepto"
                value={formData.concepto}
                onChange={handleChange}
                required
              />
              <FormField
                label="Categoría"
                name="categoria"
                type="select"
                value={formData.categoria}
                onChange={handleChange}
                options={[
                  { value: 'Alquiler', label: 'Alquiler' },
                  { value: 'Servicios', label: 'Servicios' },
                  { value: 'Suministros', label: 'Suministros' },
                  { value: 'Salarios', label: 'Salarios' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Impuestos', label: 'Impuestos' },
                  { value: 'Otros', label: 'Otros' }
                ]}
                required
              />
              <FormField
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
              <FormField
                label="Monto ($)"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
                required
              />
              <FormField
                label="Proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
              />
              <FormField
                label="Estado"
                name="estado"
                type="select"
                value={formData.estado}
                onChange={handleChange}
                options={[
                  { value: 'Pendiente', label: 'Pendiente' },
                  { value: 'Pagado', label: 'Pagado' },
                  { value: 'Vencido', label: 'Vencido' },
                  { value: 'Anulado', label: 'Anulado' }
                ]}
                required
              />
              <div className="md:col-span-2">
                <FormField
                  label="Notas"
                  name="notas"
                  type="textarea"
                  value={formData.notas}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {currentGastoId ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar gasto?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este gasto?"
      />
    </div>
  );
};

export default Gastos;
