
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/lib/storage';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';

const Clientes = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [clientes, setClientes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentClienteId, setCurrentClienteId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo: '',
    notas: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = () => {
    const data = getItems('clientes');
    setClientes(data);
  };

  const handleOpenDialog = (cliente = null) => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        tipo: cliente.tipo || '',
        notas: cliente.notas || ''
      });
      setCurrentClienteId(cliente.id);
    } else {
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        tipo: '',
        notas: ''
      });
      setCurrentClienteId(null);
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
    
    if (currentClienteId) {
      // Actualizar cliente existente
      updateItem('clientes', currentClienteId, formData);
    } else {
      // Crear nuevo cliente
      createItem('clientes', formData);
    }
    
    loadClientes();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentClienteId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('clientes', currentClienteId);
    loadClientes();
    setIsConfirmDialogOpen(false);
  };

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Teléfono',
      accessor: 'telefono',
    },
    {
      header: 'Tipo',
      accessor: 'tipo',
      cell: (row) => (
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {row.tipo}
        </Badge>
      ),
    },
    {
      header: 'Dirección',
      accessor: 'direccion',
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
        <p className="text-muted-foreground mt-2">
          Administre la información de sus clientes
        </p>
      </motion.div>

      <DataTable
        data={clientes}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Clientes"
        description="Lista de todos los clientes registrados"
      />

      {/* Formulario de Cliente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentClienteId ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FormField
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
              <FormField
                label="Tipo de Cliente"
                name="tipo"
                type="select"
                value={formData.tipo}
                onChange={handleChange}
                options={[
                  { value: 'Corporativo', label: 'Corporativo' },
                  { value: 'Distribuidor', label: 'Distribuidor' },
                  { value: 'Minorista', label: 'Minorista' },
                  { value: 'Otro', label: 'Otro' }
                ]}
                required
              />
              <FormField
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <FormField
                label="Notas"
                name="notas"
                type="textarea"
                value={formData.notas}
                onChange={handleChange}
                className="md:col-span-2"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {currentClienteId ? 'Actualizar' : 'Crear'}
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
        title="¿Eliminar cliente?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este cliente?"
      />
    </div>
  );
};

export default Clientes;
