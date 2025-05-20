
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/lib/storage';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';

const Vacaciones = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [vacaciones, setVacaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentVacacionId, setCurrentVacacionId] = useState(null);
  const [formData, setFormData] = useState({
    empleadoId: '',
    fechaInicio: '',
    fechaFin: '',
    tipo: '',
    estado: '',
    comentarios: ''
  });

  useEffect(() => {
    // Inicializar datos de ejemplo si no existen
    if (!localStorage.getItem('vacaciones')) {
      const vacacionesEjemplo = [
        {
          id: '1',
          empleadoId: '1',
          empleadoNombre: 'Juan Pérez',
          fechaInicio: '2023-06-01',
          fechaFin: '2023-06-15',
          tipo: 'Vacaciones',
          estado: 'Aprobada',
          comentarios: 'Vacaciones de verano',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          empleadoId: '2',
          empleadoNombre: 'María López',
          fechaInicio: '2023-05-20',
          fechaFin: '2023-05-22',
          tipo: 'Permiso',
          estado: 'Pendiente',
          comentarios: 'Asuntos personales',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('vacaciones', JSON.stringify(vacacionesEjemplo));
    }
    
    loadVacaciones();
    loadEmpleados();
  }, []);

  const loadVacaciones = () => {
    const data = getItems('vacaciones');
    setVacaciones(data);
  };

  const loadEmpleados = () => {
    const data = getItems('empleados');
    setEmpleados(data);
  };

  const handleOpenDialog = (vacacion = null) => {
    if (vacacion) {
      setFormData({
        empleadoId: vacacion.empleadoId || '',
        fechaInicio: vacacion.fechaInicio || '',
        fechaFin: vacacion.fechaFin || '',
        tipo: vacacion.tipo || '',
        estado: vacacion.estado || '',
        comentarios: vacacion.comentarios || ''
      });
      setCurrentVacacionId(vacacion.id);
    } else {
      setFormData({
        empleadoId: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        tipo: '',
        estado: 'Pendiente',
        comentarios: ''
      });
      setCurrentVacacionId(null);
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
    
    // Obtener el nombre del empleado
    const empleado = empleados.find(e => e.id === formData.empleadoId);
    const empleadoNombre = empleado ? `${empleado.nombre} ${empleado.apellido || ''}` : '';
    
    const vacacionData = {
      ...formData,
      empleadoNombre
    };
    
    if (currentVacacionId) {
      // Actualizar vacación existente
      updateItem('vacaciones', currentVacacionId, vacacionData);
    } else {
      // Crear nueva vacación
      createItem('vacaciones', vacacionData);
    }
    
    loadVacaciones();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentVacacionId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('vacaciones', currentVacacionId);
    loadVacaciones();
    setIsConfirmDialogOpen(false);
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'Aprobada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns = [
    {
      header: 'Empleado',
      accessor: 'empleadoNombre',
    },
    {
      header: 'Tipo',
      accessor: 'tipo',
    },
    {
      header: 'Fecha Inicio',
      accessor: 'fechaInicio',
      cell: (row) => new Date(row.fechaInicio).toLocaleDateString(),
    },
    {
      header: 'Fecha Fin',
      accessor: 'fechaFin',
      cell: (row) => new Date(row.fechaFin).toLocaleDateString(),
    },
    {
      header: 'Duración',
      accessor: 'duracion',
      cell: (row) => {
        const inicio = new Date(row.fechaInicio);
        const fin = new Date(row.fechaFin);
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} días`;
      },
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
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Vacaciones</h1>
        <p className="text-muted-foreground mt-2">
          Administre las solicitudes de vacaciones y permisos
        </p>
      </motion.div>

      <DataTable
        data={vacaciones}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Vacaciones y Permisos"
        description="Lista de todas las solicitudes registradas"
      />

      {/* Formulario de Vacaciones */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentVacacionId ? 'Editar Solicitud' : 'Nueva Solicitud'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Empleado"
                name="empleadoId"
                type="select"
                value={formData.empleadoId}
                onChange={handleChange}
                options={empleados.map(empleado => ({
                  value: empleado.id,
                  label: `${empleado.nombre} ${empleado.apellido || ''}`
                }))}
                required
              />
              <FormField
                label="Tipo"
                name="tipo"
                type="select"
                value={formData.tipo}
                onChange={handleChange}
                options={[
                  { value: 'Vacaciones', label: 'Vacaciones' },
                  { value: 'Permiso', label: 'Permiso' },
                  { value: 'Enfermedad', label: 'Enfermedad' },
                  { value: 'Otro', label: 'Otro' }
                ]}
                required
              />
              <FormField
                label="Fecha de Inicio"
                name="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={handleChange}
                required
              />
              <FormField
                label="Fecha de Fin"
                name="fechaFin"
                type="date"
                value={formData.fechaFin}
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
                  { value: 'Aprobada', label: 'Aprobada' },
                  { value: 'Rechazada', label: 'Rechazada' },
                  { value: 'Cancelada', label: 'Cancelada' }
                ]}
                required
              />
              <div className="md:col-span-2">
                <FormField
                  label="Comentarios"
                  name="comentarios"
                  type="textarea"
                  value={formData.comentarios}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {currentVacacionId ? 'Actualizar' : 'Crear'}
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
        title="¿Eliminar solicitud?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar esta solicitud?"
      />
    </div>
  );
};

export default Vacaciones;
