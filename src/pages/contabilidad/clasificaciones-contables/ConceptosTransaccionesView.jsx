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
import { Plus, Pencil, Trash2, Eye, BarChart2, FileText, Code, FilterX, X, Grid3X3, Save, RotateCcw, Target, Download, Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import CrearConceptoTransaccionDialog from './conceptos-transacciones/CrearConceptoTransaccionDialog';
import EditarConceptoTransaccionDialog from './conceptos-transacciones/EditarConceptoTransaccionDialog';
import VerConceptoTransaccionDialog from './conceptos-transacciones/VerConceptoTransaccionDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';
import { toast } from 'react-hot-toast';

const ConceptosTransaccionesView = () => {
  const [conceptosTransacciones, setConceptosTransacciones] = useState([]);
  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [dialogoCrear, setDialogoCrear] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoVer, setDialogoVer] = useState(false);
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState(null);
  
  // Estados para funcionalidades avanzadas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedConceptos, setEditedConceptos] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());

  // Estados para import/export
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const { toast: useToastToast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_concepto', label: 'ID', required: true },
    { key: 'nombre_tipo_transaccion', label: 'Tipo Transacción', required: true },
    { key: 'codigo_dian', label: 'Código DIAN' },
    { key: 'concepto_dian', label: 'Concepto DIAN', required: true }
  ];

  // Inicializar columnas visibles por defecto
  useEffect(() => {
    const defaultColumns = {};
    availableColumns.forEach(col => {
      // Mostrar columnas requeridas por defecto
      defaultColumns[col.key] = col.required || ['codigo_dian'].includes(col.key);
    });
    setVisibleColumns(defaultColumns);
  }, []);

  // Obtener valor anidado
  const getNestedValue = (obj, path) => {
    if (!path || typeof path !== 'string') return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Cargar conceptos de transacciones
  const cargarConceptosTransacciones = async () => {
    try {
      const [conceptosResponse, tiposResponse] = await Promise.all([
        fetch('/api/conceptos-transacciones'),
        fetch('/api/tipos-transaccion')
      ]);
      
      const conceptos = await conceptosResponse.json();
      const tipos = await tiposResponse.json();
      
      // Guardar tipos de transacción en el estado
      setTiposTransaccion(tipos);
      
      // Agregar el nombre del tipo de transacción a cada concepto
      const conceptosConTipos = conceptos.map(concepto => {
        const tipo = tipos.find(t => t.id_tipotransaccion === concepto.id_tipotransaccion);
        return {
          ...concepto,
          nombre_tipo_transaccion: tipo ? tipo.tipo_transaccion : 'No asignado'
        };
      });
      
      setConceptosTransacciones(conceptosConTipos);
    } catch (error) {
      useToastToast({
        title: "Error",
        description: "No se pudieron cargar los conceptos de transacciones",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarConceptosTransacciones();
  }, []);

  // Eliminar concepto de transacción
  const eliminarConceptoTransaccion = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este concepto de transacción?')) {
      try {
        const response = await fetch(`/api/conceptos-transacciones/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          useToastToast({
            title: "Éxito",
            description: "Concepto de transacción eliminado correctamente",
          });
          cargarConceptosTransacciones();
        }
      } catch (error) {
        useToastToast({
          title: "Error",
          description: "No se pudo eliminar el concepto de transacción",
          variant: "destructive",
        });
      }
    }
  };

  // Funciones para manejar diálogos
  const handleVerConcepto = (concepto) => {
    setConceptoSeleccionado(concepto);
    setDialogoVer(true);
  };

  const handleEditarConcepto = (concepto) => {
    setConceptoSeleccionado(concepto);
    setDialogoEditar(true);
  };

  // Renderizar valor de columna
  const renderColumnValue = (concepto, columnKey) => {
    const value = getNestedValue(concepto, columnKey);
    
    switch (columnKey) {
      case 'id_concepto':
        return <span className="font-mono text-blue-600">#{value}</span>;
      case 'nombre_tipo_transaccion':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'INGRESO' 
              ? 'bg-green-100 text-green-700' 
              : value === 'EGRESO'
              ? 'bg-red-100 text-red-700'
              : value === 'TRANSFERENCIA'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {value || 'Sin tipo'}
          </span>
        );
      case 'codigo_dian':
        return (
          <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
            {value || '-'}
          </span>
        );
      case 'concepto_dian':
        return (
          <div className="max-w-xs">
            <div className="truncate" title={value}>
              {value || '-'}
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
      case 'id_concepto':
        return 'disabled';
      case 'nombre_tipo_transaccion':
        return 'select';
      case 'concepto_dian':
        return 'textarea';
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos select
  const getFieldOptions = (columnKey) => {
    switch (columnKey) {
      case 'nombre_tipo_transaccion':
        return tiposTransaccion.map(tipo => ({
          value: tipo.id_tipotransaccion,
          label: tipo.tipo_transaccion
        }));
      default:
        return [];
    }
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
    return conceptosTransacciones;
  };

  // Aplicar filtros y ordenamiento
  const filteredAndSortedConceptos = useMemo(() => {
    let filtered = [...conceptosTransacciones];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(concepto => {
          const value = getNestedValue(concepto, field);
          let displayValue = value;

          // Aplicar el mismo renderizado que se usa en la tabla
          if (field === 'nombre_tipo_transaccion' && !value) {
            displayValue = 'Sin tipo';
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
  }, [conceptosTransacciones, filters, sortConfig]);

  // Paginación
  const totalFilteredItems = filteredAndSortedConceptos.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedConceptos = filteredAndSortedConceptos.slice(startIndex, endIndex);

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
      setEditedConceptos({});
    }
  };

  const handleCellSave = async (conceptoId, field, newValue) => {
    try {
      let finalValue = newValue;
      
      // Convertir el nombre del tipo a ID si es necesario
      if (field === 'nombre_tipo_transaccion') {
        const tipoEncontrado = tiposTransaccion.find(t => t.tipo_transaccion === newValue);
        if (tipoEncontrado) {
          finalValue = tipoEncontrado.id_tipotransaccion;
          field = 'id_tipotransaccion'; // Cambiar el field para el backend
        }
      }

      // Actualizar el estado local inmediatamente
      setEditedConceptos(prev => ({
        ...prev,
        [conceptoId]: {
          ...prev[conceptoId],
          [field]: finalValue
        }
      }));

      // Marcar como pendiente
      setPendingChanges(prev => new Set([...prev, conceptoId]));

      // Hacer la actualización en el servidor
      const response = await fetch(`/api/conceptos-transacciones/${conceptoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: finalValue })
      });

      if (response.ok) {
        // Remover de cambios pendientes si se guardó exitosamente
        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(conceptoId);
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
    
    for (const conceptoId of pendingChanges) {
      const editedData = editedConceptos[conceptoId];
      if (editedData) {
        updates.push(
          fetch(`/api/conceptos-transacciones/${conceptoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedData)
          })
        );
      }
    }

    try {
      await Promise.all(updates);
      useToastToast({
        title: "Éxito",
        description: `Se actualizaron ${pendingChanges.size} conceptos de transacciones`,
      });
      
      setPendingChanges(new Set());
      setEditedConceptos({});
      cargarConceptosTransacciones();
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
    setEditedConceptos({});
    
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
        dataToExport = filteredAndSortedConceptos;
      } else {
        dataToExport = conceptosTransacciones;
      }

      // Formatear datos para exportación
      const exportData = dataToExport.map(concepto => ({
        'ID': concepto.id_concepto,
        'Tipo de Transacción': concepto.nombre_tipo_transaccion || '',
        'Código DIAN': concepto.codigo_dian || '',
        'Concepto DIAN': concepto.concepto_dian || ''
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Conceptos Transacciones');

      // Guardar archivo
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `conceptos_transacciones_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success(`Exportados ${exportData.length} conceptos de transacciones correctamente`);
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

        // Buscar el tipo de transacción por nombre
        const tipoNombre = mapColumn([
          'Tipo de Transacción', 'tipo_transaccion', 'Tipo Transaccion',
          'nombre_tipo_transaccion', 'Tipo', 'tipo'
        ]);
        
        const tipoTransaccion = tiposTransaccion.find(
          t => t.tipo_transaccion === tipoNombre
        );

        return {
          id_tipotransaccion: tipoTransaccion?.id_tipotransaccion || null,
          codigo_dian: mapColumn([
            'Código DIAN', 'codigo_dian', 'Codigo DIAN', 'Código', 'codigo'
          ]),
          concepto_dian: mapColumn([
            'Concepto DIAN', 'concepto_dian', 'Concepto', 'concepto',
            'Descripción', 'descripcion', 'Detalle', 'detalle'
          ])
        };
      });

      // Filtrar filas válidas (que tengan al menos concepto_dian)
      const validData = mappedData.filter(row => 
        row.concepto_dian && row.concepto_dian.toString().trim() !== ''
      );

      if (validData.length === 0) {
        toast.error('No se encontraron registros válidos para importar');
        return;
      }

      // Enviar al backend
      const response = await fetch('/api/conceptos-transacciones/bulk-create', {
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
      toast.success(`Se importaron ${result.created} conceptos de transacciones correctamente`);
      setShowImportDialog(false);
      cargarConceptosTransacciones(); // Recargar datos
    } catch (error) {
      console.error('Error al importar:', error);
      toast.error(`Error al importar: ${error.message}`);
    }
  };

  // Cálculos para widgets mejorados
  const cantidadConceptos = conceptosTransacciones.length;
  const conceptosConCodigo = conceptosTransacciones.filter(c => c.codigo_dian).length;
  const conceptoMasReciente = conceptosTransacciones.length > 0 ? conceptosTransacciones[0] : null;
  const nombreMasReciente = conceptoMasReciente?.concepto_dian || '-';
  
  // Estadísticas por tipo
  const tipoStats = conceptosTransacciones.reduce((acc, concepto) => {
    const tipo = concepto.nombre_tipo_transaccion || 'Sin tipo';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Conceptos</div>
            <div className="text-2xl font-bold">{cantidadConceptos}</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Con Código DIAN</div>
            <div className="text-2xl font-bold">{conceptosConCodigo}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Code className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Más Reciente</div>
            <div className="text-lg font-bold truncate">{nombreMasReciente}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Conceptos de Transacciones</h1>
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
          
        <Button onClick={() => setDialogoCrear(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Concepto
        </Button>
          
          {/* Botones de Importar/Exportar */}
          <Button 
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="border-green-400 text-green-600 hover:bg-green-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="border-blue-400 text-blue-600 hover:bg-blue-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Excel
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
            {paginatedConceptos.map((concepto, idx) => (
              <TableRow 
                key={concepto.id_concepto} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition
                  ${pendingChanges.has(concepto.id_concepto) ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                `}
              >
                {availableColumns.map(column => {
                  if (!visibleColumns[column.key]) return null;
                  
                  const fieldType = getFieldType(column.key);
                  
                  // Obtener el valor actual correctamente para cada tipo de campo
                  let currentValue;
                  if (column.key === 'nombre_tipo_transaccion') {
                    // Para el tipo de transacción, necesitamos el ID, no el nombre
                    currentValue = editedConceptos[concepto.id_concepto]?.id_tipotransaccion ?? concepto.id_tipotransaccion;
                  } else {
                    currentValue = editedConceptos[concepto.id_concepto]?.[column.key] ?? getNestedValue(concepto, column.key);
                  }
                  
                  const hasChanges = pendingChanges.has(concepto.id_concepto);
                  
                  return (
                    <TableCell 
                      key={`${concepto.id_concepto}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCell
                          value={currentValue}
                          onSave={(newValue) => handleCellSave(concepto.id_concepto, column.key, newValue)}
                          field={column.key}
                          type={fieldType}
                          options={getFieldOptions(column.key)}
                          disabled={fieldType === 'disabled'}
                        />
                      ) : (
                        renderColumnValue(concepto, column.key)
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
                      onClick={() => handleVerConcepto(concepto)}
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-blue-400 hover:bg-blue-100"
                      onClick={() => handleEditarConcepto(concepto)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-red-400 hover:bg-red-100"
                      onClick={() => eliminarConceptoTransaccion(concepto.id_concepto)}
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
      <CrearConceptoTransaccionDialog
        open={dialogoCrear}
        onOpenChange={setDialogoCrear}
        onConceptoCreado={cargarConceptosTransacciones}
      />

      <EditarConceptoTransaccionDialog
        open={dialogoEditar}
        onOpenChange={setDialogoEditar}
        concepto={conceptoSeleccionado}
        onConceptoActualizado={cargarConceptosTransacciones}
      />

      <VerConceptoTransaccionDialog
        open={dialogoVer}
        onOpenChange={setDialogoVer}
        concepto={conceptoSeleccionado}
      />

      {/* Diálogos de Importación/Exportación */}
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        totalRecords={conceptosTransacciones.length}
        filteredRecords={filteredAndSortedConceptos.length}
        entityName="conceptos de transacciones"
      />

      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        entityName="conceptos de transacciones"
        templateData={[
          {
            'Tipo de Transacción': 'INGRESO',
            'Código DIAN': '01',
            'Concepto DIAN': 'Ventas de productos'
          },
          {
            'Tipo de Transacción': 'EGRESO',
            'Código DIAN': '02',
            'Concepto DIAN': 'Compra de materiales'
          }
        ]}
        columns={[
          { key: 'Tipo de Transacción', label: 'Tipo de Transacción', required: false },
          { key: 'Código DIAN', label: 'Código DIAN', required: false },
          { key: 'Concepto DIAN', label: 'Concepto DIAN', required: true }
        ]}
      />
    </div>
  );
};

export default ConceptosTransaccionesView; 