import { useState } from 'react';
import * as XLSX from 'xlsx';

export const useExcelImportExport = () => {
  const [loading, setLoading] = useState(false);

  // Función para exportar datos a Excel
  const exportToExcel = (data, filename, columns = null) => {
    setLoading(true);
    try {
      // Si no se especifican columnas, usar todas las claves del primer elemento
      const headers = columns || (data.length > 0 ? Object.keys(data[0]) : []);
      
      // Filtrar datos solo con las columnas especificadas si se proporcionan
      const filteredData = data.map(row => {
        const filteredRow = {};
        headers.forEach(header => {
          // Convertir valores nulos/undefined a strings vacíos para Excel
          filteredRow[header] = row[header] ?? '';
        });
        return filteredRow;
      });

      // Crear worksheet
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      
      // Crear workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
      
      // Generar nombre del archivo con fecha
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = `${filename}_${timestamp}.xlsx`;
      
      // Descargar archivo
      XLSX.writeFile(workbook, finalFilename);
      
      return { success: true, filename: finalFilename };
    } catch (error) {
      console.error('Error al exportar:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para importar datos desde Excel
  const importFromExcel = (file) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Obtener la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Obtener como array de arrays
            defval: '' // Valor por defecto para celdas vacías
          });
          
          if (jsonData.length === 0) {
            reject(new Error('El archivo está vacío'));
            return;
          }
          
          // La primera fila son los headers
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          // Convertir a array de objetos
          const processedData = rows
            .filter(row => row.some(cell => cell !== '')) // Filtrar filas completamente vacías
            .map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
            });
          
          resolve({
            success: true,
            data: processedData,
            headers: headers,
            totalRows: processedData.length
          });
        } catch (error) {
          reject(new Error(`Error al procesar el archivo: ${error.message}`));
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setLoading(false);
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Función para crear una plantilla Excel
  const downloadTemplate = (columns, filename) => {
    try {
      // Crear worksheet solo con headers
      const templateData = [{}];
      columns.forEach(col => {
        templateData[0][col] = '';
      });
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
      
      const finalFilename = `plantilla_${filename}.xlsx`;
      XLSX.writeFile(workbook, finalFilename);
      
      return { success: true, filename: finalFilename };
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    exportToExcel,
    importFromExcel,
    downloadTemplate
  };
}; 