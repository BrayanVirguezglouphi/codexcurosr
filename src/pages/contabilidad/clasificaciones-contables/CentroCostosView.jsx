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
import { Plus, Pencil, Trash2, Eye, BarChart2, Building, Target, FilterX, X, Grid3X3, Save, RotateCcw, Home, Download, Upload } from 'lucide-react';
import CrearCentroCostoDialog from './centros-costos/CrearCentroCostoDialog';
import EditarCentroCostoDialog from './centros-costos/EditarCentroCostoDialog';
import VerCentroCostoDialog from './centros-costos/VerCentroCostoDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { toast } from 'react-hot-toast';

const CentroCostosView = () => {
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [isVerDialogOpen, setIsVerDialogOpen] = useState(false);
  const [centroCostoSeleccionado, setCentroCostoSeleccionado] = useState(null);
  const [centroCostoVisto, setCentroCostoVisto] = useState(null);
  
  // Estados para funcionalidades avanzadas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedCentrosCostos, setEditedCentrosCostos] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());

  // Estados para import/export
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const { toast: useToastToast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_centro_costo', label: 'ID', required: true },
    { key: 'sub_centro_costo', label: 'Sub Centro de Costo', required: true },
    { key: 'centro_costo_macro', label: 'Centro Costo Macro' },
    { key: 'descripcion_cc', label: 'Descripción' }
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

  // Cargar centros de costos
  const cargarCentrosCostos = async () => {
    try {
      const response = await apiCall('/api/centros-costos');
      const data = await response.json();
      setCentrosCostos(data);
    } catch (error) {
      useToastToast({
        title: "Error",
        description: "No se pudieron cargar los centros de costos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarCentrosCostos();
  }, []);

  // Eliminar centro de costo
  const eliminarCentroCosto = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este centro de costo?')) {
      try {
        const response = await fetch(`/api/centros-costos/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          useToastToast({
            title: "Éxito",
            description: "Centro de costo eliminado correctamente",
          });
          cargarCentrosCostos();
        }
      } catch (error) {
        useToastToast({
          title: "Error",
          description: "No se pudo eliminar el centro de costo",
          variant: "destructive",
        });
      }
    }
  };

  // Renderizar valor de columna
  const renderColumnValue = (centroCosto, columnKey) => {
    const value = getNestedValue(centroCosto, columnKey);
    
    switch (columnKey) {
      case 'id_centro_costo':
        return <span className="font-mono text-purple-600">#{value}</span>;
      case 'sub_centro_costo':
        return (
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              <Building className="w-3 h-3 inline mr-1" />
              {value}
            </span>
          </div>
        );
      case 'centro_costo_macro':
        return value ? (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
            <Home className="w-3 h-3 inline mr-1" />
            {value}
          </span>
        ) : (
          <span className="text-gray-400 italic">Centro principal</span>
        );
      case 'descripcion_cc':
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
      case 'id_centro_costo':
        return 'disabled';
      case 'descripcion_cc':
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
    return centrosCostos;
  };

  // Aplicar filtros y ordenamiento
  const filteredAndSortedCentrosCostos = useMemo(() => {
    let filtered = [...centrosCostos];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(centroCosto => {
          const value = getNestedValue(centroCosto, field);
          let displayValue = value;

          // Aplicar el mismo renderizado que se usa en la tabla
          if (field === 'centro_costo_macro' && !value) {
            displayValue = 'Centro principal';
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
  }, [centrosCostos, filters, sortConfig]);

  // Paginación
  const totalFilteredItems = filteredAndSortedCentrosCostos.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCentrosCostos = filteredAndSortedCentrosCostos.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Funciones para modo de edición masiva
  const toggleGridEditMode = () => {
    if (isGridEditMode && pendingChanges.size > 0) {
      if (window.confirm('¿Deseas salir del modo edición? Se perderán los cambios no guardados.')) {
        setIsGridEditMode(false);
        setEditedCentrosCostos({});
        setPendingChanges(new Set());
      }
    } else {
      setIsGridEditMode(!isGridEditMode);
      setEditedCentrosCostos({});
      setPendingChanges(new Set());
    }
  };

  const handleCellSave = async (centroCostoId, field, newValue) => {
    // Actualizar el estado local
    setEditedCentrosCostos(prev => ({
      ...prev,
      [centroCostoId]: {
        ...prev[centroCostoId],
        [field]: newValue
      }
    }));

    // Marcar como cambio pendiente
    setPendingChanges(prev => new Set([...prev, centroCostoId]));

    // Actualizar inmediatamente en la base de datos
    try {
      const response = await fetch(`/api/centros-costos/${centroCostoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (response.ok) {
        // Actualizar la lista local
        cargarCentrosCostos();
        
        // Remover de cambios pendientes
        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(centroCostoId);
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
    
    for (const centroCostoId of pendingChanges) {
      const editedData = editedCentrosCostos[centroCostoId];
      if (editedData) {
        updates.push(
          apiCall('/api/centros-costos/${centroCostoId}', { method: 'PUT', body: JSON.stringify(editedData) })
        );
      }
    }

    try {
      await Promise.all(updates);
      useToastToast({
        title: "Éxito",
        description: `Se actualizaron ${pendingChanges.size} centros de costos`,
      });
      
      setPendingChanges(new Set());
      setEditedCentrosCostos({});
      cargarCentrosCostos();
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
    setEditedCentrosCostos({});
    
    useToastToast({
      title: "Cambios descartados",
      description: "Se han descartado todos los cambios pendientes",
    });
  };

  // Funciones de exportación e importación
  const handleExport = async (exportType) => {
    try {
      const { default: XLSX } = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      let dataToExport = [];
      
      if (exportType === 'filtered') {
        dataToExport = filteredAndSortedCentrosCostos;
      } else {
        dataToExport = centrosCostos;
      }

      // Formatear datos para exportación
      const exportData = dataToExport.map(centroCosto => ({
        'ID': centroCosto.id_centro_costo,
        'Sub Centro de Costo': centroCosto.sub_centro_costo || '',
        'Centro Costo Macro': centroCosto.centro_costo_macro || '',
        'Descripción': centroCosto.descripcion_cc || ''
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Centros de Costos');

      // Guardar archivo
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `centros_costos_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success(`Exportados ${exportData.length} centros de costos correctamente`);
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
          sub_centro_costo: mapColumn([
            'Sub Centro de Costo', 'sub_centro_costo', 'Sub Centro Costo', 
            'Centro de Costo', 'centro_costo', 'Nombre', 'nombre'
          ]),
          centro_costo_macro: mapColumn([
            'Centro Costo Macro', 'centro_costo_macro', 'Centro Macro', 
            'Macro', 'macro', 'Padre', 'padre'
          ]),
          descripcion_cc: mapColumn([
            'Descripción', 'descripcion_cc', 'descripcion', 'Descripcion',
            'Detalle', 'detalle', 'Observaciones', 'observaciones'
          ])
        };
      });

      // Filtrar filas válidas (que tengan al menos sub_centro_costo)
      const validData = mappedData.filter(row => 
        row.sub_centro_costo && row.sub_centro_costo.toString().trim() !== ''
      );

      if (validData.length === 0) {
        toast.error('No se encontraron registros válidos para importar');
        return;
      }

      // Enviar al backend
      const response = await fetch('/api/centros-costos/bulk-create', {
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
      toast.success(`Se importaron ${result.created} centros de costos correctamente`);
      setShowImportDialog(false);
      cargarCentrosCostos(); // Recargar datos
    } catch (error) {
      console.error('Error al importar:', error);
      toast.error(`Error al importar: ${error.message}`);
    }
  };

  // Cálculos para widgets mejorados
  const cantidadCentrosCostos = centrosCostos.length;
  const centrosMacro = [...new Set(centrosCostos.map(c => c.centro_costo_macro).filter(Boolean))].length;
  const centroCostoMasReciente = centrosCostos.length > 0 ? centrosCostos[0] : null;
  const nombreMasReciente = centroCostoMasReciente?.sub_centro_costo || '-';
  const macroMasReciente = centroCostoMasReciente?.centro_costo_macro || '-';

  return (
    <div className="space-y-6">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        {/* Cantidad de centros de costos */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Centros de Costos</div>
            <div className="text-2xl font-bold">{cantidadCentrosCostos}</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {/* Centros macro */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Centros Macro</div>
            <div className="text-2xl font-bold">{centrosMacro}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Building className="w-6 h-6 text-green-600" />
          </div>
        </div>
        {/* Más reciente */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Centro Más Reciente</div>
            <div className="text-lg font-bold truncate">{nombreMasReciente}</div>
            <div className="text-2xl font-bold">{macroMasReciente}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Centros de Costos</h1>
        <div className="flex gap-2">
          <ColumnSelector
            availableColumns={availableColumns}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          
          {/* Controles del modo edición */}
          {!isGridEditMode ? (
            <Button 
              variant="outline" 
              onClick={toggleGridEditMode}
              className="border-purple-400 text-purple-600 hover:bg-purple-50"
            >
              <Grid3X3 className="mr-2 h-4 w-4" />
              Modo Cuadrícula
            </Button>
          ) : (
            <div className="flex gap-2">
              {pendingChanges.size > 0 && (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={saveAllPendingChanges}
                    className="border-green-400 text-green-600 hover:bg-green-50"
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Guardar Todo ({pendingChanges.size})
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={discardChanges}
                    className="border-orange-400 text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Descartar
                  </Button>
                </>
              )}
              <Button 
                variant="outline"
                size="sm"
                onClick={toggleGridEditMode}
                className="border-gray-400 text-gray-600 hover:bg-gray-50"
              >
                <X className="mr-1 h-3 w-3" />
                Salir
              </Button>
            </div>
          )}
          
          {/* Botones de Exportación e Importación */}
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="border-green-400 text-green-600 hover:bg-green-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="border-blue-400 text-blue-600 hover:bg-blue-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          
          <Button onClick={() => setIsCrearDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Centro de Costo
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
            {paginatedCentrosCostos.map((centroCosto, idx) => (
              <TableRow 
                key={centroCosto.id_centro_costo} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition
                  ${pendingChanges.has(centroCosto.id_centro_costo) ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                `}
              >
                {availableColumns.map(column => {
                  if (!visibleColumns[column.key]) return null;
                  
                  const fieldType = getFieldType(column.key);
                  const currentValue = editedCentrosCostos[centroCosto.id_centro_costo]?.[column.key] ?? getNestedValue(centroCosto, column.key);
                  const hasChanges = pendingChanges.has(centroCosto.id_centro_costo);
                  
                  return (
                    <TableCell 
                      key={`${centroCosto.id_centro_costo}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCell
                          value={currentValue}
                          onSave={(newValue) => handleCellSave(centroCosto.id_centro_costo, column.key, newValue)}
                          field={column.key}
                          type={fieldType}
                          options={getFieldOptions(column.key)}
                          disabled={fieldType === 'disabled'}
                        />
                      ) : (
                        renderColumnValue(centroCosto, column.key)
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
                      onClick={() => {
                        setCentroCostoVisto(centroCosto);
                        setIsVerDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-blue-400 hover:bg-blue-100"
                      onClick={() => {
                        setCentroCostoSeleccionado(centroCosto);
                        setIsEditarDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-400 hover:bg-red-100"
                      onClick={() => eliminarCentroCosto(centroCosto.id_centro_costo)}
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

      {/* Dialogs */}
      <CrearCentroCostoDialog 
        open={isCrearDialogOpen}
        onClose={() => setIsCrearDialogOpen(false)}
        onCentroCostoCreado={cargarCentrosCostos}
      />

      <EditarCentroCostoDialog 
        open={isEditarDialogOpen}
        onClose={() => setIsEditarDialogOpen(false)}
        centroCosto={centroCostoSeleccionado}
        onCentroCostoActualizado={cargarCentrosCostos}
      />

      <VerCentroCostoDialog 
        open={isVerDialogOpen}
        onClose={() => setIsVerDialogOpen(false)}
        centroCosto={centroCostoVisto}
      />

      {/* Diálogos de Exportación e Importación */}
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        totalRecords={centrosCostos.length}
        filteredRecords={filteredAndSortedCentrosCostos.length}
        entityName="centros de costos"
      />

      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        entityName="centros de costos"
        templateData={[
          {
            'Sub Centro de Costo': 'Ejemplo Centro 1',
            'Centro Costo Macro': 'Administración', 
            'Descripción': 'Descripción del centro de costo'
          },
          {
            'Sub Centro de Costo': 'Ejemplo Centro 2',
            'Centro Costo Macro': 'Producción',
            'Descripción': 'Otro ejemplo de descripción'
          }
        ]}
        columns={[
          { key: 'Sub Centro de Costo', label: 'Sub Centro de Costo', required: true },
          { key: 'Centro Costo Macro', label: 'Centro Costo Macro', required: false },
          { key: 'Descripción', label: 'Descripción', required: false }
        ]}
      />
    </div>
  );
};

export default CentroCostosView; 