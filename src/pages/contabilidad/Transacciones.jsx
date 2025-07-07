import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from '@/config/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ArrowUpDown, BarChart2, DollarSign, Clock, Eye, FilterX, X, Grid3X3, Save, RotateCcw, Download, Upload, List } from 'lucide-react';
import CrearTransaccionDialog from './transacciones/CrearTransaccionDialog';
import EditarTransaccionDialog from './transacciones/EditarTransaccionDialog';
import VerTransaccionDialog from './transacciones/VerTransaccionDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';

const Transacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [isVerDialogOpen, setIsVerDialogOpen] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [transaccionVista, setTransaccionVista] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState({ campo: 'fecha_transaccion', direccion: 'desc' });
  
  // Estados para funcionalidades avanzadas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedTransacciones, setEditedTransacciones] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Estados para catálogos
  const [cuentas, setCuentas] = useState([]);
  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [etiquetasContables, setEtiquetasContables] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  
  const { toast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_transaccion', label: 'ID', required: true },
    { key: 'fecha_transaccion', label: 'Fecha', required: true },
    { key: 'titulo_transaccion', label: 'Título', required: true },
    { key: 'valor_total_transaccion', label: 'Monto', required: true },
    { key: 'id_tipotransaccion', label: 'Tipo' },
    { key: 'id_cuenta', label: 'Cuenta Origen' },
    { key: 'id_etiqueta_contable', label: 'Etiqueta' },
    { key: 'id_concepto', label: 'Concepto DIAN' },
    { key: 'id_tercero', label: 'Tercero' },
    { key: 'id_moneda_transaccion', label: 'Moneda' },
    { key: 'registro_validado', label: 'Estado' },
    { key: 'observacion', label: 'Observación' },
    { key: 'trm_moneda_base', label: 'TRM' },
    { key: 'registro_auxiliar', label: 'Auxiliar' },
    { key: 'aplica_retencion', label: 'Retención' },
    { key: 'aplica_impuestos', label: 'Impuestos' }
  ];

  // Inicializar columnas visibles por defecto
  useEffect(() => {
    const defaultColumns = {};
    availableColumns.forEach(col => {
      // Mostrar solo las columnas principales por defecto
      defaultColumns[col.key] = ['id_transaccion', 'fecha_transaccion', 'titulo_transaccion', 'valor_total_transaccion', 'id_tipotransaccion', 'id_cuenta', 'id_etiqueta_contable', 'registro_validado'].includes(col.key);
    });
    setVisibleColumns(defaultColumns);
  }, []);

  // Opciones predefinidas para Concepto DIAN
  const conceptosDianOpciones = [
    { id: 1, concepto_dian: 'Compra' },
    { id: 2, concepto_dian: 'Venta' },
    { id: 3, concepto_dian: 'Gasto' },
    { id: 4, concepto_dian: 'Ingreso' },
    { id: 5, concepto_dian: 'Transferencia' },
    { id: 6, concepto_dian: 'Ajuste' },
    { id: 7, concepto_dian: 'Devolución' },
    { id: 8, concepto_dian: 'Descuento' },
    { id: 9, concepto_dian: 'Interés' },
    { id: 10, concepto_dian: 'Comisión' }
  ];

  // Cargar catálogos
  const cargarCatalogos = async () => {
    try {
      console.log('🔄 Cargando catálogos...');
      
      const [
        cuentasData,
        tiposTransaccionData,
        monedasData,
        tercerosData,
        etiquetasData,
        conceptosData
      ] = await Promise.all([
        api.getCuentas(),
        api.getTiposTransaccion(),
        api.getMonedas(),
        api.getTerceros(),
        api.getEtiquetasContables(),
        api.getConceptos()
      ]);

      console.log('📋 Catálogos recibidos:', {
        cuentas: Array.isArray(cuentasData) ? cuentasData.length : 'error',
        tiposTransaccion: Array.isArray(tiposTransaccionData) ? tiposTransaccionData.length : 'error',
        monedas: Array.isArray(monedasData) ? monedasData.length : 'error',
        terceros: Array.isArray(tercerosData) ? tercerosData.length : 'error',
        etiquetas: Array.isArray(etiquetasData) ? etiquetasData.length : 'error',
        conceptos: Array.isArray(conceptosData) ? conceptosData.length : 'error'
      });

      // Asegurar que todos los catálogos sean arrays
      setCuentas(Array.isArray(cuentasData) ? cuentasData : []);
      setTiposTransaccion(Array.isArray(tiposTransaccionData) ? tiposTransaccionData : []);
      setMonedas(Array.isArray(monedasData) ? monedasData : []);
      setTerceros(Array.isArray(tercerosData) ? tercerosData : []);
      setEtiquetasContables(Array.isArray(etiquetasData) ? etiquetasData : []);
      setConceptos(Array.isArray(conceptosData) ? conceptosData : []);
      
      // Logs de debugging de cada catálogo
      console.log('🏦 Datos de cuentas:', Array.isArray(cuentasData) ? cuentasData.slice(0, 2) : cuentasData);
      console.log('📋 Datos de tipos de transacción:', Array.isArray(tiposTransaccionData) ? tiposTransaccionData.slice(0, 2) : tiposTransaccionData);
      console.log('💰 Datos de monedas:', Array.isArray(monedasData) ? monedasData.slice(0, 2) : monedasData);
      console.log('👥 Datos de terceros:', Array.isArray(tercerosData) ? tercerosData.slice(0, 2) : tercerosData);
      console.log('🏷️ Datos de etiquetas contables:', Array.isArray(etiquetasData) ? etiquetasData.slice(0, 2) : etiquetasData);
      console.log('📝 Datos de conceptos:', Array.isArray(conceptosData) ? conceptosData.slice(0, 2) : conceptosData);
      
      console.log('✅ Todos los catálogos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar catálogos:', error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los catálogos: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Obtener nombre del tipo de transacción
  const getNombreTipoTransaccion = (id) => {
    console.log('🔍 Buscando tipo transacción:', id, 'en:', tiposTransaccion);
    const tipo = tiposTransaccion.find(t => t.id_tipotransaccion === id);
    const resultado = tipo ? tipo.tipo_transaccion : `ID: ${id}`;
    console.log('✅ Resultado tipo transacción:', resultado);
    return resultado;
  };

  // Obtener nombre de la cuenta
  const getNombreCuenta = (id) => {
    console.log('🔍 Buscando cuenta:', id, 'en:', cuentas);
    const cuenta = cuentas.find(c => c.id_cuenta === id);
    const resultado = cuenta ? (cuenta.titulo_cuenta || cuenta.numero_cuenta || `ID: ${id}`) : `ID: ${id}`;
    console.log('✅ Resultado cuenta:', resultado);
    return resultado;
  };

  // Cargar transacciones
  const cargarTransacciones = async () => {
    try {
      console.log('🔄 Cargando transacciones...');
      const data = await api.getTransacciones();
      
      console.log('📊 Respuesta recibida:', {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) && data.length > 0 ? data[0] : 'Sin datos'
      });
      
      // Asegurar que data es un array
      if (Array.isArray(data)) {
        setTransacciones(data);
        console.log('✅ Transacciones cargadas exitosamente:', data.length);
      } else {
        console.error('❌ La respuesta no es un array:', data);
        setTransacciones([]);
        toast({
          title: "Error",
          description: "Formato de datos incorrecto del servidor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar transacciones:', error);
      setTransacciones([]);
      toast({
        title: "Error",
        description: `No se pudieron cargar las transacciones: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log('🚀 Componente Transacciones montado, cargando datos...');
    cargarCatalogos();
    cargarTransacciones();
  }, []);

  // Eliminar (anular) transacción
  const eliminarTransaccion = async (id) => {
    if (window.confirm('¿Está seguro de que desea anular esta transacción?')) {
      try {
        console.log('🗑️ Eliminando transacción:', id);
        await api.deleteTransaccion(id);
        
        console.log('✅ Transacción eliminada correctamente');
        toast({
          title: "Éxito",
          description: "Transacción anulada correctamente",
        });
        cargarTransacciones();
      } catch (error) {
        console.error('❌ Error al eliminar transacción:', error);
        toast({
          title: "Error",
          description: `No se pudo anular la transacción: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear monto
  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  // Obtener valor anidado (para campos como tipoTransaccion.tipo_transaccion)
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Renderizar valor de columna
  const renderColumnValue = (transaccion, columnKey) => {
    const value = getNestedValue(transaccion, columnKey);
    
    switch (columnKey) {
      case 'fecha_transaccion':
        return formatearFecha(value);
      case 'valor_total_transaccion':
      case 'trm_moneda_base':
        return formatearMonto(value);
      case 'registro_validado':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {value ? 'Validada' : 'Pendiente'}
          </span>
        );
      case 'registro_auxiliar':
      case 'aplica_retencion':
      case 'aplica_impuestos':
        return value ? 'Sí' : 'No';
      case 'id_tipotransaccion':
        if (value == null || value === '' || value === undefined) return 'No seleccionado';
        return getNombreTipoTransaccion(value);
      case 'id_cuenta':
      case 'id_cuenta_destino_transf':
        if (value == null || value === '' || value === undefined) return 'No seleccionado';
        return getNombreCuenta(value);
      case 'id_moneda_transaccion':
        if (value == null || value === '' || value === undefined) return 'No seleccionado';
        const moneda = monedas.find(m => m.id_moneda === value);
        return moneda ? `${moneda.codigo_iso} - ${moneda.nombre_moneda}` : 'No seleccionado';
      case 'id_tercero':
        if (value == null || value === '' || value === undefined) return 'No seleccionado';
        const tercero = terceros.find(t => t.id_tercero === value);
        return tercero ? `${tercero.primer_nombre} ${tercero.primer_apellido}` : 'No seleccionado';
      case 'id_etiqueta_contable':
        if (value == null || value === '' || value === undefined) return 'No seleccionado';
        const etiqueta = etiquetasContables.find(e => e.id_etiqueta_contable === value);
        return etiqueta ? (etiqueta.etiqueta_contable || etiqueta.descripcion_etiqueta) : 'No seleccionado';
      case 'id_concepto':
        if (value == null || value === '' || value === undefined) return 'No seleccionado';
        const concepto = conceptos.find(c => c.id_concepto === value);
        if (concepto) {
          return concepto.descripcion_concepto || concepto.concepto_dian || concepto.concepto || 'No seleccionado';
        }
        const conceptoDian = conceptosDianOpciones.find(c => c.id === value);
        return conceptoDian ? conceptoDian.concepto_dian : 'No seleccionado';
      default:
        return value || 'No seleccionado';
    }
  };

  // Obtener tipo de campo para edición
  const getFieldType = (columnKey) => {
    switch (columnKey) {
      case 'id_transaccion':
        return 'disabled';
      case 'fecha_transaccion':
        return 'date';
      case 'valor_total_transaccion':
      case 'trm_moneda_base':
        return 'currency';
      case 'registro_validado':
      case 'registro_auxiliar':
      case 'aplica_retencion':
      case 'aplica_impuestos':
        return 'select';
      case 'id_tipotransaccion':
      case 'id_cuenta':
      case 'id_etiqueta_contable':
      case 'id_concepto':
      case 'id_tercero':
      case 'id_moneda_transaccion':
        return 'select';
      case 'tipoTransaccion.tipo_transaccion':
      case 'cuenta.titulo_cuenta':
        return 'disabled'; // Por ahora, estos requieren relaciones complejas
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos select
  const getFieldOptions = (columnKey) => {
    switch (columnKey) {
      case 'registro_validado':
      case 'registro_auxiliar':
      case 'aplica_retencion':
      case 'aplica_impuestos':
        return [
          { value: true, label: 'Sí' },
          { value: false, label: 'No' }
        ];
      case 'id_tipotransaccion':
        return tiposTransaccion.map(tipo => ({
          value: tipo.id_tipotransaccion,
          label: tipo.tipo_transaccion
        }));
      case 'id_cuenta':
        return cuentas.map(cuenta => ({
          value: cuenta.id_cuenta,
          label: cuenta.titulo_cuenta || cuenta.numero_cuenta
        }));
      case 'id_etiqueta_contable':
        return etiquetasContables.map(etiqueta => ({
          value: etiqueta.id_etiqueta_contable,
          label: etiqueta.etiqueta_contable || etiqueta.descripcion_etiqueta
        }));
      case 'id_concepto':
        return [...conceptos.map(concepto => ({
          value: concepto.id_concepto,
          label: concepto.descripcion_concepto || concepto.concepto_dian || concepto.concepto
        })), ...conceptosDianOpciones.map(opcion => ({
          value: opcion.id,
          label: opcion.concepto_dian
        }))];
      case 'id_tercero':
        return terceros.map(tercero => ({
          value: tercero.id_tercero,
          label: tercero.tipo_personalidad === 'JURIDICA' && tercero.razon_social 
            ? tercero.razon_social 
            : `${tercero.primer_nombre || ''} ${tercero.primer_apellido || ''}`.trim()
        }));
      case 'id_moneda_transaccion':
        return monedas.map(moneda => ({
          value: moneda.id_moneda,
          label: `${moneda.codigo_iso} - ${moneda.nombre_moneda}`
        }));
      default:
        return [];
    }
  };

  // Función de exportación
  const handleExport = async (exportType) => {
    try {
      const dataToExport = exportType === 'filtered' ? processedTransacciones : transacciones;
      const fileName = `transacciones-${new Date().toISOString().split('T')[0]}`;
      
      // Preparar datos para exportación
      const exportData = dataToExport.map(transaccion => {
        const exportRow = {};
        availableColumns
          .filter(col => visibleColumns[col.key])
          .forEach(col => {
            let value = getNestedValue(transaccion, col.key);
            
            // Formatear valores especiales
            if (col.key.includes('fecha') && value) {
              value = new Date(value).toLocaleDateString('es-CO');
            } else if (col.key.includes('valor') || col.key.includes('trm')) {
              value = value ? parseFloat(value) : 0;
            } else if (col.key === 'registro_validado') {
              value = value ? 'Validada' : 'Pendiente';
            } else if (['registro_auxiliar', 'aplica_retencion', 'aplica_impuestos'].includes(col.key)) {
              value = value ? 'Sí' : 'No';
            } else if (col.key === 'id_tipotransaccion') {
              // Convertir ID de tipo de transacción a nombre
              value = getNombreTipoTransaccion(value);
            } else if (col.key === 'id_cuenta') {
              // Convertir ID de cuenta a nombre
              value = getNombreCuenta(value);
            }
            
            exportRow[col.label] = value || '';
          });
        return exportRow;
      });

      // Crear libro de trabajo (necesitamos importar XLSX en el componente)
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
      XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
      
      // Generar archivo y descargar
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Importar file-saver dinámicamente
      const { saveAs } = await import('file-saver');
      saveAs(blob, `${fileName}.xlsx`);
      
      toast({
        title: "Éxito",
        description: `${dataToExport.length} transacciones exportadas correctamente`,
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

      // Función para extraer ID de formato "ID - Nombre"
      const extractIdFromDropdownValue = (value) => {
        if (!value || typeof value !== 'string') return null;
        const match = value.match(/^(\d+)\s*-/);
        return match ? parseInt(match[1]) : null;
      };

      // Procesar datos
      const processedData = jsonData.map((row, index) => {
        const processedRow = {};
        
        // Mapear columnas según los encabezados de la plantilla
        Object.keys(row).forEach(header => {
          let value = row[header];
          
          if (value === undefined || value === '') {
            value = null;
          }
          
          // Mapear encabezados de la plantilla a campos de la BD
          switch (header.toLowerCase()) {
            case 'fecha':
              if (value !== null) {
                if (typeof value === 'number') {
                  const excelDate = new Date((value - 25569) * 86400 * 1000);
                  processedRow['fecha_transaccion'] = excelDate.toISOString().split('T')[0];
                } else if (typeof value === 'string') {
                  const parsedDate = new Date(value);
                  processedRow['fecha_transaccion'] = isNaN(parsedDate) ? null : parsedDate.toISOString().split('T')[0];
                }
              }
              break;
              
            case 'título':
            case 'titulo':
              processedRow['titulo_transaccion'] = value;
              break;
              
            case 'tipo':
              // Extraer ID del formato "ID - Nombre"
              processedRow['id_tipotransaccion'] = extractIdFromDropdownValue(value);
              break;
              
            case 'cuenta origen':
            case 'cuenta_origen':
              // Extraer ID del formato "ID - Nombre"
              processedRow['id_cuenta'] = extractIdFromDropdownValue(value);
              break;
              
            case 'moneda':
              // Extraer ID del formato "ID - Codigo - Nombre"
              processedRow['id_moneda_transaccion'] = extractIdFromDropdownValue(value);
              break;
              
            case 'monto':
              if (value !== null && !isNaN(value)) {
                processedRow['valor_total_transaccion'] = parseFloat(value);
              }
              break;
              
            case 'trm':
              if (value !== null && !isNaN(value)) {
                processedRow['trm_moneda_base'] = parseFloat(value);
              }
              break;
              
            case 'estado':
              // Convertir estado textual a booleano
              processedRow['registro_validado'] = value && value.toLowerCase() === 'validada';
              break;
              
            case 'auxiliar':
              processedRow['registro_auxiliar'] = value && value.toLowerCase() === 'sí';
              break;
              
            case 'retención':
            case 'retencion':
              processedRow['aplica_retencion'] = value && value.toLowerCase() === 'sí';
              break;
              
            case 'impuestos':
              processedRow['aplica_impuestos'] = value && value.toLowerCase() === 'sí';
              break;
              
            case 'tercero':
              // Extraer ID del formato "ID - Nombre Apellido"
              processedRow['id_tercero'] = extractIdFromDropdownValue(value);
              break;
              
            case 'etiqueta':
              // Extraer ID del formato "ID - Nombre"
              processedRow['id_etiqueta_contable'] = extractIdFromDropdownValue(value);
              break;
              
            case 'concepto':
              // Extraer ID del formato "ID - Descripción"
              processedRow['id_concepto'] = extractIdFromDropdownValue(value);
              break;
              
            case 'observación':
            case 'observacion':
              processedRow['observacion'] = value;
              break;
              
            default:
              // Para compatibilidad con plantillas anteriores
              if (header.includes('fecha') && value !== null) {
                if (typeof value === 'number') {
                  const excelDate = new Date((value - 25569) * 86400 * 1000);
                  processedRow[header] = excelDate.toISOString().split('T')[0];
                } else if (typeof value === 'string') {
                  const parsedDate = new Date(value);
                  processedRow[header] = isNaN(parsedDate) ? null : parsedDate.toISOString().split('T')[0];
                }
              } else if (header.includes('valor') || header.includes('trm')) {
                if (value !== null && !isNaN(value)) {
                  processedRow[header] = parseFloat(value);
                }
              } else {
                processedRow[header] = value;
              }
              break;
          }
        });
        
        return processedRow;
      }).filter(row => row.titulo_transaccion && row.valor_total_transaccion); // Filtrar registros válidos

      // Enviar datos al servidor (por ahora simular)
      console.log('Transacciones a importar:', processedData);
      
      // Simular respuesta exitosa del servidor
      // En producción, aquí iría la llamada real al API
      
      // Agregar al estado local con IDs temporales
      const transaccionesConId = processedData.map((transaccion, index) => ({
        ...transaccion,
        id_transaccion: Date.now() + index
      }));
      
      setTransacciones(prev => [...prev, ...transaccionesConId]);
      
      toast({
        title: "Éxito",
        description: `${processedData.length} transacciones importadas correctamente`,
      });
      
      cargarTransacciones(); // Recargar datos del servidor
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

  // Convertir valores de filtros para campos con relaciones
  const convertFilterValue = (field, value) => {
    if (field === 'id_tipotransaccion') {
      const tipo = tiposTransaccion.find(t => t.id_tipotransaccion === value);
      return tipo ? tipo.tipo_transaccion : `ID: ${value}`;
    } else if (field === 'id_cuenta') {
      const cuenta = cuentas.find(c => c.id_cuenta === value);
      return cuenta ? (cuenta.titulo_cuenta || cuenta.numero_cuenta || `ID: ${value}`) : `ID: ${value}`;
    } else if (field === 'id_etiqueta_contable') {
      const etiqueta = etiquetasContables.find(e => e.id_etiqueta_contable === value);
      return etiqueta ? (etiqueta.etiqueta_contable || etiqueta.descripcion_etiqueta || `ID: ${value}`) : `ID: ${value}`;
    } else if (field === 'id_concepto') {
      const concepto = conceptos.find(c => c.id_concepto === value);
      if (concepto) {
        return concepto.descripcion_concepto || concepto.concepto_dian || concepto.concepto || `ID: ${value}`;
      }
      // Fallback a opciones predefinidas
      const opcionPredefinida = conceptosDianOpciones.find(o => o.id === value);
      return opcionPredefinida ? opcionPredefinida.concepto_dian : `ID: ${value}`;
    } else if (field === 'id_tercero') {
      const tercero = terceros.find(t => t.id_tercero === value);
      if (tercero) {
        if (tercero.tipo_personalidad === 'JURIDICA' && tercero.razon_social) {
          return tercero.razon_social;
        } else {
          return `${tercero.primer_nombre || ''} ${tercero.primer_apellido || ''}`.trim() || `ID: ${value}`;
        }
      }
      return `ID: ${value}`;
    } else if (field === 'id_moneda_transaccion') {
      const moneda = monedas.find(m => m.id_moneda === value);
      return moneda ? (moneda.nombre_moneda || moneda.codigo_iso || `ID: ${value}`) : `ID: ${value}`;
    }
    return value;
  };

  // Obtener datos para filtros
  const getFilterData = (targetField) => {
    let result = [...transacciones];

    Object.entries(filters).forEach(([field, values]) => {
      if (field !== targetField && values && values.length > 0) {
        result = result.filter(transaccion => {
          let fieldValue = getNestedValue(transaccion, field);
          
          // Convertir IDs a nombres legibles para campos relacionales
          if (['id_tipotransaccion', 'id_cuenta', 'id_etiqueta_contable', 'id_concepto', 'id_tercero', 'id_moneda_transaccion'].includes(field)) {
            fieldValue = convertFilterValue(field, fieldValue);
          } else if (field === 'fecha_transaccion') {
            fieldValue = formatearFecha(fieldValue);
          } else if (field === 'valor_total_transaccion' || field === 'trm_moneda_base') {
            fieldValue = formatearMonto(fieldValue);
          } else if (field === 'registro_validado') {
            fieldValue = fieldValue ? 'Validada' : 'Pendiente';
          } else if (field === 'registro_auxiliar' || field === 'aplica_retencion' || field === 'aplica_impuestos') {
            fieldValue = fieldValue ? 'Sí' : 'No';
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
  const { processedTransacciones, totalFilteredItems, paginatedTransacciones } = useMemo(() => {
    let result = [...transacciones];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        result = result.filter(transaccion => {
          let fieldValue = getNestedValue(transaccion, field);
          
          // Convertir IDs a nombres legibles para campos relacionales
          if (['id_tipotransaccion', 'id_cuenta', 'id_etiqueta_contable', 'id_concepto', 'id_tercero', 'id_moneda_transaccion'].includes(field)) {
            fieldValue = convertFilterValue(field, fieldValue);
          } else if (field === 'fecha_transaccion') {
            fieldValue = formatearFecha(fieldValue);
          } else if (field === 'valor_total_transaccion' || field === 'trm_moneda_base') {
            fieldValue = formatearMonto(fieldValue);
          } else if (field === 'registro_validado') {
            fieldValue = fieldValue ? 'Validada' : 'Pendiente';
          } else if (field === 'registro_auxiliar' || field === 'aplica_retencion' || field === 'aplica_impuestos') {
            fieldValue = fieldValue ? 'Sí' : 'No';
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

        if (sortConfig.field === 'fecha_transaccion') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        } else if (sortConfig.field === 'valor_total_transaccion' || sortConfig.field === 'trm_moneda_base') {
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
    const paginatedTransacciones = result.slice(startIndex, endIndex);

    return {
      processedTransacciones: result,
      totalFilteredItems,
      paginatedTransacciones
    };
  }, [transacciones, filters, sortConfig, currentPage, itemsPerPage]);

  // Limpiar filtros
  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ field: null, direction: null });
    setCurrentPage(1);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.keys(filters).length > 0 || sortConfig.field;

  // Cálculos para widgets (usando datos filtrados)
  const cantidadTransacciones = totalFilteredItems;
  const sumaMontos = processedTransacciones.reduce((acc, t) => acc + (parseFloat(t.valor_total_transaccion) || 0), 0);
  const transaccionMasReciente = processedTransacciones.length > 0 ? processedTransacciones[0] : null;
  const fechaMasReciente = transaccionMasReciente ? formatearFecha(transaccionMasReciente.fecha_transaccion) : '-';
  const tituloMasReciente = transaccionMasReciente ? transaccionMasReciente.titulo_transaccion : '-';

  // Funciones para modo de edición masiva
  const toggleGridEditMode = () => {
    if (isGridEditMode && pendingChanges.size > 0) {
      if (window.confirm('¿Deseas salir del modo edición? Se perderán los cambios no guardados.')) {
        setIsGridEditMode(false);
        setEditedTransacciones({});
        setPendingChanges(new Set());
      }
    } else {
      setIsGridEditMode(!isGridEditMode);
      setEditedTransacciones({});
      setPendingChanges(new Set());
    }
  };

  const handleCellSave = async (transaccionId, field, newValue) => {
    setEditedTransacciones(prev => ({
      ...prev,
      [transaccionId]: {
        ...prev[transaccionId],
        [field]: newValue
      }
    }));

    setPendingChanges(prev => new Set([...prev, transaccionId]));

    try {
      console.log('💾 Guardando cambio en celda:', { transaccionId, field, newValue });
      const updatedData = { [field]: newValue };
      const responseData = await api.updateTransaccion(transaccionId, updatedData);
      console.log('✅ PUT Parsed response:', responseData);

      setTransacciones(prev => prev.map(t => 
        t.id_transaccion === transaccionId 
          ? { ...t, [field]: newValue }
          : t
      ));

      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(transaccionId);
        return newSet;
      });

      toast({
        title: "Cambio guardado",
        description: `Campo ${field} actualizado correctamente`,
      });
    } catch (error) {
      console.error('❌ Error en handleCellSave:', error);
      toast({
        title: "Error",
        description: `No se pudo guardar el cambio: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const saveAllPendingChanges = async () => {
    if (pendingChanges.size === 0) return;

    try {
      console.log('💾 Guardando todos los cambios pendientes:', pendingChanges.size);
      const updatePromises = Array.from(pendingChanges).map(async (transaccionId) => {
        const changes = editedTransacciones[transaccionId];
        console.log('💾 Actualizando transacción:', transaccionId, changes);
        
        const response = await api.updateTransaccion(transaccionId, changes);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Bulk update error:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return response;
      });

      await Promise.all(updatePromises);
      
      console.log('✅ Todos los cambios guardados, recargando datos...');
      await cargarTransacciones();
      
      setEditedTransacciones({});
      setPendingChanges(new Set());

      toast({
        title: "Éxito",
        description: `${pendingChanges.size} cambios guardados correctamente`,
      });
    } catch (error) {
      console.error('❌ Error en saveAllPendingChanges:', error);
      toast({
        title: "Error",
        description: `Error al guardar algunos cambios: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const discardChanges = () => {
    if (window.confirm('¿Estás seguro de descartar todos los cambios pendientes?')) {
      setEditedTransacciones({});
      setPendingChanges(new Set());
      cargarTransacciones();
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6 overflow-x-auto">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        {/* Cantidad de transacciones */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Cantidad de Transacciones</div>
            <div className="text-2xl font-bold">{cantidadTransacciones}</div>
            {Object.keys(filters).length > 0 && (
              <div className="text-xs text-blue-500">
                ({transacciones.length} total, {cantidadTransacciones} filtradas)
              </div>
            )}
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {/* Suma de montos */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Suma de Montos</div>
            <div className="text-2xl font-bold">{formatearMonto(sumaMontos)}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
        {/* Más reciente */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Transacción Más Reciente</div>
            <div className="text-lg font-bold">{tituloMasReciente}</div>
            <div className="text-2xl font-bold">{fechaMasReciente}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transacciones</h1>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm text-gray-600">
                Página {currentPage} - Mostrando {paginatedTransacciones.length} de {totalFilteredItems} transacciones filtradas
                {totalFilteredItems !== transacciones.length && (
                  <span className="text-gray-500"> (de {transacciones.length} total)</span>
                )}
              </span>
              
              {/* Mostrar filtros activos */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500">Filtros activos:</span>
                {Object.entries(filters).map(([field, values]) => {
                  const fieldNames = {
                    'id_transaccion': 'ID',
                    'fecha_transaccion': 'Fecha',
                    'titulo_transaccion': 'Título',
                    'valor_total_transaccion': 'Monto',
                    'id_tipotransaccion': 'Tipo',
                    'id_cuenta': 'Cuenta',
                    'registro_validado': 'Estado',
                    'observacion': 'Observación'
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
            Nueva Transacción
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
                       column={column.key}
                       title={column.label}
                       field={column.key}
                       data={getFilterData(column.key)}
                       onFilter={handleFilter}
                       onSort={handleSort}
                       sortDirection={sortConfig.field === column.key ? sortConfig.direction : null}
                       activeFilters={filters[column.key] || []}
                       valueConverter={convertFilterValue}
                     />
                  </TableHead>
                ))}
              {!isGridEditMode && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransacciones.map((transaccion, idx) => (
              <TableRow 
                key={transaccion.id_transaccion} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                  !isGridEditMode ? 'hover:bg-blue-50' : ''
                } transition ${
                  pendingChanges.has(transaccion.id_transaccion) ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                }`}
              >
                {availableColumns
                  .filter(col => visibleColumns[col.key])
                  .map((column) => (
                    <TableCell key={column.key}>
                      {isGridEditMode ? (
                        <EditableCell
                          value={getNestedValue(transaccion, column.key)}
                          displayValue={renderColumnValue(transaccion, column.key)}
                          onSave={(newValue) => handleCellSave(transaccion.id_transaccion, column.key, newValue)}
                          type={getFieldType(column.key)}
                          options={getFieldOptions(column.key)}
                          renderValue={() => renderColumnValue(transaccion, column.key)}
                        />
                      ) : (
                        renderColumnValue(transaccion, column.key)
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
                        onClick={() => {
                          console.log('🚨 TRANSACCIÓN ORIGINAL:', JSON.stringify(transaccion, null, 2));
                          
                          // Crear copia corregida de la transacción con todos los IDs
                          const transaccionCorregida = {
                            ...transaccion,
                            // Asegurar que todos los IDs estén disponibles
                            id_cuenta: transaccion.id_cuenta || null,
                            id_tipotransaccion: transaccion.id_tipotransaccion || null,
                            id_moneda_transaccion: transaccion.id_moneda_transaccion || null,
                            id_tercero: transaccion.id_tercero || null,
                            id_etiqueta_contable: transaccion.id_etiqueta_contable || null,
                            id_concepto: transaccion.id_concepto || null,
                            id_cuenta_destino_transf: transaccion.id_cuenta_destino_transf || null
                          };
                          
                          console.log('🚨 TRANSACCIÓN CORREGIDA:', JSON.stringify(transaccionCorregida, null, 2));
                          console.log('🚨 IDs FINALES:', {
                            id_cuenta: transaccionCorregida.id_cuenta,
                            id_tipotransaccion: transaccionCorregida.id_tipotransaccion,
                            id_moneda_transaccion: transaccionCorregida.id_moneda_transaccion,
                            id_tercero: transaccionCorregida.id_tercero,
                            id_etiqueta_contable: transaccionCorregida.id_etiqueta_contable,
                            id_concepto: transaccionCorregida.id_concepto,
                            id_cuenta_destino_transf: transaccionCorregida.id_cuenta_destino_transf
                          });
                          
                          setTransaccionVista(transaccionCorregida);
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
                          setTransaccionSeleccionada(transaccion);
                          setIsEditarDialogOpen(true);
                        }}
                        disabled={transaccion.estado === 'ANULADA'}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-400 hover:bg-red-100"
                        onClick={() => eliminarTransaccion(transaccion.id_transaccion)}
                        disabled={transaccion.estado === 'ANULADA'}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
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
          totalFilteredItems={transacciones.length}
        />
      </div>

      <CrearTransaccionDialog
        open={isCrearDialogOpen}
        onClose={() => setIsCrearDialogOpen(false)}
        onTransaccionCreada={cargarTransacciones}
      />

      <EditarTransaccionDialog
        open={isEditarDialogOpen}
        onClose={() => {
          setIsEditarDialogOpen(false);
          setTransaccionSeleccionada(null);
        }}
        transaccion={transaccionSeleccionada}
        onTransaccionActualizada={cargarTransacciones}
      />

      <VerTransaccionDialog
        open={isVerDialogOpen}
        onClose={() => {
          setIsVerDialogOpen(false);
          setTransaccionVista(null);
        }}
        transaccion={transaccionVista}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        totalRecords={transacciones.length}
        filteredRecords={processedTransacciones.length}
        entityName="transacciones"
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        loading={isImporting}
        entityName="transacciones"
        // Enviar todos los catálogos para generar plantilla con dropdowns
        cuentas={cuentas}
        tiposTransaccion={tiposTransaccion}
        monedas={monedas}
        terceros={terceros}
        etiquetasContables={etiquetasContables}
        conceptos={conceptos}
        // Columnas completas de transacciones
        columns={availableColumns}
      />
    </div>
  );
};

export default Transacciones;
