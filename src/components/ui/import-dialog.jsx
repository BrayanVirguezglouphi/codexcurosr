import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import TemplateDownloader from './template-downloader';

const ImportDialog = ({ 
  open, 
  onOpenChange,
  onClose, 
  onImport, 
  loading = false,
  entityName = "datos",
  tableName = "datos", // Retrocompatibilidad
  templateData = [],
  columns = [],
  templateColumns = [] // Retrocompatibilidad
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Usar parámetros unificados o de retrocompatibilidad
  const displayName = entityName || tableName;
  const finalTemplateData = templateData.length > 0 ? templateData : [];
  const finalColumns = columns.length > 0 ? columns : templateColumns.map(col => ({ key: col, label: col }));

  // Función mejorada para cerrar el diálogo
  const closeDialog = () => {
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Manejar drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Procesar archivo
  const processFile = (file) => {
    if (!file.name.toLowerCase().includes('.xlsx') && !file.name.toLowerCase().includes('.xls')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo Excel (.xlsx o .xls)",
        variant: "destructive",
      });
      return;
    }

    if (onImport) {
      onImport(file);
    }
  };



  const handleCancel = () => {
    closeDialog();
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Importar {displayName}
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel con los datos a importar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Área de drag and drop */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading}
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo Excel'}
                </p>
                <p className="text-sm text-gray-500">
                  o haz clic para seleccionar un archivo
                </p>
              </div>
              
              <Button 
                variant="outline" 
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo
              </Button>
            </div>
          </div>

          {/* Información sobre el formato */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-800 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Formato requerido</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Archivo Excel (.xlsx o .xls)</li>
              <li>• Primera fila debe contener los nombres de las columnas</li>
              <li>• Los datos deben empezar desde la segunda fila</li>
            </ul>
            
            {/* Mostrar columnas esperadas */}
            {finalColumns.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Columnas esperadas:</p>
                <div className="flex flex-wrap gap-1">
                  {finalColumns.map((col, idx) => (
                    <span 
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        col.required 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {col.label}{col.required && ' *'}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-red-600 mt-1">* Campos requeridos</p>
              </div>
            )}
          </div>

          {/* Botón para descargar plantilla */}
          {(finalTemplateData.length > 0 || finalColumns.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    ¿No tienes una plantilla?
                  </p>
                  <p className="text-sm text-blue-700">
                    Descarga nuestra plantilla con el formato correcto
                  </p>
                </div>
                <TemplateDownloader
                  templateData={finalTemplateData}
                  columns={finalColumns}
                  entityName={displayName}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog; 