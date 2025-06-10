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
  className = ""
}) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Usar templateColumns para la plantilla si está disponible, sino usar columns
  const columnsForTemplate = templateColumns || columns;

  // Exportar a Excel
  const exportToExcel = () => {
    try {
      // Preparar datos para exportación
      const exportData = data.map(row => {
        const exportRow = {};
        columns.forEach(col => {
          let value = row[col.key];
          
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
      const columnWidths = columns.map(col => ({
        wch: Math.max(col.label.length, 15)
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
          } else if (col.key.includes('moneda') || col.key.includes('valor') || col.key.includes('subtotal')) {
            // Para campos numéricos, convertir a número o null
            if (value === null || value === '' || isNaN(value)) {
              processedRow[col.key] = null;
            } else {
              processedRow[col.key] = parseFloat(value);
            }
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

  // Descargar plantilla Excel
  const downloadTemplate = () => {
    try {
      // Crear datos de ejemplo
      const templateData = columnsForTemplate.reduce((acc, col) => {
        acc[col.label] = col.example || 'Ejemplo';
        return acc;
      }, {});

      // Crear hoja con headers solamente
      const ws = XLSX.utils.json_to_sheet([templateData]);
      const wb = XLSX.utils.book_new();
      
      // Ajustar ancho de columnas
      const columnWidths = columnsForTemplate.map(col => ({
        wch: Math.max(col.label.length, 15)
      }));
      ws['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `plantilla_${filename}.xlsx`);
      
      toast({
        title: "Éxito",
        description: `Plantilla descargada: plantilla_${filename}.xlsx`,
      });
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la plantilla",
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