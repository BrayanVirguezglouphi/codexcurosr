import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const TemplateDownloader = ({ 
  templateData = null, 
  columns = null, 
  entityName = "datos",
  className = "" 
}) => {
  
  const downloadTemplate = () => {
    try {
      console.log('🔄 Iniciando descarga con TemplateDownloader...');
      console.log('📋 Datos recibidos:', { templateData, columns, entityName });

      // Verificar que XLSX esté disponible
      if (!XLSX || !XLSX.utils) {
        throw new Error('XLSX no está disponible');
      }

      if (!saveAs || typeof saveAs !== 'function') {
        throw new Error('saveAs no está disponible');
      }

      console.log('✅ Librerías verificadas correctamente');

      let dataToUse = [];

      // Usar templateData si está disponible
      if (templateData && Array.isArray(templateData) && templateData.length > 0) {
        console.log('📝 Usando templateData proporcionado');
        dataToUse = templateData;
      } 
      // Si hay columns, crear datos de ejemplo
      else if (columns && Array.isArray(columns) && columns.length > 0) {
        console.log('📝 Creando datos desde columns');
        const exampleRow = {};
        columns.forEach(col => {
          if (col.example) {
            exampleRow[col.label || col.key] = col.example;
          } else {
            exampleRow[col.label || col.key] = getExampleValue(col.key, col.label);
          }
        });
        dataToUse = [exampleRow];
      } 
      // Fallback
      else {
        console.log('⚠️ Usando datos de fallback');
        dataToUse = [{ 
          'Campo1': 'Ejemplo1', 
          'Campo2': 'Ejemplo2',
          'Campo3': 'Ejemplo3'
        }];
      }

      console.log('📊 Datos finales para Excel:', dataToUse);

      if (!dataToUse || dataToUse.length === 0) {
        throw new Error('No hay datos para crear la plantilla');
      }

      // Crear archivo Excel
      console.log('📁 Creando archivo Excel...');
      const ws = XLSX.utils.json_to_sheet(dataToUse);
      const wb = XLSX.utils.book_new();
      
      // Ajustar ancho de columnas
      const colKeys = Object.keys(dataToUse[0] || {});
      const columnWidths = colKeys.map(col => ({
        wch: Math.max(col.length, 15)
      }));
      ws['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
      
      // Generar archivo
      console.log('💾 Generando buffer...');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `plantilla_${entityName.replace(/\s+/g, '_').toLowerCase()}.xlsx`;
      
      console.log('📤 Descargando archivo:', {
        nombre: fileName,
        tamaño: blob.size,
        tipo: blob.type
      });
      
      // Descargar
      saveAs(blob, fileName);
      
      console.log('✅ Plantilla descargada exitosamente');
      
    } catch (error) {
      console.error('❌ Error en TemplateDownloader:', error);
      console.error('Stack trace:', error.stack);
      alert(`Error al descargar plantilla: ${error.message}\nRevisa la consola para más detalles.`);
    }
  };

  // Función para generar valores de ejemplo
  const getExampleValue = (columnKey, columnLabel) => {
    const key = (columnKey || columnLabel || '').toLowerCase();
    
    if (key.includes('fecha')) {
      return '2024-01-15';
    } else if (key.includes('numero') || key.includes('código') || key.includes('codigo')) {
      return 'ABC-001';
    } else if (key.includes('estado') || key.includes('estatus')) {
      return 'ACTIVO';
    } else if (key.includes('id')) {
      return '1';
    } else if (key.includes('valor') || key.includes('monto') || key.includes('precio')) {
      return '1000000';
    } else if (key.includes('descripcion') || key.includes('observacion')) {
      return 'Descripción de ejemplo';
    } else if (key.includes('nombre')) {
      return 'Ejemplo Nombre';
    } else if (key.includes('tipo')) {
      return 'Tipo Ejemplo';
    } else if (key.includes('personalidad')) {
      return 'NATURAL';
    } else if (key.includes('documento')) {
      return 'CC';
    } else if (key.includes('telefono')) {
      return '3001234567';
    } else if (key.includes('email')) {
      return 'ejemplo@email.com';
    } else if (key.includes('direccion')) {
      return 'Calle 123 # 45-67';
    }
    return 'Ejemplo';
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={downloadTemplate}
      className={`border-blue-300 text-blue-700 hover:bg-blue-100 ${className}`}
    >
      <Download className="w-4 h-4 mr-2" />
      Plantilla
    </Button>
  );
};

export default TemplateDownloader; 