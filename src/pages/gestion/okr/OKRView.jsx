import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';
import { cn } from '@/lib/utils';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Filter,
  Calendar,
  UserCheck,
  Settings,
  TreePine
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Importar componentes especializados
import CrearObjetivoDialog from './components/CrearObjetivoDialog';
import EditarObjetivoDialog from './components/EditarObjetivoDialog';
import VerObjetivoDialog from './components/VerObjetivoDialog';
import KeyResultsManager from './components/KeyResultsManager';
import OKRHierarchyView from './components/OKRHierarchyView';

const OKRView = () => {
  const { isDarkMode } = useSettings();
  const { toast } = useToast();

  // Estados principales
  const [objetivos, setObjetivos] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [isCrearObjetivoOpen, setIsCrearObjetivoOpen] = useState(false);
  const [isEditarObjetivoOpen, setIsEditarObjetivoOpen] = useState(false);
  const [isVerObjetivoOpen, setIsVerObjetivoOpen] = useState(false);
  const [isKeyResultsManagerOpen, setIsKeyResultsManagerOpen] = useState(false);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    responsable: '',
    nivel: ''
  });

  // Estado para tabs
  const [activeTab, setActiveTab] = useState('lista');

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [objetivosData, staffData, statsData] = await Promise.all([
        apiCall('/api/okr/objetivos'),
        apiCall('/api/okr/staff'),
        apiCall('/api/okr/dashboard/stats')
      ]);
      
      setObjetivos(objetivosData);
      setStaff(staffData);
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos OKR",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar objetivo
  const eliminarObjetivo = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este objetivo y todos sus Key Results?')) {
      return;
    }

    try {
      await apiCall(`/api/okr/objetivos/${id}`, { method: 'DELETE' });
      toast({
        title: "Éxito",
        description: "Objetivo eliminado correctamente",
      });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el objetivo",
        variant: "destructive",
      });
    }
  };

  // Abrir diálogo de edición
  const abrirEditarObjetivo = (objetivo) => {
    setObjetivoSeleccionado(objetivo);
    setIsEditarObjetivoOpen(true);
  };

  // Abrir diálogo de visualización
  const abrirVerObjetivo = (objetivo) => {
    setObjetivoSeleccionado(objetivo);
    setIsVerObjetivoOpen(true);
  };

  // Abrir gestor de Key Results
  const abrirKeyResultsManager = (objetivo) => {
    setObjetivoSeleccionado(objetivo);
    setIsKeyResultsManagerOpen(true);
  };

  // Filtrar objetivos
  const objetivosFiltrados = objetivos.filter(objetivo => {
    return (
      (!filtros.estado || objetivo.estado === filtros.estado) &&
      (!filtros.responsable || objetivo.id_responsable.toString() === filtros.responsable) &&
      (!filtros.nivel || objetivo.nivel === filtros.nivel)
    );
  });

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Activo':
        return 'bg-blue-100 text-blue-800';
      case 'En Riesgo':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pausado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Objetivos y Resultados Clave (OKR)
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión centralizada de objetivos empresariales y seguimiento de resultados clave
          </p>
        </div>
        <Button 
          onClick={() => setIsCrearObjetivoOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Objetivo
        </Button>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objetivos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_objetivos || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.objetivos_activos || 0} activos, {stats.objetivos_completados || 0} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Results</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_key_results || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.key_results_completados || 0} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.promedio_cumplimiento_general || 0)}%
            </div>
            <Progress 
              value={stats.promedio_cumplimiento_general || 0} 
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_responsables || 0}</div>
            <p className="text-xs text-muted-foreground">
              Personas involucradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navegación por tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vista Lista
          </TabsTrigger>
          <TabsTrigger value="jerarquia" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Vista Jerárquica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-6 mt-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={filtros.estado} onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="En Riesgo">En Riesgo</SelectItem>
                      <SelectItem value="Pausado">Pausado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Responsable</Label>
                  <Select value={filtros.responsable} onValueChange={(value) => setFiltros(prev => ({ ...prev, responsable: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los responsables" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los responsables</SelectItem>
                      {staff.map(person => (
                        <SelectItem key={person.id_staff} value={person.id_staff.toString()}>
                          {person.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nivel</Label>
                  <Select value={filtros.nivel} onValueChange={(value) => setFiltros(prev => ({ ...prev, nivel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los niveles</SelectItem>
                      <SelectItem value="Empresa">Empresa</SelectItem>
                      <SelectItem value="Departamento">Departamento</SelectItem>
                      <SelectItem value="Equipo">Equipo</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Objetivos */}
          <div className="space-y-6">
        {objetivosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay objetivos</h3>
              <p className="text-gray-600 text-center">
                {objetivos.length === 0 
                  ? 'Crea tu primer objetivo OKR para comenzar'
                  : 'No se encontraron objetivos con los filtros seleccionados'
                }
              </p>
              {objetivos.length === 0 && (
                <Button 
                  onClick={() => setIsCrearObjetivoOpen(true)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Objetivo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          objetivosFiltrados.map((objetivo) => (
            <motion.div
              key={objetivo.id_objetivo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{objetivo.titulo}</h3>
                    <Badge className={getEstadoColor(objetivo.estado)}>
                      {objetivo.estado}
                    </Badge>
                    {objetivo.nivel_impacto && (
                      <Badge variant="outline">
                        Impacto: {objetivo.nivel_impacto}/10
                      </Badge>
                    )}
                  </div>
                  {objetivo.descripcion && (
                    <p className="text-gray-600 mb-3">{objetivo.descripcion}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      {objetivo.responsable_nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {objetivo.nivel}
                    </span>
                    {objetivo.fecha_inicio && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(objetivo.fecha_inicio).toLocaleDateString()} - {new Date(objetivo.fecha_fin).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {objetivo.total_key_results} Key Results
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right mr-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(objetivo.promedio_cumplimiento || 0)}%
                    </div>
                    <Progress 
                      value={objetivo.promedio_cumplimiento || 0} 
                      className="w-24"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => abrirVerObjetivo(objetivo)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => abrirKeyResultsManager(objetivo)}
                    title="Gestionar Key Results"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => abrirEditarObjetivo(objetivo)}
                    title="Editar objetivo"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => eliminarObjetivo(objetivo.id_objetivo)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar objetivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
          </div>
        </TabsContent>

        <TabsContent value="jerarquia" className="mt-6">
          <OKRHierarchyView
            onViewObjective={abrirVerObjetivo}
            onEditObjective={abrirEditarObjetivo}
            onDeleteObjective={(objetivo) => eliminarObjetivo(objetivo.id_objetivo)}
            onCreateObjective={() => setIsCrearObjetivoOpen(true)}
            staff={staff}
          />
        </TabsContent>
      </Tabs>

      {/* Diálogos especializados */}
      <CrearObjetivoDialog
        isOpen={isCrearObjetivoOpen}
        onClose={() => setIsCrearObjetivoOpen(false)}
        onObjetivoCreated={cargarDatos}
        staff={staff}
      />

      <EditarObjetivoDialog
        isOpen={isEditarObjetivoOpen}
        onClose={() => {
          setIsEditarObjetivoOpen(false);
          setObjetivoSeleccionado(null);
        }}
        onObjetivoUpdated={cargarDatos}
        objetivo={objetivoSeleccionado}
        staff={staff}
      />

      <VerObjetivoDialog
        isOpen={isVerObjetivoOpen}
        onClose={() => {
          setIsVerObjetivoOpen(false);
          setObjetivoSeleccionado(null);
        }}
        objetivoId={objetivoSeleccionado?.id_objetivo}
        onObjetivoUpdated={cargarDatos}
        staff={staff}
      />

      <KeyResultsManager
        isOpen={isKeyResultsManagerOpen}
        onClose={() => {
          setIsKeyResultsManagerOpen(false);
          setObjetivoSeleccionado(null);
        }}
        objetivoId={objetivoSeleccionado?.id_objetivo}
        onKeyResultsUpdated={cargarDatos}
        staff={staff}
      />
    </div>
  );
};

export default OKRView; 