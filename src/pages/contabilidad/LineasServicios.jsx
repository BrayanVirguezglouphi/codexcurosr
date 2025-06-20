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
import { Plus, Pencil, Trash2, Eye, BarChart2, Settings, Layers, FilterX, X, Grid3X3, Save, RotateCcw, Download, Upload, List } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import CrearLineaServicioDialog from './lineas-servicios/CrearLineaServicioDialog';
import EditarLineaServicioDialog from './lineas-servicios/EditarLineaServicioDialog';
import VerLineaServicioDialog from './lineas-servicios/VerLineaServicioDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';
import { toast as toastImport } from 'react-hot-toast';
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';

const LineasServicios = () => {
  const [lineasServicios, setLineasServicios] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [isVerDialogOpen, setIsVerDialogOpen] = useState(false);
  const [lineaServicioSeleccionada, setLineaServicioSeleccionada] = useState(null);
  const [lineaServicioVista, setLineaServicioVista] = useState(null);
  
  // Estados para funcionalidades avanzadas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedLineasServicios, setEditedLineasServicios] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const { toast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_servicio', label: 'ID', required: true },
    { key: 'servicio', label: 'Servicio', required: true },
    { key: 'tipo_servicio', label: 'Tipo de Servicio', required: true },
    { key: 'descripcion_servicio', label: 'Descripción' }
  ];

  // Inicializar columnas visibles por defecto
  useEffect(() => {
    const defaultColumns = {};
    availableColumns.forEach(col => {
      // Mostrar todas las columnas por defecto para esta página más simple
      defaultColumns[col.key] = true;
    });
    setVisibleColumns(defaultColumns);
  }, []);

  // Obtener valor anidado
  const getNestedValue = (obj, path) => {
    if (!path || typeof path !== 'string') return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Obtener etiqueta para tipo de servicio
  const getTipoServicioLabel = (tipo) => {
    const tipos = {
      'Internet': 'Internet',
      'Telefonía': 'Telefonía',
      'Televisión': 'Televisión',
      'Streaming': 'Streaming',
      'Seguridad': 'Seguridad',
      'Soporte': 'Soporte',
      'Cloud': 'Cloud',
      'IoT': 'IoT',
      'CONSULTORIA': 'Consultoría',
      'DESARROLLO': 'Desarrollo',
      'MANTENIMIENTO': 'Mantenimiento',
      'CAPACITACION': 'Capacitación',
      'ANALISIS': 'Análisis',
      'IMPLEMENTACION': 'Implementación',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  // Obtener color para tipo de servicio
  const getTipoServicioColor = (tipo) => {
    const colors = {
      'Internet': 'bg-blue-100 text-blue-700',
      'Telefonía': 'bg-green-100 text-green-700',
      'Televisión': 'bg-purple-100 text-purple-700',
      'Streaming': 'bg-red-100 text-red-700',
      'Seguridad': 'bg-orange-100 text-orange-700',
      'Soporte': 'bg-yellow-100 text-yellow-700',
      'Cloud': 'bg-cyan-100 text-cyan-700',
      'IoT': 'bg-indigo-100 text-indigo-700',
      'CONSULTORIA': 'bg-blue-100 text-blue-700',
      'DESARROLLO': 'bg-green-100 text-green-700',
      'MANTENIMIENTO': 'bg-orange-100 text-orange-700',
      'CAPACITACION': 'bg-purple-100 text-purple-700',
      'ANALISIS': 'bg-indigo-100 text-indigo-700',
      'IMPLEMENTACION': 'bg-pink-100 text-pink-700',
      'OTRO': 'bg-gray-100 text-gray-700'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-700';
  };

  // Renderizar valor de columna
  const renderColumnValue = (lineaServicio, columnKey) => {
    const value = getNestedValue(lineaServicio, columnKey);
    
    switch (columnKey) {
      case 'id_servicio':
        return <span className="font-medium">{value}</span>;
      case 'servicio':
        return <span className="font-medium">{value}</span>;
      case 'tipo_servicio':
        return value ? (
          <Badge className={getTipoServicioColor(value)}>
            {getTipoServicioLabel(value)}
          </Badge>
        ) : (
          <span className="text-gray-400">Sin tipo</span>
        );
      case 'descripcion_servicio':
        return (
          <div className="max-w-xs truncate" title={value}>
            {value || '-'}
          </div>
        );
      default:
        return value || '-';
    }
  };

  // Obtener tipo de campo para edición
  const getFieldType = (columnKey) => {
    switch (columnKey) {
      case 'id_servicio':
        return 'disabled';
      case 'tipo_servicio':
        return 'select';
      case 'descripcion_servicio':
        return 'textarea';
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos select
  const getFieldOptions = (columnKey) => {
    switch (columnKey) {
      case 'tipo_servicio':
        return [
          { value: 'Internet', label: 'Internet' },
          { value: 'Telefonía', label: 'Telefonía' },
          { value: 'Televisión', label: 'Televisión' },
          { value: 'Streaming', label: 'Streaming' },
          { value: 'Seguridad', label: 'Seguridad' },
          { value: 'Soporte', label: 'Soporte' },
          { value: 'Cloud', label: 'Cloud' },
          { value: 'IoT', label: 'IoT' },
          { value: 'CONSULTORIA', label: 'Consultoría' },
          { value: 'DESARROLLO', label: 'Desarrollo' },
          { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
          { value: 'CAPACITACION', label: 'Capacitación' },
          { value: 'ANALISIS', label: 'Análisis' },
          { value: 'IMPLEMENTACION', label: 'Implementación' },
          { value: 'OTRO', label: 'Otro' }
        ];
      default:
        return [];
    }
  };

  // Función de exportación
  const handleExport = async (exportType) => {
    try {
      const dataToExport = exportType === 'filtered' ? processedLineasServicios : lineasServicios;
      const fileName = `lineas-servicios-${new Date().toISOString().split('T')[0]}`;
      
      // Importación dinámica de XLSX y file-saver
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      // Formatear datos para exportación
      const formattedData = dataToExport.map(linea => ({
        'ID': linea.id_servicio,
        'Servicio': linea.servicio,
        'Tipo de Servicio': getTipoServicioLabel(linea.tipo_servicio),
        'Descripción': linea.descripcion_servicio || ''
      }));
      
      // Crear libro de trabajo
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Líneas de Servicios');
      
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
            'servicio': ['servicio', 'nombre', 'name', 'service'],
            'tipo_servicio': ['tipo_servicio', 'tipo', 'type', 'categoria', 'category'],
            'descripcion_servicio': ['descripcion_servicio', 'descripcion', 'description', 'desc']
          };

          // Procesar y crear líneas de servicios
          const newLineasServicios = jsonData.map(row => {
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
              servicio: mappedRow.servicio?.toString().trim(),
              tipo_servicio: mappedRow.tipo_servicio?.toString().trim().toUpperCase() || 'OTRO',
              descripcion_servicio: mappedRow.descripcion_servicio?.toString().trim() || ''
            };
          }).filter(linea => linea.servicio); // Filtrar filas sin servicio

          // Validar tipos de servicio válidos
          const tiposValidos = ['CONSULTORIA', 'DESARROLLO', 'SOPORTE', 'MANTENIMIENTO', 'CAPACITACION', 'ANALISIS', 'IMPLEMENTACION', 'OTRO'];
          newLineasServicios.forEach(linea => {
            if (!tiposValidos.includes(linea.tipo_servicio)) {
              linea.tipo_servicio = 'OTRO';
            }
          });

          if (newLineasServicios.length === 0) {
            toastImport.error('No se encontraron registros válidos para importar');
            setIsImporting(false);
            return;
          }

          // Enviar al backend
          const response = await fetch('/api/lineas-servicios/bulk-create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lineasServicios: newLineasServicios }),
          });

          if (response.ok) {
            await cargarLineasServicios();
            setIsImportDialogOpen(false);
            toastImport.success(`${newLineasServicios.length} líneas de servicios importadas exitosamente`);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al importar las líneas de servicios');
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

  // Cargar líneas de servicios
  const cargarLineasServicios = async () => {
    try {
      const data = await apiCall('/api/lineas-servicios');
      setLineasServicios(data);
    } catch (error) {
      console.error('Error al cargar líneas de servicios:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las líneas de servicios",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarLineasServicios();
  }, []);

  // Eliminar línea de servicio
  const eliminarLineaServicio = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta línea de servicio?')) {
      try {
        await apiCall(`/api/lineas-servicios/${id}`, {
          method: 'DELETE',
        });
        toast({
          title: "Éxito",
          description: "Línea de servicio eliminada correctamente",
        });
        cargarLineasServicios();
      } catch (error) {
        console.error('Error al eliminar línea de servicio:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la línea de servicio",
          variant: "destructive",
        });
      }
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
    let result = [...lineasServicios];

    Object.entries(filters).forEach(([field, values]) => {
      if (field !== targetField && values && values.length > 0) {
        result = result.filter(lineaServicio => {
          let fieldValue = getNestedValue(lineaServicio, field);
          
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
  const { processedLineasServicios, totalFilteredItems, paginatedLineasServicios } = useMemo(() => {
    let result = [...lineasServicios];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        result = result.filter(lineaServicio => {
          let fieldValue = getNestedValue(lineaServicio, field);
          
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
        let aValue = getNestedValue(a, sortConfig.field);
        let bValue = getNestedValue(b, sortConfig.field);

        if (sortConfig.field === 'id_servicio') {
          aValue = parseInt(aValue || 0);
          bValue = parseInt(bValue || 0);
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
    const paginatedLineasServicios = result.slice(startIndex, endIndex);

    return {
      processedLineasServicios: result,
      totalFilteredItems,
      paginatedLineasServicios
    };
  }, [lineasServicios, filters, sortConfig, currentPage, itemsPerPage]);

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
        setEditedLineasServicios({});
        setPendingChanges(new Set());
      }
    } else {
      setIsGridEditMode(!isGridEditMode);
      setEditedLineasServicios({});
      setPendingChanges(new Set());
    }
  };

  const handleCellSave = async (lineaServicioId, field, newValue) => {
    setEditedLineasServicios(prev => ({
      ...prev,
      [lineaServicioId]: {
        ...prev[lineaServicioId],
        [field]: newValue
      }
    }));

    setPendingChanges(prev => new Set([...prev, lineaServicioId]));

    try {
      const updatedData = { [field]: newValue };
      console.log('🔄 Actualizando línea de servicio:', { lineaServicioId, field, newValue });
      
      await apiCall(`/api/lineas-servicios/${lineaServicioId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });

      setLineasServicios(prev => prev.map(ls => 
        ls.id_servicio === lineaServicioId 
          ? { ...ls, [field]: newValue }
          : ls
      ));

      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(lineaServicioId);
        return newSet;
      });

      toast({
        title: "Cambio guardado",
        description: `Campo ${field} actualizado correctamente`,
      });
    } catch (error) {
      console.error('❌ Error al actualizar línea de servicio:', error);
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
      const updatePromises = Array.from(pendingChanges).map(lineaServicioId => {
        const changes = editedLineasServicios[lineaServicioId];
        return apiCall(`/api/lineas-servicios/${lineaServicioId}`, {
          method: 'PUT',
          body: JSON.stringify(changes),
        });
      });

      await Promise.all(updatePromises);
      
      await cargarLineasServicios();
      
      setEditedLineasServicios({});
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
      setEditedLineasServicios({});
      setPendingChanges(new Set());
      cargarLineasServicios();
    }
  };

  // Cálculos para widgets (usando datos filtrados)
  const cantidadServicios = totalFilteredItems;
  const tiposServicios = [...new Set(processedLineasServicios.map(s => s.tipo_servicio).filter(Boolean))].length;
  const servicioMasReciente = processedLineasServicios.length > 0 ? processedLineasServicios[0] : null;
  const nombreMasReciente = servicioMasReciente ? servicioMasReciente.servicio : '-';
  const tipoMasReciente = servicioMasReciente?.tipo_servicio ? getTipoServicioLabel(servicioMasReciente.tipo_servicio) : '-';

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6 overflow-x-auto">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        {/* Cantidad de servicios */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total de Servicios</div>
            <div className="text-2xl font-bold">{cantidadServicios}</div>
            {Object.keys(filters).length > 0 ? (
              <div className="text-xs text-blue-500">
                ({lineasServicios.length} total, {cantidadServicios} filtrados)
              </div>
            ) : (
              <div className="text-sm text-gray-500">Registrados en el sistema</div>
            )}
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {/* Tipos de servicios */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tipos de Servicios</div>
            <div className="text-2xl font-bold">{tiposServicios}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Layers className="w-6 h-6 text-green-600" />
          </div>
        </div>
        {/* Más reciente */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Servicio Más Reciente</div>
            <div className="text-lg font-bold truncate">{nombreMasReciente}</div>
            <div className="text-2xl font-bold">{tipoMasReciente}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Líneas de Servicios</h1>
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
          
          <Button onClick={() => setIsCrearDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Línea de Servicio
          </Button>
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center mb-6">
          <span className="text-sm font-medium text-blue-700">Filtros activos:</span>
          {Object.entries(filters).map(([field, values]) => (
            <div key={field} className="flex items-center gap-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {availableColumns.find(col => col.key === field)?.label || field}: {values.length}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 text-blue-600 hover:bg-blue-200"
                onClick={() => handleFilter(field, [])}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button 
            onClick={clearAllFilters}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <FilterX className="mr-1 h-3 w-3" />
            Limpiar todos
          </Button>
        </div>
      )}

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
            {paginatedLineasServicios.map((lineaServicio, idx) => (
              <TableRow 
                key={lineaServicio.id_servicio} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition
                  ${pendingChanges.has(lineaServicio.id_servicio) ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                `}
              >
                {availableColumns.map(column => {
                  if (!visibleColumns[column.key]) return null;
                  
                  const fieldType = getFieldType(column.key);
                  const currentValue = editedLineasServicios[lineaServicio.id_servicio]?.[column.key] ?? getNestedValue(lineaServicio, column.key);
                  const hasChanges = pendingChanges.has(lineaServicio.id_servicio);
                  
                  return (
                    <TableCell 
                      key={`${lineaServicio.id_servicio}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCell
                          value={currentValue}
                          onSave={(newValue) => handleCellSave(lineaServicio.id_servicio, column.key, newValue)}
                          field={column.key}
                          type={fieldType}
                          options={getFieldOptions(column.key)}
                          disabled={fieldType === 'disabled'}
                        />
                      ) : (
                        renderColumnValue(lineaServicio, column.key)
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
                        setLineaServicioVista(lineaServicio);
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
                        setLineaServicioSeleccionada(lineaServicio);
                        setIsEditarDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-400 hover:bg-red-100"
                      onClick={() => eliminarLineaServicio(lineaServicio.id_servicio)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Componente de paginación */}
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
      <CrearLineaServicioDialog 
        open={isCrearDialogOpen}
        onClose={() => setIsCrearDialogOpen(false)}
        onLineaServicioCreada={cargarLineasServicios}
      />

      <EditarLineaServicioDialog 
        open={isEditarDialogOpen}
        onClose={() => setIsEditarDialogOpen(false)}
        lineaServicio={lineaServicioSeleccionada}
        onLineaServicioActualizada={cargarLineasServicios}
      />

      <VerLineaServicioDialog 
        open={isVerDialogOpen}
        onClose={() => setIsVerDialogOpen(false)}
        lineaServicio={lineaServicioVista}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        totalRecords={lineasServicios.length}
        filteredRecords={processedLineasServicios.length}
        entityName="líneas de servicios"
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        loading={isImporting}
        tableName="líneas de servicios"
        templateColumns={['servicio', 'tipo_servicio', 'descripcion_servicio']}
      />
    </div>
  );
};

export default LineasServicios; 