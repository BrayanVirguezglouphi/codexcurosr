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
import { Plus, Pencil, Trash2, Eye, BarChart2, DollarSign, Clock, FilterX, X, Grid3X3, Save, RotateCcw, Zap, Download, Upload, List } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CrearFacturaDialog from './facturas/CrearFacturaDialog';
import EditarFacturaDialog from './facturas/EditarFacturaDialog';
import VerFacturaDialog from './facturas/VerFacturaDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [isVerDialogOpen, setIsVerDialogOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [facturaVista, setFacturaVista] = useState(null);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [filters, setFilters] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedFacturas, setEditedFacturas] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { toast } = useToast();

  // Definir todas las columnas disponibles (basado en el modelo de Factura)
  const availableColumns = [
    { key: 'id_factura', label: 'ID Factura', required: false },
    { key: 'numero_factura', label: 'Número', required: true },
    { key: 'estatus_factura', label: 'Estado', required: true },
    { key: 'id_contrato', label: 'ID Contrato', required: false },
    { key: 'fecha_radicado', label: 'Fecha Radicado', required: true },
    { key: 'fecha_estimada_pago', label: 'Fecha Est. Pago', required: false },
    { key: 'id_moneda', label: 'ID Moneda', required: false },
    { key: 'subtotal_facturado_moneda', label: 'Subtotal', required: true },
    { key: 'id_tax', label: 'ID Tax', required: false },
    { key: 'valor_tax', label: 'IVA', required: false },
    { key: 'observaciones_factura', label: 'Observaciones', required: false }
  ];

  // Estado para controlar qué columnas están visibles (por defecto las principales)
  const [visibleColumns, setVisibleColumns] = useState({
    id_factura: false,
    numero_factura: true,
    estatus_factura: true,
    id_contrato: false,
    fecha_radicado: true,
    fecha_estimada_pago: true,
    id_moneda: false,
    subtotal_facturado_moneda: true,
    id_tax: false,
    valor_tax: true,
    observaciones_factura: true
  });

  // Cargar facturas
  const cargarFacturas = async () => {
    try {
      const response = await apiCall('/api/facturas');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      // Asegurar que data es un array
      if (Array.isArray(data)) {
        setFacturas(data);
      } else {
        console.error('La respuesta no es un array:', data);
        setFacturas([]);
        toast({
          title: "Error",
          description: "Formato de datos incorrecto del servidor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setFacturas([]);
      toast({
        title: "Error",
        description: `No se pudieron cargar las facturas: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Configuración de columnas para Excel (con ejemplos)
  const excelColumns = availableColumns.map(col => ({
    ...col,
    example: getExampleValue(col.key)
  }));

  // Columnas para plantilla (sin campos auto-incrementales)
  const templateColumns = availableColumns
    .filter(col => col.key !== 'id_factura') // Excluir id_factura porque es auto-incrementable
    .map(col => ({
      ...col,
      example: getExampleValue(col.key)
    }));

  // Función para obtener valores de ejemplo para la plantilla
  function getExampleValue(columnKey) {
    switch (columnKey) {
      case 'id_factura':
        return '1';
      case 'numero_factura':
        return 'FAC-2024-001';
      case 'estatus_factura':
        return 'PENDIENTE';
      case 'id_contrato':
        return '1';
      case 'fecha_radicado':
        return '2024-01-15';
      case 'fecha_estimada_pago':
        return '2024-02-15';
      case 'id_moneda':
        return '1';
      case 'subtotal_facturado_moneda':
        return '1000000';
      case 'id_tax':
        return '1';
      case 'valor_tax':
        return '190000';
      case 'observaciones_factura':
        return 'Observaciones de la factura';
      default:
        return 'Ejemplo';
    }
  }

  // Función para manejar la exportación
  const handleExport = async (exportType) => {
    try {
      const dataToExport = exportType === 'filtered' ? processedFacturas : facturas;
      const fileName = `facturas-${new Date().toISOString().split('T')[0]}`;
      
      // Preparar datos para exportación
      const exportData = dataToExport.map(factura => {
        const exportRow = {};
        availableColumns
          .filter(col => visibleColumns[col.key])
          .forEach(col => {
            let value = factura[col.key];
            
            // Formatear valores especiales
            if (col.key.includes('fecha') && value) {
              value = new Date(value).toLocaleDateString('es-CO');
            } else if (col.key.includes('moneda') || col.key.includes('valor') || col.key.includes('subtotal')) {
              value = value ? parseFloat(value) : 0;
            }
            
            exportRow[col.label] = value || '';
          });
        return exportRow;
      });

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Ajustar ancho de columnas
      const columnWidths = availableColumns
        .filter(col => visibleColumns[col.key])
        .map(col => ({
          wch: Math.max(col.label.length, 15)
        }));
      ws['!cols'] = columnWidths;
      
      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
      
      // Generar archivo y descargar
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `${fileName}.xlsx`);
      
      toast({
        title: "Éxito",
        description: `${dataToExport.length} facturas exportadas correctamente`,
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el archivo Excel",
        variant: "destructive",
      });
    }
  };

  // Función para manejar la importación de Excel
  const handleImport = async (file) => {
    setIsImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('El archivo está vacío');
      }

      // Procesar datos
      const processedData = jsonData.map((row, index) => {
        const processedRow = {};
        
        // Mapear columnas del Excel a campos de la base de datos
        availableColumns.forEach(col => {
          let value = row[col.label];
          
          if (value === undefined || value === '') {
            value = null;
          }
          
          // Convertir tipos de datos
          if (col.key.includes('fecha') && value !== null) {
            if (typeof value === 'number') {
              const excelDate = new Date((value - 25569) * 86400 * 1000);
              processedRow[col.key] = excelDate.toISOString().split('T')[0];
            } else if (typeof value === 'string') {
              const parsedDate = new Date(value);
              processedRow[col.key] = isNaN(parsedDate) ? null : parsedDate.toISOString().split('T')[0];
            } else {
              processedRow[col.key] = null;
            }
          } else if (col.key.includes('moneda') || col.key.includes('valor') || col.key.includes('subtotal')) {
            if (value === null || value === '' || isNaN(value)) {
              processedRow[col.key] = null;
            } else {
              processedRow[col.key] = parseFloat(value);
            }
          } else {
            processedRow[col.key] = value;
          }
        });
        
        return processedRow;
      });

      // Enviar datos al servidor
      const response = await fetch('/api/facturas/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facturas: processedData }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `${processedData.length} facturas importadas correctamente`,
        });
        cargarFacturas();
      } else {
        throw new Error(result.message || 'Error al importar datos');
      }
    } catch (error) {
      console.error('Error al importar:', error);
      toast({
        title: "Error",
        description: `Error al importar: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setIsImportDialogOpen(false);
    }
  };

  // Función para manejar la importación de Excel (versión anterior)
  const handleImportExcel = async (importedData) => {
    try {
      console.log('=== INICIO DE IMPORTACIÓN ===');
      console.log('Datos recibidos del Excel:', importedData);
      
      // Limpiar datos antes de enviar (eliminar campos auto-incrementales y campos vacíos)
      const cleanedData = importedData.map(factura => {
        const { id_factura, _rowIndex, ...cleanedFactura } = factura;
        
        // Convertir valores vacíos o undefined a null
        Object.keys(cleanedFactura).forEach(key => {
          if (cleanedFactura[key] === '' || cleanedFactura[key] === undefined) {
            cleanedFactura[key] = null;
          }
        });
        
        return cleanedFactura;
      });

      console.log('Datos limpiados para enviar:', cleanedData);
      console.log('JSON que se enviará:', JSON.stringify({ facturas: cleanedData }, null, 2));

      const response = await fetch('/api/facturas/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facturas: cleanedData }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok || response.status === 207) {
        // Mostrar resultados detallados
        if (result.resultados.errores.length > 0) {
          console.log('=== ERRORES DETALLADOS ===');
          result.resultados.errores.forEach((error, index) => {
            console.log(`Error ${index + 1}:`, error);
            console.log(`- Fila: ${error.fila}`);
            console.log(`- Error: ${error.error}`);
            console.log(`- Datos: `, error.data);
          });
          
          toast({
            title: "Importación Completada con Advertencias",
            description: `${result.resultados.exitosas.length} facturas importadas, ${result.resultados.errores.length} errores. Revisa la consola para detalles.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Importación Exitosa",
            description: `${result.resultados.exitosas.length} facturas importadas correctamente`,
          });
        }

        // Recargar las facturas
        cargarFacturas();
      } else {
        throw new Error(result.message || 'Error en la importación');
      }
    } catch (error) {
      console.error('=== ERROR EN IMPORTACIÓN ===');
      console.error('Tipo de error:', error.constructor.name);
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
      
      toast({
        title: "Error",
        description: `Error al importar facturas: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, []);

  // Eliminar factura
  const eliminarFactura = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        const response = await fetch(`/api/facturas/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Factura eliminada correctamente",
          });
          cargarFacturas();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la factura",
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

  // Formatear moneda
  const formatearMoneda = (valor) => {
    if (!valor) return '0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  };

  // Función para renderizar el valor de una columna
  const renderColumnValue = (factura, columnKey) => {
    const value = factura[columnKey];
    
    switch (columnKey) {
      case 'fecha_radicado':
      case 'fecha_estimada_pago':
        return formatearFecha(value);
      case 'subtotal_facturado_moneda':
      case 'valor_tax':
        return formatearMoneda(value);
      case 'id_factura':
      case 'id_contrato':
      case 'id_moneda':
      case 'id_tax':
        return value || '—';
      default:
        return value || '—';
    }
  };

  // Definir tipos de campo para edición
  const getFieldType = (columnKey) => {
    switch (columnKey) {
      case 'fecha_radicado':
      case 'fecha_estimada_pago':
        return 'date';
      case 'subtotal_facturado_moneda':
      case 'valor_tax':
        return 'currency';
      case 'estatus_factura':
        return 'select';
      case 'id_factura':
        return 'disabled'; // No editable
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos tipo select
  const getFieldOptions = (columnKey) => {
    switch (columnKey) {
      case 'estatus_factura':
        return [
          { value: 'PENDIENTE', label: 'PENDIENTE' },
          { value: 'PAGADA', label: 'PAGADA' },
          { value: 'ANULADA', label: 'ANULADA' },
          { value: 'VENCIDA', label: 'VENCIDA' }
        ];
      default:
        return [];
    }
  };

  // Manejar ordenamiento
  const handleSort = (field, direction) => {
    setSortConfig({ field, direction });
    setCurrentPage(1); // Resetear a la primera página al ordenar
  };

  // Manejar filtros
  const handleFilter = (field, values) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Si no hay valores o están todos seleccionados, eliminar el filtro
      if (!values || values.length === 0) {
        delete newFilters[field];
      } else {
        newFilters[field] = values;
      }
      
      return newFilters;
    });
    // Resetear a la primera página cuando se aplican filtros
    setCurrentPage(1);
  };

  // Obtener datos para filtros de una columna específica (considerando otros filtros activos)
  const getFilterData = (targetField) => {
    let result = [...facturas];

    // Aplicar todos los filtros EXCEPTO el del campo objetivo
    Object.entries(filters).forEach(([field, values]) => {
      if (field !== targetField && values && values.length > 0) {
        result = result.filter(factura => {
          let fieldValue = factura[field];
          
          // Manejar fechas
          if (field === 'fecha_radicado' || field === 'fecha_estimada_pago') {
            fieldValue = formatearFecha(fieldValue);
          }
          // Manejar monedas
          else if (field === 'subtotal_facturado_moneda' || field === 'valor_tax') {
            fieldValue = formatearMoneda(fieldValue);
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

  // Procesar datos (filtrar, ordenar y paginar)
  const { processedFacturas, totalFilteredItems, paginatedFacturas } = useMemo(() => {
    let result = [...facturas];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        result = result.filter(factura => {
          let fieldValue = factura[field];
          
          // Manejar fechas
          if (field === 'fecha_radicado' || field === 'fecha_estimada_pago') {
            fieldValue = formatearFecha(fieldValue);
          }
          // Manejar monedas
          else if (field === 'subtotal_facturado_moneda' || field === 'valor_tax') {
            fieldValue = formatearMoneda(fieldValue);
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

        // Manejar fechas
        if (sortConfig.field === 'fecha_radicado' || sortConfig.field === 'fecha_estimada_pago') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }
        // Manejar números
        else if (sortConfig.field === 'subtotal_facturado_moneda' || sortConfig.field === 'valor_tax') {
          aValue = parseFloat(aValue || 0);
          bValue = parseFloat(bValue || 0);
        }
        // Manejar strings
        else {
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

    // Guardar total de items filtrados antes de paginar
    const totalFilteredItems = result.length;

    // Aplicar paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFacturas = result.slice(startIndex, endIndex);

    return {
      processedFacturas: result, // Todos los datos procesados (para filtros)
      totalFilteredItems,       // Total después de filtros (para paginación)
      paginatedFacturas        // Solo la página actual (para mostrar)
    };
  }, [facturas, filters, sortConfig, currentPage, itemsPerPage]);

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ field: null, direction: null });
    setCurrentPage(1); // Volver a la primera página al limpiar filtros
  };

  // Funciones de paginación
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Volver a la primera página al cambiar items por página
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.keys(filters).length > 0 || sortConfig.field;

  // Funciones para modo de edición masiva
  const toggleGridEditMode = () => {
    if (isGridEditMode && pendingChanges.size > 0) {
      if (window.confirm('¿Deseas salir del modo edición? Se perderán los cambios no guardados.')) {
        setIsGridEditMode(false);
        setEditedFacturas({});
        setPendingChanges(new Set());
      }
    } else {
      setIsGridEditMode(!isGridEditMode);
      setEditedFacturas({});
      setPendingChanges(new Set());
    }
  };

  const handleCellSave = async (facturaId, field, newValue) => {
    // Actualizar el estado local
    setEditedFacturas(prev => ({
      ...prev,
      [facturaId]: {
        ...prev[facturaId],
        [field]: newValue
      }
    }));

    // Marcar como cambio pendiente
    setPendingChanges(prev => new Set([...prev, facturaId]));

    // Actualizar inmediatamente en la base de datos
    try {
      const updatedData = { [field]: newValue };
      const response = await fetch(`/api/facturas/${facturaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        // Actualizar la factura en el estado local
        setFacturas(prev => prev.map(f => 
          f.id_factura === facturaId 
            ? { ...f, [field]: newValue }
            : f
        ));

        // Remover de cambios pendientes
        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(facturaId);
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
      const updatePromises = Array.from(pendingChanges).map(facturaId => {
        const changes = editedFacturas[facturaId];
        return fetch(`/api/facturas/${facturaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(changes),
        });
      });

      await Promise.all(updatePromises);
      
      // Recargar datos
      await cargarFacturas();
      
      // Limpiar cambios pendientes
      setEditedFacturas({});
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
      setEditedFacturas({});
      setPendingChanges(new Set());
      cargarFacturas(); // Recargar datos originales
    }
  };

  // Cálculos para widgets (usando datos filtrados)
  const cantidadFacturas = totalFilteredItems;
  const sumaSubtotales = processedFacturas.reduce((acc, f) => acc + (parseFloat(f.subtotal_facturado_moneda) || 0), 0);
  const facturaMasReciente = processedFacturas.length > 0 ? processedFacturas[0] : null;
  const fechaMasReciente = facturaMasReciente ? formatearFecha(facturaMasReciente.fecha_radicado) : '-';
  const numeroMasReciente = facturaMasReciente ? facturaMasReciente.numero_factura : '-';

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6 overflow-x-auto">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        {/* Cantidad de facturas */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Cantidad de Facturas</div>
            <div className="text-2xl font-bold">{cantidadFacturas}</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {/* Suma de subtotales */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Suma de Subtotales</div>
            <div className="text-2xl font-bold">{formatearMoneda(sumaSubtotales)}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
        {/* Más reciente */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Factura Más Reciente</div>
            <div className="text-lg font-bold">{numeroMasReciente}</div>
            <div className="text-2xl font-bold">{fechaMasReciente}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Facturas</h1>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm text-gray-600">
                Página {currentPage} - Mostrando {paginatedFacturas.length} de {totalFilteredItems} facturas filtradas
                {totalFilteredItems !== facturas.length && (
                  <span className="text-gray-500"> (de {facturas.length} total)</span>
                )}
              </span>
              
              {/* Mostrar filtros activos */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500">Filtros activos:</span>
                {Object.entries(filters).map(([field, values]) => {
                  // Mapear nombres de campos a nombres legibles
                  const fieldNames = {
                    'numero_factura': 'Número',
                    'estatus_factura': 'Estado', 
                    'fecha_radicado': 'Fecha Radicado',
                    'fecha_estimada_pago': 'Fecha Est. Pago',
                    'subtotal_facturado_moneda': 'Subtotal',
                    'valor_tax': 'IVA',
                    'observaciones_factura': 'Observaciones'
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

          {/* Botones de importación/exportación */}
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


          
          <Button onClick={() => setIsCrearDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
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
            {paginatedFacturas.map((factura, idx) => (
              <TableRow key={factura.id_factura} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50 transition'}>
                {/* Renderizar celdas dinámicamente basado en columnas visibles */}
                {availableColumns.map(column => {
                  if (!visibleColumns[column.key]) return null;
                  
                  const fieldType = getFieldType(column.key);
                  const currentValue = editedFacturas[factura.id_factura]?.[column.key] ?? factura[column.key];
                  const hasChanges = pendingChanges.has(factura.id_factura);
                  
                  return (
                    <TableCell 
                      key={`${factura.id_factura}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCell
                          value={currentValue}
                          onSave={(newValue) => handleCellSave(factura.id_factura, column.key, newValue)}
                          field={column.key}
                          type={fieldType}
                          options={getFieldOptions(column.key)}
                          disabled={fieldType === 'disabled'}
                        />
                      ) : (
                        renderColumnValue(factura, column.key)
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
                        setFacturaVista(factura);
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
                      setFacturaSeleccionada(factura);
                      setIsEditarDialogOpen(true);
                    }}
                  >
                      <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                      variant="outline"
                    size="icon"
                      className="border-red-400 hover:bg-red-100"
                    onClick={() => eliminarFactura(factura.id_factura)}
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

      {isCrearDialogOpen && (
        <CrearFacturaDialog
          open={isCrearDialogOpen}
          onClose={() => setIsCrearDialogOpen(false)}
          onFacturaCreada={cargarFacturas}
          />
      )}

      {isEditarDialogOpen && facturaSeleccionada && (
        <EditarFacturaDialog
          open={isEditarDialogOpen}
          onClose={() => {
            setIsEditarDialogOpen(false);
            setFacturaSeleccionada(null);
          }}
          factura={facturaSeleccionada}
          onFacturaActualizada={cargarFacturas}
        />
      )}

      <VerFacturaDialog
        open={isVerDialogOpen}
        onClose={() => {
          setIsVerDialogOpen(false);
          setFacturaVista(null);
        }}
        factura={facturaVista}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        totalRecords={facturas.length}
        filteredRecords={processedFacturas.length}
        entityName="facturas"
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        loading={isImporting}
        entityName="facturas"
        columns={templateColumns}
        templateData={[{
          'Número': 'FAC-2024-001',
          'Estado': 'PENDIENTE',
          'ID Contrato': '1',
          'Fecha Radicado': '2024-01-15',
          'Fecha Est. Pago': '2024-02-15',
          'ID Moneda': '1',
          'Subtotal': '1000000',
          'ID Tax': '1',
          'IVA': '190000',
          'Observaciones': 'Observaciones de la factura'
        }]}
      />
    </div>
  );
};

export default Facturas;
