import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import DataTable from '@/components/DataTable';
import { apiCall } from '@/config/api';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Building2,
  Globe,
  MapPin,
  Users,
  Filter,
  RefreshCw,
  Download,
  ExternalLink,
  Linkedin
} from 'lucide-react';

// Importar diálogos
import CrearEmpresaDialog from './empresas/CrearEmpresaDialog';
import EditarEmpresaDialog from './empresas/EditarEmpresaDialog';
import VerEmpresaDialog from './empresas/VerEmpresaDialog';

const Empresas = () => {
  // Estados principales
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [showCrearDialog, setShowCrearDialog] = useState(false);
  const [showEditarDialog, setShowEditarDialog] = useState(false);
  const [showVerDialog, setShowVerDialog] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  
  // Estados para confirmación de eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState(null);
  
  const { toast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/crm/empresas');
      setEmpresas(data);
      console.log('Empresas cargadas:', data);
    } catch (error) {
      console.error('Error cargando empresas:', error);
      toast({
        title: "Error",
        description: "Error al cargar las empresas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const handleCrearEmpresa = (nuevaEmpresa) => {
    setEmpresas(prev => [...prev, nuevaEmpresa]);
    toast({
      title: "¡Éxito!",
      description: "Empresa creada correctamente",
      variant: "success"
    });
  };

  const handleEditarEmpresa = (empresaActualizada) => {
    setEmpresas(prev => prev.map(emp => 
      emp.id_empresa === empresaActualizada.id_empresa ? empresaActualizada : emp
    ));
    toast({
      title: "¡Éxito!",
      description: "Empresa actualizada correctamente",
      variant: "success"
    });
  };

  const handleEliminarEmpresa = async () => {
    if (!empresaToDelete) return;
    
    try {
      await apiCall(`/api/crm/empresas/${empresaToDelete.id_empresa}`, {
        method: 'DELETE'
      });
      
      setEmpresas(prev => prev.filter(emp => emp.id_empresa !== empresaToDelete.id_empresa));
      
      toast({
        title: "¡Éxito!",
        description: "Empresa eliminada correctamente",
        variant: "success"
      });
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la empresa",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setEmpresaToDelete(null);
    }
  };

  // Funciones para abrir diálogos
  const abrirDialogoVer = (empresa) => {
    setSelectedEmpresa(empresa);
    setShowVerDialog(true);
  };

  const abrirDialogoEditar = (empresa) => {
    setSelectedEmpresa(empresa);
    setShowEditarDialog(true);
  };

  const abrirDialogoEliminar = (empresa) => {
    setEmpresaToDelete(empresa);
    setShowDeleteDialog(true);
  };

  // Configuración de columnas compatibles con DataTable
  const columnsForDataTable = [
    {
      accessor: 'id_empresa',
      header: 'ID',
      cell: (empresa) => (
        <Badge variant="outline" className="font-mono">
          {empresa.id_empresa}
        </Badge>
      )
    },
    {
      accessor: 'empresa',
      header: 'Empresa',
      cell: (empresa) => (
        <div className="font-medium">
          {empresa.empresa}
        </div>
      )
    },
    {
      accessor: 'mercado',
      header: 'Mercado',
      cell: (empresa) => empresa.mercado ? (
        <div>
          <p className="font-medium text-sm">{empresa.mercado.segmento_mercado}</p>
          <p className="text-xs text-muted-foreground truncate">
            {empresa.mercado.resumen_mercado || 'Sin descripción'}
          </p>
        </div>
      ) : (
        <Badge variant="outline" className="text-xs">
          Sin mercado
        </Badge>
      )
    },
    {
      accessor: 'pais',
      header: 'País',
      cell: (empresa) => empresa.pais ? (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {empresa.pais.codigo_iso}
          </Badge>
          <span className="text-sm">{empresa.pais.pais}</span>
        </div>
      ) : (
        <Badge variant="outline" className="text-xs">
          Sin país
        </Badge>
      )
    },
    {
      accessor: 'tamano_empleados',
      header: 'Tamaño',
      cell: (empresa) => empresa.tamano_empleados ? (
        <Badge variant="secondary" className="text-xs">
          <Users className="h-3 w-3 mr-1" />
          {empresa.tamano_empleados}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs">
          Sin definir
        </Badge>
      )
    },
    {
      accessor: 'enlaces',
      header: 'Enlaces',
      cell: (empresa) => (
        <div className="flex items-center gap-1">
          {empresa.website && (
            <Badge variant="secondary" className="text-xs">
              <Globe className="h-3 w-3" />
            </Badge>
          )}
          {empresa.linkedin && (
            <Badge variant="secondary" className="text-xs">
              <Linkedin className="h-3 w-3" />
            </Badge>
          )}
          {!empresa.website && !empresa.linkedin && (
            <Badge variant="outline" className="text-xs">
              Sin enlaces
            </Badge>
          )}
        </div>
      )
    },
    {
      accessor: 'completitud',
      header: 'Completitud',
      cell: (empresa) => {
        // Calcular completitud basado en campos completados
        const campos = [
          empresa.empresa,
          empresa.id_mercado,
          empresa.id_pais,
          empresa.tamano_empleados,
          empresa.website,
          empresa.linkedin
        ];
        
        const completados = campos.filter(campo => campo && campo.toString().trim().length > 0).length;
        const porcentaje = Math.round((completados / campos.length) * 100);
        
        let variant = "outline";
        if (porcentaje >= 80) variant = "default";
        else if (porcentaje >= 50) variant = "secondary";
        
        return (
          <Badge variant={variant} className="text-xs">
            {porcentaje}%
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Empresas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestione las empresas clientes y prospectos del CRM
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={cargarEmpresas}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setShowCrearDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        </div>
      </div>



      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{empresas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con Mercado</p>
                <p className="text-2xl font-bold">
                  {empresas.filter(emp => emp.mercado).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con País</p>
                <p className="text-2xl font-bold">
                  {empresas.filter(emp => emp.pais).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ExternalLink className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con Enlaces</p>
                <p className="text-2xl font-bold">
                  {empresas.filter(emp => emp.website || emp.linkedin).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresas ({empresas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={empresas}
            columns={columnsForDataTable}
            onEdit={abrirDialogoEditar}
            onView={abrirDialogoVer}
            onDelete={abrirDialogoEliminar}
            emptyMessage="No hay empresas registradas"
            searchable={true}
          />
        </CardContent>
      </Card>

      {/* Diálogos */}
      <CrearEmpresaDialog
        open={showCrearDialog}
        onClose={() => setShowCrearDialog(false)}
        onEmpresaCreada={handleCrearEmpresa}
      />

      <EditarEmpresaDialog
        open={showEditarDialog}
        onClose={() => setShowEditarDialog(false)}
        empresa={selectedEmpresa}
        onEmpresaActualizada={handleEditarEmpresa}
      />

      <VerEmpresaDialog
        open={showVerDialog}
        onClose={() => setShowVerDialog(false)}
        empresa={selectedEmpresa}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setEmpresaToDelete(null);
        }}
        onConfirm={handleEliminarEmpresa}
        title="Eliminar Empresa"
        description={
          empresaToDelete
            ? `¿Está seguro de que desea eliminar la empresa "${empresaToDelete.empresa}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default Empresas; 