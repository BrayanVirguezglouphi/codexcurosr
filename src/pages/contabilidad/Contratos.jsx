import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  DollarSign,
  Users,
  FilterX,
  X,
  Grid3X3,
  Save,
  RotateCcw,
  Download,
  Upload,
  List
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CrearContratoDialog from './contratos/CrearContratoDialog';
import EditarContratoDialog from './contratos/EditarContratoDialog';
import VerContratoDialog from './contratos/VerContratoDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [crearDialogOpen, setCrearDialogOpen] = useState(false);
  const [editarDialogOpen, setEditarDialogOpen] = useState(false);
  const [verDialogOpen, setVerDialogOpen] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  
  // Estados para funcionalidades avanzadas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedContratos, setEditedContratos] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Estados para catálogos
  const [terceros, setTerceros] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [impuestos, setImpuestos] = useState([]);
  
  const { toast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_contrato', label: 'ID', required: true },
    { key: 'fecha_contrato', label: 'Fecha Contrato', required: true },
    { key: 'numero_contrato_os', label: 'Número', required: true },
    { key: 'descripcion_servicio_contratado', label: 'Descripción', required: true },
    { key: 'estatus_contrato', label: 'Estado', required: true },
    { key: 'valor_cotizado', label: 'Valor', required: true },
    { key: 'modo_de_pago', label: 'Modo Pago' },
    { key: 'fecha_inicio_servicio', label: 'Fecha Inicio' },
    { key: 'fecha_final_servicio', label: 'Fecha Final' },
    { key: 'valor_descuento', label: 'Descuento' },
    { key: 'trm', label: 'TRM' },
    { key: 'valor_tax', label: 'Valor Tax' },
    { key: 'observaciones_contrato', label: 'Observaciones' },
    { key: 'url_cotizacion', label: 'URL Cotización' },
    { key: 'url_contrato', label: 'URL Contrato' }
  ];

  // Inicializar columnas visibles por defecto
  useEffect(() => {
    const defaultColumns = {};
    availableColumns.forEach(col => {
      // Mostrar solo las columnas principales por defecto
      defaultColumns[col.key] = ['id_contrato', 'fecha_contrato', 'numero_contrato_os', 'descripcion_servicio_contratado', 'estatus_contrato', 'valor_cotizado', 'modo_de_pago'].includes(col.key);
    });
    setVisibleColumns(defaultColumns);
  }, []);

  useEffect(() => {
    cargarContratos();
  }, []);

  const cargarContratos = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/contratos');
      setContratos(data);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      toast({ title: "Error", description: "No se pudieron cargar los contratos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este contrato?')) {
      try {
        await apiCall(`/api/contratos/${id}`, { method: 'DELETE' });
        toast({ title: "Éxito", description: "Contrato eliminado correctamente" });
        cargarContratos();
      } catch (error) {
        toast({ title: "Error", description: "No se pudo eliminar el contrato", variant: "destructive" });
      }
    }
  };

  const handleVer = (contrato) => {
    setContratoSeleccionado(contrato.id_contrato);
    setVerDialogOpen(true);
  };

  const handleEditar = (contrato) => {
    setContratoSeleccionado(contrato.id_contrato);
    setEditarDialogOpen(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearMoneda = (valor) => {
    if (!valor) return '$0.00';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  };

  // Obtener valor anidado (para campos como tercero.nombre)
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Renderizar valor de columna
  const renderColumnValue = (contrato, columnKey) => {
    const value = getNestedValue(contrato, columnKey);
    
    switch (columnKey) {
      case 'fecha_contrato':
      case 'fecha_inicio_servicio':
      case 'fecha_final_servicio':
        return formatearFecha(value);
      case 'valor_cotizado':
      case 'valor_descuento':
      case 'valor_tax':
      case 'trm':
        return formatearMoneda(value);
      case 'estatus_contrato':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'ACTIVO' ? 'bg-green-100 text-green-700' : 
            value === 'FINALIZADO' ? 'bg-blue-100 text-blue-700' : 
            'bg-yellow-100 text-yellow-700'
          }`}>
            {value || 'Sin estado'}
          </span>
        );
      case 'descripcion_servicio_contratado':
      case 'observaciones_contrato':
        return (
          <div className="max-w-xs truncate" title={value}>
            {value || '-'}
          </div>
        );
      case 'url_cotizacion':
      case 'url_contrato':
        return value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ver enlace
          </a>
        ) : '-';
      default:
        return value || '-';
    }
  };

  // Obtener tipo de campo para edición
  const getFieldType = (columnKey) => {
    switch (columnKey) {
      case 'id_contrato':
        return 'disabled';
      case 'fecha_contrato':
      case 'fecha_inicio_servicio':
      case 'fecha_final_servicio':
        return 'date';
      case 'valor_cotizado':
      case 'valor_descuento':
      case 'valor_tax':
      case 'trm':
        return 'currency';
      case 'estatus_contrato':
        return 'select';
      case 'descripcion_servicio_contratado':
      case 'observaciones_contrato':
        return 'textarea';
      case 'url_cotizacion':
      case 'url_contrato':
        return 'url';
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos select
  const getFieldOptions = (columnKey) => {
    switch (columnKey) {
      case 'estatus_contrato':
        return [
          { value: 'ACTIVO', label: 'ACTIVO' },
          { value: 'FINALIZADO', label: 'FINALIZADO' },
          { value: 'SUSPENDIDO', label: 'SUSPENDIDO' },
          { value: 'CANCELADO', label: 'CANCELADO' },
          { value: 'EN_NEGOCIACION', label: 'EN NEGOCIACION' }
        ];
      default:
        return [];
    }
  };

  // Función de exportación
  const handleExport = async (exportType) => {
    try {
      const dataToExport = exportType === 'filtered' ? processedContratos : contratos;
      const fileName = `contratos-${new Date().toISOString().split('T')[0]}`;
      
      // Preparar datos para exportación
      const exportData = dataToExport.map(contrato => {
        const exportRow = {};
        availableColumns
          .filter(col => visibleColumns[col.key])
          .forEach(col => {
            let value = getNestedValue(contrato, col.key);
            
            // Formatear valores especiales
            if (col.key.includes('fecha') && value) {
              value = new Date(value).toLocaleDateString('es-CO');
            } else if (col.key.includes('valor') || col.key === 'trm') {
              value = value ? parseFloat(value) : 0;
            }
            
            exportRow[col.label] = value || '';
          });
        return exportRow;
      });

      // Crear libro de trabajo (importación dinámica)
      const XLSX = await import('xlsx');
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
      XLSX.utils.book_append_sheet(wb, ws, 'Contratos');
      
      // Generar archivo y descargar
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Importar file-saver dinámicamente
      const { saveAs } = await import('file-saver');
      saveAs(blob, `${fileName}.xlsx`);
      
      toast({
        title: "Éxito",
        description: `${dataToExport.length} contratos exportados correctamente`,
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

  // Función de importación
  const handleImport = async (file) => {
    setIsImporting(true);
    
    try {
      const XLSX = await import('xlsx');
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
          } else if (col.key.includes('valor') || col.key === 'trm') {
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
      }).filter(row => row.numero_contrato_os && row.descripcion_servicio_contratado); // Filtrar registros válidos

      // Enviar datos al servidor (por ahora simular)
      console.log('Contratos a importar:', processedData);
      
      // Simular respuesta exitosa del servidor
      // En producción, aquí iría la llamada real al API
      
      // Agregar al estado local con IDs temporales
      const contratosConId = processedData.map((contrato, index) => ({
        ...contrato,
        id_contrato: Date.now() + index
      }));
      
      setContratos(prev => [...prev, ...contratosConId]);
      
      toast({
        title: "Éxito",
        description: `${processedData.length} contratos importados correctamente`,
      });
      
      cargarContratos(); // Recargar datos del servidor
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
    let result = [...contratos];

    Object.entries(filters).forEach(([field, values]) => {
      if (field !== targetField && values && values.length > 0) {
        result = result.filter(contrato => {
          let fieldValue = getNestedValue(contrato, field);
          
          if (field === 'fecha_contrato' || field === 'fecha_inicio_servicio' || field === 'fecha_final_servicio') {
            fieldValue = formatearFecha(fieldValue);
          } else if (field === 'valor_cotizado' || field === 'valor_descuento' || field === 'valor_tax' || field === 'trm') {
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

  // Funciones de paginación
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Procesar datos (filtrar, ordenar y paginar)
  const { processedContratos, totalFilteredItems, paginatedContratos } = useMemo(() => {
    let result = [...contratos];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        result = result.filter(contrato => {
          let fieldValue = getNestedValue(contrato, field);
          
          if (field === 'fecha_contrato' || field === 'fecha_inicio_servicio' || field === 'fecha_final_servicio') {
            fieldValue = formatearFecha(fieldValue);
          } else if (field === 'valor_cotizado' || field === 'valor_descuento' || field === 'valor_tax' || field === 'trm') {
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
        let aValue = getNestedValue(a, sortConfig.field);
        let bValue = getNestedValue(b, sortConfig.field);

        if (sortConfig.field === 'fecha_contrato' || sortConfig.field === 'fecha_inicio_servicio' || sortConfig.field === 'fecha_final_servicio') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        } else if (sortConfig.field === 'valor_cotizado' || sortConfig.field === 'valor_descuento' || sortConfig.field === 'valor_tax' || sortConfig.field === 'trm') {
          aValue = parseFloat(aValue || 0);
          bValue = parseFloat(bValue || 0);
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
    const paginatedContratos = result.slice(startIndex, endIndex);

    return {
      processedContratos: result,
      totalFilteredItems,
      paginatedContratos
    };
  }, [contratos, filters, sortConfig, currentPage, itemsPerPage]);

  // Limpiar filtros
  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ field: null, direction: null });
    setCurrentPage(1);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.keys(filters).length > 0 || sortConfig.field;

  // Calcular estadísticas (usando datos filtrados)
  const totalContratos = totalFilteredItems;
  const contratosActivos = processedContratos.filter(c => c.estatus_contrato === 'ACTIVO').length;
  const valorTotalContratos = processedContratos.reduce((sum, c) => sum + (parseFloat(c.valor_cotizado) || 0), 0);

  // Funciones para modo de edición masiva
  const toggleGridEditMode = () => {
    if (isGridEditMode && pendingChanges.size > 0) {
      if (window.confirm('¿Deseas salir del modo edición? Se perderán los cambios no guardados.')) {
        setIsGridEditMode(false);
        setEditedContratos({});
        setPendingChanges(new Set());
      }
    } else {
      setIsGridEditMode(!isGridEditMode);
      setEditedContratos({});
      setPendingChanges(new Set());
    }
  };

  const handleCellSave = async (contratoId, field, newValue) => {
    try {
      // Validar el tipo de dato según el campo
      const validatedValue = validateFieldValue(field, newValue);
      if (validatedValue.error) {
        throw new Error(validatedValue.error);
      }

      // Actualizar estado local primero para UI responsiva
      setEditedContratos(prev => ({
        ...prev,
        [contratoId]: {
          ...prev[contratoId],
          [field]: validatedValue.value
        }
      }));

      setPendingChanges(prev => new Set([...prev, contratoId]));

      // Formatear el valor según el tipo de campo
      const formattedValue = formatValueForUpdate(field, validatedValue.value);

      // Intentar actualizar en el servidor
      const response = await apiCall(`/api/contratos/${contratoId}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: formattedValue })
      });

      if (!response.error) {
        // Actualizar el estado global de contratos
        setContratos(prev => prev.map(c => 
          c.id_contrato === contratoId 
            ? { ...c, [field]: validatedValue.value }
            : c
        ));

        // Remover de cambios pendientes
        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(contratoId);
          return newSet;
        });

        toast({
          title: "Cambio guardado",
          description: `Campo ${field} actualizado correctamente`,
        });
      } else {
        throw new Error(response.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      
      // Revertir cambios locales en caso de error
      setEditedContratos(prev => {
        const newState = { ...prev };
        if (newState[contratoId]) {
          delete newState[contratoId][field];
          if (Object.keys(newState[contratoId]).length === 0) {
            delete newState[contratoId];
          }
        }
        return newState;
      });

      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(contratoId);
        return newSet;
      });

      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el cambio",
        variant: "destructive",
      });
    }
  };

  const formatValueForUpdate = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (field) {
      case 'valor_cotizado':
      case 'valor_descuento':
      case 'valor_tax':
      case 'trm':
        return parseFloat(value);

      case 'fecha_contrato':
      case 'fecha_inicio_servicio':
      case 'fecha_final_servicio':
        return new Date(value).toISOString().split('T')[0];

      case 'id_tercero':
      case 'id_moneda_cotizacion':
      case 'id_tax':
        return parseInt(value, 10);

      default:
        return value;
    }
  };

  const validateFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return { value: null };
    }

    switch (field) {
      case 'valor_cotizado':
      case 'valor_descuento':
      case 'valor_tax':
      case 'trm':
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return { error: 'El valor debe ser un número válido' };
        }
        return { value: numValue };

      case 'fecha_contrato':
      case 'fecha_inicio_servicio':
      case 'fecha_final_servicio':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { error: 'La fecha no es válida' };
        }
        return { value: date.toISOString() };

      case 'estatus_contrato':
        if (!estatusContratoOptions.includes(value)) {
          return { error: 'Estado no válido' };
        }
        return { value };

      case 'modo_de_pago':
        if (!modoPagoOptions.includes(value)) {
          return { error: 'Modo de pago no válido' };
        }
        return { value };

      default:
        return { value };
    }
  };

  const saveAllPendingChanges = async () => {
    if (pendingChanges.size === 0) return;

    try {
      const updatePromises = Array.from(pendingChanges).map(contratoId => {
        const changes = editedContratos[contratoId];
        return apiCall(`/api/contratos/${contratoId}`, {
          method: 'PUT',
          body: JSON.stringify(changes)
        });
      });

      const results = await Promise.allSettled(updatePromises);
      
      // Contar éxitos y fallos
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      if (failCount === 0) {
        await cargarContratos();
        setEditedContratos({});
        setPendingChanges(new Set());
        toast({
          title: "Éxito",
          description: `${successCount} cambios guardados correctamente`,
        });
      } else {
        toast({
          title: "Advertencia",
          description: `${successCount} cambios guardados, ${failCount} fallidos`,
          variant: "warning",
        });
        // Recargar para asegurar consistencia
        await cargarContratos();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar los cambios",
        variant: "destructive",
      });
    }
  };

  const discardChanges = () => {
    if (window.confirm('¿Estás seguro de descartar todos los cambios pendientes?')) {
      setEditedContratos({});
      setPendingChanges(new Set());
      cargarContratos();
    }
  };

  // Cargar catálogos al montar
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [tercerosData, monedasData, impuestosData] = await Promise.all([
          apiCall('/api/terceros'),
          apiCall('/api/catalogos/monedas'),
          apiCall('/api/impuestos')
        ]);
        setTerceros(tercerosData);
        setMonedas(monedasData);
        setImpuestos(impuestosData);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      }
    };
    cargarCatalogos();
  }, []);

  // Opciones para estados y modos de pago
  const estatusContratoOptions = [
    'ACTIVO',
    'FINALIZADO',
    'SUSPENDIDO',
    'CANCELADO',
    'EN_NEGOCIACION'
  ];

  const modoPagoOptions = [
    'MENSUAL',
    'QUINCENAL',
    'UNICO',
    'POR DEMANDA',
    'OTRO'
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6 overflow-x-auto">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        {/* Total Contratos */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Contratos</div>
            <div className="text-2xl font-bold">{totalContratos}</div>
            {Object.keys(filters).length > 0 && (
              <div className="text-xs text-blue-500">
                ({contratos.length} total, {totalContratos} filtrados)
              </div>
            )}
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        {/* Contratos Activos */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Contratos Activos</div>
            <div className="text-2xl font-bold">{contratosActivos}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        {/* Valor Total */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Valor Total</div>
            <div className="text-2xl font-bold">{formatearMoneda(valorTotalContratos)}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm text-gray-600">
                Página {currentPage} - Mostrando {paginatedContratos.length} de {totalFilteredItems} contratos filtrados
                {totalFilteredItems !== contratos.length && (
                  <span className="text-gray-500"> (de {contratos.length} total)</span>
                )}
              </span>
              
              {/* Mostrar filtros activos */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500">Filtros activos:</span>
                {Object.entries(filters).map(([field, values]) => {
                  const fieldNames = {
                    'id_contrato': 'ID',
                    'fecha_contrato': 'Fecha Contrato',
                    'numero_contrato_os': 'Número',
                    'descripcion_servicio_contratado': 'Descripción',
                    'estatus_contrato': 'Estado',
                    'valor_cotizado': 'Valor',
                    'modo_de_pago': 'Modo Pago'
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
          
          <Button onClick={() => setCrearDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Button>
        </div>
      </div>

      {/* Mensaje de modo edición */}
      {isGridEditMode && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Modo Edición Cuadrícula Activo</span>
              <span className="text-sm text-purple-600">
                Haz clic en cualquier celda para editarla
              </span>
            </div>
            {pendingChanges.size > 0 && (
              <span className="text-sm text-purple-600 font-medium">
                {pendingChanges.size} cambio(s) pendiente(s)
              </span>
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border bg-white shadow-lg overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className={`${isGridEditMode ? 'bg-gradient-to-r from-purple-100 to-purple-200' : 'bg-gradient-to-r from-blue-100 to-blue-200'}`}>
            <TableRow>
              {availableColumns
                .filter(col => visibleColumns[col.key])
                .map((column) => (
                  <TableHead key={column.key}>
                    <FilterableTableHeader
                      title={column.label}
                      field={column.key}
                      data={getFilterData(column.key)}
                      onFilter={handleFilter}
                      onSort={handleSort}
                      sortDirection={sortConfig.field === column.key ? sortConfig.direction : null}
                      activeFilters={filters[column.key] || []}
                    />
                  </TableHead>
                ))}
              {!isGridEditMode && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={availableColumns.filter(col => visibleColumns[col.key]).length + (!isGridEditMode ? 1 : 0)} className="text-center text-gray-500">
                  Cargando contratos...
                </TableCell>
              </TableRow>
            ) : paginatedContratos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={availableColumns.filter(col => visibleColumns[col.key]).length + (!isGridEditMode ? 1 : 0)} className="text-center text-gray-500">
                  No se encontraron contratos
                </TableCell>
              </TableRow>
            ) : (
              paginatedContratos.map((contrato, idx) => (
                <TableRow 
                  key={contrato.id_contrato} 
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                    !isGridEditMode ? 'hover:bg-blue-50' : ''
                  } transition ${
                    pendingChanges.has(contrato.id_contrato) ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                  }`}
                >
                  {availableColumns
                    .filter(col => visibleColumns[col.key])
                    .map((column) => (
                      <TableCell key={column.key}>
                        {isGridEditMode ? (
                          <EditableCell
                            value={getNestedValue(contrato, column.key)}
                            onSave={(newValue) => handleCellSave(contrato.id_contrato, column.key, newValue)}
                            type={getFieldType(column.key)}
                            options={getFieldOptions(column.key)}
                            renderValue={() => renderColumnValue(contrato, column.key)}
                          />
                        ) : (
                          renderColumnValue(contrato, column.key)
                        )}
                      </TableCell>
                    ))}
                  {!isGridEditMode && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-400 hover:bg-gray-100"
                          onClick={() => handleVer(contrato)}
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-400 hover:bg-blue-100"
                          onClick={() => handleEditar(contrato)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-400 hover:bg-red-100"
                          onClick={() => handleEliminar(contrato.id_contrato)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalFilteredItems / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={totalFilteredItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          filteredItems={totalFilteredItems}
          totalFilteredItems={contratos.length}
        />
      </div>

      {/* Diálogos */}
      <CrearContratoDialog
        open={crearDialogOpen}
        onClose={() => setCrearDialogOpen(false)}
        onContratoCreado={cargarContratos}
      />

      <EditarContratoDialog
        open={editarDialogOpen}
        onClose={() => setEditarDialogOpen(false)}
        onContratoActualizado={cargarContratos}
        contratoId={contratoSeleccionado}
      />

      <VerContratoDialog
        open={verDialogOpen}
        onClose={() => setVerDialogOpen(false)}
        contratoId={contratoSeleccionado}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        totalRecords={contratos.length}
        filteredRecords={processedContratos.length}
        entityName="contratos"
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        loading={isImporting}
        entityName="contratos"
        columns={availableColumns}
        terceros={terceros}
        monedas={monedas}
        impuestos={impuestos}
        estados={estatusContratoOptions}
        modosPago={modoPagoOptions}
      />
    </div>
  );
};

export default Contratos;
