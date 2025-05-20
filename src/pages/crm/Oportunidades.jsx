
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/lib/storage';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';

const Oportunidades = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [oportunidades, setOportunidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentOportunidadId, setCurrentOportunidadId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    clienteId: '',
    valor: '',
    estado: '',
    fechaEstimada: '',
    descripcion: ''
  });

  useEffect(() => {
    // Inicializar datos de ejemplo si no existen
    if (!localStorage.getItem('oportunidades')) {
      const oportunidadesEjemplo = [
        {
          id: '1',
          titulo: 'Proyecto de implementación ERP',
          clienteId: '1',
          clienteNombre: 'Empresa ABC',
          valor: 15000,
          estado: 'En proceso',
          fechaEstimada: '2023-12-15',
          descripcion: 'Implementación de sistema ERP completo',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          titulo: 'Actualización de infraestructura',
          clienteId: '2',
          clienteNombre: 'Distribuidora XYZ',
          valor: 8500,
          estado: 'Propuesta',
          fechaEstimada: '2023-11-30',
          descripcion: 'Actualización de servidores y red',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('oportunidades', JSON.stringify(oportunidadesEjemplo));
    }
    
    loadOportunidades();
    loadClientes();
  }, []);

  const loadOportunidades = () => {
    const data = getItems('oportunidades');
    setOportunidades(data);
  };

  const loadClientes = () => {
    const data = getItems('clientes');
    setClientes(data);
  };

  const handleOpenDialog = (oportunidad = null) => {
    if (oportunidad) {
      setFormData({
        titulo: oportunidad.titulo || '',
        clienteId: oportunidad.clienteId || '',
        valor: oportunidad.valor || '',
        estado: oportunidad.estado || '',
        fechaEstimada: oportunidad.fechaEstimada || '',
        descripcion: oportunidad.descripcion || ''
      });
      setCurrentOportunidadId(oportunidad.id);
    } else {
      setFormData({
        titulo: '',
        clienteId: '',
        valor: '',
        estado: '',
        fechaEstimada: '',
        descripcion: ''
      });
      setCurrentOportunidadId(null);
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
    
    // Obtener el nombre del cliente
    const cliente = clientes.find(c => c.id === formData.clienteId);
    const clienteNombre = cliente ? cliente.nombre : '';
    
    const oportunidadData = {
      ...formData,
      clienteNombre
    };
    
    if (currentOportunidadId) {
      // Actualizar oportunidad existente
      updateItem('oportunidades', currentOportunidadId, oportunidadData);
    } else {
      // Crear nueva oportunidad
      createItem('oportunidades', oportunidadData);
    }
    
    loadOportunidades();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentOportunidadId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('oportunidades', currentOportunidadId);
    loadOportunidades();
    setIsConfirmDialogOpen(false);
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'Propuesta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En proceso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Ganada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Perdida':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns = [
    {
      header: 'Título',
      accessor: 'titulo',
    },
    {
      header: 'Cliente',
      accessor: 'clienteNombre',
    },
    {
      header: 'Valor',
      accessor: 'valor',
      cell: (row) => `$${Number(row.valor).toLocaleString()}`,
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (row) => (
        <Badge variant="outline" className={getEstadoBadgeColor(row.estado)}>
          {row.estado}
        </Badge>
      ),
    },
    {
      header: 'Fecha Estimada',
      accessor: 'fechaEstimada',
      cell: (row) => new Date(row.fechaEstimada).toLocaleDateString(),
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Oportunidades</h1>
        <p className="text-muted-foreground mt-2">
          Administre sus oportunidades de venta
        </p>
      </motion.div>

      <DataTable
        data={oportunidades}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Oportunidades"
        description="Lista de todas las oportunidades de venta"
      />

      {/* Formulario de Oportunidad */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentOportunidadId ? 'Editar Oportunidad' : 'Nueva Oportunidad'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Título"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Cliente"
                name="clienteId"
                type="select"
                value={formData.clienteId}
                onChange={handleChange}
                options={clientes.map(cliente => ({
                  value: cliente.id,
                  label: cliente.nombre
                }))}
                required
              />
              <FormField
                label="Valor ($)"
                name="valor"
                type="number"
                value={formData.valor}
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
                  { value: 'Propuesta', label: 'Propuesta' },
                  { value: 'En proceso', label: 'En proceso' },
                  { value: 'Ganada', label: 'Ganada' },
                  { value: 'Perdida', label: 'Perdida' }
                ]}
                required
              />
              <FormField
                label="Fecha Estimada"
                name="fechaEstimada"
                type="date"
                value={formData.fechaEstimada}
                onChange={handleChange}
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
                {currentOportunidadId ? 'Actualizar' : 'Crear'}
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
        title="¿Eliminar oportunidad?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar esta oportunidad?"
      />
    </div>
  );
};

export default Oportunidades;
