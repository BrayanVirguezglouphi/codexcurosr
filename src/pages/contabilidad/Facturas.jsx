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
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye, BarChart2, DollarSign, Clock, FilterX, X, Grid3X3, Save, RotateCcw, Zap, Download, Upload, List, Search, ChevronDown, Check, Edit } from 'lucide-react';
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

// Componente de dropdown con búsqueda para facturas
const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Seleccione una opción", 
  searchPlaceholder = "Buscar...",
  displayKey = "name",
  valueKey = "id",
  formatOption = null,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);
  
  // Cerrar dropdown cuando se hace clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const filteredOptions = options.filter(option => {
    const searchValue = formatOption ? formatOption(option) : option[displayKey];
    return searchValue?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedOption = options.find(option => option[valueKey] == value);
  
  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption 
            ? (formatOption ? formatOption(selectedOption) : selectedOption[displayKey])
            : placeholder
          }
        </span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-8 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  onClick={() => handleSelect(option)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent"
                >
                  {formatOption ? formatOption(option) : option[displayKey]}
                </div>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente EditableCell mejorado para facturas con SearchableSelect
const EditableCellWithSearch = ({
  value,
  displayValue,
  onSave,
  onCancel,
  field,
  type = 'text',
  options = [],
  isEditing = false,
  onStartEdit,
  className = "",
  disabled = false
}) => {
  const [editValue, setEditValue] = useState(value || '');
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  React.useEffect(() => {
    setLocalIsEditing(isEditing);
    if (isEditing && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setLocalIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setLocalIsEditing(false);
    onCancel && onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const formatDisplayValue = (val) => {
    if (displayValue !== undefined) {
      return displayValue || '—';
    }
    
    if (!val) return '—';
    
    switch (type) {
      case 'date':
        if (val) {
          const date = new Date(val);
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        return '—';
      case 'currency':
        if (val && !isNaN(val)) {
          return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
          }).format(val);
        }
        return '$ 0';
      case 'select':
        const option = options.find(opt => opt.value === val);
        return option ? option.label : val;
      default:
        return val;
    }
  };

  if (disabled) {
    return (
      <div className={`p-2 text-gray-500 ${className}`}>
        {formatDisplayValue()}
      </div>
    );
  }

  if (!localIsEditing) {
    return (
      <div 
        className={`group relative p-2 cursor-pointer hover:bg-gray-50 rounded ${className}`}
        onClick={() => {
          setLocalIsEditing(true);
          onStartEdit && onStartEdit();
        }}
      >
        <div className="flex items-center justify-between">
          <span>{formatDisplayValue()}</span>
          <Edit className="h-3 w-3 opacity-0 group-hover:opacity-50 ml-2" />
        </div>
      </div>
    );
  }

  // Renderizar según el tipo de campo con SearchableSelect para listas largas
  if (type === 'select') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex-1">
          <SearchableSelect
            options={options}
            value={editValue}
            onChange={setEditValue}
            placeholder="Seleccionar..."
            searchPlaceholder="Buscar..."
            valueKey="value"
            displayKey="label"
            formatOption={(option) => option.label}
          />
        </div>
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0 ml-1">
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Input
        ref={inputRef}
        type={type === 'currency' ? 'number' : type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8 text-xs"
        step={type === 'currency' ? '0.01' : undefined}
      />
      <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
        <X className="h-3 w-3 text-red-600" />
      </Button>
    </div>
  );
};

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

  // Estados para catálogos (para mostrar nombres legibles)
  const [contratos, setContratos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [taxes, setTaxes] = useState([]);

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

  // Cargar catálogos para mostrar nombres legibles
  const cargarCatalogos = async () => {
    try {
      console.log('🔄 Cargando catálogos...');
      const [contratosData, monedasData, taxesData] = await Promise.all([
        apiCall('/api/contratos'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/impuestos')
      ]);

      console.log('✅ Catálogos cargados:', {
        contratos: Array.isArray(contratosData) ? contratosData.length : 'No es array',
        monedas: Array.isArray(monedasData) ? monedasData.length : 'No es array',
        taxes: Array.isArray(taxesData) ? taxesData.length : 'No es array'
      });

      setContratos(Array.isArray(contratosData) ? contratosData : []);
      setMonedas(Array.isArray(monedasData) ? monedasData : []);
      setTaxes(Array.isArray(taxesData) ? taxesData : []);
    } catch (error) {
      console.error('❌ Error al cargar catálogos:', error);
      // Establecer arrays vacíos para evitar errores
      setContratos([]);
      setMonedas([]);
      setTaxes([]);
    }
  };

  // Cargar facturas
  const cargarFacturas = async () => {
    try {
      console.log('🔄 Cargando facturas...');
      const data = await apiCall('/api/facturas');
      
      console.log('📊 Facturas recibidas:', {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        sample: Array.isArray(data) && data.length > 0 ? data[0] : 'Sin datos'
      });
      
      // Asegurar que data es un array
      if (Array.isArray(data)) {
        setFacturas(data);
        console.log('✅ Facturas cargadas exitosamente:', data.length);
      } else {
        console.error('❌ La respuesta no es un array:', data);
        setFacturas([]);
        toast({
          title: "Error",
          description: "Formato de datos incorrecto del servidor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar facturas:', error);
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
      // Determinar qué datos exportar
      let dataToExport;
      if (exportType === 'filtered') {
        // Obtener todas las facturas filtradas (sin paginación)
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
              // Manejar catálogos
              else if (field === 'id_contrato') {
                fieldValue = getNombreContrato(fieldValue);
              }
              else if (field === 'id_moneda') {
                fieldValue = getNombreMoneda(fieldValue);
              }
              else if (field === 'id_tax') {
                fieldValue = getNombreTax(fieldValue);
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
        
        dataToExport = result;
      } else {
        // Exportar todas las facturas sin filtros
        dataToExport = facturas;
      }

      const fileName = `facturas-${new Date().toISOString().split('T')[0]}`;
      
      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      
      // Obtener columnas visibles
      const visibleCols = availableColumns.filter(col => visibleColumns[col.key]);
      
      // Crear datos para Excel con nombres legibles en lugar de IDs
      const excelData = dataToExport.map(factura => {
        const row = {};
        visibleCols.forEach(col => {
          const value = renderColumnValue(factura, col.key);
          // Si es una fecha, formatearla correctamente para Excel
          if (col.key.includes('fecha') && factura[col.key]) {
            row[col.label] = formatearFecha(factura[col.key]);
          } else {
            row[col.label] = value;
          }
        });
        return row;
      });
      
      // Crear hoja principal
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar el ancho de las columnas
      const colWidths = visibleCols.map(col => {
        const maxLength = Math.max(
          col.label.length,
          ...excelData.map(row => String(row[col.label] || '').length)
        );
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
      });
      ws['!cols'] = colWidths;
      
      // Crear hojas de catálogos para las opciones de dropdown
      
      // Hoja de contratos
      if (contratos.length > 0) {
        const contratosData = contratos.map(c => ({
          'ID': c.id_contrato,
          'Número': c.numero_contrato_os || '',
          'Descripción': c.descripcion_servicio_contratado || '',
          'Estado': c.estatus_contrato || '',
          'Valor': `${c.id_contrato} - ${c.numero_contrato_os} - ${c.descripcion_servicio_contratado}`
        }));
        const wsContratos = XLSX.utils.json_to_sheet(contratosData);
        XLSX.utils.book_append_sheet(wb, wsContratos, 'Opciones_Contratos');
      }

      // Hoja de monedas
      if (monedas.length > 0) {
        const monedasData = monedas.map(m => ({
          'ID': m.id_moneda,
          'Código': m.codigo_iso || '',
          'Nombre': m.nombre_moneda || '',
          'Símbolo': m.simbolo || '',
          'Valor': `${m.id_moneda} - ${m.codigo_iso} - ${m.nombre_moneda}`
        }));
        const wsMonedas = XLSX.utils.json_to_sheet(monedasData);
        XLSX.utils.book_append_sheet(wb, wsMonedas, 'Opciones_Monedas');
      }

      // Hoja de impuestos
      if (taxes.length > 0) {
        const taxesData = taxes.map(t => ({
          'ID': t.id_tax,
          'Tipo': t.tipo_obligacion || '',
          'Título': t.titulo_impuesto || '',
          'Estado': t.estado || '',
          'Valor': `${t.id_tax} - ${t.tipo_obligacion} - ${t.titulo_impuesto}`
        }));
        const wsTaxes = XLSX.utils.json_to_sheet(taxesData);
        XLSX.utils.book_append_sheet(wb, wsTaxes, 'Opciones_Impuestos');
      }
      
      // Agregar la hoja principal al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
      
      // Guardar archivo
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `${fileName}.xlsx`);
      
      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${dataToExport.length} facturas con hojas de opciones`,
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast({
        title: "Error en la exportación",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Función para extraer ID de valores con formato "ID - Código - Nombre"
  const extractIdFromDropdownValue = (value) => {
    if (!value || typeof value !== 'string') return value;
    
    // Si el formato es "ID - Código - Nombre", extraer solo el ID
    const match = value.match(/^(\d+)\s*-\s*/);
    if (match) {
      return parseInt(match[1]);
    }
    
    // Si es solo un número, devolverlo como número
    if (/^\d+$/.test(value.toString().trim())) {
      return parseInt(value);
    }
    
    return value;
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
          
          // También buscar por nombres alternativos para campos con ID
          if (!value) {
            if (col.key === 'id_contrato') {
              value = row['ID Contrato'] || row['Contrato'];
            } else if (col.key === 'id_moneda') {
              value = row['ID Moneda'] || row['Moneda'];
            } else if (col.key === 'id_tax') {
              value = row['ID Tax'] || row['Impuesto'];
            }
          }
          
          if (value === undefined || value === '') {
            value = null;
          }
          
          // Procesar campos con IDs que pueden tener formato dropdown
          if (col.key === 'id_contrato' || col.key === 'id_moneda' || col.key === 'id_tax') {
            if (value !== null) {
              const extractedId = extractIdFromDropdownValue(value);
              processedRow[col.key] = extractedId;
            } else {
              processedRow[col.key] = null;
            }
          }
          // Convertir tipos de datos
          else if (col.key.includes('fecha') && value !== null) {
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

      console.log('Datos procesados para importar:', processedData);

      // Enviar datos al servidor
      const response = await apiCall('/api/facturas/import', {
        method: 'POST',
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

      const response = await apiCall('/api/facturas/import', {
        method: 'POST',
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

  // Función para descargar plantilla con dropdowns nativos
  const handleDownloadTemplate = async () => {
    try {
      // Importar ExcelJS dinámicamente
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.default.Workbook();
      
      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Plantilla');
      
      // Definir columnas con ancho adecuado
      worksheet.columns = [
        { header: 'Número', key: 'numero', width: 15 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'ID Contrato', key: 'id_contrato', width: 50 },
        { header: 'Fecha Radicado', key: 'fecha_radicado', width: 15 },
        { header: 'Fecha Est. Pago', key: 'fecha_pago', width: 15 },
        { header: 'ID Moneda', key: 'id_moneda', width: 40 },
        { header: 'Subtotal', key: 'subtotal', width: 15 },
        { header: 'ID Tax', key: 'id_tax', width: 50 },
        { header: 'IVA', key: 'iva', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 30 }
      ];
      
      // Agregar datos de ejemplo
      worksheet.addRow({
        numero: 'FAC-2024-001',
        estado: 'PENDIENTE',
        id_contrato: contratos.length > 0 ? `${contratos[0].id_contrato} - ${contratos[0].numero_contrato_os} - ${contratos[0].descripcion_servicio_contratado}` : '',
        fecha_radicado: '2024-01-15',
        fecha_pago: '2024-02-15',
        id_moneda: monedas.length > 0 ? `${monedas[0].id_moneda} - ${monedas[0].codigo_iso} - ${monedas[0].nombre_moneda}` : '',
        subtotal: '1000000',
        id_tax: taxes.length > 0 ? `${taxes[0].id_tax} - ${taxes[0].tipo_obligacion} - ${taxes[0].titulo_impuesto}` : '',
        iva: '190000',
        observaciones: 'Ejemplo de observaciones'
      });
      
      // Crear hojas auxiliares para los datos de los dropdowns
      
      // Hoja de contratos
      const wsContratos = workbook.addWorksheet('Datos_Contratos');
      wsContratos.columns = [
        { header: 'Opción', key: 'opcion', width: 60 }
      ];
      
      const contratosOpciones = contratos.map(c => ({
        opcion: `${c.id_contrato} - ${c.numero_contrato_os || 'Sin número'} - ${c.descripcion_servicio_contratado || 'Sin descripción'}`
      }));
      wsContratos.addRows(contratosOpciones);
      
      // Hoja de monedas
      const wsMonedas = workbook.addWorksheet('Datos_Monedas');
      wsMonedas.columns = [
        { header: 'Opción', key: 'opcion', width: 40 }
      ];
      
      const monedasOpciones = monedas.map(m => ({
        opcion: `${m.id_moneda} - ${m.codigo_iso || 'N/A'} - ${m.nombre_moneda || 'Sin nombre'}`
      }));
      wsMonedas.addRows(monedasOpciones);
      
      // Hoja de impuestos
      const wsTaxes = workbook.addWorksheet('Datos_Impuestos');
      wsTaxes.columns = [
        { header: 'Opción', key: 'opcion', width: 60 }
      ];
      
      const taxesOpciones = taxes.map(t => ({
        opcion: `${t.id_tax} - ${t.tipo_obligacion || 'N/A'} - ${t.titulo_impuesto || 'Sin título'}`
      }));
      wsTaxes.addRows(taxesOpciones);
      
      // Aplicar validación de datos (dropdowns) a las celdas correspondientes
      
      // Dropdown para Estados
      const estadosOpciones = ['PENDIENTE', 'PAGADA', 'VENCIDA', 'CANCELADA'];
      worksheet.getColumn('estado').eachCell((cell, rowNumber) => {
        if (rowNumber > 1) { // Saltar header
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${estadosOpciones.join(',')}"`]
          };
        }
      });
      
      // Dropdown para Contratos (usando referencia a hoja)
      if (contratos.length > 0) {
        worksheet.getColumn('id_contrato').eachCell((cell, rowNumber) => {
          if (rowNumber > 1) { // Saltar header
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [`Datos_Contratos!$A$2:$A$${contratos.length + 1}`]
            };
          }
        });
      }
      
      // Dropdown para Monedas (usando referencia a hoja)
      if (monedas.length > 0) {
        worksheet.getColumn('id_moneda').eachCell((cell, rowNumber) => {
          if (rowNumber > 1) { // Saltar header
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [`Datos_Monedas!$A$2:$A$${monedas.length + 1}`]
            };
          }
        });
      }
      
      // Dropdown para Impuestos (usando referencia a hoja)
      if (taxes.length > 0) {
        worksheet.getColumn('id_tax').eachCell((cell, rowNumber) => {
          if (rowNumber > 1) { // Saltar header
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [`Datos_Impuestos!$A$2:$A$${taxes.length + 1}`]
            };
          }
        });
      }
      
      // Agregar más filas vacías con validación para permitir múltiples facturas
      for (let i = 0; i < 10; i++) {
        const newRow = worksheet.addRow({
          numero: '',
          estado: '',
          id_contrato: '',
          fecha_radicado: '',
          fecha_pago: '',
          id_moneda: '',
          subtotal: '',
          id_tax: '',
          iva: '',
          observaciones: ''
        });
        
        // Aplicar validación a cada nueva fila
        newRow.getCell('estado').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${estadosOpciones.join(',')}"`]
        };
        
        if (contratos.length > 0) {
          newRow.getCell('id_contrato').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`Datos_Contratos!$A$2:$A$${contratos.length + 1}`]
          };
        }
        
        if (monedas.length > 0) {
          newRow.getCell('id_moneda').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`Datos_Monedas!$A$2:$A$${monedas.length + 1}`]
          };
        }
        
        if (taxes.length > 0) {
          newRow.getCell('id_tax').dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`Datos_Impuestos!$A$2:$A$${taxes.length + 1}`]
          };
        }
      }
      
      // Estilizar el header
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Hoja de instrucciones
      const wsInstrucciones = workbook.addWorksheet('Instrucciones');
      wsInstrucciones.columns = [
        { header: 'Paso', key: 'paso', width: 8 },
        { header: 'Instrucción', key: 'instruccion', width: 80 }
      ];
      
      const instrucciones = [
        { paso: 1, instruccion: 'Use la hoja "Plantilla" para ingresar los datos de facturas' },
        { paso: 2, instruccion: 'Los campos con dropdowns (Estado, Contrato, Moneda, Impuesto) tienen opciones predefinidas' },
        { paso: 3, instruccion: 'Haga clic en las flechas desplegables para seleccionar opciones' },
        { paso: 4, instruccion: 'Las fechas deben estar en formato YYYY-MM-DD (ej: 2024-01-15)' },
        { paso: 5, instruccion: 'Los valores numéricos no deben incluir símbolos de moneda' },
        { paso: 6, instruccion: 'Al importar, el sistema extraerá automáticamente los IDs del formato seleccionado' }
      ];
      wsInstrucciones.addRows(instrucciones);
      
      // Guardar archivo
      const fileName = `plantilla-facturas-con-dropdowns-${new Date().toISOString().split('T')[0]}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Crear blob y descargar
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Plantilla descargada",
        description: "Se descargó la plantilla con dropdowns nativos en Excel",
      });
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      toast({
        title: "Error al crear plantilla",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarFacturas();
    cargarCatalogos();
  }, []);

  // Eliminar factura
  const eliminarFactura = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        const response = await apiCall(`/api/facturas/${id}`, {
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

  // Obtener nombre del contrato por ID
  const getNombreContrato = (id) => {
    if (!id) return '—';
    const contrato = contratos.find(c => c.id_contrato === parseInt(id));
    return contrato ? `${contrato.numero_contrato_os} - ${contrato.descripcion_servicio_contratado}` : `ID: ${id}`;
  };

  // Obtener nombre de la moneda por ID
  const getNombreMoneda = (id) => {
    if (!id) return '—';
    const moneda = monedas.find(m => m.id_moneda === parseInt(id));
    return moneda ? `${moneda.codigo_iso} - ${moneda.nombre_moneda}` : `ID: ${id}`;
  };

  // Obtener nombre del impuesto por ID
  const getNombreTax = (id) => {
    if (!id) return '—';
    const tax = taxes.find(t => t.id_tax === parseInt(id));
    return tax ? tax.titulo_impuesto : `ID: ${id}`;
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
      case 'id_contrato':
        return getNombreContrato(value);
      case 'id_moneda':
        return getNombreMoneda(value);
      case 'id_tax':
        return getNombreTax(value);
      case 'id_factura':
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
      case 'id_contrato':
      case 'id_moneda':
      case 'id_tax':
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
      case 'id_contrato':
        return contratos.map(contrato => ({
          value: contrato.id_contrato,
          label: `${contrato.numero_contrato_os} - ${contrato.descripcion_servicio_contratado}`
        }));
      case 'id_moneda':
        return monedas.map(moneda => ({
          value: moneda.id_moneda,
          label: `${moneda.codigo_iso} - ${moneda.nombre_moneda}`
        }));
      case 'id_tax':
        return taxes.map(tax => ({
          value: tax.id_tax,
          label: `${tax.tipo_obligacion} - ${tax.titulo_impuesto}`
        }));
      default:
        return [];
    }
  };

  // Obtener valor para mostrar en modo edición (descriptivo en lugar de ID)
  const getDisplayValue = (factura, columnKey, currentValue) => {
    // Para campos que son IDs, mostrar el valor descriptivo
    switch (columnKey) {
      case 'id_contrato':
        return getNombreContrato(currentValue);
      case 'id_moneda':
        return getNombreMoneda(currentValue);
      case 'id_tax':
        return getNombreTax(currentValue);
      case 'fecha_radicado':
      case 'fecha_estimada_pago':
        return formatearFecha(currentValue);
      case 'subtotal_facturado_moneda':
      case 'valor_tax':
        return formatearMoneda(currentValue);
      default:
        return currentValue;
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
          // Manejar catálogos
          else if (field === 'id_contrato') {
            fieldValue = getNombreContrato(fieldValue);
          }
          else if (field === 'id_moneda') {
            fieldValue = getNombreMoneda(fieldValue);
          }
          else if (field === 'id_tax') {
            fieldValue = getNombreTax(fieldValue);
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
          // Manejar catálogos
          else if (field === 'id_contrato') {
            fieldValue = getNombreContrato(fieldValue);
          }
          else if (field === 'id_moneda') {
            fieldValue = getNombreMoneda(fieldValue);
          }
          else if (field === 'id_tax') {
            fieldValue = getNombreTax(fieldValue);
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
    // Actualizar el estado local primero
    setEditedFacturas(prev => ({
      ...prev,
      [facturaId]: {
        ...prev[facturaId],
        [field]: newValue
      }
    }));

    // Marcar como cambio pendiente temporalmente
    setPendingChanges(prev => new Set([...prev, facturaId]));

    // Actualizar inmediatamente en la base de datos
    try {
      const updatedData = { [field]: newValue };
      
      // La función apiCall ya maneja la respuesta JSON automáticamente
      const result = await apiCall(`/api/facturas/${facturaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      // Si llegamos aquí, significa que apiCall fue exitoso
      // Actualizar la factura en el estado local
      setFacturas(prev => prev.map(f => 
        f.id_factura === facturaId 
          ? { ...f, [field]: newValue }
          : f
      ));

      // Remover de cambios pendientes ya que se guardó exitosamente
      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(facturaId);
        return newSet;
      });

      // Limpiar estado de edición para esta factura
      setEditedFacturas(prev => {
        const newState = { ...prev };
        if (newState[facturaId]) {
          delete newState[facturaId][field];
          if (Object.keys(newState[facturaId]).length === 0) {
            delete newState[facturaId];
          }
        }
        return newState;
      });

      toast({
        title: "✅ Cambio guardado",
        description: `Campo actualizado correctamente`,
        duration: 2000,
      });

    } catch (error) {
      console.error('Error al guardar cambio:', error);
      
      // Remover de cambios pendientes para mostrar el error
      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(facturaId);
        return newSet;
      });
      
      // Revertir el cambio local
      setEditedFacturas(prev => {
        const newState = { ...prev };
        if (newState[facturaId]) {
          delete newState[facturaId][field];
          if (Object.keys(newState[facturaId]).length === 0) {
            delete newState[facturaId];
          }
        }
        return newState;
      });
      
      toast({
        title: "❌ Error al guardar",
        description: `${error.message || 'No se pudo actualizar el campo'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const saveAllPendingChanges = async () => {
    if (pendingChanges.size === 0) return;

    try {
      const updatePromises = Array.from(pendingChanges).map(facturaId => {
        const changes = editedFacturas[facturaId];
        return apiCall(`/api/facturas/${facturaId}`, {
          method: 'PUT',
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
                  const displayValue = getDisplayValue(factura, column.key, currentValue);
                  const hasChanges = pendingChanges.has(factura.id_factura);
                  
                  return (
                    <TableCell 
                      key={`${factura.id_factura}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCellWithSearch
                          value={currentValue}
                          displayValue={displayValue}
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
        contratos={contratos}
        monedas={monedas}
        impuestos={taxes}
        terceros={[]}
      />
    </div>
  );
};

export default Facturas;
