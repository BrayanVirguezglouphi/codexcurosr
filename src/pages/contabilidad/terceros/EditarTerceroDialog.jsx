import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';
import { api } from '@/config/api';
import { 
  Users, 
  FileText, 
  CreditCard, 
  User,
  MapPin,
  Phone,
  Mail,
  Info,
  Building,
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/FormField';

// Componente SearchableSelect idéntico al de facturas
const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Seleccione una opción", 
  searchPlaceholder = "Buscar...",
  displayKey = "nombre",
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

const EditarTerceroDialog = ({ open, onClose, tercero, onTerceroActualizado }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { toast } = useToast();
  
  // Estado para tipos de documento y relación dinámicos
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [tiposRelacion, setTiposRelacion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Watch para campos controlados
  const currentTipoRelacion = watch('tipo_relacion');
  const currentTipoPersonalidad = watch('tipo_personalidad');
  const currentTipoDocumento = watch('tipo_documento');

  const tiposPersonalidad = [
    { id: 'NATURAL', nombre: 'Persona Natural' },
    { id: 'JURIDICA', nombre: 'Persona Jurídica' }
  ];

  // Cargar tipos de documento y relación de la base de datos
  useEffect(() => {
    if (open) {
      console.log('🔄 Cargando catálogos en EditarTercero...');
      setIsLoading(true);
      setError(null);
      
      Promise.all([
        api.getCatalogos('tipos-documento'),
        api.getCatalogos('tipos-relacion')
      ]).then(([tiposDoc, tiposRel]) => {
        console.log('📦 Datos recibidos:', { 
          tiposDocumento: tiposDoc, 
          tiposRelacion: tiposRel 
        });
        
        // Usar los datos directamente ya que vienen en el formato correcto
        setTiposDocumento(tiposDoc || []);
        setTiposRelacion(tiposRel || []);
        setIsLoading(false);
      }).catch(error => {
        console.error('❌ Error cargando catálogos en EditarTercero:', error);
        setError(error.message);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "No se pudieron cargar los catálogos",
          variant: "destructive",
        });
      });
    }
  }, [open]);

  useEffect(() => {
    if (tercero) {
      console.log('📝 Estableciendo valores iniciales del tercero:', tercero);
      
      // Extraer solo los campos que necesitamos
      const {
        id_tiporelacion,
        tipo_personalidad,
        id_tipodocumento,
        numero_documento,
        dv,
        razon_social,
        primer_nombre,
        otros_nombres,
        primer_apellido,
        segundo_apellido,
        direccion,
        telefono,
        email,
        observaciones,
        departamento_region,
        municipio_ciudad,
        pais
      } = tercero;
      
      // Establecer valores iniciales usando los campos extraídos
      setValue('tipo_relacion', id_tiporelacion || '');
      setValue('tipo_personalidad', tipo_personalidad || '');
      setValue('tipo_documento', id_tipodocumento || '');
      setValue('numero_documento', numero_documento || '');
      setValue('dv', dv || '');
      setValue('razon_social', razon_social || '');
      setValue('primer_nombre', primer_nombre || '');
      setValue('otros_nombres', otros_nombres || '');
      setValue('primer_apellido', primer_apellido || '');
      setValue('segundo_apellido', segundo_apellido || '');
      setValue('direccion', direccion || '');
      setValue('telefono', telefono || '');
      setValue('email', email || '');
      setValue('observaciones', observaciones || '');
      setValue('departamento_region', departamento_region || '');
      setValue('municipio_ciudad', municipio_ciudad || '');
      setValue('pais', pais || '');
    }
  }, [tercero]);

  const onSubmit = async (data) => {
    try {
      // Extraer solo los campos que queremos actualizar
      const {
        tipo_relacion,
        tipo_personalidad,
        tipo_documento,
        numero_documento,
        dv,
        razon_social,
        primer_nombre,
        otros_nombres,
        primer_apellido,
        segundo_apellido,
        direccion,
        telefono,
        email,
        observaciones,
        departamento_region,
        municipio_ciudad,
        pais
      } = data;

      // Crear objeto con solo los campos necesarios
      const datosActualizar = {
        id_tiporelacion: tipo_relacion,
        tipo_personalidad,
        id_tipodocumento: tipo_documento,
        numero_documento,
        dv,
        razon_social,
        primer_nombre,
        otros_nombres,
        primer_apellido,
        segundo_apellido,
        direccion,
        telefono,
        email,
        observaciones,
        departamento_region,
        municipio_ciudad,
        pais
      };

      await api.updateTercero(tercero.id_tercero, datosActualizar);

      toast({ title: "Éxito", description: "Tercero actualizado correctamente" });
      onTerceroActualizado();
      onClose();
    } catch (error) {
      console.error('Error al actualizar tercero:', error);
      toast({ title: "Error", description: "No se pudo actualizar el tercero", variant: "destructive" });
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Editar Tercero
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Relación */}
              <div className="col-span-2">
                <Label>Tipo de Relación</Label>
                <SearchableSelect
                  options={tiposRelacion}
                  value={currentTipoRelacion}
                  onChange={(value) => setValue('tipo_relacion', value)}
                  placeholder="Seleccione el tipo de relación"
                  searchPlaceholder="Buscar tipo de relación..."
                  disabled={isLoading}
                />
                {errors.tipo_relacion && (
                  <span className="text-sm text-destructive">{errors.tipo_relacion.message}</span>
                )}
              </div>

              {/* Tipo de Personalidad */}
              <div className="space-y-2">
                <Label htmlFor="tipo_personalidad">Tipo de Personalidad *</Label>
                <SearchableSelect
                  options={tiposPersonalidad}
                  value={currentTipoPersonalidad}
                  onChange={(value) => setValue('tipo_personalidad', value)}
                  placeholder="Seleccione el tipo de personalidad"
                  searchPlaceholder="Buscar tipo de personalidad..."
                />
              </div>

              {/* Tipo de Documento */}
              <div className="col-span-2">
                <Label>Tipo de Documento</Label>
                <SearchableSelect
                  options={tiposDocumento}
                  value={currentTipoDocumento}
                  onChange={(value) => setValue('tipo_documento', value)}
                  placeholder="Seleccione el tipo de documento"
                  searchPlaceholder="Buscar tipo de documento..."
                  disabled={isLoading}
                />
                {errors.tipo_documento && (
                  <span className="text-sm text-destructive">{errors.tipo_documento.message}</span>
                )}
              </div>

              {/* Identificación */}
              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número de Documento *</Label>
                <Input 
                  id="numero_documento" 
                  {...register("numero_documento", { 
                    required: "El número de documento es requerido",
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="Ingrese el número de documento"
                />
                {errors.numero_documento && (
                  <p className="text-sm text-red-500">{errors.numero_documento.message}</p>
                )}
              </div>

              {/* Dígito de Verificación */}
              <div className="space-y-2">
                <Label htmlFor="dv">Dígito de Verificación</Label>
                <Input 
                  id="dv" 
                  {...register("dv", { 
                    maxLength: { value: 5, message: "No puede exceder 5 caracteres" }
                  })} 
                  placeholder="DV (opcional)"
                />
                {errors.dv && (
                  <p className="text-sm text-red-500">{errors.dv.message}</p>
                )}
              </div>

              {/* Razón Social */}
              <div className="space-y-2">
                <Label htmlFor="razon_social">Razón Social</Label>
                <Input 
                  id="razon_social" 
                  {...register("razon_social", { 
                    maxLength: { value: 150, message: "No puede exceder 150 caracteres" }
                  })} 
                  placeholder="Razón social o nombre comercial"
                />
                {errors.razon_social && (
                  <p className="text-sm text-red-500">{errors.razon_social.message}</p>
                )}
              </div>

              {/* Nombres y Apellidos */}
              <div className="space-y-2">
                <Label htmlFor="primer_nombre">Primer Nombre</Label>
                <Input 
                  id="primer_nombre" 
                  {...register("primer_nombre", { 
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="Primer nombre"
                />
                {errors.primer_nombre && (
                  <p className="text-sm text-red-500">{errors.primer_nombre.message}</p>
                )}
              </div>

              {/* Otros Nombres */}
              <div className="space-y-2">
                <Label htmlFor="otros_nombres">Otros Nombres</Label>
                <Input 
                  id="otros_nombres" 
                  {...register("otros_nombres", { 
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="Segundo nombre, etc."
                />
                {errors.otros_nombres && (
                  <p className="text-sm text-red-500">{errors.otros_nombres.message}</p>
                )}
              </div>

              {/* Primer Apellido */}
              <div className="space-y-2">
                <Label htmlFor="primer_apellido">Primer Apellido</Label>
                <Input 
                  id="primer_apellido" 
                  {...register("primer_apellido", { 
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="Primer apellido"
                />
                {errors.primer_apellido && (
                  <p className="text-sm text-red-500">{errors.primer_apellido.message}</p>
                )}
              </div>

              {/* Segundo Apellido */}
              <div className="space-y-2">
                <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                <Input 
                  id="segundo_apellido" 
                  {...register("segundo_apellido", { 
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="Segundo apellido"
                />
                {errors.segundo_apellido && (
                  <p className="text-sm text-red-500">{errors.segundo_apellido.message}</p>
                )}
              </div>

              {/* Información de Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input 
                  id="pais" 
                  {...register("pais", { 
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="País de residencia"
                />
                {errors.pais && (
                  <p className="text-sm text-red-500">{errors.pais.message}</p>
                )}
              </div>

              {/* Departamento/Región */}
              <div className="space-y-2">
                <Label htmlFor="departamento_region">Departamento/Región</Label>
                <Input 
                  id="departamento_region" 
                  {...register("departamento_region", { 
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="Departamento o región"
                />
                {errors.departamento_region && (
                  <p className="text-sm text-red-500">{errors.departamento_region.message}</p>
                )}
              </div>

              {/* Municipio/Ciudad */}
              <div className="space-y-2">
                <Label htmlFor="municipio_ciudad">Municipio/Ciudad</Label>
                <Input 
                  id="municipio_ciudad" 
                  {...register("municipio_ciudad", { 
                    maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                  })} 
                  placeholder="Municipio o ciudad"
                />
                {errors.municipio_ciudad && (
                  <p className="text-sm text-red-500">{errors.municipio_ciudad.message}</p>
                )}
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input 
                  id="direccion" 
                  {...register("direccion", { 
                    maxLength: { value: 200, message: "No puede exceder 200 caracteres" }
                  })} 
                  placeholder="Dirección completa"
                />
                {errors.direccion && (
                  <p className="text-sm text-red-500">{errors.direccion.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono" 
                  {...register("telefono", { 
                    maxLength: { value: 20, message: "No puede exceder 20 caracteres" }
                  })} 
                  placeholder="Número de teléfono"
                />
                {errors.telefono && (
                  <p className="text-sm text-red-500">{errors.telefono.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  {...register("email", { 
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Debe ser un email válido"
                    },
                    maxLength: { value: 100, message: "No puede exceder 100 caracteres" }
                  })} 
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                <Textarea 
                  id="observaciones" 
                  {...register("observaciones")} 
                  placeholder="Observaciones adicionales sobre el tercero, notas importantes, etc."
                  rows={3}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                Actualizar Tercero
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditarTerceroDialog; 