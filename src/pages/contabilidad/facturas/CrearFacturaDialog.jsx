import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { FileText, Calendar, DollarSign, Search, ChevronDown, X, Plus } from 'lucide-react';

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

const CrearFacturaDialog = ({ open, onClose, onFacturaCreada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      numero_factura: '',
      estatus_factura: 'PENDIENTE',
      id_contrato: '',
      descripcion_servicio: '',
      fecha_radicado: new Date().toISOString().split('T')[0],
      fecha_estimada_pago: '',
      id_moneda: '',
      subtotal_facturado_moneda: '',
      valor_descuento: '',
      trm_tasa_cambio: '',
      id_tax: '',
      valor_tax: '',
      modo_pago: '',
      url_cotizacion: '',
      url_contrato: '',
      observaciones_factura: ''
    }
  });
  const { toast } = useToast();

  const [contratos, setContratos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [taxes, setTaxes] = useState([]);

  // Watch para valores controlados
  const currentEstatus = watch('estatus_factura');
  const currentContrato = watch('id_contrato');
  const currentMoneda = watch('id_moneda');
  const currentTax = watch('id_tax');
  const currentModoPago = watch('modo_pago');

  useEffect(() => {
    if (open) {
      Promise.all([
        apiCall('/api/catalogos/contratos'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/catalogos/taxes')
      ]).then(([contratosData, monedasData, taxesData]) => {
        console.log('CrearFactura - Contratos cargados:', contratosData);
        console.log('CrearFactura - Monedas cargadas:', monedasData);
        console.log('CrearFactura - Taxes cargados:', taxesData);
        setContratos(contratosData);
        setMonedas(monedasData);
        setTaxes(taxesData);
      }).catch(error => {
        console.error('Error cargando catálogos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los catálogos",
          variant: "destructive",
        });
      });
    }
  }, [open]);

  // Efecto para actualizar automáticamente la descripción cuando se selecciona un contrato
  useEffect(() => {
    if (currentContrato && contratos.length > 0) {
      const contratoSeleccionado = contratos.find(c => c.id_contrato == currentContrato);
      if (contratoSeleccionado && contratoSeleccionado.descripcion_servicio_contratado) {
        // Solo actualizar si el campo está vacío o tiene la descripción anterior
        const currentDescription = watch('descripcion_servicio');
        if (!currentDescription || currentDescription === '') {
          setValue('descripcion_servicio', contratoSeleccionado.descripcion_servicio_contratado);
        }
      }
    }
  }, [currentContrato, contratos, setValue, watch]);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        id_contrato: data.id_contrato ? parseInt(data.id_contrato) : null,
        id_moneda: data.id_moneda ? parseInt(data.id_moneda) : null,
        id_tax: data.id_tax ? parseInt(data.id_tax) : null,
        fecha_radicado: data.fecha_radicado ? new Date(data.fecha_radicado).toISOString().split('T')[0] : null,
        fecha_estimada_pago: data.fecha_estimada_pago ? new Date(data.fecha_estimada_pago).toISOString().split('T')[0] : null,
        subtotal_facturado_moneda: parseFloat(data.subtotal_facturado_moneda),
        valor_descuento: data.valor_descuento ? parseFloat(data.valor_descuento) : null,
        trm_tasa_cambio: data.trm_tasa_cambio ? parseFloat(data.trm_tasa_cambio) : null,
        valor_tax: data.valor_tax ? parseFloat(data.valor_tax) : null
      };
      
      delete formattedData.id_factura;
      
      const response = await apiCall('/api/facturas', {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        toast({ title: "Éxito", description: "Factura creada correctamente" });
        onFacturaCreada();
        onClose();
        reset();
      } else {
        if (responseData.field) {
          toast({ title: "Error de validación", description: responseData.message, variant: "destructive" });
        } else if (responseData.details) {
          const errorMessage = responseData.details.map(error => `${error.field}: ${error.message}`).join('\n');
          toast({ title: "Error de validación", description: errorMessage, variant: "destructive" });
        } else {
          throw new Error(responseData.message || 'Error al crear la factura');
        }
      }
    } catch (error) {
      console.error('Error al crear factura:', error);
      toast({ title: "Error", description: error.message || "No se pudo crear la factura", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Crear Nueva Factura
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete la información para crear una nueva factura
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Información General */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Información General
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numero_factura">Número de Factura *</Label>
                <Input 
                  id="numero_factura" 
                  {...register("numero_factura", { required: "El número de factura es requerido" })}
                  placeholder="Ej: FAC-2024-001"
                />
                {errors.numero_factura && <span className="text-red-500 text-sm">{errors.numero_factura.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="estatus_factura">Estado de la Factura *</Label>
                <select 
                  id="estatus_factura" 
                  {...register("estatus_factura", { required: "El estado es requerido" })}
                  value={currentEstatus || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="ANULADA">Anulada</option>
                  <option value="VENCIDA">Vencida</option>
                </select>
                {errors.estatus_factura && <span className="text-red-500 text-sm">{errors.estatus_factura.message}</span>}
              </div>

                             <div className="grid gap-2">
                 <Label htmlFor="id_contrato">Contrato Asociado *</Label>
                 <SearchableSelect
                   options={contratos}
                   value={currentContrato}
                   onChange={(value) => setValue('id_contrato', value)}
                   placeholder="Seleccione un contrato"
                   displayKey="numero_contrato_os"
                   valueKey="id_contrato"
                   formatOption={(contrato) => `${contrato.numero_contrato_os} - ${contrato.descripcion_servicio_contratado?.substring(0, 30)}...`}
                   searchPlaceholder="Buscar contrato..."
                 />
                 <input 
                   type="hidden" 
                   {...register("id_contrato", { required: "El contrato es requerido" })}
                   value={currentContrato || ''}
                 />
                 {errors.id_contrato && <span className="text-red-500 text-sm">El contrato es requerido</span>}
               </div>
            </div>
          </div>

          {/* Descripción del Servicio Contratado */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Descripción del Servicio Contratado
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="descripcion_servicio">Descripción del Servicio Contratado</Label>
              <Textarea 
                id="descripcion_servicio" 
                {...register("descripcion_servicio")}
                placeholder="Describa detalladamente el servicio o producto contratado"
                rows={3}
              />
              {currentContrato && (
                <p className="text-sm text-gray-600">
                  💡 Descripción del contrato seleccionado cargada automáticamente. Puede editarla si es necesario.
                </p>
              )}
            </div>
          </div>

                     {/* Fechas de la Factura */}
           <div className="bg-white border rounded-lg p-4">
             <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
               <Calendar className="w-5 h-5" />
               Fechas de la Factura
             </h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label htmlFor="fecha_radicado">Fecha de Radicado *</Label>
                 <Input 
                   id="fecha_radicado" 
                   type="date" 
                   {...register("fecha_radicado", { required: "La fecha de radicado es requerida" })}
                 />
                 {errors.fecha_radicado && <span className="text-red-500 text-sm">{errors.fecha_radicado.message}</span>}
               </div>
               
               <div className="grid gap-2">
                 <Label htmlFor="fecha_estimada_pago">Fecha Estimada de Pago</Label>
                 <Input 
                   id="fecha_estimada_pago" 
                   type="date" 
                   {...register("fecha_estimada_pago")}
                 />
               </div>
             </div>
           </div>

          {/* Información Financiera */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              Información Financiera
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id_moneda">Moneda de Cotización</Label>
                <SearchableSelect
                  options={monedas}
                  value={currentMoneda}
                  onChange={(value) => setValue('id_moneda', value)}
                  placeholder="Seleccione moneda"
                  displayKey="nombre_moneda"
                  valueKey="id_moneda"
                  searchPlaceholder="Buscar moneda..."
                />
                <input 
                  type="hidden" 
                  {...register("id_moneda", { required: "La moneda es requerida" })}
                  value={currentMoneda || ''}
                />
                {errors.id_moneda && <span className="text-red-500 text-sm">La moneda es requerida</span>}
              </div>
              
                             <div className="grid gap-2">
                 <Label htmlFor="subtotal_facturado_moneda">Subtotal Facturado *</Label>
                 <Input 
                   id="subtotal_facturado_moneda" 
                   type="number" 
                   step="0.01" 
                   placeholder="0.00"
                   {...register("subtotal_facturado_moneda", { 
                     required: "El subtotal es requerido", 
                     min: { value: 0, message: "El subtotal debe ser mayor o igual a 0" } 
                   })}
                 />
                 {errors.subtotal_facturado_moneda && <span className="text-red-500 text-sm">{errors.subtotal_facturado_moneda.message}</span>}
               </div>
              
              <div className="grid gap-2">
                <Label htmlFor="valor_descuento">Valor de Descuento</Label>
                <Input 
                  id="valor_descuento"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  {...register("valor_descuento", { 
                    min: { value: 0, message: "El descuento debe ser mayor o igual a 0" } 
                  })}
                />
                {errors.valor_descuento && <span className="text-red-500 text-sm">{errors.valor_descuento.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="trm_tasa_cambio">TRM (Tasa de Cambio)</Label>
                <Input 
                  id="trm_tasa_cambio"
                  type="number" 
                  step="0.0001" 
                  placeholder="0.0000"
                  {...register("trm_tasa_cambio", { 
                    min: { value: 0, message: "La TRM debe ser mayor o igual a 0" } 
                  })}
                />
                {errors.trm_tasa_cambio && <span className="text-red-500 text-sm">{errors.trm_tasa_cambio.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_tax">Impuesto/Tax</Label>
                <SearchableSelect
                  options={taxes}
                  value={currentTax}
                  onChange={(value) => setValue('id_tax', value)}
                  placeholder="Seleccione impuesto"
                  displayKey="titulo_impuesto"
                  valueKey="id_tax"
                  searchPlaceholder="Buscar impuesto..."
                />
                <input 
                  type="hidden" 
                  {...register("id_tax")}
                  value={currentTax || ''}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="valor_tax">Valor del Impuesto</Label>
                <Input 
                  id="valor_tax" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  {...register("valor_tax", { 
                    min: { value: 0, message: "El IVA debe ser mayor o igual a 0" } 
                  })}
                />
                {errors.valor_tax && <span className="text-red-500 text-sm">{errors.valor_tax.message}</span>}
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Información Adicional
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="modo_pago">Modo de Pago</Label>
                <select 
                  id="modo_pago"
                  {...register("modo_pago")}
                  value={currentModoPago || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccione modo de pago</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                  <option value="PSE">PSE</option>
                  <option value="CONSIGNACION">Consignación</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="url_cotizacion">URL de Cotización</Label>
                <Input 
                  id="url_cotizacion"
                  {...register("url_cotizacion", {
                    pattern: {
                      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: "Ingrese una URL válida"
                    }
                  })}
                  placeholder="https://ejemplo.com/cotizacion"
                />
                {errors.url_cotizacion && <span className="text-red-500 text-sm">{errors.url_cotizacion.message}</span>}
              </div>
              
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="url_contrato">URL del Contrato</Label>
                <Input 
                  id="url_contrato"
                  {...register("url_contrato", {
                    pattern: {
                      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: "Ingrese una URL válida"
                    }
                  })}
                  placeholder="https://ejemplo.com/contrato"
                />
                {errors.url_contrato && <span className="text-red-500 text-sm">{errors.url_contrato.message}</span>}
              </div>
              
                             <div className="grid gap-2 col-span-2">
                 <Label htmlFor="observaciones_factura">Observaciones de la Factura</Label>
                 <Textarea 
                   id="observaciones_factura" 
                   {...register("observaciones_factura")}
                   placeholder="Observaciones, notas o condiciones especiales de la factura"
                   rows={3}
                 />
               </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>
              Cancelar
            </Button>
                         <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
               <Plus className="w-4 h-4 mr-2" />
               Crear Factura
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearFacturaDialog; 