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
import { Plus, Pencil, Trash2, Eye, BarChart2, FileText, Calendar, FilterX, X, Grid3X3, Save, RotateCcw, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CrearImpuestoDialog from './impuestos/CrearImpuestoDialog';
import EditarImpuestoDialog from './impuestos/EditarImpuestoDialog';
import VerImpuestoDialog from './impuestos/VerImpuestoDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';
import { toast as toastImport } from 'react-hot-toast';
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';

const Impuestos = () => {
  const [impuestos, setImpuestos] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [isVerDialogOpen, setIsVerDialogOpen] = useState(false);
  const [impuestoSeleccionado, setImpuestoSeleccionado] = useState(null);
  const [impuestoVisto, setImpuestoVisto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para filtros y ordenamiento
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  
  // Estados para visibilidad de columnas
  const [visibleColumns, setVisibleColumns] = useState({});
  
  // Estados para modo edición masiva
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedImpuestos, setEditedImpuestos] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());

  // Estados para exportación/importación
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const { toast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_tax', label: 'ID', required: true },
    { key: 'titulo_impuesto', label: 'Título del Impuesto', required: true },
    { key: 'tipo_obligacion', label: 'Tipo de Obligación' },
    { key: 'institucion_reguladora', label: 'Institución Reguladora' },
    { key: 'periodicidad_declaracion', label: 'Periodicidad' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_inicio_impuesto', label: 'Fecha Inicio' },
    { key: 'fecha_final_impuesto', label: 'Fecha Fin' },
    { key: 'formula_aplicacion', label: 'Fórmula' },
    { key: 'observaciones', label: 'Observaciones' }
  ];

  // Inicializar columnas visibles por defecto
  useEffect(() => {
    const defaultColumns = {};
    availableColumns.forEach(col => {
      // Mostrar solo las columnas principales por defecto
      defaultColumns[col.key] = ['id_tax', 'titulo_impuesto', 'tipo_obligacion', 'institucion_reguladora', 'periodicidad_declaracion', 'estado', 'fecha_inicio_impuesto'].includes(col.key);
    });
    setVisibleColumns(defaultColumns);
  }, []);

  // Cargar impuestos
  const cargarImpuestos = async () => {
    try {
      const response = await apiCall('/api/impuestos');
      const data = await response.json();
      setImpuestos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los impuestos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarImpuestos();
  }, []);

  // Función de exportación
  const handleExport = async (exportType) => {
    try {
      const dataToExport = exportType === 'filtered' ? processedImpuestos : impuestos;
      const fileName = `impuestos-${new Date().toISOString().split('T')[0]}`;
      
      // Importación dinámica de XLSX y file-saver
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      // Formatear datos para exportación
      const formattedData = dataToExport.map(impuesto => ({
        'ID': impuesto.id_tax,
        'Título del Impuesto': impuesto.titulo_impuesto,
        'Tipo de Obligación': impuesto.tipo_obligacion || '',
        'Institución Reguladora': impuesto.institucion_reguladora || '',
        'Periodicidad': impuesto.periodicidad_declaracion || '',
        'Estado': impuesto.estado || '',
        'Fecha Inicio': impuesto.fecha_inicio_impuesto ? formatearFecha(impuesto.fecha_inicio_impuesto) : '',
        'Fecha Fin': impuesto.fecha_final_impuesto ? formatearFecha(impuesto.fecha_final_impuesto) : '',
        'Fórmula de Aplicación': impuesto.formula_aplicacion || '',
        'Observaciones': impuesto.observaciones || ''
      }));
      
      // Crear libro de trabajo
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Impuestos');
      
      // Generar archivo y descargar
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
      
      setIsExportDialogOpen(false);
      toastImport.success(`${dataToExport.length} registros exportados exitosamente`);
    } catch (error) {
      console.error('Error al exportar:', error);
      toastImport.error('Error al exportar los datos');
    }
  };

  // Función de importación
  const handleImport = async (file) => {
    setIsImporting(true);
    try {
      // Importación dinámica de XLSX
      const XLSX = await import('xlsx');
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            toastImport.error('No se encontraron datos válidos en el archivo');
            setIsImporting(false);
            return;
          }

          // Mapeo automático de columnas
          const columnMappings = {
            'titulo_impuesto': ['titulo_impuesto', 'titulo', 'title', 'nombre', 'name'],
            'tipo_obligacion': ['tipo_obligacion', 'tipo', 'type'],
            'institucion_reguladora': ['institucion_reguladora', 'institucion', 'institution'],
            'periodicidad_declaracion': ['periodicidad_declaracion', 'periodicidad', 'periodicity'],
            'estado': ['estado', 'status', 'state'],
            'formula_aplicacion': ['formula_aplicacion', 'formula'],
            'observaciones': ['observaciones', 'comments', 'notes']
          };

          // Procesar y crear impuestos
          const nuevosImpuestos = jsonData.map(row => {
            const mappedRow = {};
            
            // Mapear columnas automáticamente
            Object.entries(columnMappings).forEach(([targetColumn, possibleNames]) => {
              for (const possibleName of possibleNames) {
                const foundKey = Object.keys(row).find(key => 
                  key.toLowerCase().includes(possibleName.toLowerCase())
                );
                if (foundKey && row[foundKey]) {
                  mappedRow[targetColumn] = row[foundKey];
                  break;
                }
              }
            });

            return {
              titulo_impuesto: mappedRow.titulo_impuesto?.toString().trim(),
              tipo_obligacion: mappedRow.tipo_obligacion?.toString().trim() || null,
              institucion_reguladora: mappedRow.institucion_reguladora?.toString().trim() || null,
              periodicidad_declaracion: mappedRow.periodicidad_declaracion?.toString().trim() || null,
              estado: mappedRow.estado?.toString().trim().toUpperCase() || 'ACTIVO',
              formula_aplicacion: mappedRow.formula_aplicacion?.toString().trim() || null,
              observaciones: mappedRow.observaciones?.toString().trim() || null
            };
          }).filter(impuesto => impuesto.titulo_impuesto);

          // Validar estados válidos
          const estadosValidos = ['ACTIVO', 'INACTIVO', 'PENDIENTE'];
          nuevosImpuestos.forEach(impuesto => {
            if (!estadosValidos.includes(impuesto.estado)) {
              impuesto.estado = 'ACTIVO';
            }
          });

          if (nuevosImpuestos.length === 0) {
            toastImport.error('No se encontraron registros válidos para importar');
            setIsImporting(false);
            return;
          }

          // Enviar al backend
          const response = await fetch('/api/impuestos/bulk-create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ impuestos: nuevosImpuestos }),
          });

          if (response.ok) {
            await cargarImpuestos();
            setIsImportDialogOpen(false);
            toastImport.success(`${nuevosImpuestos.length} impuestos importados exitosamente`);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al importar los impuestos');
          }
        } catch (error) {
          console.error('Error al procesar el archivo:', error);
          toastImport.error('Error al procesar el archivo de importación');
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error al importar:', error);
      toastImport.error('Error al importar los datos');
      setIsImporting(false);
    }
  };

  // Eliminar impuesto
  const eliminarImpuesto = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este impuesto?')) {
      try {
        const response = await fetch(`/api/impuestos/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Impuesto eliminado correctamente",
          });
          cargarImpuestos();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el impuesto",
          variant: "destructive",
        });
      }
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
  };

  // Renderizar valor de columna
  const renderColumnValue = (impuesto, columnKey) => {
    const value = impuesto[columnKey];
    
    switch (columnKey) {
      case 'fecha_inicio_impuesto':
      case 'fecha_final_impuesto':
        return formatearFecha(value);
      case 'estado':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'ACTIVO' 
              ? 'bg-green-100 text-green-700' 
              : value === 'INACTIVO'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {value || 'Sin estado'}
          </span>
        );
      default:
        return value || '-';
    }
  };

  // Obtener tipo de campo para edición
  const getFieldType = (columnKey) => {
    switch (columnKey) {
      case 'id_tax':
        return 'disabled';
      case 'fecha_inicio_impuesto':
      case 'fecha_final_impuesto':
        return 'date';
      case 'estado':
        return 'select';
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos select
  const getFieldOptions = (columnKey) => {
    switch (columnKey) {
      case 'estado':
        return [
          { value: 'ACTIVO', label: 'Activo' },
          { value: 'INACTIVO', label: 'Inactivo' },
          { value: 'PENDIENTE', label: 'Pendiente' }
        ];
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
  const getFilterData = (targetField) => {
    let result = [...impuestos];

    Object.entries(filters).forEach(([field, values]) => {
      if (field !== targetField && values && values.length > 0) {
        result = result.filter(impuesto => {
          let fieldValue = impuesto[field];
          
          if (field === 'fecha_inicio_impuesto' || field === 'fecha_final_impuesto') {
            fieldValue = formatearFecha(fieldValue);
          }
          
          if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
            fieldValue = '(Vacío)';
          } else {
            fieldValue = String(fieldValue);
          }
          
          return values.includes(fieldValue);
        });
      }
    });

    return result;
  };

  // Funciones de paginación
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Procesar datos (filtrar, ordenar y paginar)
  const { processedImpuestos, totalFilteredItems, paginatedImpuestos } = useMemo(() => {
    let result = [...impuestos];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        result = result.filter(impuesto => {
          let fieldValue = impuesto[field];
          
          if (field === 'fecha_inicio_impuesto' || field === 'fecha_final_impuesto') {
            fieldValue = formatearFecha(fieldValue);
          }
          
          if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
            fieldValue = '(Vacío)';
          } else {
            fieldValue = String(fieldValue);
          }
          
          return values.includes(fieldValue);
        });
      }
    });

    // Aplicar ordenamiento
    if (sortConfig.field && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];

        if (sortConfig.field === 'fecha_inicio_impuesto' || sortConfig.field === 'fecha_final_impuesto') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        } else {
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    const totalFilteredItems = result.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedImpuestos = result.slice(startIndex, endIndex);

    return {
      processedImpuestos: result,
      totalFilteredItems,
      paginatedImpuestos
    };
  }, [impuestos, filters, sortConfig, currentPage, itemsPerPage]);

  // Limpiar filtros
  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ field: null, direction: null });
    setCurrentPage(1);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.keys(filters).length > 0 || sortConfig.field;

  // Funciones para modo de edición masiva
  const toggleGridEditMode = () => {
    if (isGridEditMode && pendingChanges.size > 0) {
      if (window.confirm('¿Deseas salir del modo edición? Se perderán los cambios no guardados.')) {
        setIsGridEditMode(false);
        setEditedImpuestos({});
        setPendingChanges(new Set());
      }
    } else {
      setIsGridEditMode(!isGridEditMode);
      setEditedImpuestos({});
      setPendingChanges(new Set());
    }
  };

  const handleCellSave = async (impuestoId, field, newValue) => {
    setEditedImpuestos(prev => ({
      ...prev,
      [impuestoId]: {
        ...prev[impuestoId],
        [field]: newValue
      }
    }));

    setPendingChanges(prev => new Set([...prev, impuestoId]));

    try {
      const updatedData = { [field]: newValue };
      const response = await fetch(`/api/impuestos/${impuestoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setImpuestos(prev => prev.map(i => 
          i.id_tax === impuestoId 
            ? { ...i, [field]: newValue }
            : i
        ));

        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(impuestoId);
          return newSet;
        });

        toast({
          title: "Cambio guardado",
          description: `Campo ${field} actualizado correctamente`,
        });
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cambio",
        variant: "destructive",
      });
    }
  };

  const saveAllPendingChanges = async () => {
    if (pendingChanges.size === 0) return;

    try {
      const updatePromises = Array.from(pendingChanges).map(impuestoId => {
        const changes = editedImpuestos[impuestoId];
        return fetch(`/api/impuestos/${impuestoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(changes),
        });
      });

      await Promise.all(updatePromises);
      
      await cargarImpuestos();
      
      setEditedImpuestos({});
      setPendingChanges(new Set());

      toast({
        title: "Éxito",
        description: `${pendingChanges.size} cambios guardados correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar algunos cambios",
        variant: "destructive",
      });
    }
  };

  const discardChanges = () => {
    if (window.confirm('¿Estás seguro de descartar todos los cambios pendientes?')) {
      setEditedImpuestos({});
      setPendingChanges(new Set());
      cargarImpuestos();
    }
  };

  // Cálculos para widgets (usando datos filtrados)
  const cantidadImpuestos = totalFilteredItems;
  const impuestosActivos = processedImpuestos.filter(i => i.estado === 'ACTIVO').length;
  const impuestoMasReciente = processedImpuestos.length > 0 ? processedImpuestos[0] : null;
  const fechaMasReciente = impuestoMasReciente?.fecha_inicio_impuesto ? formatearFecha(impuestoMasReciente.fecha_inicio_impuesto) : '-';
  const tituloMasReciente = impuestoMasReciente ? impuestoMasReciente.titulo_impuesto : '-';

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6 overflow-x-auto">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        {/* Cantidad de impuestos */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total de Impuestos</div>
            <div className="text-2xl font-bold">{cantidadImpuestos}</div>
            {Object.keys(filters).length > 0 && (
              <div className="text-xs text-blue-500">
                ({impuestos.length} total, {cantidadImpuestos} filtrados)
              </div>
            )}
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {/* Impuestos activos */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Impuestos Activos</div>
            <div className="text-2xl font-bold">{impuestosActivos}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
        </div>
        {/* Más reciente */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Impuesto Más Reciente</div>
            <div className="text-lg font-bold truncate">{tituloMasReciente}</div>
            <div className="text-2xl font-bold">{fechaMasReciente}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Impuestos</h1>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm text-gray-600">
                Página {currentPage} - Mostrando {paginatedImpuestos.length} de {totalFilteredItems} impuestos filtrados
                {totalFilteredItems !== impuestos.length && (
                  <span className="text-gray-500"> (de {impuestos.length} total)</span>
                )}
              </span>
              
              {/* Mostrar filtros activos */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500">Filtros activos:</span>
                {Object.entries(filters).map(([field, values]) => {
                  const fieldNames = {
                    'titulo_impuesto': 'Título',
                    'tipo_obligacion': 'Tipo',
                    'institucion_reguladora': 'Institución',
                    'periodicidad_declaracion': 'Periodicidad',
                    'estado': 'Estado',
                    'fecha_inicio_impuesto': 'Fecha Inicio',
                    'fecha_final_impuesto': 'Fecha Fin'
                  };
                  
                  const displayName = fieldNames[field] || field;
                  
                  return (
                    <div 
                      key={field}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      <span className="font-medium">{displayName}</span>
                      <span className="text-blue-600">({values.length})</span>
                      <button
                        onClick={() => handleFilter(field, [])}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        title={`Quitar filtro de ${displayName}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <FilterX className="mr-1 h-3 w-3" />
                Limpiar todos
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setIsExportDialogOpen(true)}
            variant="outline"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
          
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
          
          <Button onClick={() => setIsCrearDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Impuesto
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
              {/* Renderizar headers dinámicamente basado en columnas visibles */}
              {availableColumns.map(column => {
                if (!visibleColumns[column.key]) return null;
                
                return (
                  <TableHead key={column.key}>
                    <FilterableTableHeader
                      title={column.label}
                      data={getFilterData(column.key)}
                      field={column.key}
                      onSort={handleSort}
                      onFilter={handleFilter}
                      sortDirection={sortConfig.field === column.key ? sortConfig.direction : null}
                      activeFilters={filters[column.key] || []}
                    />
                  </TableHead>
                );
              })}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedImpuestos.map((impuesto, idx) => (
              <TableRow key={impuesto.id_tax} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50 transition'}>
                {/* Renderizar celdas dinámicamente basado en columnas visibles */}
                {availableColumns.map(column => {
                  if (!visibleColumns[column.key]) return null;
                  
                  const fieldType = getFieldType(column.key);
                  const currentValue = editedImpuestos[impuesto.id_tax]?.[column.key] ?? impuesto[column.key];
                  const hasChanges = pendingChanges.has(impuesto.id_tax);
                  
                  return (
                    <TableCell 
                      key={`${impuesto.id_tax}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCell
                          value={currentValue}
                          onSave={(newValue) => handleCellSave(impuesto.id_tax, column.key, newValue)}
                          field={column.key}
                          type={fieldType}
                          options={getFieldOptions(column.key)}
                          disabled={fieldType === 'disabled'}
                        />
                      ) : (
                        renderColumnValue(impuesto, column.key)
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
                        setImpuestoVisto(impuesto);
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
                        setImpuestoSeleccionado(impuesto);
                        setIsEditarDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-400 hover:bg-red-100"
                      onClick={() => eliminarImpuesto(impuesto.id_tax)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Componente de paginación avanzada */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalFilteredItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[10, 20, 30]}
        />
      </div>

      {/* Dialogs */}
      <CrearImpuestoDialog 
        open={isCrearDialogOpen}
        onClose={() => setIsCrearDialogOpen(false)}
        onImpuestoCreado={cargarImpuestos}
      />

      <EditarImpuestoDialog 
        open={isEditarDialogOpen}
        onClose={() => setIsEditarDialogOpen(false)}
        impuesto={impuestoSeleccionado}
        onImpuestoActualizado={cargarImpuestos}
      />

      <VerImpuestoDialog 
        open={isVerDialogOpen}
        onClose={() => setIsVerDialogOpen(false)}
        impuesto={impuestoVisto}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        totalRecords={impuestos.length}
        filteredRecords={processedImpuestos.length}
        entityName="impuestos"
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        loading={isImporting}
        tableName="impuestos"
        templateColumns={['titulo_impuesto', 'tipo_obligacion', 'institucion_reguladora', 'periodicidad_declaracion', 'estado']}
      />
    </div>
  );
};

export default Impuestos; 