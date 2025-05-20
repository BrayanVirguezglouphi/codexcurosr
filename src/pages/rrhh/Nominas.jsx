import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/lib/storage';
import DataTable from '@/components/DataTable';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';
import { 
  Search, 
  Filter,
  Download,
  Calendar,
  Users,
  Building,
  DollarSign
} from 'lucide-react';

const Nominas = () => {
  const { getItems, createItem, updateItem, deleteItem } = useStorage();
  const [nominas, setNominas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentNominaId, setCurrentNominaId] = useState(null);
  const [formData, setFormData] = useState({
    empleadoId: '',
    periodo: '',
    fechaPago: '',
    salarioBase: '',
    bonificaciones: '',
    deducciones: '',
    total: '',
    estado: '',
    comentarios: ''
  });
  const [filtros, setFiltros] = useState({
    busqueda: '',
    departamento: 'Todos',
    estado: 'Todos',
    tipoContrato: 'Todos',
    metodoPago: 'Todos',
    rangoSalarial: {
      min: '',
      max: ''
    },
    fechaInicio: '',
    fechaFin: '',
    periodo: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    // Inicializar datos de ejemplo si no existen
    if (!localStorage.getItem('nominas')) {
      const nominasEjemplo = [
        {
          id: '1',
          empleadoId: '1',
          empleadoNombre: 'Juan Pérez',
          periodo: 'Mayo 2023',
          fechaPago: '2023-05-30',
          salarioBase: 2500.00,
          bonificaciones: 300.00,
          deducciones: 450.00,
          total: 2350.00,
          estado: 'Pagada',
          comentarios: 'Nómina regular',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          empleadoId: '2',
          empleadoNombre: 'María López',
          periodo: 'Mayo 2023',
          fechaPago: '2023-05-30',
          salarioBase: 2200.00,
          bonificaciones: 200.00,
          deducciones: 400.00,
          total: 2000.00,
          estado: 'Pendiente',
          comentarios: 'Pendiente de revisión',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('nominas', JSON.stringify(nominasEjemplo));
    }
    
    loadNominas();
    loadEmpleados();
  }, []);

  const loadNominas = () => {
    const data = getItems('nominas');
    setNominas(data);
  };

  const loadEmpleados = () => {
    const data = getItems('empleados');
    setEmpleados(data);
  };

  const handleOpenDialog = (nomina = null) => {
    if (nomina) {
      setFormData({
        empleadoId: nomina.empleadoId || '',
        periodo: nomina.periodo || '',
        fechaPago: nomina.fechaPago || '',
        salarioBase: nomina.salarioBase || '',
        bonificaciones: nomina.bonificaciones || '',
        deducciones: nomina.deducciones || '',
        total: nomina.total || '',
        estado: nomina.estado || '',
        comentarios: nomina.comentarios || ''
      });
      setCurrentNominaId(nomina.id);
    } else {
      // Obtener el mes y año actual para el periodo
      const fecha = new Date();
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const periodoActual = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      
      setFormData({
        empleadoId: '',
        periodo: periodoActual,
        fechaPago: new Date().toISOString().split('T')[0],
        salarioBase: '',
        bonificaciones: '0',
        deducciones: '0',
        total: '',
        estado: 'Pendiente',
        comentarios: ''
      });
      setCurrentNominaId(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar el valor en el formulario
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      
      // Si se cambia alguno de los valores que afectan al total, recalcular
      if (['salarioBase', 'bonificaciones', 'deducciones'].includes(name)) {
        const salarioBase = parseFloat(newFormData.salarioBase) || 0;
        const bonificaciones = parseFloat(newFormData.bonificaciones) || 0;
        const deducciones = parseFloat(newFormData.deducciones) || 0;
        
        newFormData.total = (salarioBase + bonificaciones - deducciones).toFixed(2);
      }
      
      return newFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Obtener el nombre del empleado
    const empleado = empleados.find(e => e.id === formData.empleadoId);
    const empleadoNombre = empleado ? `${empleado.nombre} ${empleado.apellido || ''}` : '';
    
    const nominaData = {
      ...formData,
      empleadoNombre
    };
    
    if (currentNominaId) {
      // Actualizar nómina existente
      updateItem('nominas', currentNominaId, nominaData);
    } else {
      // Crear nueva nómina
      createItem('nominas', nominaData);
    }
    
    loadNominas();
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCurrentNominaId(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteItem('nominas', currentNominaId);
    loadNominas();
    setIsConfirmDialogOpen(false);
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'Pagada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
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
      header: 'Periodo',
      accessor: 'periodo',
    },
    {
      header: 'Fecha Pago',
      accessor: 'fechaPago',
      cell: (row) => new Date(row.fechaPago).toLocaleDateString(),
    },
    {
      header: 'Salario Base',
      accessor: 'salarioBase',
      cell: (row) => `$${Number(row.salarioBase).toLocaleString()}`,
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (row) => `$${Number(row.total).toLocaleString()}`,
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

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = () => {
    let nominasFiltradas = [...nominas];

    // Filtro de búsqueda general
    if (filtros.busqueda) {
      nominasFiltradas = nominasFiltradas.filter(nomina =>
        nomina.empleadoNombre.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }

    // Filtro por periodo
    if (filtros.periodo) {
      nominasFiltradas = nominasFiltradas.filter(nomina =>
        nomina.periodo === filtros.periodo
      );
    }

    // Filtro por estado
    if (filtros.estado !== 'Todos') {
      nominasFiltradas = nominasFiltradas.filter(nomina =>
        nomina.estado === filtros.estado
      );
    }

    // Filtro por rango salarial
    if (filtros.rangoSalarial.min) {
      nominasFiltradas = nominasFiltradas.filter(nomina =>
        nomina.salarioBase >= parseFloat(filtros.rangoSalarial.min)
      );
    }
    if (filtros.rangoSalarial.max) {
      nominasFiltradas = nominasFiltradas.filter(nomina =>
        nomina.salarioBase <= parseFloat(filtros.rangoSalarial.max)
      );
    }

    // Filtro por fecha de pago
    if (filtros.fechaInicio) {
      nominasFiltradas = nominasFiltradas.filter(nomina =>
        nomina.fechaPago >= filtros.fechaInicio
      );
    }
    if (filtros.fechaFin) {
      nominasFiltradas = nominasFiltradas.filter(nomina =>
        nomina.fechaPago <= filtros.fechaFin
      );
    }

    setNominas(nominasFiltradas);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      departamento: 'Todos',
      estado: 'Todos',
      tipoContrato: 'Todos',
      metodoPago: 'Todos',
      rangoSalarial: {
        min: '',
        max: ''
      },
      fechaInicio: '',
      fechaFin: '',
      periodo: ''
    });
    loadNominas();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Nóminas</h1>
        <p className="text-muted-foreground mt-2">
          Administre las nóminas de sus empleados
        </p>
      </motion.div>

      <DataTable
        data={nominas}
        columns={columns}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        onAdd={() => handleOpenDialog()}
        title="Nóminas"
        description="Lista de todas las nóminas registradas"
      />

      {/* Formulario de Nómina */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentNominaId ? 'Editar Nómina' : 'Nueva Nómina'}</DialogTitle>
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
                label="Periodo"
                name="periodo"
                value={formData.periodo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Fecha de Pago"
                name="fechaPago"
                type="date"
                value={formData.fechaPago}
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
                  { value: 'Pagada', label: 'Pagada' },
                  { value: 'Cancelada', label: 'Cancelada' }
                ]}
                required
              />
              <FormField
                label="Salario Base ($)"
                name="salarioBase"
                type="number"
                value={formData.salarioBase}
                onChange={handleChange}
                required
              />
              <FormField
                label="Bonificaciones ($)"
                name="bonificaciones"
                type="number"
                value={formData.bonificaciones}
                onChange={handleChange}
                required
              />
              <FormField
                label="Deducciones ($)"
                name="deducciones"
                type="number"
                value={formData.deducciones}
                onChange={handleChange}
                required
              />
              <FormField
                label="Total ($)"
                name="total"
                type="number"
                value={formData.total}
                onChange={handleChange}
                required
                disabled
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
                {currentNominaId ? 'Actualizar' : 'Crear'}
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
        title="¿Eliminar nómina?"
        description="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar esta nómina?"
      />

      {/* Encabezado y controles principales */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nóminas</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por empleado, departamento..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
          value={filtros.busqueda}
          onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
        />
      </div>

      {/* Panel de filtros avanzados */}
      {mostrarFiltros && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Filtros de la primera columna */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periodo
                </label>
                <input
                  type="month"
                  className="w-full p-2 border rounded-lg"
                  value={filtros.periodo}
                  onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  {['Todos', 'Pagada', 'Pendiente', 'Cancelada'].map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contrato
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={filtros.tipoContrato}
                  onChange={(e) => handleFiltroChange('tipoContrato', e.target.value)}
                >
                  {['Todos', 'Tiempo Completo', 'Medio Tiempo', 'Temporal', 'Por Proyecto'].map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros de la segunda columna */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango Salarial
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    className="w-1/2 p-2 border rounded-lg"
                    value={filtros.rangoSalarial.min}
                    onChange={(e) => handleFiltroChange('rangoSalarial', {
                      ...filtros.rangoSalarial,
                      min: e.target.value
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    className="w-1/2 p-2 border rounded-lg"
                    value={filtros.rangoSalarial.max}
                    onChange={(e) => handleFiltroChange('rangoSalarial', {
                      ...filtros.rangoSalarial,
                      max: e.target.value
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de Fechas de Pago
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={filtros.fechaInicio}
                    onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={filtros.fechaFin}
                    onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={aplicarFiltros}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={limpiarFiltros}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nominas;
