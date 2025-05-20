import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useStorage } from '@/lib/storage';

const AvancesFactura = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [avances, setAvances] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    factura: '',
    fecha: '',
    monto: '',
    estado: 'Pendiente',
    descripcion: ''
  });

  useEffect(() => {
    if (!localStorage.getItem('avancesFactura')) {
      const ejemplo = [
        {
          id: '1',
          factura: 'F-2023-001',
          fecha: '2023-06-01',
          monto: 500,
          estado: 'Pendiente',
          descripcion: 'Primer avance',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          factura: 'F-2023-002',
          fecha: '2023-06-05',
          monto: 300,
          estado: 'Completado',
          descripcion: 'Avance final',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('avancesFactura', JSON.stringify(ejemplo));
    }
    loadAvances();
  }, []);

  const loadAvances = () => {
    const data = getItems('avancesFactura');
    setAvances(data);
  };

  const handleOpenDialog = (avance = null) => {
    if (avance) {
      setFormData({
        factura: avance.factura || '',
        fecha: avance.fecha || '',
        monto: avance.monto || '',
        estado: avance.estado || 'Pendiente',
        descripcion: avance.descripcion || ''
      });
      setCurrentId(avance.id);
    } else {
      setFormData({
        factura: '',
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        estado: 'Pendiente',
        descripcion: ''
      });
      setCurrentId(null);
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
    if (currentId) {
      updateItem('avancesFactura', currentId, formData);
    } else {
      createItem('avancesFactura', formData);
    }
    loadAvances();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('avancesFactura', currentId);
    loadAvances();
    setIsConfirmDialogOpen(false);
  };

  const columns = [
    {
      header: 'Factura',
      accessor: 'factura',
    },
    {
      header: 'Fecha',
      accessor: 'fecha',
      cell: (row) => new Date(row.fecha).toLocaleDateString()
    },
    {
      header: 'Monto',
      accessor: 'monto',
      cell: (row) => `$${Number(row.monto).toLocaleString()}`
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (row) => (
        <Badge variant="outline">{row.estado}</Badge>
      )
    },
    {
      header: 'Descripción',
      accessor: 'descripcion',
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Avances de Factura</h1>
        <p className="text-muted-foreground mt-2">
          Registro de avances asociados a facturas
        </p>
      </motion.div>

      <DataTable
        data={avances}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Avances de Factura"
        description="Lista de avances registrados"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentId ? 'Editar Avance' : 'Nuevo Avance'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Factura"
                name="factura"
                value={formData.factura}
                onChange={handleChange}
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
                label="Monto"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
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
                  { value: 'Cancelado', label: 'Cancelado' },
                ]}
                required
              />
              <div className="md:col-span-2">
                <FormField
                  label="Descripción"
                  name="descripcion"
                  type="textarea"
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {currentId ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar avance?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este avance?"
      />
    </div>
  );
};

export default AvancesFactura;
