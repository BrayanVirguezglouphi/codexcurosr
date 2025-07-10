import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import DataTable from '@/components/DataTable';
import { apiCall } from '@/config/api';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Globe,
  Building,
  RefreshCw,
  MapPin,
  Factory
} from 'lucide-react';

// Importar diálogos
import CrearMercadoDialog from './mercados/CrearMercadoDialog';
import EditarMercadoDialog from './mercados/EditarMercadoDialog';
import VerMercadoDialog from './mercados/VerMercadoDialog';

const Mercado = () => {
  // Estados principales
  const [mercados, setMercados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [showCrearDialog, setShowCrearDialog] = useState(false);
  const [showEditarDialog, setShowEditarDialog] = useState(false);
  const [showVerDialog, setShowVerDialog] = useState(false);
  const [selectedMercado, setSelectedMercado] = useState(null);
  
  // Estados para confirmación de eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mercadoToDelete, setMercadoToDelete] = useState(null);
  
  // Estados para catálogos (para filtros)
  const [paises, setPaises] = useState([]);
  const [industrias, setIndustrias] = useState([]);
  
  const { toast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    cargarMercados();
    cargarCatalogos();
  }, []);

  const cargarMercados = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/crm/mercados');
      setMercados(data);
      console.log('Mercados cargados:', data);
    } catch (error) {
      console.error('Error cargando mercados:', error);
      toast({
        title: "Error",
        description: "Error al cargar los mercados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [paisesData, industriasData] = await Promise.all([
        apiCall('/api/catalogos/paises'),
        apiCall('/api/catalogos/industrias')
      ]);
      setPaises(paisesData || []);
      setIndustrias(industriasData || []);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const handleCrearMercado = (nuevoMercado) => {
    setMercados(prev => [...prev, nuevoMercado]);
    toast({
      title: "¡Éxito!",
      description: "Mercado creado correctamente",
      variant: "success"
    });
  };

  const handleEditarMercado = (mercadoActualizado) => {
    setMercados(prev => prev.map(m => 
      m.id_mercado === mercadoActualizado.id_mercado ? mercadoActualizado : m
    ));
    toast({
      title: "¡Éxito!",
      description: "Mercado actualizado correctamente",
      variant: "success"
    });
  };

  const handleEliminarMercado = async () => {
    if (!mercadoToDelete) return;
    
    try {
      await apiCall(`/api/crm/mercados/${mercadoToDelete.id_mercado}`, {
        method: 'DELETE'
      });
      
      setMercados(prev => prev.filter(m => m.id_mercado !== mercadoToDelete.id_mercado));
      
      toast({
        title: "¡Éxito!",
        description: "Mercado eliminado correctamente",
        variant: "success"
      });
    } catch (error) {
      console.error('Error eliminando mercado:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el mercado",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setMercadoToDelete(null);
    }
  };

  // Funciones para abrir diálogos
  const abrirDialogoVer = (mercado) => {
    setSelectedMercado(mercado);
    setShowVerDialog(true);
  };

  const abrirDialogoEditar = (mercado) => {
    setSelectedMercado(mercado);
    setShowEditarDialog(true);
  };

  const abrirDialogoEliminar = (mercado) => {
    setMercadoToDelete(mercado);
    setShowDeleteDialog(true);
  };

  // Obtener nombres de catálogos
  const getNombrePais = (idPais) => {
    if (!idPais) return '';
    const pais = paises.find(p => p.id_pais === idPais);
    return pais ? pais.nombre_pais : `ID: ${idPais}`;
  };

  const getNombreIndustria = (idIndustria) => {
    if (!idIndustria) return '';
    const industria = industrias.find(i => i.id_industria === idIndustria);
    return industria ? industria.nombre_industria : `ID: ${idIndustria}`;
  };

  // Configuración de columnas compatibles con DataTable
  const columnsForDataTable = [
    {
      accessor: 'id_mercado',
      header: 'ID',
      cell: (mercado) => (
        <Badge variant="outline" className="font-mono">
          {mercado.id_mercado}
        </Badge>
      )
    },
    {
      accessor: 'segmento_mercado',
      header: 'Segmento de Mercado',
      cell: (mercado) => (
        <div className="font-medium">
          {mercado.segmento_mercado}
        </div>
      )
    },
    {
      accessor: 'id_pais',
      header: 'País',
      cell: (mercado) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{getNombrePais(mercado.id_pais) || 'No especificado'}</span>
        </div>
      )
    },
    {
      accessor: 'id_industria',
      header: 'Industria',
      cell: (mercado) => (
        <div className="flex items-center gap-1">
          <Factory className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{getNombreIndustria(mercado.id_industria) || 'No especificado'}</span>
        </div>
      )
    },
    {
      accessor: 'resumen_mercado',
      header: 'Resumen',
      cell: (mercado) => (
        <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={mercado.resumen_mercado}>
          {mercado.resumen_mercado || 'Sin resumen'}
        </div>
      )
    },
    {
      accessor: 'url_reporte_mercado',
      header: 'Reporte',
      cell: (mercado) => mercado.url_reporte_mercado ? (
        <Badge variant="secondary" className="text-xs">
          Disponible
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs">
          Sin reporte
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Gestión de Mercados
          </h1>
          <p className="text-muted-foreground mt-1">
            Administre los mercados objetivo y segmentos de su CRM
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={cargarMercados}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setShowCrearDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Mercado
          </Button>
        </div>
      </div>



      {/* Tabla de mercados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Mercados ({mercados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando mercados...</div>
            </div>
          ) : (
            <DataTable
              data={mercados.map(mercado => ({...mercado, id: mercado.id_mercado}))}
              columns={columnsForDataTable}
              onEdit={abrirDialogoEditar}
              onDelete={(id) => {
                const mercado = mercados.find(m => m.id_mercado === id);
                if (mercado) abrirDialogoEliminar(mercado);
              }}
              onAdd={() => setShowCrearDialog(true)}
              title=""
              description=""
            />
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <CrearMercadoDialog
        open={showCrearDialog}
        onClose={() => setShowCrearDialog(false)}
        onMercadoCreado={handleCrearMercado}
      />

      <EditarMercadoDialog
        open={showEditarDialog}
        onClose={() => setShowEditarDialog(false)}
        mercado={selectedMercado}
        onMercadoActualizado={handleEditarMercado}
      />

      <VerMercadoDialog
        open={showVerDialog}
        onClose={() => setShowVerDialog(false)}
        mercado={selectedMercado}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setMercadoToDelete(null);
        }}
        onConfirm={handleEliminarMercado}
        title="Eliminar Mercado"
        description={
          mercadoToDelete
            ? `¿Está seguro de que desea eliminar el mercado "${mercadoToDelete.segmento_mercado}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default Mercado; 