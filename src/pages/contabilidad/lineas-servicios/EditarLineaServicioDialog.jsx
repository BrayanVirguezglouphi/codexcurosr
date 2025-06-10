import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';
import { 
  Settings, 
  FileText, 
  Tag, 
  Info,
  ChevronDown,
  Search,
  X
} from 'lucide-react';

// Componente SearchableSelect idéntico al de facturas
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

const EditarLineaServicioDialog = ({ open, onClose, lineaServicio, onLineaServicioActualizada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { toast } = useToast();

  // Watch para campos controlados
  const currentTipoServicio = watch('tipo_servicio');

  const tiposServicio = [
    { id: 'CONSULTORIA', name: 'Consultoría' },
    { id: 'DESARROLLO', name: 'Desarrollo' },
    { id: 'SOPORTE', name: 'Soporte' },
    { id: 'MANTENIMIENTO', name: 'Mantenimiento' },
    { id: 'CAPACITACION', name: 'Capacitación' },
    { id: 'ANALISIS', name: 'Análisis' },
    { id: 'IMPLEMENTACION', name: 'Implementación' },
    { id: 'OTRO', name: 'Otro' }
  ];

  useEffect(() => {
    if (lineaServicio && open) {
      setValue('servicio', lineaServicio.servicio || '');
      setValue('tipo_servicio', lineaServicio.tipo_servicio || '');
      setValue('descripcion_servicio', lineaServicio.descripcion_servicio || '');
    }
  }, [lineaServicio, open, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lineas-servicios/${lineaServicio.id_servicio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({ title: "Éxito", description: "Línea de servicio actualizada correctamente" });
        onLineaServicioActualizada();
        onClose();
      } else {
        throw new Error('Error al actualizar la línea de servicio');
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar la línea de servicio", variant: "destructive" });
    }
  };

  if (!lineaServicio) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Editar Línea de Servicio
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Modifique los datos de la línea de servicio seleccionada
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              📋 Información Básica
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="servicio">Nombre del Servicio *</Label>
                <Input 
                  id="servicio" 
                  {...register("servicio", { 
                    required: "El nombre del servicio es requerido",
                    maxLength: { value: 200, message: "El servicio no puede exceder 200 caracteres" }
                  })} 
                  placeholder="Ej: Consultoría en sistemas, Desarrollo web, Soporte técnico..."
                />
                {errors.servicio && (
                  <p className="text-sm text-red-500">{errors.servicio.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Clasificación del Servicio */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Tag className="w-5 h-5" />
              🏷️ Clasificación del Servicio
            </h3>
            <div className="space-y-2">
              <Label htmlFor="tipo_servicio">Tipo de Servicio</Label>
              <SearchableSelect
                options={tiposServicio}
                value={currentTipoServicio}
                onChange={(value) => setValue('tipo_servicio', value)}
                placeholder="Seleccione el tipo de servicio"
                searchPlaceholder="Buscar tipo de servicio..."
                displayKey="name"
                valueKey="id"
              />
              <input type="hidden" {...register("tipo_servicio")} />
            </div>
          </div>

          {/* Descripción Detallada */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Info className="w-5 h-5" />
              📝 Descripción Detallada del Servicio
            </h3>
            <div className="space-y-2">
              <Label htmlFor="descripcion_servicio">Descripción del Servicio</Label>
              <Textarea 
                id="descripcion_servicio" 
                {...register("descripcion_servicio")} 
                placeholder="Describa detalladamente en qué consiste el servicio, metodología, entregables, etc."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Incluya información relevante como metodología, tecnologías, entregables esperados, etc.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Actualizar Línea de Servicio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarLineaServicioDialog; 