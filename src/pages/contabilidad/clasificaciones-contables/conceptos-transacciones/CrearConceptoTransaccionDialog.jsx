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
  Target, 
  Code, 
  Building, 
  Info,
  FileText,
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
        className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption 
              ? (formatOption ? formatOption(selectedOption) : selectedOption[displayKey])
              : placeholder
            }
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option[valueKey]}
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  {formatOption ? formatOption(option) : option[displayKey]}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No se encontraron opciones
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CrearConceptoTransaccionDialog = ({ open, onOpenChange, onConceptoCreado }) => {
  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      id_tipotransaccion: '',
      codigo_dian: '',
      concepto_dian: ''
    }
  });

  const watchedFields = watch();

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      if (open) {
        try {
          const tipos = await apiCall('/api/tipos-transaccion');
          setTiposTransaccion(Array.isArray(tipos) ? tipos : []);
        } catch (error) {
          console.error('Error al cargar tipos de transacción:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los tipos de transacción",
            variant: "destructive",
          });
        }
      }
    };

    cargarDatos();
  }, [open, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/conceptos-transacciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Concepto de transacción creado correctamente",
        });
        
        reset();
        onConceptoCreado?.();
        onOpenChange(false);
      } else {
        throw new Error('Error al crear el concepto de transacción');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el concepto de transacción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado Elegante */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Crear Nuevo Concepto de Transacción
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Complete la información para crear un nuevo concepto de transacción
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Info className="w-5 h-5" />
              📋 Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_tipotransaccion">Tipo de Transacción *</Label>
                <SearchableSelect
                  options={tiposTransaccion}
                  value={watchedFields.id_tipotransaccion}
                  onChange={(value) => setValue('id_tipotransaccion', value)}
                  placeholder="Seleccione un tipo de transacción"
                  displayKey="tipo_transaccion"
                  valueKey="id_tipotransaccion"
                />
                <input
                  type="hidden"
                  {...register("id_tipotransaccion", { 
                    required: "El tipo de transacción es requerido" 
                  })}
                />
                {errors.id_tipotransaccion && (
                  <p className="text-sm text-red-500">{errors.id_tipotransaccion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo_dian">Código DIAN</Label>
                <Input 
                  id="codigo_dian" 
                  {...register("codigo_dian", { 
                    maxLength: { value: 20, message: "No puede exceder 20 caracteres" }
                  })} 
                  placeholder="Ingrese el código DIAN (opcional)"
                />
                {errors.codigo_dian && (
                  <p className="text-sm text-red-500">{errors.codigo_dian.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información DIAN */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Building className="w-5 h-5" />
              🏛️ Información DIAN
            </h3>
            <div className="space-y-2">
              <Label htmlFor="concepto_dian">Concepto DIAN *</Label>
              <Textarea 
                id="concepto_dian" 
                {...register("concepto_dian", { 
                  required: "El concepto DIAN es requerido",
                  maxLength: { value: 500, message: "No puede exceder 500 caracteres" }
                })} 
                placeholder="Describa el concepto según las especificaciones DIAN"
                rows={4}
              />
              {errors.concepto_dian && (
                <p className="text-sm text-red-500">{errors.concepto_dian.message}</p>
              )}
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Target className="w-5 h-5" />
              ⚙️ Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Estado</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Activo</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">El concepto se creará en estado activo</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Tipo</span>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Concepto</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Clasificación de concepto de transacción</p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crear Concepto
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearConceptoTransaccionDialog; 