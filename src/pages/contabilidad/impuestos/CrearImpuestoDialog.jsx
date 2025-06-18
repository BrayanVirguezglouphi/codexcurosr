import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { 
  Calculator, 
  FileText, 
  Building, 
  Calendar,
  Info,
  Link,
  Settings,
  DollarSign,
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

const CrearImpuestoDialog = ({ open, onClose, onImpuestoCreado }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      titulo_impuesto: '',
      tipo_obligacion: '',
      institucion_reguladora: '',
      periodicidad_declaracion: '',
      estado: 'ACTIVO',
      fecha_inicio_impuesto: '',
      fecha_final_impuesto: '',
      fecha_fin: '',
      formula_aplicacion: '',
      oportunidades_optimizacion: '',
      observaciones: '',
      url_referencia_normativa: '',
      url_instrucciones: ''
    }
  });
  const { toast } = useToast();

  // Watch para campos controlados
  const currentPeriodicidad = watch('periodicidad_declaracion');
  const currentEstado = watch('estado');

  const periodicidades = [
    { id: 'MENSUAL', name: 'Mensual' },
    { id: 'BIMESTRAL', name: 'Bimestral' },
    { id: 'TRIMESTRAL', name: 'Trimestral' },
    { id: 'SEMESTRAL', name: 'Semestral' },
    { id: 'ANUAL', name: 'Anual' },
    { id: 'QUINCENAL', name: 'Quincenal' },
    { id: 'DIARIO', name: 'Diario' }
  ];

  const estados = [
    { id: 'ACTIVO', name: 'Activo' },
    { id: 'INACTIVO', name: 'Inactivo' },
    { id: 'SUSPENDIDO', name: 'Suspendido' },
    { id: 'DEROGADO', name: 'Derogado' }
  ];

  const onSubmit = async (data) => {
    try {
      // Formatear fechas
      const formattedData = {
        ...data,
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin).toISOString().split('T')[0] : null,
        fecha_inicio_impuesto: data.fecha_inicio_impuesto ? new Date(data.fecha_inicio_impuesto).toISOString().split('T')[0] : null,
        fecha_final_impuesto: data.fecha_final_impuesto ? new Date(data.fecha_final_impuesto).toISOString().split('T')[0] : null,
      };

      const response = await fetch('/api/impuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        toast({ title: "Éxito", description: "Impuesto creado correctamente" });
        onImpuestoCreado();
        reset();
        onClose();
      } else {
        throw new Error('Error al crear el impuesto');
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el impuesto", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Crear Nuevo Impuesto
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete la información para registrar un nuevo impuesto o obligación fiscal
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo_impuesto">Título del Impuesto *</Label>
                <Input 
                  id="titulo_impuesto" 
                  {...register("titulo_impuesto", { 
                    required: "El título del impuesto es requerido",
                    maxLength: { value: 100, message: "El título no puede exceder 100 caracteres" }
                  })} 
                  placeholder="Ej: IVA 19%, Retención en la fuente, Impuesto de Industria y Comercio..."
                />
                {errors.titulo_impuesto && (
                  <p className="text-sm text-red-500">{errors.titulo_impuesto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_obligacion">Tipo de Obligación</Label>
                <Input 
                  id="tipo_obligacion" 
                  {...register("tipo_obligacion", { 
                    maxLength: { value: 100, message: "No puede exceder 100 caracteres" }
                  })} 
                  placeholder="Ej: Impuesto, Contribución, Tasa, Retención"
                />
                {errors.tipo_obligacion && (
                  <p className="text-sm text-red-500">{errors.tipo_obligacion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado del Impuesto</Label>
                <SearchableSelect
                  options={estados}
                  value={currentEstado}
                  onChange={(value) => setValue('estado', value)}
                  placeholder="Seleccione el estado"
                  searchPlaceholder="Buscar estado..."
                  displayKey="name"
                  valueKey="id"
                />
                <input type="hidden" {...register("estado")} />
              </div>
            </div>
          </div>

          {/* Información Institucional */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Building className="w-5 h-5" />
              🏢 Información Institucional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institucion_reguladora">Institución Reguladora</Label>
                <Input 
                  id="institucion_reguladora" 
                  {...register("institucion_reguladora", { 
                    maxLength: { value: 200, message: "No puede exceder 200 caracteres" }
                  })} 
                  placeholder="Ej: DIAN, Ministerio de Hacienda, Alcaldía Municipal"
                />
                {errors.institucion_reguladora && (
                  <p className="text-sm text-red-500">{errors.institucion_reguladora.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodicidad_declaracion">Periodicidad de Declaración</Label>
                <SearchableSelect
                  options={periodicidades}
                  value={currentPeriodicidad}
                  onChange={(value) => setValue('periodicidad_declaracion', value)}
                  placeholder="Seleccione la periodicidad"
                  searchPlaceholder="Buscar periodicidad..."
                  displayKey="name"
                  valueKey="id"
                />
                <input type="hidden" {...register("periodicidad_declaracion")} />
              </div>
            </div>
          </div>

          {/* Fechas Importantes */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5" />
              📅 Fechas Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio_impuesto">Fecha Inicio del Impuesto</Label>
                <Input 
                  id="fecha_inicio_impuesto" 
                  type="date"
                  {...register("fecha_inicio_impuesto")} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_final_impuesto">Fecha Final del Impuesto</Label>
                <Input 
                  id="fecha_final_impuesto" 
                  type="date"
                  {...register("fecha_final_impuesto")} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                <Input 
                  id="fecha_fin" 
                  type="date"
                  {...register("fecha_fin")} 
                />
              </div>
            </div>
          </div>

          {/* Información Técnica y Fiscal */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              💰 Información Técnica y Fiscal
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formula_aplicacion">Fórmula de Aplicación</Label>
                <Textarea 
                  id="formula_aplicacion" 
                  {...register("formula_aplicacion")} 
                  placeholder="Describa la fórmula o método de cálculo del impuesto, tarifa aplicable, base gravable, etc."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Incluya información sobre tarifas, bases gravables, deducciones aplicables, etc.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oportunidades_optimizacion">Oportunidades de Optimización</Label>
                <Textarea 
                  id="oportunidades_optimizacion" 
                  {...register("oportunidades_optimizacion")} 
                  placeholder="Describa las oportunidades de optimización fiscal, beneficios tributarios, deducciones especiales, etc."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Mencione beneficios tributarios, estrategias de optimización fiscal, exenciones disponibles, etc.
                </p>
              </div>
            </div>
          </div>

          {/* Enlaces y Documentos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Link className="w-5 h-5" />
              📎 Enlaces y Documentos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url_referencia_normativa">URL Referencia Normativa</Label>
                <Input 
                  id="url_referencia_normativa" 
                  type="url"
                  {...register("url_referencia_normativa", { 
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Debe ser una URL válida"
                    },
                    maxLength: { value: 500, message: "No puede exceder 500 caracteres" }
                  })} 
                  placeholder="https://ejemplo.com/normativa"
                />
                {errors.url_referencia_normativa && (
                  <p className="text-sm text-red-500">{errors.url_referencia_normativa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url_instrucciones">URL Instrucciones</Label>
                <Input 
                  id="url_instrucciones" 
                  type="url"
                  {...register("url_instrucciones", { 
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Debe ser una URL válida"
                    },
                    maxLength: { value: 500, message: "No puede exceder 500 caracteres" }
                  })} 
                  placeholder="https://ejemplo.com/instrucciones"
                />
                {errors.url_instrucciones && (
                  <p className="text-sm text-red-500">{errors.url_instrucciones.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Info className="w-5 h-5" />
              📝 Observaciones
            </h3>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones Adicionales</Label>
              <Textarea 
                id="observaciones" 
                {...register("observaciones")} 
                placeholder="Observaciones adicionales sobre el impuesto, consideraciones especiales, notas importantes, etc."
                rows={3}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Crear Impuesto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearImpuestoDialog; 