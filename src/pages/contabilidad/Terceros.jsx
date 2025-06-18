import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, ArrowUpDown, BarChart2, Users, Building, Eye, FilterX, X, Grid3X3, Save, RotateCcw, Download, Upload } from 'lucide-react';

import CrearTerceroDialog from './terceros/CrearTerceroDialog';
import EditarTerceroDialog from './terceros/EditarTerceroDialog';
import VerTerceroDialog from './terceros/VerTerceroDialog';
import FilterableTableHeader from '@/components/ui/filterable-table-header';
import ColumnSelector from '@/components/ui/column-selector';
import EditableCell from '@/components/ui/editable-cell';
import Pagination from '@/components/ui/pagination';
import ExportDialog from '@/components/ui/export-dialog';
import ImportDialog from '@/components/ui/import-dialog';
import { toast as toastImport } from 'react-hot-toast';

const Terceros = () => {
  const [terceros, setTerceros] = useState([]);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [isEditarDialogOpen, setIsEditarDialogOpen] = useState(false);
  const [isVerDialogOpen, setIsVerDialogOpen] = useState(false);
  const [terceroSeleccionado, setTerceroSeleccionado] = useState(null);
  const [terceroVisto, setTerceroVisto] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState({ campo: 'id_tercero', direccion: 'desc' });
  
  // Estados para funcionalidades avanzadas
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isGridEditMode, setIsGridEditMode] = useState(false);
  const [editedTerceros, setEditedTerceros] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());

  // Estados para exportación/importación
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const { toast } = useToast();

  // Definir columnas disponibles
  const availableColumns = [
    { key: 'id_tercero', label: 'ID', required: true },
    { key: 'nombre_completo', label: 'Nombre/Razón Social', required: true },
    { key: 'tipo_personalidad', label: 'Tipo', required: true },
    { key: 'tipo_documento', label: 'Tipo Doc' },
    { key: 'numero_documento', label: 'Documento', required: true },
    { key: 'dv', label: 'DV' },
    { key: 'tipo_relacion', label: 'Relación', required: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'municipio_ciudad', label: 'Ciudad' },
    { key: 'departamento_region', label: 'Departamento' },
    { key: 'pais', label: 'País' },
    { key: 'primer_nombre', label: 'Primer Nombre' },
    { key: 'otros_nombres', label: 'Otros Nombres' },
    { key: 'primer_apellido', label: 'Primer Apellido' },
    { key: 'segundo_apellido', label: 'Segundo Apellido' },
    { key: 'razon_social', label: 'Razón Social' },
    { key: 'observaciones', label: 'Observaciones' }
  ];

  // Configuración de columnas para plantilla Excel (sin campos auto-incrementales)
  const templateColumns = availableColumns
    .filter(col => col.key !== 'id_tercero' && col.key !== 'nombre_completo') // Excluir campos calculados/auto-incrementales
    .map(col => ({
      ...col,
      example: getTerceroExampleValue(col.key)
    }));

  // Función para obtener valores de ejemplo para la plantilla
  function getTerceroExampleValue(columnKey) {
    switch (columnKey) {
      case 'tipo_personalidad':
        return 'NATURAL';
      case 'tipo_documento':
        return 'CC';
      case 'numero_documento':
        return '12345678';
      case 'dv':
        return '9';
      case 'tipo_relacion':
        return 'CLIENTE';
      case 'telefono':
        return '3001234567';
      case 'email':
        return 'ejemplo@email.com';
      case 'direccion':
        return 'Calle 123 # 45-67';
      case 'municipio_ciudad':
        return 'Bogotá';
      case 'departamento_region':
        return 'Cundinamarca';
      case 'pais':
        return 'Colombia';
      case 'primer_nombre':
        return 'Juan';
      case 'otros_nombres':
        return 'Carlos';
      case 'primer_apellido':
        return 'Pérez';
      case 'segundo_apellido':
        return 'García';
      case 'razon_social':
        return 'Empresa S.A.S.';
      case 'observaciones':
        return 'Observaciones del tercero';
      default:
        return 'Ejemplo';
    }
  }

  // Debug: Log de templateColumns cuando cambie
  useEffect(() => {
    console.log('🔧 Debug templateColumns en Terceros:', templateColumns);
  }, [templateColumns]);

  // Inicializar columnas visibles por defecto
  useEffect(() => {
    const defaultColumns = {};
    availableColumns.forEach(col => {
      // Mostrar solo las columnas principales por defecto
      defaultColumns[col.key] = ['id_tercero', 'nombre_completo', 'tipo_personalidad', 'numero_documento', 'tipo_relacion', 'telefono', 'email'].includes(col.key);
    });
    setVisibleColumns(defaultColumns);
  }, []);

  // Cargar terceros
  const cargarTerceros = async () => {
    try {
      const response = await apiCall('/api/terceros');
      const data = await response.json();
      setTerceros(data);
    } catch (error) {
      console.error('Error al cargar terceros:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los terceros",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarTerceros();
  }, []);

  // Función de exportación
  const handleExport = async (exportType) => {
    try {
      console.log('🔄 Iniciando exportación de terceros...');
      
      const dataToExport = exportType === 'filtered' ? processedTerceros : terceros;
      const fileName = `terceros-${new Date().toISOString().split('T')[0]}`;
      
      console.log(`📊 Exportando ${dataToExport.length} terceros`);
      
      // Importación dinámica de XLSX y file-saver
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      console.log('✅ Librerías Excel cargadas correctamente');
      
      // Formatear datos para exportación
      const formattedData = dataToExport.map(tercero => ({
        'ID': tercero.id_tercero,
        'Nombre/Razón Social': getNombreCompleto(tercero),
        'Tipo Personalidad': tercero.tipo_personalidad || '',
        'Tipo Documento': tercero.tipo_documento || '',
        'Número Documento': tercero.numero_documento || '',
        'DV': tercero.dv || '',
        'Tipo Relación': tercero.tipo_relacion || '',
        'Teléfono': tercero.telefono || '',
        'Email': tercero.email || '',
        'Dirección': tercero.direccion || '',
        'Ciudad': tercero.municipio_ciudad || '',
        'Departamento': tercero.departamento_region || '',
        'País': tercero.pais || '',
        'Primer Nombre': tercero.primer_nombre || '',
        'Otros Nombres': tercero.otros_nombres || '',
        'Primer Apellido': tercero.primer_apellido || '',
        'Segundo Apellido': tercero.segundo_apellido || '',
        'Razón Social': tercero.razon_social || '',
        'Observaciones': tercero.observaciones || ''
      }));
      
      console.log('📝 Datos formateados para Excel:', formattedData.length, 'filas');
      
      // Crear libro de trabajo
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Terceros');
      
      // Generar archivo y descargar
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      console.log('📁 Archivo Excel creado:', {
        tamaño: blob.size,
        tipo: blob.type,
        nombre: `${fileName}.xlsx`
      });
      
      saveAs(blob, `${fileName}.xlsx`);
      
      console.log('✅ Exportación completada exitosamente');
      
      setIsExportDialogOpen(false);
      toastImport.success(`${dataToExport.length} registros exportados exitosamente`);
    } catch (error) {
      console.error('❌ Error al exportar terceros:', error);
      console.error('Stack trace:', error.stack);
      toastImport.error(`Error al exportar los datos: ${error.message}`);
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
            'numero_documento': ['numero_documento', 'documento', 'document_number', 'cedula', 'nit'],
            'tipo_relacion': ['tipo_relacion', 'relacion', 'relation_type', 'tipo'],
            'tipo_personalidad': ['tipo_personalidad', 'personalidad', 'personality_type', 'natural_juridica'],
            'primer_nombre': ['primer_nombre', 'nombre', 'first_name', 'name'],
            'otros_nombres': ['otros_nombres', 'segundo_nombre', 'other_names'],
            'primer_apellido': ['primer_apellido', 'apellido', 'last_name', 'surname'],
            'segundo_apellido': ['segundo_apellido', 'segundo_apellido', 'second_surname'],
            'razon_social': ['razon_social', 'company_name', 'nombre_empresa', 'empresa'],
            'tipo_documento': ['tipo_documento', 'tipo_doc', 'document_type'],
            'dv': ['dv', 'digito_verificacion'],
            'telefono': ['telefono', 'phone', 'celular'],
            'email': ['email', 'correo', 'mail'],
            'direccion': ['direccion', 'address', 'domicilio'],
            'municipio_ciudad': ['municipio_ciudad', 'ciudad', 'city', 'municipio'],
            'departamento_region': ['departamento_region', 'departamento', 'region', 'state'],
            'pais': ['pais', 'country', 'nation'],
            'observaciones': ['observaciones', 'comments', 'notes', 'notas']
          };

          // Procesar y crear terceros
          const nuevosTerceros = jsonData.map(row => {
            const mappedRow = {};
            
            // Mapear columnas automáticamente
            Object.entries(columnMappings).forEach(([targetColumn, possibleNames]) => {
              for (const possibleName of possibleNames) {
                const foundKey = Object.keys(row).find(key => 
                  key.toLowerCase().includes(possibleName.toLowerCase()) ||
                  possibleName.toLowerCase().includes(key.toLowerCase())
                );
                if (foundKey && row[foundKey]) {
                  mappedRow[targetColumn] = row[foundKey];
                  break;
                }
              }
            });

            return {
              numero_documento: mappedRow.numero_documento?.toString().trim(),
              tipo_relacion: mappedRow.tipo_relacion?.toString().trim().toUpperCase() || 'CLIENTE',
              tipo_personalidad: mappedRow.tipo_personalidad?.toString().trim().toUpperCase() || 'NATURAL',
              primer_nombre: mappedRow.primer_nombre?.toString().trim() || null,
              otros_nombres: mappedRow.otros_nombres?.toString().trim() || null,
              primer_apellido: mappedRow.primer_apellido?.toString().trim() || null,
              segundo_apellido: mappedRow.segundo_apellido?.toString().trim() || null,
              razon_social: mappedRow.razon_social?.toString().trim() || null,
              tipo_documento: mappedRow.tipo_documento?.toString().trim() || 'CC',
              dv: mappedRow.dv?.toString().trim() || null,
              telefono: mappedRow.telefono?.toString().trim() || null,
              email: mappedRow.email?.toString().trim() || null,
              direccion: mappedRow.direccion?.toString().trim() || null,
              municipio_ciudad: mappedRow.municipio_ciudad?.toString().trim() || null,
              departamento_region: mappedRow.departamento_region?.toString().trim() || null,
              pais: mappedRow.pais?.toString().trim() || null,
              observaciones: mappedRow.observaciones?.toString().trim() || null
            };
          }).filter(tercero => tercero.numero_documento);

          // Validar tipos válidos
          const tiposRelacionValidos = ['CLIENTE', 'PROVEEDOR', 'EMPLEADO', 'OTRO'];
          const tiposPersonalidadValidos = ['NATURAL', 'JURIDICA'];
          
          nuevosTerceros.forEach(tercero => {
            if (!tiposRelacionValidos.includes(tercero.tipo_relacion)) {
              tercero.tipo_relacion = 'CLIENTE';
            }
            if (!tiposPersonalidadValidos.includes(tercero.tipo_personalidad)) {
              tercero.tipo_personalidad = 'NATURAL';
            }
          });

          if (nuevosTerceros.length === 0) {
            toastImport.error('No se encontraron registros válidos para importar');
            setIsImporting(false);
            return;
          }

          // Enviar al backend
          const response = await apiCall('/api/terceros/bulk-create', {
            method: 'POST',
            body: JSON.stringify({ terceros: nuevosTerceros }),
          });

          if (response.ok) {
            await cargarTerceros();
            setIsImportDialogOpen(false);
            toastImport.success(`${nuevosTerceros.length} terceros importados exitosamente`);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al importar los terceros');
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

  // Eliminar tercero
  const eliminarTercero = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este tercero?')) {
      try {
        const response = await apiCall(`/api/terceros/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Tercero eliminado correctamente",
          });
          cargarTerceros();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el tercero",
          variant: "destructive",
        });
      }
    }
  };

  // Ordenar terceros
  const ordenarTerceros = (campo) => {
    const direccion = ordenamiento.campo === campo && ordenamiento.direccion === 'asc' ? 'desc' : 'asc';
    setOrdenamiento({ campo, direccion });
    
    const tercerosOrdenados = [...terceros].sort((a, b) => {
      if (campo === 'id_tercero') {
        return direccion === 'asc'
          ? a[campo] - b[campo]
          : b[campo] - a[campo];
      }
      const valorA = a[campo] || '';
      const valorB = b[campo] || '';
      return direccion === 'asc'
        ? valorA.localeCompare(valorB)
        : valorB.localeCompare(valorA);
    });
    
    setTerceros(tercerosOrdenados);
  };

  // Función para obtener nombre completo o razón social
  const getNombreCompleto = (tercero) => {
    if (tercero.razon_social) {
      return tercero.razon_social;
    }
    const nombres = [
      tercero.primer_nombre,
      tercero.otros_nombres,
      tercero.primer_apellido,
      tercero.segundo_apellido
    ].filter(Boolean).join(' ');
    
    return nombres || 'Sin nombre';
  };

  // Obtener valor anidado (para campos como nombre_completo)
  const getNestedValue = (obj, path) => {
    if (!path || typeof path !== 'string') return obj;
    if (path === 'nombre_completo') {
      return getNombreCompleto(obj);
    }
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Renderizar valor de columna
  const renderColumnValue = (tercero, columnKey) => {
    const value = getNestedValue(tercero, columnKey);
    
    switch (columnKey) {
      case 'nombre_completo':
        return (
          <div className="font-medium max-w-[200px] truncate" title={value}>
            {value}
          </div>
        );
      case 'tipo_personalidad':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'NATURAL' ? 'bg-emerald-100 text-emerald-700' :
            value === 'JURIDICA' ? 'bg-indigo-100 text-indigo-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {value || 'No especificado'}
          </span>
        );
      case 'tipo_relacion':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'CLIENTE' ? 'bg-blue-100 text-blue-700' :
            value === 'PROVEEDOR' ? 'bg-orange-100 text-orange-700' :
            value === 'EMPLEADO' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {value || 'No especificado'}
          </span>
        );
      case 'numero_documento':
        return (
          <div className="font-mono">
            {value || '-'}
            {tercero.dv && <span className="ml-1 text-gray-500">-{tercero.dv}</span>}
          </div>
        );
      case 'email':
        return value ? (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 underline">
            {value}
          </a>
        ) : '-';
      case 'telefono':
        return value ? (
          <a href={`tel:${value}`} className="text-green-600 hover:text-green-800">
            {value}
          </a>
        ) : '-';
      case 'direccion':
      case 'observaciones':
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
      case 'id_tercero':
      case 'nombre_completo':
        return 'disabled';
      case 'tipo_personalidad':
      case 'tipo_relacion':
      case 'tipo_documento':
        return 'select';
      case 'email':
        return 'email';
      case 'telefono':
        return 'tel';
      case 'direccion':
      case 'observaciones':
        return 'textarea';
      default:
        return 'text';
    }
  };

  // Obtener opciones para campos select
  const getFieldOptions = (columnKey) => {
    switch (columnKey) {
      case 'tipo_personalidad':
        return [
          { value: 'NATURAL', label: 'NATURAL' },
          { value: 'JURIDICA', label: 'JURÍDICA' }
        ];
      case 'tipo_relacion':
        return [
          { value: 'CLIENTE', label: 'CLIENTE' },
          { value: 'PROVEEDOR', label: 'PROVEEDOR' },
          { value: 'EMPLEADO', label: 'EMPLEADO' }
        ];
      case 'tipo_documento':
        return [
          { value: 'CC', label: 'Cédula de Ciudadanía' },
          { value: 'NIT', label: 'NIT' },
          { value: 'CE', label: 'Cédula de Extranjería' },
          { value: 'PA', label: 'Pasaporte' },
          { value: 'TI', label: 'Tarjeta de Identidad' }
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
    let result = [...terceros];

    Object.entries(filters).forEach(([field, values]) => {
      if (field !== targetField && values && values.length > 0) {
        result = result.filter(tercero => {
          let fieldValue = getNestedValue(tercero, field);
          
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
  const { processedTerceros, totalFilteredItems, paginatedTerceros } = useMemo(() => {
    let result = [...terceros];

    // Aplicar filtros
    Object.entries(filters).forEach(([field, values]) => {
      if (values && values.length > 0) {
        result = result.filter(tercero => {
          let fieldValue = getNestedValue(tercero, field);
          
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

        if (sortConfig.field === 'id_tercero') {
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
    const paginatedTerceros = result.slice(startIndex, endIndex);

    return {
      processedTerceros: result,
      totalFilteredItems,
      paginatedTerceros
    };
  }, [terceros, filters, sortConfig, currentPage, itemsPerPage]);

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
        setEditedTerceros({});
        setPendingChanges(new Set());
      }
    } else {
      setIsGridEditMode(!isGridEditMode);
      setEditedTerceros({});
      setPendingChanges(new Set());
    }
  };

  const handleCellSave = async (terceroId, field, newValue) => {
    setEditedTerceros(prev => ({
      ...prev,
      [terceroId]: {
        ...prev[terceroId],
        [field]: newValue
      }
    }));

    setPendingChanges(prev => new Set([...prev, terceroId]));

    try {
      const updatedData = { [field]: newValue };
      const response = await apiCall(`/api/terceros/${terceroId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setTerceros(prev => prev.map(t => 
          t.id_tercero === terceroId 
            ? { ...t, [field]: newValue }
            : t
        ));

        setPendingChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(terceroId);
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
      const updatePromises = Array.from(pendingChanges).map(terceroId => {
        const changes = editedTerceros[terceroId];
        return fetch(`/api/terceros/${terceroId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(changes),
        });
      });

      await Promise.all(updatePromises);
      
      await cargarTerceros();
      
      setEditedTerceros({});
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
      setEditedTerceros({});
      setPendingChanges(new Set());
      cargarTerceros();
    }
  };

  // Cálculos para widgets (usando datos filtrados)
  const cantidadTerceros = totalFilteredItems;
  const personasNaturales = processedTerceros.filter(t => t.tipo_personalidad === 'NATURAL').length;
  const personasJuridicas = processedTerceros.filter(t => t.tipo_personalidad === 'JURIDICA').length;
  const clientes = processedTerceros.filter(t => t.tipo_relacion === 'CLIENTE').length;
  const proveedores = processedTerceros.filter(t => t.tipo_relacion === 'PROVEEDOR').length;
  const empleados = processedTerceros.filter(t => t.tipo_relacion === 'EMPLEADO').length;

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6 overflow-x-auto">
      {/* Widgets */}
      <div className="flex gap-6 mb-8">
        {/* Total de terceros */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total de Terceros</div>
            <div className="text-2xl font-bold">{cantidadTerceros}</div>
            {Object.keys(filters).length > 0 ? (
              <div className="text-xs text-blue-500">
                ({terceros.length} total, {cantidadTerceros} filtrados)
              </div>
            ) : (
              <div className="text-sm text-gray-500">Registrados en el sistema</div>
            )}
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Personas vs Empresas */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tipos de Personalidad</div>
            <div className="text-lg font-bold text-green-600">Naturales: {personasNaturales}</div>
            <div className="text-lg font-bold text-purple-600">Jurídicas: {personasJuridicas}</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Building className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Tipos de relación */}
        <div className="flex-1 rounded-xl border bg-white shadow p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tipos de Relación</div>
            <div className="text-sm font-medium text-blue-600">Clientes: {clientes}</div>
            <div className="text-sm font-medium text-orange-600">Proveedores: {proveedores}</div>
            <div className="text-sm font-medium text-purple-600">Empleados: {empleados}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <BarChart2 className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Terceros</h1>
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
            Nuevo Tercero
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
            {paginatedTerceros.map((tercero, idx) => (
              <TableRow 
                key={tercero.id_tercero} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition
                  ${pendingChanges.has(tercero.id_tercero) ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                `}
              >
                {availableColumns.map(column => {
                  if (!visibleColumns[column.key]) return null;
                  
                  const fieldType = getFieldType(column.key);
                  const currentValue = editedTerceros[tercero.id_tercero]?.[column.key] ?? getNestedValue(tercero, column.key);
                  const hasChanges = pendingChanges.has(tercero.id_tercero);
                  
                  return (
                    <TableCell 
                      key={`${tercero.id_tercero}-${column.key}`}
                      className={hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                    >
                      {isGridEditMode ? (
                        <EditableCell
                          value={currentValue}
                          onSave={(newValue) => handleCellSave(tercero.id_tercero, column.key, newValue)}
                          field={column.key}
                          type={fieldType}
                          options={getFieldOptions(column.key)}
                          disabled={fieldType === 'disabled'}
                        />
                      ) : (
                        renderColumnValue(tercero, column.key)
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
                        setTerceroVisto(tercero);
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
                        setTerceroSeleccionado(tercero);
                        setIsEditarDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-400 hover:bg-red-100"
                      onClick={() => eliminarTercero(tercero.id_tercero)}
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

        {/* Componente de paginación */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalFilteredItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[10, 20, 30]}
        />

      <CrearTerceroDialog
        open={isCrearDialogOpen}
        onClose={() => setIsCrearDialogOpen(false)}
        onTerceroCreado={cargarTerceros}
      />

      <EditarTerceroDialog
        open={isEditarDialogOpen}
        onClose={() => {
          setIsEditarDialogOpen(false);
          setTerceroSeleccionado(null);
        }}
        tercero={terceroSeleccionado}
        onTerceroActualizado={cargarTerceros}
      />

      <VerTerceroDialog
        open={isVerDialogOpen}
        onClose={() => {
          setIsVerDialogOpen(false);
          setTerceroVisto(null);
        }}
        tercero={terceroVisto}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        totalRecords={terceros.length}
        filteredRecords={processedTerceros.length}
        entityName="terceros"
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        loading={isImporting}
        entityName="terceros"
        columns={templateColumns}
        templateData={[{
          'Tipo Personalidad': 'NATURAL',
          'Tipo Documento': 'CC',
          'Número Documento': '12345678',
          'DV': '9',
          'Tipo Relación': 'CLIENTE',
          'Teléfono': '3001234567',
          'Email': 'ejemplo@email.com',
          'Dirección': 'Calle 123 # 45-67',
          'Ciudad': 'Bogotá',
          'Departamento': 'Cundinamarca',
          'País': 'Colombia',
          'Primer Nombre': 'Juan',
          'Otros Nombres': 'Carlos',
          'Primer Apellido': 'Pérez',
          'Segundo Apellido': 'García',
          'Razón Social': 'Empresa S.A.S.',
          'Observaciones': 'Observaciones del tercero'
        }]}
      />
    </div>
  );
};

export default Terceros;
