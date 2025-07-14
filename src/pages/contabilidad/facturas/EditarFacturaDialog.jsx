import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { FileText, User, Calendar, DollarSign, X, Search, ChevronDown } from 'lucide-react';

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
              filteredOptions.map((option, index) => {
                const optionKey = option[valueKey] 
                  ? `${option[valueKey]}-${option[displayKey] || ''}`
                  : `option-${index}`;
                return (
                  <div
                    key={optionKey}
                    onClick={() => handleSelect(option)}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent"
                    data-selected={option[valueKey] === value}
                  >
                    {formatOption ? formatOption(option) : option[displayKey] || 'Sin nombre'}
                  </div>
                );
              })
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

const EditarFacturaDialog = ({ open, onClose, factura, onFacturaActualizada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { toast } = useToast();

  const [contratos, setContratos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [taxes, setTaxes] = useState([]);

  // Watch para valores actuales
  const currentEstatus = watch('estatus_factura');
  const currentContrato = watch('id_contrato');
  const currentMoneda = watch('id_moneda');
  const currentTax = watch('id_tax');

  useEffect(() => {
    if (open) {
      console.log('🔄 Cargando catálogos en EditarFactura...');
      Promise.all([
        apiCall('/api/contratos'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/impuestos')
      ]).then(([contratosData, monedasData, taxesData]) => {
        console.log('✅ Datos de monedas recibidos:', monedasData);
        console.log('✅ Ejemplo de primera moneda:', monedasData[0]);
        setContratos(contratosData);
        setMonedas(monedasData);
        setTaxes(taxesData);
      }).catch(error => {
        console.error('❌ Error cargando catálogos en EditarFactura:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los catálogos",
          variant: "destructive",
        });
      });
    }
  }, [open]);

  useEffect(() => {
    if (factura) {
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toISOString().split('T')[0];
      };
      
      // Establecer todos los valores del formulario
      setValue('numero_factura', factura.numero_factura || '');
      setValue('estatus_factura', factura.estatus_factura || 'PENDIENTE');
      setValue('id_contrato', factura.id_contrato || '');
      setValue('fecha_radicado', formatearFecha(factura.fecha_radicado));
      setValue('fecha_estimada_pago', formatearFecha(factura.fecha_estimada_pago));
      setValue('id_moneda', factura.id_moneda || '');
      setValue('subtotal_facturado_moneda', factura.subtotal_facturado_moneda || '');
      setValue('id_tax', factura.id_tax || '');
      setValue('valor_tax', factura.valor_tax || '');
      setValue('observaciones_factura', factura.observaciones_factura || '');
    }
  }, [factura, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log('📝 Datos del formulario antes de formatear:', data);
      
      const formattedData = {
        numero_factura: data.numero_factura || '',
        estatus_factura: data.estatus_factura || 'PENDIENTE',
        id_contrato: data.id_contrato ? parseInt(data.id_contrato) : null,
        id_moneda: data.id_moneda ? parseInt(data.id_moneda) : null,
        id_tax: data.id_tax ? parseInt(data.id_tax) : null,
        fecha_radicado: data.fecha_radicado ? new Date(data.fecha_radicado).toISOString().split('T')[0] : null,
        fecha_estimada_pago: data.fecha_estimada_pago ? new Date(data.fecha_estimada_pago).toISOString().split('T')[0] : null,
        subtotal_facturado_moneda: data.subtotal_facturado_moneda ? parseFloat(data.subtotal_facturado_moneda) : 0,
        valor_tax: data.valor_tax ? parseFloat(data.valor_tax) : null,
        observaciones_factura: (data.observaciones_factura || '').trim()
      };
      
      console.log('📤 Datos formateados para enviar:', formattedData);
      
      const response = await apiCall(`/api/facturas/${factura.id_factura}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      console.log('📨 Respuesta recibida:', response);
      
      if (response && response.success !== false) {
        toast({ title: "Éxito", description: "Factura actualizada correctamente" });
        onFacturaActualizada();
        onClose();
        reset();
      } else {
        throw new Error(response?.message || 'Error al actualizar la factura');
      }
    } catch (error) {
      console.error('❌ Error en onSubmit:', error);
      toast({ 
        title: "Error", 
        description: `No se pudo actualizar la factura: ${error.message}`, 
        variant: "destructive" 
      });
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
                Editar Factura
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {factura?.numero_factura}
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
                  className="w-full"
                />
                {errors.numero_factura && <span className="text-red-500 text-sm">{errors.numero_factura.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="estatus_factura">Estado *</Label>
                <SearchableSelect
                  options={[
                    { value: "PENDIENTE", label: "Pendiente" },
                    { value: "PAGADA", label: "Pagada" },
                    { value: "ANULADA", label: "Anulada" },
                    { value: "VENCIDA", label: "Vencida" }
                  ]}
                  value={currentEstatus}
                  onChange={(value) => setValue('estatus_factura', value)}
                  placeholder="Seleccione estado"
                  displayKey="label"
                  valueKey="value"
                  searchPlaceholder="Buscar estado..."
                />
                <input 
                  type="hidden" 
                  {...register("estatus_factura", { required: "El estado es requerido" })}
                  value={currentEstatus || ''}
                />
                {errors.estatus_factura && <span className="text-red-500 text-sm">{errors.estatus_factura.message}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_contrato">Contrato</Label>
                <SearchableSelect
                  options={contratos}
                  value={currentContrato}
                  onChange={(value) => setValue('id_contrato', value)}
                  placeholder="Seleccione un contrato"
                  displayKey="label"
                  valueKey="id"
                  formatOption={(contrato) => contrato.label || contrato.nombre}
                  searchPlaceholder="Buscar contrato..."
                />
                <input 
                  type="hidden" 
                  {...register("id_contrato")}
                  value={currentContrato || ''}
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5" />
              Fechas
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
                <Label htmlFor="subtotal_facturado_moneda">Subtotal Facturado *</Label>
                <Input 
                  id="subtotal_facturado_moneda" 
                  type="number" 
                  step="0.01" 
                  {...register("subtotal_facturado_moneda", { 
                    required: "El subtotal es requerido", 
                    min: { value: 0, message: "El subtotal debe ser mayor o igual a 0" } 
                  })}
                />
                {errors.subtotal_facturado_moneda && <span className="text-red-500 text-sm">{errors.subtotal_facturado_moneda.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="valor_tax">Valor del IVA</Label>
                <Input 
                  id="valor_tax" 
                  type="number" 
                  step="0.01" 
                  {...register("valor_tax", { 
                    min: { value: 0, message: "El IVA debe ser mayor o igual a 0" } 
                  })}
                />
                {errors.valor_tax && <span className="text-red-500 text-sm">{errors.valor_tax.message}</span>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id_moneda">Moneda *</Label>
                <SearchableSelect
                  options={monedas}
                  value={currentMoneda}
                  onChange={(value) => setValue('id_moneda', value)}
                  placeholder="Seleccione una moneda"
                  searchPlaceholder="Buscar moneda..."
                  displayKey="nombre_moneda"
                  valueKey="id_moneda"
                  formatOption={(moneda) => moneda ? `${moneda.codigo_iso} - ${moneda.nombre_moneda}` : 'Moneda no válida'}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="id_tax">Impuesto</Label>
                <SearchableSelect
                  options={taxes}
                  value={currentTax}
                  onChange={(value) => setValue('id_tax', value)}
                  placeholder="Seleccione un impuesto"
                  searchPlaceholder="Buscar impuesto..."
                  displayKey="titulo_impuesto"
                  valueKey="id_tax"
                  formatOption={(impuesto) => impuesto ? `${impuesto.titulo_impuesto}${impuesto.tipo_obligacion ? ' - ' + impuesto.tipo_obligacion : ''}` : 'Impuesto no válido'}
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Observaciones
            </h3>
            <div className="grid gap-2">
              <Label htmlFor="observaciones_factura">Observaciones</Label>
              <Textarea 
                id="observaciones_factura" 
                {...register("observaciones_factura")}
                placeholder="Ingrese observaciones adicionales sobre la factura"
                rows={3}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarFacturaDialog; 