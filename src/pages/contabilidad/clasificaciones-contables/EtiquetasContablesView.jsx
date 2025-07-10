import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, BarChart2, Tag, Hash, FilterX, X, Grid3X3, Save, RotateCcw, Tags, Download, Upload, List } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import CrearEtiquetaContableDialog from './etiquetas-contables/CrearEtiquetaContableDialog';
import EditarEtiquetaContableDialog from './etiquetas-contables/EditarEtiquetaContableDialog';
import VerEtiquetaContableDialog from './etiquetas-contables/VerEtiquetaContableDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import ExportDialog from '../../../components/ui/export-dialog';
import ImportDialog from '../../../components/ui/import-dialog';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const EtiquetasContablesView = () => {
  const [etiquetasContables, setEtiquetasContables] = useState([]);
  const [dialogoCrear, setDialogoCrear] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoVer, setDialogoVer] = useState(false);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null);
  
  // Estados para funcionalidades avanzadas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedEtiquetas, setEditedEtiquetas] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());

  // Estados para import/export
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const { toast: useToastToast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_etiqueta_contable', label: 'ID', required: true },
    { key: 'etiqueta_contable', label: 'Etiqueta Contable', required: true },
    { key: 'descripcion_etiqueta', label: 'Descripción' }
  ];

  // Inicializar columnas visibles por defecto
  useEffect(() => {
    const defaultColumns = {};
    availableColumns.forEach(col => {
      // Mostrar todas las columnas por defecto ya que son pocas
      defaultColumns[col.key] = true;
    });
    setVisibleColumns(defaultColumns);
  }, []);

  // Obtener valor anidado
  const getNestedValue = (obj, path) => {
    if (!path || typeof path !== 'string') return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Cargar etiquetas contables
  const cargarEtiquetasContables = async () => {
    try {
      const data = await apiCall('/api/etiquetas-contables');
      setEtiquetasContables(Array.isArray(data) ? data : []);
      console.log('✅ Etiquetas contables cargadas:', data);
    } catch (error) {
      console.error('❌ Error al cargar etiquetas contables:', error);
      setEtiquetasContables([]);
      useToastToast({
        title: "Error",
        description: "No se pudieron cargar las etiquetas contables",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarEtiquetasContables();
  }, []);

  // Eliminar etiqueta contable
  const eliminarEtiquetaContable = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta etiqueta contable?')) {
      try {
        const response = await fetch(`/api/etiquetas-contables/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          useToastToast({
            title: "Éxito",
            description: "Etiqueta contable eliminada correctamente",
          });
          cargarEtiquetasContables();
        }
      } catch (error) {
        useToastToast({
          title: "Error",
          description: "No se pudo eliminar la etiqueta contable",
          variant: "destructive",
        });
      }
    }
  };

  // Funciones para manejar diálogos
  const handleVerEtiqueta = (etiqueta) => {
    setEtiquetaSeleccionada(etiqueta);
    setDialogoVer(true);
  };

  const handleEditarEtiqueta = (etiqueta) => {
    setEtiquetaSeleccionada(etiqueta);
    setDialogoEditar(true);
  };

  // Renderizar valor de columna
  const renderColumnValue = (etiqueta, columnKey) => {
    const value = getNestedValue(etiqueta, columnKey);
    
    switch (columnKey) {
      case 'id_etiqueta_contable':
        return <span className="font-mono text-green-600">#{value}</span>;
      case 'etiqueta_contable':
        return (
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <Tag className="w-3 h-3 inline mr-1" />
              {value}
            </span>
          </div>
        );
      case 'descripcion_etiqueta':
        return (
          <div className="max-w-xs">
            <div className="truncate" title={value}>
              {value || <span className="text-gray-400 italic">Sin descripción</span>}
            </div>
          </div>
        );
      default:
        return value || '-';
    }
  };

  // Obtener tipo de campo para edición
  const getFieldType = (columnKey) => {
    switch (columnKey) {
      case 'id_etiqueta_contable':
        return 'disabled';
      case 'descripcion_etiqueta':
        return 'textarea';
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos select
  const getFieldOptions = (columnKey) => {
    return [];
  };

  // Manejar ordenamiento
  const handleSort = (field, direction) => {
    setSortConfig({ field, direction });
    setCurrentPage(1);
  };

  // Manejar filtros
  const handleFilter = (field, values) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (!values || values.length === 0) {
        delete newFilters[field];
      } else {
        newFilters[field] = values;
      }
      
      return newFilters;
    });
    setCurrentPage(1);
  };

  // Obtener datos para filtros
  const getFilterData = (columnKey) => {
    return etiquetasContables;
  };

  // Aplicar filtros y ordenamiento
  const filteredAndSortedEtiquetas = useMemo(() => {
    let filtered = [...etiquetasContables];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(etiqueta => {
          const value = getNestedValue(etiqueta, field);
          let displayValue = value;

          // Aplicar el mismo renderizado que se usa en la tabla
          if (field === 'descripcion_etiqueta' && !value) {
            displayValue = 'Sin descripción';
          }

          const stringValue = displayValue?.toString().toLowerCase() || '';
          return values.some(filterValue => 
            stringValue.includes(filterValue.toLowerCase())
          );
        });
      }
    });

    // Aplicar ordenamiento
    if (sortConfig.field && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.field) || '';
        const bValue = getNestedValue(b, sortConfig.field) || '';
        
        const aString = aValue.toString().toLowerCase();
        const bString = bValue.toString().toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      });
    }

    return filtered;
  }, [etiquetasContables, filters, sortConfig]);

  // Paginación
  const totalFilteredItems = filteredAndSortedEtiquetas.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEtiquetas = filteredAndSortedEtiquetas.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const toggleGridEditMode = () => {
    setIsGridEditMode(!isGridEditMode);
    if (isGridEditMode) {
      // Salir del modo edición, descartar cambios pendientes
      setPendingChanges(new Set());
      setEditedEtiquetas({});
    }
  };

  const handleCellSave = async (etiquetaId, field, newValue) => {
    try {
      // Actualizar el estado local inmediatamente
      setEditedEtiquetas(prev => ({
        ...prev,
        [etiquetaId]: {
          ...prev[etiquetaId],
          [field]: newValue
        }
      }));

      // Marcar como pendiente
      setPendingChanges(prev => new Set([...prev, etiquetaId]));

      // Hacer la actualización en el servidor
      const response = await fetch(`/api/etiquetas-contables/${etiquetaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      });

      if (response.ok) {
        // Remover de cambios pendientes si se guardó exitosamente
        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(etiquetaId);
          return newSet;
        });

        useToastToast({
          title: "Éxito",
          description: "Campo actualizado correctamente",
        });
      }
    } catch (error) {
      useToastToast({
        title: "Error",
        description: "No se pudo actualizar el campo",
        variant: "destructive",
      });
    }
  };

  const saveAllPendingChanges = async () => {
    const updates = [];
    
    for (const etiquetaId of pendingChanges) {
      const editedData = editedEtiquetas[etiquetaId];
      if (editedData) {
        updates.push(
          apiCall('/api/etiquetas-contables/${etiquetaId}', { method: 'PUT', body: JSON.stringify(editedData) })
        );
      }
    }

    try {
      await Promise.all(updates);
      useToastToast({
        title: "Éxito",
        description: `Se actualizaron ${pendingChanges.size} etiquetas contables`,
      });
      
      setPendingChanges(new Set());
      setEditedEtiquetas({});
      cargarEtiquetasContables();
    } catch (error) {
      useToastToast({
        title: "Error",
        description: "Error al guardar algunos cambios",
        variant: "destructive",
      });
    }
  };

  const discardChanges = () => {
    setPendingChanges(new Set());
    setEditedEtiquetas({});
    
    useToastToast({
      title: "Cambios descartados",
      description: "Se han descartado todos los cambios pendientes",
    });
  };

  // Funciones de exportación e importación
  const handleExport = async (exportType) => {
    try {
      console.log('🔄 Iniciando exportación de etiquetas contables...');
      
      // Verificar que las librerías estén disponibles (importación estática)
      console.log('✅ Librerías disponibles:', { XLSX: !!XLSX, saveAs: !!saveAs });
      
      if (!XLSX || !XLSX.utils) {
        throw new Error('Error: Librería XLSX no disponible');
      }
      
      let dataToExport = [];
      
      if (exportType === 'filtered' && filteredAndSortedEtiquetas && filteredAndSortedEtiquetas.length > 0) {
        dataToExport = filteredAndSortedEtiquetas;
      } else {
        dataToExport = etiquetasContables || [];
      }

      console.log(`📊 Datos a exportar: ${dataToExport.length} registros`);

      if (dataToExport.length === 0) {
        toast.warning('No hay datos para exportar');
        return;
      }

      // Formatear datos para exportación
      const exportData = dataToExport.map(etiqueta => ({
        'ID': etiqueta.id_etiqueta_contable,
        'Etiqueta Contable': etiqueta.etiqueta_contable || '',
        'Descripción': etiqueta.descripcion_etiqueta || ''
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Etiquetas Contables');

      // Guardar archivo
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `etiquetas_contables_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success(`Exportadas ${exportData.length} etiquetas contables correctamente`);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const handleImport = async (file) => {
    try {
      const { default: XLSX } = await import('xlsx');
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('El archivo está vacío o no contiene datos válidos');
        return;
      }

      // Mapear columnas automáticamente
      const mappedData = jsonData.map(row => {
        // Mapear diferentes posibles nombres de columnas
        const mapColumn = (possibleNames) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
              return row[name];
            }
          }
          return null;
        };

        return {
          etiqueta_contable: mapColumn([
            'Etiqueta Contable', 'etiqueta_contable', 'Etiqueta', 
            'etiqueta', 'Nombre', 'nombre', 'Tag'
          ]),
          descripcion_etiqueta: mapColumn([
            'Descripción', 'descripcion_etiqueta', 'descripcion', 'Descripcion',
            'Detalle', 'detalle', 'Observaciones', 'observaciones'
          ])
        };
      });

      // Filtrar filas válidas (que tengan al menos etiqueta_contable)
      const validData = mappedData.filter(row => 
        row.etiqueta_contable && row.etiqueta_contable.toString().trim() !== ''
      );

      if (validData.length === 0) {
        toast.error('No se encontraron registros válidos para importar');
        return;
      }

      // Enviar al backend
      const response = await fetch('/api/etiquetas-contables/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: validData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al importar datos');
      }

      const result = await response.json();
      toast.success(`Se importaron ${result.created} etiquetas contables correctamente`);
      setShowImportDialog(false);
      cargarEtiquetasContables(); // Recargar datos
    } catch (error) {
      console.error('Error al importar:', error);
      toast.error(`Error al importar: ${error.message}`);
    }
  };

  // Cálculos para widgets mejorados
  const cantidadEtiquetas = etiquetasContables.length;
  const etiquetaConDescripcion = etiquetasContables.filter(e => e.descripcion_etiqueta).length;
  const etiquetaMasReciente = etiquetasContables.length > 0 ? etiquetasContables[0] : null;
  const nombreMasReciente = etiquetaMasReciente?.etiqueta_contable || '-';
  
  // Estadísticas de longitud
  const promedioLongitud = etiquetasContables.length > 0 
    ? (etiquetasContables.reduce((acc, e) => acc + (e.etiqueta_contable?.length || 0), 0) / etiquetasContables.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Etiquetas</div>
            <div className="text-2xl font-bold">{cantidadEtiquetas}</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Con Descripción</div>
            <div className="text-2xl font-bold">{etiquetaConDescripcion}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Tag className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Más Reciente</div>
            <div className="text-lg font-bold truncate">{nombreMasReciente}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Hash className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Tag className="w-8 h-8 text-white" />
            </div>
            Etiquetas Contables
          </h1>
          <p className="text-gray-500 text-lg">
            Gestiona las etiquetas para categorización contable
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowExportDialog(true)}
            variant="outline"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
          
          <Button 
            onClick={() => setIsGridEditMode(!isGridEditMode)}
            variant="outline"
            size="sm"
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            {isGridEditMode ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </Button>
          
          <Button onClick={() => setDialogoCrear(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Etiqueta
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-lg overflow-x-auto">
        {isGridEditMode && (
          <div className="bg-purple-50 border-b px-4 py-2 text-sm text-purple-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span className="font-medium">Modo Edición Masiva Activo</span>
              <span className="text-purple-600">- Haz clic en cualquier celda para editarla</span>
            </div>
            {pendingChanges.size > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                {pendingChanges.size} cambio(s) pendiente(s)
              </span>
            )}
          </div>
        )}
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className={`bg-gradient-to-r ${isGridEditMode ? 'from-purple-100 to-purple-200' : 'from-blue-100 to-blue-200'}`}>
            <TableRow>
              {availableColumns.map(column => {
                if (!visibleColumns[column.key]) return null;
                
                return (
                  <TableHead key={column.key}>
                    <FilterableTableHeader
                      title={column.label}
                      field={column.key}
                      data={getFilterData(column.key)}
                      onSort={handleSort}
                      onFilter={handleFilter}
                      activeFilters={filters[column.key] || []}
                      sortDirection={sortConfig.field === column.key ? sortConfig.direction : null}
                    />
                  </TableHead>
                );
              })}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEtiquetas.map((etiqueta, idx) => (
              <TableRow 
                key={etiqueta.id_etiqueta_contable} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition
                  ${pendingChanges.has(etiqueta.id_etiqueta_contable) ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                `}
              >
                {availableColumns.map(column => {
                  if (!visibleColumns[column.key]) return null;
                  
                  const fieldType = getFieldType(column.key);
                  const currentValue = editedEtiquetas[etiqueta.id_etiqueta_contable]?.[column.key] ?? getNestedValue(etiqueta, column.key);
                  const hasChanges = pendingChanges.has(etiqueta.id_etiqueta_contable);
                  
                  return (
                    <TableCell 
                      key={`${etiqueta.id_etiqueta_contable}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCell
                          value={currentValue}
                          onSave={(newValue) => handleCellSave(etiqueta.id_etiqueta_contable, column.key, newValue)}
                          field={column.key}
                          type={fieldType}
                          options={getFieldOptions(column.key)}
                          disabled={fieldType === 'disabled'}
                        />
                      ) : (
                        renderColumnValue(etiqueta, column.key)
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-400 hover:bg-gray-100"
                      onClick={() => handleVerEtiqueta(etiqueta)}
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-blue-400 hover:bg-blue-100"
                      onClick={() => handleEditarEtiqueta(etiqueta)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-red-400 hover:bg-red-100"
                      onClick={() => eliminarEtiquetaContable(etiqueta.id_etiqueta_contable)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalItems={totalFilteredItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Diálogos */}
      <CrearEtiquetaContableDialog
        open={dialogoCrear}
        onOpenChange={setDialogoCrear}
        onEtiquetaCreada={cargarEtiquetasContables}
      />

      <EditarEtiquetaContableDialog
        open={dialogoEditar}
        onOpenChange={setDialogoEditar}
        etiqueta={etiquetaSeleccionada}
        onEtiquetaActualizada={cargarEtiquetasContables}
      />

      <VerEtiquetaContableDialog
        open={dialogoVer}
        onOpenChange={setDialogoVer}
        etiqueta={etiquetaSeleccionada}
      />

      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        totalRecords={etiquetasContables.length}
        filteredRecords={filteredAndSortedEtiquetas.length}
        entityName="etiquetas contables"
      />

      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        entityName="etiquetas contables"
        templateData={[
          {
            'Etiqueta Contable': 'Ejemplo Etiqueta 1',
            'Descripción': 'Descripción de la etiqueta contable'
          },
          {
            'Etiqueta Contable': 'Ejemplo Etiqueta 2',
            'Descripción': 'Otra descripción de ejemplo'
          }
        ]}
        columns={[
          { key: 'Etiqueta Contable', label: 'Etiqueta Contable', required: true },
          { key: 'Descripción', label: 'Descripción', required: false }
        ]}
      />
    </div>
  );
};

export default EtiquetasContablesView;
