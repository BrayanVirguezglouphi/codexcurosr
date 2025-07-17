import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { 
  Globe, 
  Building, 
  FileText,
  Search,
  ChevronDown,
  X,
  Edit
} from 'lucide-react';

// Componente de dropdown simple como en otros módulos
const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Seleccione una opción", 
  searchPlaceholder = "Buscar...",
  displayKey = "name",
  valueKey = "id",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);
  
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
    const searchValue = option[displayKey];
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
          {selectedOption ? selectedOption[displayKey] : placeholder}
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
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  {option[displayKey]}
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

const EditarMercadoDialog = ({ open, onClose, mercado, onMercadoActualizado }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      segmento_mercado: '',
      id_pais: '',
      id_industria: '',
      resumen_mercado: '',
      recomendaciones: '',
      url_reporte_mercado: '',
      observaciones: ''
    }
  });
  const { toast } = useToast();

  // Estados para catálogos
  const [paises, setPaises] = useState([]);
  const [industrias, setIndustrias] = useState([]);

  // Watch para valores controlados
  const currentPais = watch('id_pais');
  const currentIndustria = watch('id_industria');

  // Cargar datos del mercado cuando cambie
  useEffect(() => {
    if (mercado && open) {
      console.log('Cargando datos del mercado:', mercado);
      
      // Resetear el formulario con los datos del mercado
      reset({
        segmento_mercado: mercado.segmento_mercado || '',
        id_pais: mercado.id_pais || '',
        id_industria: mercado.id_industria || '',
        resumen_mercado: mercado.resumen_mercado || '',
        recomendaciones: mercado.recomendaciones || '',
        url_reporte_mercado: mercado.url_reporte_mercado || '',
        observaciones: mercado.observaciones || ''
      });
    }
  }, [mercado, open, reset]);

  // Cargar catálogos al abrir el diálogo
  useEffect(() => {
    if (open) {
      Promise.all([
        apiCall('/api/catalogos/paises'),
        apiCall('/api/catalogos/industrias')
      ]).then(([paisesData, industriasData]) => {
        setPaises(paisesData || []);
        setIndustrias(industriasData || []);
      }).catch(error => {
        console.error('Error cargando catálogos:', error);
        setPaises([]);
        setIndustrias([]);
      });
    }
  }, [open]);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        segmento_mercado: data.segmento_mercado,
        id_pais: data.id_pais || null,
        id_industria: data.id_industria || null,
        resumen_mercado: data.resumen_mercado || null,
        recomendaciones: data.recomendaciones || null,
        url_reporte_mercado: data.url_reporte_mercado || null,
        observaciones: data.observaciones || null
      };

      console.log('Actualizando mercado:', mercado.id_mercado, formattedData);
      
      const mercadoActualizado = await apiCall(`/api/crm/mercados/${mercado.id_mercado}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      toast({
        title: "¡Éxito!",
        description: "Mercado actualizado correctamente",
        variant: "success"
      });

      onMercadoActualizado?.(mercadoActualizado);
      onClose();
    } catch (error) {
      console.error('Error al actualizar mercado:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el mercado",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!mercado) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Mercado
          </DialogTitle>
          <DialogDescription>
            Modifique la información del mercado: {mercado.segmento_mercado}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="segmento_mercado" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Segmento de Mercado *
              </Label>
              <Input
                id="segmento_mercado"
                placeholder="Ej: Empresas pequeñas, PYMES, etc."
                {...register('segmento_mercado', { 
                  required: 'El segmento de mercado es requerido' 
                })}
              />
              {errors.segmento_mercado && (
                <p className="text-sm text-red-500">{errors.segmento_mercado.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_pais">País</Label>
              <SearchableSelect
                options={paises}
                value={currentPais}
                onChange={(value) => setValue('id_pais', value)}
                placeholder="Seleccionar país"
                searchPlaceholder="Buscar país..."
                displayKey="nombre"
                valueKey="id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_industria">Industria</Label>
              <SearchableSelect
                options={industrias}
                value={currentIndustria}
                onChange={(value) => setValue('id_industria', value)}
                placeholder="Seleccionar industria"
                searchPlaceholder="Buscar industria..."
                displayKey="nombre"
                valueKey="id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url_reporte_mercado" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                URL Reporte de Mercado
              </Label>
              <Input
                id="url_reporte_mercado"
                type="url"
                placeholder="https://ejemplo.com/reporte"
                {...register('url_reporte_mercado')}
              />
            </div>
          </div>

          {/* Campos de texto largo */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resumen_mercado">Resumen del Mercado</Label>
              <Textarea
                id="resumen_mercado"
                placeholder="Descripción general del mercado objetivo..."
                rows={3}
                {...register('resumen_mercado')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recomendaciones">Recomendaciones</Label>
              <Textarea
                id="recomendaciones"
                placeholder="Estrategias y recomendaciones para este mercado..."
                rows={3}
                {...register('recomendaciones')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas adicionales y observaciones..."
                rows={2}
                {...register('observaciones')}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Actualizar Mercado
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarMercadoDialog; 