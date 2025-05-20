
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/lib/storage';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';

const Empleados = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [empleados, setEmpleados] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentEmpleadoId, setCurrentEmpleadoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    departamento: '',
    cargo: '',
    fechaContratacion: '',
    direccion: '',
    estado: ''
  });

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = () => {
    const data = getItems('empleados');
    setEmpleados(data);
  };

  const handleOpenDialog = (empleado = null) => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || '',
        email: empleado.email || '',
        telefono: empleado.telefono || '',
        departamento: empleado.departamento || '',
        cargo: empleado.cargo || '',
        fechaContratacion: empleado.fechaContratacion || '',
        direccion: empleado.direccion || '',
        estado: empleado.estado || 'Activo'
      });
      setCurrentEmpleadoId(empleado.id);
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        departamento: '',
        cargo: '',
        fechaContratacion: new Date().toISOString().split('T')[0],
        direccion: '',
        estado: 'Activo'
      });
      setCurrentEmpleadoId(null);
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
    
    if (currentEmpleadoId) {
      // Actualizar empleado existente
      updateItem('empleados', currentEmpleadoId, formData);
    } else {
      // Crear nuevo empleado
      createItem('empleados', formData);
    }
    
    loadEmpleados();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentEmpleadoId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('empleados', currentEmpleadoId);
    loadEmpleados();
    setIsConfirmDialogOpen(false);
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactivo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Vacaciones':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Permiso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (row) => `${row.nombre} ${row.apellido || ''}`,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Departamento',
      accessor: 'departamento',
    },
    {
      header: 'Cargo',
      accessor: 'cargo',
    },
    {
      header: 'Fecha Contratación',
      accessor: 'fechaContratacion',
      cell: (row) => row.fechaContratacion ? new Date(row.fechaContratacion).toLocaleDateString() : '',
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (row) => (
        <Badge variant="outline" className={getEstadoBadgeColor(row.estado)}>
          {row.estado || 'Activo'}
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
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Empleados</h1>
        <p className="text-muted-foreground mt-2">
          Administre la información de sus empleados
        </p>
      </motion.div>

      <DataTable
        data={empleados}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Empleados"
        description="Lista de todos los empleados registrados"
      />

      {/* Formulario de Empleado */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentEmpleadoId ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
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
                label="Apellido"
                name="apellido"
                value={formData.apellido}
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
                label="Departamento"
                name="departamento"
                type="select"
                value={formData.departamento}
                onChange={handleChange}
                options={[
                  { value: 'Ventas', label: 'Ventas' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Finanzas', label: 'Finanzas' },
                  { value: 'Recursos Humanos', label: 'Recursos Humanos' },
                  { value: 'Tecnología', label: 'Tecnología' },
                  { value: 'Operaciones', label: 'Operaciones' },
                  { value: 'Administración', label: 'Administración' }
                ]}
                required
              />
              <FormField
                label="Cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Fecha de Contratación"
                name="fechaContratacion"
                type="date"
                value={formData.fechaContratacion}
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
                  { value: 'Activo', label: 'Activo' },
                  { value: 'Inactivo', label: 'Inactivo' },
                  { value: 'Vacaciones', label: 'Vacaciones' },
                  { value: 'Permiso', label: 'Permiso' }
                ]}
                required
              />
              <div className="md:col-span-2">
                <FormField
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {currentEmpleadoId ? 'Actualizar' : 'Crear'}
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
        title="¿Eliminar empleado?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este empleado?"
      />
    </div>
  );
};

export default Empleados;
