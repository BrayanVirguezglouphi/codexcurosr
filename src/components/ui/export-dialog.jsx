import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Filter, Database, Download, CheckCircle } from 'lucide-react';

const ExportDialog = ({ 
  open, 
  onOpenChange, 
  onClose,
  onExport, 
  totalRecords = 0, 
  filteredRecords = 0,
  entityName = "registros"
}) => {
  const [exportType, setExportType] = useState('filtered');
  const hasFilters = filteredRecords !== totalRecords;

  // Función mejorada para cerrar el diálogo
  const closeDialog = () => {
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleExport = () => {
    onExport(exportType);
    closeDialog();
  };

  const handleCancel = () => {
    closeDialog();
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Exportar {entityName}
          </DialogTitle>
          <DialogDescription>
            Selecciona qué datos deseas exportar a Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={exportType} onValueChange={setExportType} className="space-y-3">
            {/* Opción: Exportar registros filtrados */}
            <div className={`flex items-center space-x-3 p-3 border rounded-lg transition-all cursor-pointer ${
              exportType === 'filtered' 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}>
              <RadioGroupItem value="filtered" id="filtered" />
              <Label htmlFor="filtered" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className={`font-medium ${
                      exportType === 'filtered' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {hasFilters ? "Registros filtrados" : "Registros actuales"}
                    </span>
                    {exportType === 'filtered' && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    exportType === 'filtered' 
                      ? 'text-blue-800 bg-blue-200' 
                      : 'text-gray-600 bg-blue-100'
                  }`}>
                    {filteredRecords.toLocaleString()} registros
                  </span>
                </div>
                <p className={`text-sm ml-6 mt-1 ${
                  exportType === 'filtered' ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {hasFilters 
                    ? "Exporta solo los registros que coinciden con los filtros aplicados"
                    : "Exporta todos los registros visibles"
                  }
                </p>
              </Label>
            </div>

            {/* Opción: Exportar todos los registros */}
            <div className={`flex items-center space-x-3 p-3 border rounded-lg transition-all cursor-pointer ${
              exportType === 'all' 
                ? 'border-green-500 bg-green-50 shadow-sm' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}>
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className={`font-medium ${
                      exportType === 'all' ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      Todos los registros
                    </span>
                    {exportType === 'all' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    exportType === 'all' 
                      ? 'text-green-800 bg-green-200' 
                      : 'text-gray-600 bg-green-100'
                  }`}>
                    {totalRecords.toLocaleString()} registros
                  </span>
                </div>
                <p className={`text-sm ml-6 mt-1 ${
                  exportType === 'all' ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Exporta todos los registros de la base de datos, ignorando filtros
                </p>
              </Label>
            </div>
          </RadioGroup>

          {/* Información adicional si hay filtros activos */}
          {hasFilters && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtros activos detectados</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Hay {(totalRecords - filteredRecords).toLocaleString()} registros adicionales que no se muestran debido a los filtros aplicados.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog; 