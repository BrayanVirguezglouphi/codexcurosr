import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/config/api';
import DataTable from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import CrearContactoDialog from './contactos/CrearContactoDialog';
import EditarContactoDialog from './contactos/EditarContactoDialog';
import VerContactoDialog from './contactos/VerContactoDialog';
import ExcelImportExport from '@/components/ui/excel-import-export';
import { Select } from '@/components/ui/select';
import { 
  Users,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  UserCheck,
  TrendingUp,
  Activity,
  Target,
  Briefcase
} from 'lucide-react';

const Contactos = () => {
  // Estados principales
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los diálogos
  const [showCrearDialog, setShowCrearDialog] = useState(false);
  const [showEditarDialog, setShowEditarDialog] = useState(false);
  const [showVerDialog, setShowVerDialog] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState(null);
  
  // Estados para eliminación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [contactoToDelete, setContactoToDelete] = useState(null);
  
  // Estados para filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroPais, setFiltroPais] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [paises, setPaises] = useState([]);

  const { toast } = useToast();

  // Cargar contactos al montar el componente
  useEffect(() => {
    cargarContactos();
    apiCall('/api/crm/empresas').then(data => setEmpresas(data || []));
    apiCall('/api/catalogos/paises').then(data => setPaises(data || []));
  }, []);

  const cargarContactos = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/crm/contactos');
      setContactos(data || []);
      console.log('Contactos cargados:', data);
    } catch (error) {
      console.error('Error cargando contactos:', error);
      toast({
        title: "Error",
        description: "Error al cargar los contactos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener color del rol
  const getColorRol = (rol) => {
    const colores = {
      'Decisor': 'bg-red-100 text-red-800',
      'Influenciador': 'bg-yellow-100 text-yellow-800',
      'Usuario': 'bg-blue-100 text-blue-800',
      'Comprador': 'bg-green-100 text-green-800',
      'Bloqueador': 'bg-red-100 text-red-800',
      'Coach': 'bg-purple-100 text-purple-800',
      'Campeón': 'bg-emerald-100 text-emerald-800',
      'Guardián': 'bg-orange-100 text-orange-800'
    };
    return colores[rol] || 'bg-gray-100 text-gray-800';
  };

  // Columnas compatibles con DataTable
  const columnsForDataTable = [
    {
      accessor: 'nombre_completo',
      header: 'Nombre',
      cell: (contacto) => {
        const nombreCompleto = [
          contacto.nombre_primero,
          contacto.nombre_segundo,
          contacto.apellido_primero,
          contacto.apellido_segundo
        ].filter(Boolean).join(' ');
        
        return (
          <div>
            <div className="font-medium text-gray-900">
              {nombreCompleto || 'Sin nombre'}
            </div>
            {contacto.correo_corporativo && (
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {contacto.correo_corporativo}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessor: 'empresa',
      header: 'Empresa',
      cell: (contacto) => (
        <div>
          {contacto.empresa ? (
            <>
              <div className="font-medium text-gray-900 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {contacto.empresa.empresa}
              </div>
              {contacto.empresa.mercado && (
                <div className="text-sm text-gray-500">
                  {contacto.empresa.mercado.segmento_mercado}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-500">Sin empresa</span>
          )}
        </div>
      )
    },
    {
      accessor: 'cargo',
      header: 'Cargo',
      cell: (contacto) => (
        <div>
          {contacto.cargo ? (
            <div className="font-medium text-gray-900 flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {contacto.cargo}
            </div>
          ) : (
            <span className="text-gray-500">No especificado</span>
          )}
        </div>
      )
    },
    {
      accessor: 'rol',
      header: 'Rol',
      cell: (contacto) => (
        contacto.rol ? (
          <Badge className={getColorRol(contacto.rol)}>
            <UserCheck className="h-3 w-3 mr-1" />
            {contacto.rol}
          </Badge>
        ) : (
          <span className="text-gray-500">Sin rol</span>
        )
      )
    },
    {
      accessor: 'buyer_persona',
      header: 'Buyer Persona',
      cell: (contacto) => (
        contacto.buyer_persona ? (
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {contacto.buyer_persona.buyer}
          </Badge>
        ) : (
          <span className="text-gray-500">Sin asignar</span>
        )
      )
    }
  ];

  // Handlers para los diálogos
  const handleCrear = () => {
    setShowCrearDialog(true);
  };

  const handleVer = (contacto) => {
    setSelectedContacto(contacto);
    setShowVerDialog(true);
  };

  const handleEditar = (contacto) => {
    setSelectedContacto(contacto);
    setShowEditarDialog(true);
  };

  const handleEliminar = (contacto) => {
    setContactoToDelete(contacto);
    setShowConfirmDelete(true);
  };

  // Handler para eliminar contacto (recibe solo ID desde DataTable)
  const handleEliminarPorId = async (id) => {
    const contacto = contactos.find(c => c.id_persona === id);
    if (contacto) {
      setContactoToDelete(contacto);
      setShowConfirmDelete(true);
    }
  };

  // Handler para eliminar contacto
  const confirmarEliminacion = async () => {
    try {
      await apiCall(`/api/crm/contactos/${contactoToDelete.id_persona}`, {
        method: 'DELETE'
      });

      toast({
        title: "¡Éxito!",
        description: "Contacto eliminado correctamente",
        variant: "success"
      });

      await cargarContactos();
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el contacto",
        variant: "destructive"
      });
    } finally {
      setShowConfirmDelete(false);
      setContactoToDelete(null);
    }
  };

  // Handler para cuando se crea/actualiza un contacto
  const handleContactoCreado = () => {
    cargarContactos();
    setShowCrearDialog(false);
  };

  const handleContactoActualizado = () => {
    cargarContactos();
    setShowEditarDialog(false);
  };



  // Calcular estadísticas
  const totalContactos = contactos.length;
  const contactosConEmpresa = contactos.filter(c => c.empresa).length;
  const contactosConRol = contactos.filter(c => c.rol).length;
  const contactosConBuyer = contactos.filter(c => c.buyer_persona).length;

  // Estadísticas por rol
  const estadisticasRol = contactos.reduce((acc, contacto) => {
    if (contacto.rol) {
      acc[contacto.rol] = (acc[contacto.rol] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestión de Contactos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra tu red de contactos y relaciones comerciales
          </p>
        </div>
        <Button 
          onClick={handleCrear} 
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Filtros avanzados */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-xs mb-1">Filtrar por empresa</label>
          <Select
            options={empresas}
            value={filtroEmpresa}
            onChange={setFiltroEmpresa}
            placeholder="Todas las empresas"
            searchPlaceholder="Buscar empresa..."
            displayKey="nombre"
            valueKey="id"
            clearable
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Filtrar por país</label>
          <Select
            options={paises}
            value={filtroPais}
            onChange={setFiltroPais}
            placeholder="Todos los países"
            searchPlaceholder="Buscar país..."
            displayKey="nombre"
            valueKey="id"
            clearable
          />
        </div>
      </div>

      {/* Importar/Exportar Excel */}
      <div className="flex gap-4 mb-4">
        <ExcelImportExport
          data={contactos}
          columns={columnsForDataTable.map(col => ({ key: col.accessor, label: col.header }))}
          filename="contactos"
          onImport={async (importedRows) => {
            toast({
              title: "Importación no implementada",
              description: "La lógica de importación debe ser implementada.",
              variant: "destructive"
            });
          }}
        />
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContactos}</div>
            <p className="text-xs text-muted-foreground">
              Red completa de contactos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Empresa</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactosConEmpresa}</div>
            <p className="text-xs text-muted-foreground">
              {totalContactos > 0 ? Math.round((contactosConEmpresa / totalContactos) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Rol Definido</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactosConRol}</div>
            <p className="text-xs text-muted-foreground">
              {totalContactos > 0 ? Math.round((contactosConRol / totalContactos) * 100) : 0}% clasificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Buyer Persona</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactosConBuyer}</div>
            <p className="text-xs text-muted-foreground">
              {totalContactos > 0 ? Math.round((contactosConBuyer / totalContactos) * 100) : 0}% segmentados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por rol */}
      {Object.keys(estadisticasRol).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribución por Rol en Proceso de Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(estadisticasRol).map(([rol, cantidad]) => (
                <Badge key={rol} className={getColorRol(rol)}>
                  {rol}: {cantidad}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}



      {/* Tabla de contactos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Contactos ({contactos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando contactos...</div>
            </div>
          ) : (
            <DataTable
              data={contactos.map(contacto => ({...contacto, id: contacto.id_persona}))}
              columns={columnsForDataTable}
              onEdit={handleEditar}
              onDelete={handleEliminarPorId}
              onAdd={handleCrear}
              title=""
              description=""
            />
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <CrearContactoDialog
        open={showCrearDialog}
        onClose={() => setShowCrearDialog(false)}
        onContactoCreado={handleContactoCreado}
      />

      <EditarContactoDialog
        open={showEditarDialog}
        onClose={() => setShowEditarDialog(false)}
        contacto={selectedContacto}
        onContactoActualizado={handleContactoActualizado}
      />

      <VerContactoDialog
        open={showVerDialog}
        onClose={() => setShowVerDialog(false)}
        contacto={selectedContacto}
      />

      <ConfirmDialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmarEliminacion}
        title="Eliminar Contacto"
        description={`¿Estás seguro de que quieres eliminar el contacto "${contactoToDelete?.nombre_primero} ${contactoToDelete?.apellido_primero}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Contactos;
