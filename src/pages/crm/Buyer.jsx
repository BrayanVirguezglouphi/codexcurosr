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
  Users,
  Target,
  Filter,
  RefreshCw,
  Download,
  Brain,
  FileText,
  ExternalLink
} from 'lucide-react';

// Importar diálogos
import CrearBuyerPersonaDialog from './buyer-personas/CrearBuyerPersonaDialog';
import EditarBuyerPersonaDialog from './buyer-personas/EditarBuyerPersonaDialog';
import VerBuyerPersonaDialog from './buyer-personas/VerBuyerPersonaDialog';
import ExcelImportExport from '@/components/ui/excel-import-export';
import { Select } from '@/components/ui/select';

const Buyer = () => {
  // Estados principales
  const [buyerPersonas, setBuyerPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [showCrearDialog, setShowCrearDialog] = useState(false);
  const [showEditarDialog, setShowEditarDialog] = useState(false);
  const [showVerDialog, setShowVerDialog] = useState(false);
  const [selectedBuyerPersona, setSelectedBuyerPersona] = useState(null);
  
  // Estados para confirmación de eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [buyerPersonaToDelete, setBuyerPersonaToDelete] = useState(null);
  
  // Estados para filtros
  const [filtroMercado, setFiltroMercado] = useState('');
  const [filtroPais, setFiltroPais] = useState('');
  const [mercados, setMercados] = useState([]);
  const [paises, setPaises] = useState([]);

  const { toast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    cargarBuyerPersonas();
    apiCall('/api/crm/mercados').then(data => setMercados(data || []));
    apiCall('/api/catalogos/paises').then(data => setPaises(data || []));
  }, []);

  const cargarBuyerPersonas = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/crm/buyer-personas');
      setBuyerPersonas((data || []).map(bp => ({ ...bp, id: bp.id_buyer })));
      console.log('Buyer Personas cargadas:', data);
    } catch (error) {
      console.error('Error cargando buyer personas:', error);
      toast({
        title: "Error",
        description: "Error al cargar las buyer personas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const handleCrearBuyerPersona = (nuevaBuyerPersona) => {
    setBuyerPersonas(prev => [...prev, nuevaBuyerPersona]);
    toast({
      title: "¡Éxito!",
      description: "Buyer Persona creada correctamente",
      variant: "success"
    });
  };

  const handleEditarBuyerPersona = (buyerPersonaActualizada) => {
    setBuyerPersonas(prev => prev.map(bp => 
      bp.id_buyer === buyerPersonaActualizada.id_buyer ? buyerPersonaActualizada : bp
    ));
    toast({
      title: "¡Éxito!",
      description: "Buyer Persona actualizada correctamente",
      variant: "success"
    });
  };

  const handleEliminarBuyerPersona = async () => {
    if (!buyerPersonaToDelete) return;
    
    try {
      await apiCall(`/api/crm/buyer-personas/${buyerPersonaToDelete.id_buyer}`, {
        method: 'DELETE'
      });
      
      setBuyerPersonas(prev => prev.filter(bp => bp.id_buyer !== buyerPersonaToDelete.id_buyer));
      
      toast({
        title: "¡Éxito!",
        description: "Buyer Persona eliminada correctamente",
        variant: "success"
      });
    } catch (error) {
      console.error('Error eliminando buyer persona:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la buyer persona",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setBuyerPersonaToDelete(null);
    }
  };

  // Funciones para abrir diálogos
  const abrirDialogoVer = (buyerPersona) => {
    setSelectedBuyerPersona(buyerPersona);
    setShowVerDialog(true);
  };

  const abrirDialogoEditar = (buyerPersona) => {
    setSelectedBuyerPersona(buyerPersona);
    setShowEditarDialog(true);
  };

  const abrirDialogoEliminar = (buyerPersona) => {
    setBuyerPersonaToDelete(buyerPersona);
    setShowDeleteDialog(true);
  };

  // Configuración de columnas compatibles con DataTable
  const columnsForDataTable = [
    {
      accessor: 'id_buyer',
      header: 'ID',
      cell: (buyerPersona) => (
        <Badge variant="outline" className="font-mono">
          {buyerPersona.id_buyer}
        </Badge>
      )
    },
    {
      accessor: 'buyer',
      header: 'Buyer Persona',
      cell: (buyerPersona) => (
        <div className="font-medium">
          {buyerPersona.buyer}
        </div>
      )
    },
    {
      accessor: 'background',
      header: 'Background',
      cell: (buyerPersona) => (
        <div className="text-sm text-muted-foreground truncate max-w-[250px]" title={buyerPersona.background}>
          {buyerPersona.background || 'Sin background'}
        </div>
      )
    },
    {
      accessor: 'metas',
      header: 'Metas',
      cell: (buyerPersona) => (
        <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={buyerPersona.metas}>
          {buyerPersona.metas || 'Sin metas definidas'}
        </div>
      )
    },
    {
      accessor: 'retos',
      header: 'Retos',
      cell: (buyerPersona) => (
        <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={buyerPersona.retos}>
          {buyerPersona.retos || 'Sin retos definidos'}
        </div>
      )
    },
    {
      accessor: 'url_file',
      header: 'Archivo',
      cell: (buyerPersona) => buyerPersona.url_file ? (
        <div className="flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          <Badge variant="secondary" className="text-xs">
            Disponible
          </Badge>
        </div>
      ) : (
        <Badge variant="outline" className="text-xs">
          Sin archivo
        </Badge>
      )
    },
    {
      accessor: 'completitud',
      header: 'Completitud',
      cell: (buyerPersona) => {
        // Calcular completitud basado en campos completados
        const campos = [
          buyerPersona.buyer,
          buyerPersona.background,
          buyerPersona.metas,
          buyerPersona.retos,
          buyerPersona.identificadores,
          buyerPersona.objeciones_comunes,
          buyerPersona.conductas_compra,
          buyerPersona.que_podemos_hacer,
          buyerPersona.posible_mensaje,
          buyerPersona.que_oye,
          buyerPersona.que_piensa_siente,
          buyerPersona.que_ve,
          buyerPersona.que_dice_hace,
          buyerPersona.esfuerzos,
          buyerPersona.resultados_valor
        ];
        
        const completados = campos.filter(campo => campo && campo.trim().length > 0).length;
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
    },
    {
      accessor: 'acciones',
      header: 'Acciones',
      cell: (bp) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => abrirDialogoVer(bp)} title="Ver detalles">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => abrirDialogoEditar(bp)} title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => abrirDialogoEliminar(bp)} title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Buyer Personas
          </h1>
          <p className="text-muted-foreground mt-1">
            Caracterización de clientes y perfiles de compra
          </p>
        </div>
        <Button onClick={() => setShowCrearDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Buyer Persona
        </Button>
      </div>

      {/* Filtros avanzados */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-xs mb-1">Filtrar por mercado</label>
          <Select
            options={mercados}
            value={filtroMercado}
            onChange={setFiltroMercado}
            placeholder="Todos los mercados"
            searchPlaceholder="Buscar mercado..."
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
          data={buyerPersonas}
          columns={columnsForDataTable.map(col => ({ key: col.accessor, label: col.header }))}
          filename="buyer_personas"
          onImport={async (importedRows) => {
            toast({
              title: "Importación no implementada",
              description: "La lógica de importación debe ser implementada.",
              variant: "destructive"
            });
          }}
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{buyerPersonas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completas</p>
                <p className="text-2xl font-bold">
                  {buyerPersonas.filter(bp => {
                    const campos = [bp.buyer, bp.background, bp.metas, bp.retos, bp.identificadores, bp.objeciones_comunes, bp.conductas_compra, bp.que_podemos_hacer, bp.posible_mensaje, bp.que_oye, bp.que_piensa_siente, bp.que_ve, bp.que_dice_hace, bp.esfuerzos, bp.resultados_valor];
                    const completados = campos.filter(campo => campo && campo.trim().length > 0).length;
                    return (completados / campos.length) >= 0.8;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con Psicología</p>
                <p className="text-2xl font-bold">
                  {buyerPersonas.filter(bp => bp.que_oye || bp.que_ve || bp.que_piensa_siente || bp.que_dice_hace).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con Archivos</p>
                <p className="text-2xl font-bold">
                  {buyerPersonas.filter(bp => bp.url_file).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de buyer personas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Buyer Personas ({buyerPersonas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={buyerPersonas.map(bp => ({ ...bp, id: bp.id_buyer }))}
            columns={columnsForDataTable}
            onEdit={abrirDialogoEditar}
            onView={abrirDialogoVer}
            onDelete={abrirDialogoEliminar}
            emptyMessage="No hay buyer personas registradas"
            searchable={true}
          />
        </CardContent>
      </Card>

      {/* Diálogos */}
      <CrearBuyerPersonaDialog
        open={showCrearDialog}
        onClose={() => setShowCrearDialog(false)}
        onBuyerPersonaCreado={handleCrearBuyerPersona}
      />

      <EditarBuyerPersonaDialog
        open={showEditarDialog}
        onClose={() => setShowEditarDialog(false)}
        buyerPersona={selectedBuyerPersona}
        onBuyerPersonaActualizado={handleEditarBuyerPersona}
      />

      <VerBuyerPersonaDialog
        open={showVerDialog}
        onClose={() => setShowVerDialog(false)}
        buyerPersona={selectedBuyerPersona}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setBuyerPersonaToDelete(null);
        }}
        onConfirm={handleEliminarBuyerPersona}
        title="Eliminar Buyer Persona"
        description={
          buyerPersonaToDelete
            ? `¿Está seguro de que desea eliminar la buyer persona "${buyerPersonaToDelete.buyer}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default Buyer; 