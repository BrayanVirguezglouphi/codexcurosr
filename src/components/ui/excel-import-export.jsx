import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExcelImportExport = ({ 
  data = [], 
  columns = [], 
  templateColumns = null,
  filename = 'datos',
  onImport,
  catalogData = {}, // Nuevo prop para datos de catálogos
  className = ""
}) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Usar templateColumns para la plantilla si está disponible, sino usar columns
  const columnsForTemplate = templateColumns || columns;

  // Función para crear opciones de dropdown en formato "ID - Código - Nombre"
  const createDropdownOptions = (catalogType, catalogItems) => {
    if (!catalogItems || catalogItems.length === 0) return [];
    
    switch(catalogType) {
      case 'moneda':
        return catalogItems.map(item => 
          `${item.id_moneda} - ${item.codigo_iso} - ${item.nombre_moneda}`
        );
      case 'contrato':
        return catalogItems.map(item => 
          `${item.id_contrato} - ${item.numero_contrato_os} - ${item.descripcion_servicio_contratado}`
        );
      case 'impuesto':
        return catalogItems.map(item => 
          `${item.id_tax} - ${item.tipo_obligacion} - ${item.titulo_impuesto}`
        );
      case 'tercero':
        return catalogItems.map(item => {
          const nombre = item.razon_social || `${item.primer_nombre} ${item.primer_apellido}`;
          return `${item.id_tercero} - ${item.tipo_documento} - ${nombre}`;
        });
      default:
        return catalogItems.map(item => {
          const firstKey = Object.keys(item)[0];
          const secondKey = Object.keys(item)[1];
          return `${item[firstKey]} - ${item[secondKey]}`;
        });
    }
  };

  // Función para extraer ID de valores con formato "ID - Código - Nombre"
  const extractIdFromDropdownValue = (value) => {
    if (!value || typeof value !== 'string') return null;
    const match = value.match(/^(\d+)\s*-/);
    return match ? parseInt(match[1]) : null;
  };

  // Exportar a Excel
  const exportToExcel = () => {
    try {
      // Preparar datos para exportación con nombres legibles
      const exportData = data.map(row => {
        const exportRow = {};
        columns.forEach(col => {
          let value = row[col.key];
          
          // Formatear valores especiales con nombres legibles
          if (col.key.includes('fecha') && value) {
            value = new Date(value).toLocaleDateString('es-CO');
          } else if (col.key.includes('moneda') || col.key.includes('valor') || col.key.includes('subtotal')) {
            value = value ? parseFloat(value) : 0;
          } else if (col.key.includes('id_moneda') && catalogData.monedas) {
            const moneda = catalogData.monedas.find(m => m.id_moneda === value);
            if (moneda) {
              value = `${moneda.id_moneda} - ${moneda.codigo_iso} - ${moneda.nombre_moneda}`;
            }
          } else if (col.key.includes('id_contrato') && catalogData.contratos) {
            const contrato = catalogData.contratos.find(c => c.id_contrato === value);
            if (contrato) {
              value = `${contrato.id_contrato} - ${contrato.numero_contrato_os} - ${contrato.descripcion_servicio_contratado}`;
            }
          } else if (col.key.includes('id_tax') && catalogData.impuestos) {
            const impuesto = catalogData.impuestos.find(i => i.id_tax === value);
            if (impuesto) {
              value = `${impuesto.id_tax} - ${impuesto.tipo_obligacion} - ${impuesto.titulo_impuesto}`;
            }
          } else if (col.key.includes('id_tercero') && catalogData.terceros) {
            const tercero = catalogData.terceros.find(t => t.id_tercero === value);
            if (tercero) {
              const nombre = tercero.razon_social || `${tercero.primer_nombre} ${tercero.primer_apellido}`;
              value = `${tercero.id_tercero} - ${tercero.tipo_documento} - ${nombre}`;
            }
          }
          
          exportRow[col.label] = value || '';
        });
        return exportRow;
      });

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Ajustar ancho de columnas
      const columnWidths = columns.map(col => ({
        wch: Math.max(col.label.length, 20)
      }));
      ws['!cols'] = columnWidths;
      
      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      
      // Generar archivo y descargar
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(blob, `${filename}_${timestamp}.xlsx`);
      
      toast({
        title: "Éxito",
        description: `Archivo Excel exportado: ${filename}_${timestamp}.xlsx`,
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

  // Manejar selección de archivo para importar
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      importFromExcel(file);
    }
  };

  // Importar desde Excel
  const importFromExcel = async (file) => {
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('El archivo está vacío');
      }

      // Validar estructura del archivo usando todas las columnas de la plantilla
      const fileColumns = Object.keys(jsonData[0]);
      const expectedColumns = columnsForTemplate.map(col => col.label);
      const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
      const extraColumns = fileColumns.filter(col => !expectedColumns.includes(col));

      // Procesar datos usando todas las columnas de la plantilla
      const processedData = jsonData.map((row, index) => {
        const processedRow = {};
        
        columnsForTemplate.forEach(col => {
          let value = row[col.label];
          
          console.log(`Procesando columna ${col.label} (${col.key}): ${value} (tipo: ${typeof value})`);
          
          // Limpiar valores problemáticos, pero mantener valores válidos
          if (value === undefined || value === '') {
            value = null;
          }
          
          // Convertir tipos de datos
          if (col.key.includes('fecha') && value !== null) {
            // Manejar fechas de Excel
            if (typeof value === 'number') {
              // Fecha serial de Excel
              const excelDate = new Date((value - 25569) * 86400 * 1000);
              processedRow[col.key] = excelDate.toISOString().split('T')[0];
            } else if (typeof value === 'string') {
              // Fecha en texto
              const parsedDate = new Date(value);
              processedRow[col.key] = isNaN(parsedDate) ? null : parsedDate.toISOString().split('T')[0];
            } else {
              processedRow[col.key] = null;
            }
          } else if (col.key.includes('valor') || col.key.includes('subtotal') || col.key.includes('precio')) {
            // Para campos numéricos, convertir a número o null
            if (value === null || value === '' || isNaN(value)) {
              processedRow[col.key] = null;
            } else {
              processedRow[col.key] = parseFloat(value);
            }
          } else if (col.key.includes('id_moneda') || col.key.includes('id_contrato') || 
                     col.key.includes('id_tax') || col.key.includes('id_tercero') ||
                     col.key.includes('id_cuenta') || col.key.includes('id_tipotransaccion') ||
                     col.key.includes('id_etiqueta') || col.key.includes('id_concepto')) {
            // Para campos de ID con formato "ID - Código - Nombre", extraer solo el ID
            const extractedId = extractIdFromDropdownValue(value);
            processedRow[col.key] = extractedId;
            console.log(`Extrayendo ID de "${value}": ${extractedId}`);
          } else {
            // Para otros campos, usar el valor limpio
            processedRow[col.key] = value;
          }
          
          console.log(`Resultado para ${col.key}: ${processedRow[col.key]}`);
        });
        
        return { ...processedRow, _rowIndex: index + 2 }; // +2 porque Excel empieza en 1 y tiene header
      });

      const results = {
        totalRows: jsonData.length,
        processedRows: processedData.length,
        missingColumns,
        extraColumns,
        data: processedData,
        filename: file.name
      };

      setImportResults(results);
      setIsImportDialogOpen(true);
      
    } catch (error) {
      console.error('Error al importar:', error);
      toast({
        title: "Error",
        description: `Error al procesar el archivo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Confirmar importación
  const confirmImport = () => {
    if (importResults && onImport) {
      onImport(importResults.data);
      toast({
        title: "Éxito",
        description: `${importResults.processedRows} registros importados correctamente`,
      });
    }
    setIsImportDialogOpen(false);
    setImportResults(null);
  };

  // Descargar plantilla Excel con dropdowns mejorados
  const downloadTemplate = () => {
    try {
      console.log('🔄 Iniciando descarga de plantilla con dropdowns...');
      console.log('Columnas para plantilla:', columnsForTemplate);
      console.log('Datos de catálogos:', catalogData);

      // Verificar que tenemos columnas
      if (!columnsForTemplate || columnsForTemplate.length === 0) {
        throw new Error('No hay columnas definidas para la plantilla');
      }

      // Crear datos de ejemplo con formato mejorado
      const templateData = columnsForTemplate.reduce((acc, col) => {
        let example = col.example || 'Ejemplo';
        
        // Generar ejemplos específicos para campos de ID
        if (col.key.includes('id_moneda') && catalogData.monedas && catalogData.monedas.length > 0) {
          const primera = catalogData.monedas[0];
          example = `${primera.id_moneda} - ${primera.codigo_iso} - ${primera.nombre_moneda}`;
        } else if (col.key.includes('id_contrato') && catalogData.contratos && catalogData.contratos.length > 0) {
          const primero = catalogData.contratos[0];
          example = `${primero.id_contrato} - ${primero.numero_contrato_os} - ${primero.descripcion_servicio_contratado}`;
        } else if (col.key.includes('id_tax') && catalogData.impuestos && catalogData.impuestos.length > 0) {
          const primero = catalogData.impuestos[0];
          example = `${primero.id_tax} - ${primero.tipo_obligacion} - ${primero.titulo_impuesto}`;
        } else if (col.key.includes('id_tercero') && catalogData.terceros && catalogData.terceros.length > 0) {
          const primero = catalogData.terceros[0];
          const nombre = primero.razon_social || `${primero.primer_nombre} ${primero.primer_apellido}`;
          example = `${primero.id_tercero} - ${primero.tipo_documento} - ${nombre}`;
        } else if (col.key.includes('fecha')) {
          example = new Date().toISOString().split('T')[0];
        } else if (col.key.includes('valor') || col.key.includes('precio')) {
          example = '1000.00';
        }
        
        acc[col.label] = example;
        return acc;
      }, {});

      console.log('Datos de plantilla con ejemplos mejorados:', templateData);

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Hoja principal con la plantilla
      const ws = XLSX.utils.json_to_sheet([templateData]);
      
      // Ajustar ancho de columnas
      const columnWidths = columnsForTemplate.map(col => ({
        wch: Math.max(col.label.length, 25)
      }));
      ws['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

      // Crear hojas auxiliares con opciones disponibles
      if (catalogData.monedas && catalogData.monedas.length > 0) {
        const monedasOptions = createDropdownOptions('moneda', catalogData.monedas);
        const wsMonedas = XLSX.utils.aoa_to_sheet([['Opciones de Monedas'], ...monedasOptions.map(opt => [opt])]);
        XLSX.utils.book_append_sheet(wb, wsMonedas, 'Opciones_Monedas');
      }

      if (catalogData.contratos && catalogData.contratos.length > 0) {
        const contratosOptions = createDropdownOptions('contrato', catalogData.contratos);
        const wsContratos = XLSX.utils.aoa_to_sheet([['Opciones de Contratos'], ...contratosOptions.map(opt => [opt])]);
        XLSX.utils.book_append_sheet(wb, wsContratos, 'Opciones_Contratos');
      }

      if (catalogData.impuestos && catalogData.impuestos.length > 0) {
        const impuestosOptions = createDropdownOptions('impuesto', catalogData.impuestos);
        const wsImpuestos = XLSX.utils.aoa_to_sheet([['Opciones de Impuestos'], ...impuestosOptions.map(opt => [opt])]);
        XLSX.utils.book_append_sheet(wb, wsImpuestos, 'Opciones_Impuestos');
      }

      if (catalogData.terceros && catalogData.terceros.length > 0) {
        const tercerosOptions = createDropdownOptions('tercero', catalogData.terceros);
        const wsTerceros = XLSX.utils.aoa_to_sheet([['Opciones de Terceros'], ...tercerosOptions.map(opt => [opt])]);
        XLSX.utils.book_append_sheet(wb, wsTerceros, 'Opciones_Terceros');
      }
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      console.log('Archivo Excel creado:', {
        tamaño: blob.size,
        tipo: blob.type,
        nombre: `plantilla_${filename}.xlsx`,
        hojas: wb.SheetNames
      });

      saveAs(blob, `plantilla_${filename}.xlsx`);
      
      console.log('✅ Plantilla con dropdowns descargada exitosamente');
      
      toast({
        title: "Éxito",
        description: `Plantilla descargada: plantilla_${filename}.xlsx - Incluye hojas con opciones disponibles`,
      });
    } catch (error) {
      console.error('❌ Error al crear plantilla:', error);
      console.error('Stack trace:', error.stack);
      toast({
        title: "Error",
        description: `No se pudo crear la plantilla: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          onClick={exportToExcel}
          className="border-green-400 text-green-600 hover:bg-green-50"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="border-blue-400 text-blue-600 hover:bg-blue-50"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isProcessing ? 'Procesando...' : 'Importar Excel'}
        </Button>
        
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="border-purple-400 text-purple-600 hover:bg-purple-50"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Plantilla
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Dialog de confirmación de importación */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Confirmar Importación de Excel
            </DialogTitle>
          </DialogHeader>
          
          {importResults && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Resumen de la importación
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Archivo:</span>
                    <div className="font-medium">{importResults.filename}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Filas procesadas:</span>
                    <div className="font-medium">{importResults.processedRows} de {importResults.totalRows}</div>
                  </div>
                </div>
              </div>

              {/* Advertencias sobre columnas */}
              {(importResults.missingColumns.length > 0 || importResults.extraColumns.length > 0) && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium flex items-center gap-2 mb-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    Advertencias de estructura
                  </h3>
                  
                  {importResults.missingColumns.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-yellow-700">Columnas faltantes:</span>
                      <div className="text-sm font-medium text-yellow-800">
                        {importResults.missingColumns.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {importResults.extraColumns.length > 0 && (
                    <div>
                      <span className="text-sm text-yellow-700">Columnas adicionales (serán ignoradas):</span>
                      <div className="text-sm font-medium text-yellow-800">
                        {importResults.extraColumns.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vista previa de datos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Vista previa (primeras 3 filas - campos principales)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        {columns.map(col => (
                          <th key={col.key} className="border p-1 text-left">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.data.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="bg-white">
                          {columns.map(col => (
                            <td key={col.key} className="border p-1">
                              {row[col.key] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Se muestran solo los campos principales. Los datos importados incluyen todos los campos de la plantilla.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={confirmImport}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Importación
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExcelImportExport;