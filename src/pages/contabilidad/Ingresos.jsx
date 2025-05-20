
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/lib/storage';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';

const Ingresos = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [ingresos, setIngresos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentIngresoId, setCurrentIngresoId] = useState(null);
  const [formData, setFormData] = useState({
    concepto: '',
    categoria: '',
    fecha: '',
    monto: '',
    cliente: '',
    estado: '',
    notas: ''
  });

  useEffect(() => {
    // Inicializar datos de ejemplo si no existen
    if (!localStorage.getItem('ingresos')) {
      const ingresosEjemplo = [
        {
          id: '1',
          concepto: 'Pago de factura F-2023-001',
          categoria: 'Ventas',
          fecha: '2023-05-15',
          monto: 1500.00,
          cliente: 'Empresa ABC',
          estado: 'Completado',
          notas: 'Pago recibido por transferencia bancaria',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          concepto: 'Servicio de consultoría',
          categoria: 'Servicios',
          fecha: '2023-05-20',
          monto: 800.00,
          cliente: 'Distribuidora XYZ',
          estado: 'Pendiente',
          notas: 'Pago pendiente de confirmación',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('ingresos', JSON.stringify(ingresosEjemplo));
    }
    
    loadIngresos();
    loadClientes();
  }, []);

  const loadIngresos = () => {
    const data = getItems('ingresos');
    setIngresos(data);
  };

  const loadClientes = () => {
    const data = getItems('clientes');
    setClientes(data);
  };

  const handleOpenDialog = (ingreso = null) => {
    if (ingreso) {
      setFormData({
        concepto: ingreso.concepto || '',
        categoria: ingreso.categoria || '',
        fecha: ingreso.fecha || '',
        monto: ingreso.monto || '',
        cliente: ingreso.cliente || '',
        estado: ingreso.estado || '',
        notas: ingreso.notas || ''
      });
      setCurrentIngresoId(ingreso.id);
    } else {
      setFormData({
        concepto: '',
        categoria: '',
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        cliente: '',
        estado: 'Pendiente',
        notas: ''
      });
      setCurrentIngresoId(null);
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
    
    if (currentIngresoId) {
      // Actualizar ingreso existente
      updateItem('ingresos', currentIngresoId, formData);
    } else {
      // Crear nuevo ingreso
      createItem('ingresos', formData);
    }
    
    loadIngresos();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentIngresoId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('ingresos', currentIngresoId);
    loadIngresos();
    setIsConfirmDialogOpen(false);
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
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
      header: 'Cliente',
      accessor: 'cliente',
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
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Ingresos</h1>
        <p className="text-muted-foreground mt-2">
          Administre los ingresos de su empresa
        </p>
      </motion.div>

      <DataTable
        data={ingresos}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Ingresos"
        description="Lista de todos los ingresos registrados"
      />

      {/* Formulario de Ingreso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentIngresoId ? 'Editar Ingreso' : 'Nuevo Ingreso'}</DialogTitle>
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
                  { value: 'Ventas', label: 'Ventas' },
                  { value: 'Servicios', label: 'Servicios' },
                  { value: 'Comisiones', label: 'Comisiones' },
                  { value: 'Intereses', label: 'Intereses' },
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
                label="Cliente"
                name="cliente"
                type="select"
                value={formData.cliente}
                onChange={handleChange}
                options={clientes.map(cliente => ({
                  value: cliente.nombre,
                  label: cliente.nombre
                }))}
                required
              />
              <FormField
                label="Estado"
                name="estado"
                type="select"
                value={formData.estado}
                onChange={handleChange}
                options={[
                  { value: 'Pendiente', label: 'Pendiente' },
                  { value: 'Completado', label: 'Completado' },
                  { value: 'Cancelado', label: 'Cancelado' }
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
                {currentIngresoId ? 'Actualizar' : 'Crear'}
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
        title="¿Eliminar ingreso?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este ingreso?"
      />
    </div>
  );
};

export default Ingresos;
