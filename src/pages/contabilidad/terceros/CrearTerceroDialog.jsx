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
  Users, 
  FileText, 
  CreditCard, 
  User,
  MapPin,
  Phone,
  Mail,
  Info,
  Building,
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

const CrearTerceroDialog = ({ open, onClose, onTerceroCreado }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      tipo_relacion: '',
      tipo_personalidad: '',
      tipo_documento: '',
      numero_documento: '',
      dv: '',
      razon_social: '',
      primer_nombre: '',
      otros_nombres: '',
      primer_apellido: '',
      segundo_apellido: '',
      pais: 'Colombia',
      departamento_region: '',
      municipio_ciudad: '',
      direccion: '',
      telefono: '',
      email: '',
      observaciones: ''
    }
  });
  const { toast } = useToast();

  // Watch para campos controlados
  const currentTipoRelacion = watch('tipo_relacion');
  const currentTipoPersonalidad = watch('tipo_personalidad');
  const currentTipoDocumento = watch('tipo_documento');

  const tiposRelacion = [
    { id: 'CLIENTE', name: 'Cliente' },
    { id: 'PROVEEDOR', name: 'Proveedor' },
    { id: 'EMPLEADO', name: 'Empleado' },
    { id: 'ACCIONISTA', name: 'Accionista' },
    { id: 'CONTRATISTA', name: 'Contratista' },
    { id: 'OTRO', name: 'Otro' }
  ];

  const tiposPersonalidad = [
    { id: 'NATURAL', name: 'Persona Natural' },
    { id: 'JURIDICA', name: 'Persona Jurídica' }
  ];

  const tiposDocumento = [
    { id: 'CC', name: 'Cédula de Ciudadanía' },
    { id: 'CE', name: 'Cédula de Extranjería' },
    { id: 'NIT', name: 'NIT' },
    { id: 'TI', name: 'Tarjeta de Identidad' },
    { id: 'RC', name: 'Registro Civil' },
    { id: 'PA', name: 'Pasaporte' },
    { id: 'RUT', name: 'RUT' }
  ];

  const onSubmit = async (data) => {
    try {
      const response = await apiCall('/api/terceros', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({ title: "Éxito", description: "Tercero creado correctamente" });
        onTerceroCreado();
        reset();
        onClose();
      } else {
        throw new Error('Error al crear el tercero');
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el tercero", variant: "destructive" });
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
                Crear Nuevo Tercero
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete la información para registrar un nuevo tercero en el sistema
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_relacion">Tipo de Relación</Label>
                <SearchableSelect
                  options={tiposRelacion}
                  value={currentTipoRelacion}
                  onChange={(value) => setValue('tipo_relacion', value)}
                  placeholder="Seleccione el tipo de relación"
                  searchPlaceholder="Buscar tipo de relación..."
                  displayKey="name"
                  valueKey="id"
                />
                <input type="hidden" {...register("tipo_relacion")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_personalidad">Tipo de Personalidad</Label>
                <SearchableSelect
                  options={tiposPersonalidad}
                  value={currentTipoPersonalidad}
                  onChange={(value) => setValue('tipo_personalidad', value)}
                  placeholder="Seleccione el tipo de personalidad"
                  searchPlaceholder="Buscar tipo de personalidad..."
                  displayKey="name"
                  valueKey="id"
                />
                <input type="hidden" {...register("tipo_personalidad")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                <SearchableSelect
                  options={tiposDocumento}
                  value={currentTipoDocumento}
                  onChange={(value) => setValue('tipo_documento', value)}
                  placeholder="Seleccione el tipo de documento"
                  searchPlaceholder="Buscar tipo de documento..."
                  displayKey="name"
                  valueKey="id"
                />
                <input type="hidden" {...register("tipo_documento", { required: "El tipo de documento es requerido" })} />
                {errors.tipo_documento && (
                  <p className="text-sm text-red-500">{errors.tipo_documento.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Identificación */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <CreditCard className="w-5 h-5" />
              🆔 Identificación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <User className="w-5 h-5" />
              👤 Nombres y Apellidos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Información de Ubicación */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <MapPin className="w-5 h-5" />
              📍 Información de Ubicación
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input 
                    id="pais" 
                    {...register("pais", { 
                      maxLength: { value: 50, message: "No puede exceder 50 caracteres" }
                    })} 
                    placeholder="País de residencia"
                    defaultValue="Colombia"
                  />
                  {errors.pais && (
                    <p className="text-sm text-red-500">{errors.pais.message}</p>
                  )}
                </div>

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
              </div>

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
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Phone className="w-5 h-5" />
              📞 Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Crear Tercero
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearTerceroDialog; 