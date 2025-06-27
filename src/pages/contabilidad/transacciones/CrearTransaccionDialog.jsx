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
  FileText, 
  Calendar, 
  DollarSign, 
  Building2, 
  User, 
  Settings, 
  Search,
  ChevronDown,
  X,
  Plus
} from 'lucide-react';

// Componente de dropdown con búsqueda
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

const CrearTransaccionDialog = ({ open, onClose, onTransaccionCreada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      id_cuenta: '',
      id_tipotransaccion: '',
      fecha_transaccion: new Date().toISOString().split('T')[0],
      titulo_transaccion: '',
      id_moneda_transaccion: '',
      valor_total_transaccion: '',
      trm_moneda_base: '',
      observacion: '',
      url_soporte_adjunto: '',
      registro_auxiliar: false,
      registro_validado: false,
      id_etiqueta_contable: '',
      id_tercero: '',
      id_cuenta_destino_transf: '',
      aplica_retencion: false,
      aplica_impuestos: false,
      id_concepto: ''
    }
  });
  const { toast } = useToast();

  // Estados para catálogos
  const [cuentas, setCuentas] = useState([]);
  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [conceptos, setConceptos] = useState([]);

  // Watch para valores controlados
  const currentCuenta = watch('id_cuenta');
  const currentTipo = watch('id_tipotransaccion');
  const currentMoneda = watch('id_moneda_transaccion');
  const currentEtiqueta = watch('id_etiqueta_contable');
  const currentTercero = watch('id_tercero');
  const currentCuentaDestino = watch('id_cuenta_destino_transf');
  const currentConcepto = watch('id_concepto');
  const currentRegistroAuxiliar = watch('registro_auxiliar');
  const currentRegistroValidado = watch('registro_validado');
  const currentAplicaRetencion = watch('aplica_retencion');
  const currentAplicaImpuestos = watch('aplica_impuestos');

  // Cargar catálogos al abrir el diálogo
  useEffect(() => {
    if (open) {
      Promise.all([
        apiCall('/api/catalogos/cuentas'),
        apiCall('/api/catalogos/tipos-transaccion'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/catalogos/etiquetas-contables'),
        apiCall('/api/catalogos/terceros'),
        apiCall('/api/catalogos/conceptos')
      ]).then(([cuentasData, tiposData, monedasData, etiquetasData, tercerosData, conceptosData]) => {
        setCuentas(cuentasData);
        setTiposTransaccion(tiposData);
        setMonedas(monedasData);
        setEtiquetas(etiquetasData);
        setTerceros(tercerosData);
        setConceptos(conceptosData);
      });
    }
  }, [open]);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        titulo_transaccion: data.titulo_transaccion,
        fecha_transaccion: data.fecha_transaccion,
        valor_total_transaccion: data.valor_total_transaccion ? parseFloat(data.valor_total_transaccion) : null,
        id_cuenta: data.id_cuenta ? parseInt(data.id_cuenta) : null,
        id_tipotransaccion: data.id_tipotransaccion ? parseInt(data.id_tipotransaccion) : null,
        id_moneda_transaccion: data.id_moneda_transaccion ? parseInt(data.id_moneda_transaccion) : null,
        id_etiqueta_contable: data.id_etiqueta_contable ? parseInt(data.id_etiqueta_contable) : null,
        id_tercero: data.id_tercero ? parseInt(data.id_tercero) : null,
        id_cuenta_destino_transf: data.id_cuenta_destino_transf ? parseInt(data.id_cuenta_destino_transf) : null,
        id_concepto: data.id_concepto ? parseInt(data.id_concepto) : null,
        observacion: data.observacion || '',
        trm_moneda_base: data.trm_moneda_base ? parseFloat(data.trm_moneda_base) : null,
        registro_auxiliar: data.registro_auxiliar === true,
        registro_validado: data.registro_validado === true,
        aplica_retencion: data.aplica_retencion === true,
        aplica_impuestos: data.aplica_impuestos === true,
        url_soporte_adjunto: data.url_soporte_adjunto || null,
      };

      await apiCall('/api/transacciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      toast({
        title: "Éxito",
        description: "Transacción creada correctamente",
      });
      onTransaccionCreada();
      onClose();
      reset();
    } catch (error) {
      console.error('Error al crear transacción:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la transacción",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Crear Nueva Transacción
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Complete la información para crear una nueva transacción
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo_transaccion">Título de la Transacción *</Label>
                <Input 
                  id="titulo_transaccion" 
                  {...register("titulo_transaccion", { required: "El título es requerido" })}
                  placeholder="Ej: Pago a proveedor"
                />
                {errors.titulo_transaccion && <span className="text-red-500 text-sm">{errors.titulo_transaccion.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_tipotransaccion">Tipo de Transacción *</Label>
                <SearchableSelect
                  options={tiposTransaccion}
                  value={currentTipo}
                  onChange={(value) => setValue('id_tipotransaccion', value)}
                  placeholder="Seleccione un tipo"
                  displayKey="tipo_transaccion"
                  valueKey="id_tipotransaccion"
                  searchPlaceholder="Buscar tipo..."
                />
                <input 
                  type="hidden" 
                  {...register("id_tipotransaccion", { required: "El tipo es requerido" })}
                  value={currentTipo || ''}
                />
                {errors.id_tipotransaccion && <span className="text-red-500 text-sm">El tipo de transacción es requerido</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fecha_transaccion">Fecha *</Label>
                <Input 
                  id="fecha_transaccion" 
                  type="date" 
                  {...register("fecha_transaccion", { required: "La fecha es requerida" })}
                />
                {errors.fecha_transaccion && <span className="text-red-500 text-sm">{errors.fecha_transaccion.message}</span>}
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              Información Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="valor_total_transaccion">Valor Total *</Label>
                <Input 
                  id="valor_total_transaccion" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  {...register("valor_total_transaccion", { 
                    required: "El valor es requerido",
                    min: { value: 0, message: "El valor debe ser mayor o igual a 0" }
                  })}
                />
                {errors.valor_total_transaccion && <span className="text-red-500 text-sm">{errors.valor_total_transaccion.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_moneda_transaccion">Moneda *</Label>
                <SearchableSelect
                  options={monedas}
                  value={currentMoneda}
                  onChange={(value) => setValue('id_moneda_transaccion', value)}
                  placeholder="Seleccione moneda"
                  displayKey="nombre_moneda"
                  valueKey="id_moneda"
                  searchPlaceholder="Buscar moneda..."
                />
                <input 
                  type="hidden" 
                  {...register("id_moneda_transaccion", { required: "La moneda es requerida" })}
                  value={currentMoneda || ''}
                />
                {errors.id_moneda_transaccion && <span className="text-red-500 text-sm">La moneda es requerida</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="trm_moneda_base">TRM Moneda Base</Label>
                <Input 
                  id="trm_moneda_base" 
                  type="number" 
                  step="0.000001" 
                  placeholder="0.000000"
                  {...register("trm_moneda_base")}
                />
              </div>
            </div>
          </div>

          {/* Cuentas Contables */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Building2 className="w-5 h-5" />
              Cuentas Contables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_cuenta">Cuenta Origen *</Label>
                <SearchableSelect
                  options={cuentas}
                  value={currentCuenta}
                  onChange={(value) => setValue('id_cuenta', value)}
                  placeholder="Seleccione cuenta origen"
                  displayKey="titulo_cuenta"
                  valueKey="id_cuenta"
                  searchPlaceholder="Buscar cuenta..."
                />
                <input 
                  type="hidden" 
                  {...register("id_cuenta", { required: "La cuenta origen es requerida" })}
                  value={currentCuenta || ''}
                />
                {errors.id_cuenta && <span className="text-red-500 text-sm">La cuenta origen es requerida</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_cuenta_destino_transf">Cuenta Destino</Label>
                <SearchableSelect
                  options={cuentas}
                  value={currentCuentaDestino}
                  onChange={(value) => setValue('id_cuenta_destino_transf', value)}
                  placeholder="Seleccione cuenta destino"
                  displayKey="titulo_cuenta"
                  valueKey="id_cuenta"
                  searchPlaceholder="Buscar cuenta..."
                />
                <input 
                  type="hidden" 
                  {...register("id_cuenta_destino_transf")}
                  value={currentCuentaDestino || ''}
                />
              </div>
            </div>
          </div>

          {/* Tercero y Conceptos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <User className="w-5 h-5" />
              Tercero y Conceptos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_tercero">Tercero</Label>
                <SearchableSelect
                  options={terceros}
                  value={currentTercero}
                  onChange={(value) => setValue('id_tercero', value)}
                  placeholder="Seleccione tercero"
                  displayKey="razon_social"
                  valueKey="id_tercero"
                  formatOption={(tercero) => tercero.razon_social ? tercero.razon_social : `${tercero.primer_nombre || ''} ${tercero.primer_apellido || ''}`.trim()}
                  searchPlaceholder="Buscar tercero..."
                />
                <input 
                  type="hidden" 
                  {...register("id_tercero")}
                  value={currentTercero || ''}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_concepto">Concepto DIAN</Label>
                <SearchableSelect
                  options={conceptos}
                  value={currentConcepto}
                  onChange={(value) => setValue('id_concepto', value)}
                  placeholder="Seleccione concepto"
                  displayKey="concepto_dian"
                  valueKey="id_concepto"
                  searchPlaceholder="Buscar concepto..."
                />
                <input 
                  type="hidden" 
                  {...register("id_concepto")}
                  value={currentConcepto || ''}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_etiqueta_contable">Etiqueta Contable</Label>
                <SearchableSelect
                  options={etiquetas}
                  value={currentEtiqueta}
                  onChange={(value) => setValue('id_etiqueta_contable', value)}
                  placeholder="Seleccione etiqueta"
                  displayKey="etiqueta_contable"
                  valueKey="id_etiqueta_contable"
                  searchPlaceholder="Buscar etiqueta..."
                />
                <input 
                  type="hidden" 
                  {...register("id_etiqueta_contable")}
                  value={currentEtiqueta || ''}
                />
              </div>
            </div>
          </div>

          {/* Configuraciones */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Settings className="w-5 h-5" />
              Configuraciones
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registro_auxiliar">Registro Auxiliar</Label>
                <select 
                  id="registro_auxiliar"
                  {...register("registro_auxiliar")}
                  value={currentRegistroAuxiliar ? 'true' : 'false'}
                  onChange={(e) => setValue('registro_auxiliar', e.target.value === 'true')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="registro_validado">Registro Validado</Label>
                <select 
                  id="registro_validado"
                  {...register("registro_validado")}
                  value={currentRegistroValidado ? 'true' : 'false'}
                  onChange={(e) => setValue('registro_validado', e.target.value === 'true')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="aplica_retencion">Aplica Retención</Label>
                <select 
                  id="aplica_retencion"
                  {...register("aplica_retencion")}
                  value={currentAplicaRetencion ? 'true' : 'false'}
                  onChange={(e) => setValue('aplica_retencion', e.target.value === 'true')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="aplica_impuestos">Aplica Impuestos</Label>
                <select 
                  id="aplica_impuestos"
                  {...register("aplica_impuestos")}
                  value={currentAplicaImpuestos ? 'true' : 'false'}
                  onChange={(e) => setValue('aplica_impuestos', e.target.value === 'true')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
            </div>
          </div>

          {/* Observaciones y Documentos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Observaciones y Documentos
            </h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="observacion">Observaciones</Label>
                <Textarea 
                  id="observacion" 
                  {...register("observacion")}
                  placeholder="Observaciones adicionales sobre la transacción"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="url_soporte_adjunto">URL Soporte Adjunto</Label>
                <Input 
                  id="url_soporte_adjunto" 
                  {...register("url_soporte_adjunto", {
                    pattern: {
                      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: "Ingrese una URL válida"
                    }
                  })}
                  placeholder="https://ejemplo.com/documento"
                />
                {errors.url_soporte_adjunto && <span className="text-red-500 text-sm">{errors.url_soporte_adjunto.message}</span>}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Transacción
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearTransaccionDialog; 