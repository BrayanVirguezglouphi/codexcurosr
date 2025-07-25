import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { 
  Settings, 
  FileText, 
  Tag, 
  Info,
  Plus,
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

const CrearLineaServicioDialog = ({ open, onClose, onLineaServicioCreada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      nombre: '',
      id_modelonegocio: '',
      descripcion_servicio: ''
    }
  });
  const { toast } = useToast();

  // Estado para modelos de negocio
  const [modelosNegocio, setModelosNegocio] = useState([]);
  const currentModeloNegocio = watch('id_modelonegocio');

  useEffect(() => {
    // Cargar modelos de negocio al abrir el diálogo
    if (open) {
      apiCall('/api/modelos-negocio').then(data => {
        setModelosNegocio(data);
      });
    }
  }, [open]);

  const onSubmit = async (data) => {
    try {
      console.log('📝 Creando línea de servicio:', data);
      await apiCall('/api/lineas-servicios', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast({ title: "Éxito", description: "Línea de servicio creada correctamente" });
      onLineaServicioCreada();
      reset();
      onClose();
    } catch (error) {
      console.error('❌ Error al crear línea de servicio:', error);
      toast({ title: "Error", description: "No se pudo crear la línea de servicio", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Crear Nueva Línea de Servicio
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete la información para registrar una nueva línea de servicio
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
                <Label htmlFor="nombre">Nombre del Servicio *</Label>
                <Input 
                  id="nombre" 
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  placeholder="Ej: Internet Corporativo"
                />
                {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_modelonegocio">Modelo de Negocio *</Label>
                <SearchableSelect
                  options={modelosNegocio}
                  value={currentModeloNegocio}
                  onChange={(value) => setValue('id_modelonegocio', value)}
                  placeholder="Seleccione modelo de negocio"
                  displayKey="modelo"
                  valueKey="id_modelonegocio"
                  searchPlaceholder="Buscar modelo..."
                />
                <input type="hidden" {...register('id_modelonegocio', { required: 'El modelo de negocio es requerido' })} value={currentModeloNegocio || ''} />
                {errors.id_modelonegocio && <span className="text-red-500 text-sm">{errors.id_modelonegocio.message}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion_servicio">Descripción del Servicio</Label>
                <Textarea 
                  id="descripcion_servicio" 
                  {...register('descripcion_servicio')}
                  placeholder="Describa detalladamente el servicio"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Línea de Servicio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearLineaServicioDialog; 
