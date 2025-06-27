import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import ExcelJS from 'exceljs';

const TemplateDownloader = ({ 
  templateData = [], 
  columns = [], 
  entityName = "datos",
  className = ""
}) => {
  
  const downloadTemplate = async () => {
    try {
      console.log('🔄 Iniciando descarga de plantilla...');
      
      const fileName = `plantilla_${entityName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`;
      
      // Crear nuevo workbook con ExcelJS
      const workbook = new ExcelJS.Workbook();
      
      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Plantilla');
      
      // Definir encabezados
      const headers = columns.map(col => col.label || col.key);
      
      // Agregar encabezados
      worksheet.addRow(headers);
      
      // Formatear encabezados
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
      
      // Agregar datos de ejemplo si existen
      if (Array.isArray(templateData) && templateData.length > 0) {
        templateData.forEach(row => {
          if (row && typeof row === 'object') {
            const rowData = columns.map(col => {
              const value = row[col.key];
              return value !== undefined && value !== null ? value : '';
            });
            worksheet.addRow(rowData);
          }
        });
      }
      
      // Configurar validaciones para campos con opciones
      columns.forEach((col, index) => {
        if (col.options && Array.isArray(col.options)) {
          const colLetter = String.fromCharCode(65 + index);
          const lastRow = Math.max(1000, templateData.length + 10);
          
          // Crear hoja de opciones
          const optionsSheetName = `Opciones_${col.key}`;
          const optionsSheet = workbook.addWorksheet(optionsSheetName);
          optionsSheet.addRow(['Valores_Válidos']);
          col.options.forEach(option => {
            if (option && (typeof option === 'string' || typeof option === 'number')) {
              optionsSheet.addRow([option.toString()]);
            }
          });
          
          // Configurar validación usando la hoja de opciones
          for (let row = 2; row <= lastRow; row++) {
            worksheet.getCell(`${colLetter}${row}`).dataValidation = {
              type: 'list',
              allowBlank: !col.required,
              formulae: [`${optionsSheetName}!$A$2:$A$${col.options.length + 1}`],
              showErrorMessage: true,
              errorStyle: 'error',
              errorTitle: 'Valor inválido',
              error: `Por favor seleccione un valor válido de la lista`
            };
          }
        }
      });
      
      // Agregar hoja de instrucciones
      const instructionsSheet = workbook.addWorksheet('📋_Instrucciones');
      const instructions = [
        ['🎯 INSTRUCCIONES PARA USAR LA PLANTILLA'],
        [''],
        ['1. Use la pestaña "Plantilla" para ingresar sus datos'],
        ['2. Los campos marcados con * son obligatorios'],
        ['3. Algunos campos tienen listas desplegables (⬇️):'],
        ...columns
          .filter(col => col.options)
          .map(col => [`   • ${col.label}: Seleccione una opción de la lista desplegable`]),
        [''],
        ['4. Para campos con dropdown:'],
        ['   • Haga clic en la celda'],
        ['   • Aparecerá una flecha ⬇️ a la derecha'],
        ['   • Haga clic en la flecha para ver las opciones'],
        ['   • Seleccione la opción deseada'],
        [''],
        ['5. Al importar:'],
        ['   • Asegúrese de que los datos estén en el formato correcto'],
        ['   • No modifique los nombres de las columnas'],
        ['   • Los datos deben empezar en la fila 2'],
        [''],
        ['⚠️ IMPORTANTE:'],
        ['• NO modifique las hojas auxiliares (Opciones_*)'],
        ['• Use solo la hoja "Plantilla" para sus datos'],
        ['• Los dropdowns funcionan hasta la fila 1000']
      ];
      
      instructions.forEach((row, index) => {
        const excelRow = instructionsSheet.addRow(row);
        if (index === 0) {
          excelRow.font = { bold: true, size: 14 };
        }
      });
      
      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      // Descargar archivo
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.xlsx`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Plantilla descargada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al generar plantilla:', error);
    }
  };

  return (
    <Button
      onClick={downloadTemplate}
      variant="outline"
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Descargar Plantilla
    </Button>
  );
};

export default TemplateDownloader; 
