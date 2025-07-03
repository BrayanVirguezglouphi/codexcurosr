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
  User, 
  Calendar, 
  DollarSign, 
  Building, 
  Link,
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
              filteredOptions.map((option, idx) => (
                <div
                  key={option[valueKey] ?? idx}
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

const EditarContratoDialog = ({ open, onClose, onContratoActualizado, contratoId }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { toast } = useToast();
  
  const [terceros, setTerceros] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Watch para campos controlados
  const currentTercero = watch('id_tercero');
  const currentMoneda = watch('id_moneda_cotizacion');
  const currentTax = watch('id_tax');
  const currentEstado = watch('estatus_contrato');
  const currentModoPago = watch('modo_de_pago');

  useEffect(() => {
    if (open && contratoId) {
      cargarDatos();
    }
  }, [open, contratoId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [contrato, tercerosData, monedasData, taxesData] = await Promise.all([
        apiCall(`/api/contratos/${contratoId}`),
        apiCall('/api/terceros'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/impuestos')
      ]);

      setTerceros(tercerosData);
      setMonedas(monedasData);
      setTaxes(taxesData);

      // Precargar valores en el formulario
      Object.keys(contrato).forEach(key => {
        if (key.includes('fecha') && contrato[key]) {
          setValue(key, new Date(contrato[key]).toISOString().split('T')[0]);
        } else {
          setValue(key, contrato[key] || '');
        }
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Formatear datos y excluir el ID autoincrementable
      const { id_contrato, ...dataWithoutId } = data;
      const formattedData = {
        ...dataWithoutId,
        id_tercero: data.id_tercero ? parseInt(data.id_tercero) : null,
        id_moneda_cotizacion: data.id_moneda_cotizacion ? parseInt(data.id_moneda_cotizacion) : null,
        id_tax: data.id_tax ? parseInt(data.id_tax) : null,
        valor_cotizado: data.valor_cotizado ? parseFloat(data.valor_cotizado) : null,
        valor_descuento: data.valor_descuento ? parseFloat(data.valor_descuento) : null,
        valor_tax: data.valor_tax ? parseFloat(data.valor_tax) : null,
        trm: data.trm ? parseFloat(data.trm) : null,
        fecha_contrato: data.fecha_contrato ? new Date(data.fecha_contrato).toISOString().split('T')[0] : null,
        fecha_inicio_servicio: data.fecha_inicio_servicio ? new Date(data.fecha_inicio_servicio).toISOString().split('T')[0] : null,
        fecha_final_servicio: data.fecha_final_servicio ? new Date(data.fecha_final_servicio).toISOString().split('T')[0] : null
      };

      console.log('🔄 Actualizando contrato con datos:', formattedData);

      await apiCall(`/api/contratos/${contratoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      toast({ title: "Éxito", description: "Contrato actualizado correctamente" });
      onContratoActualizado();
      onClose();
    } catch (error) {
      console.error('❌ Error al actualizar contrato:', error);
      toast({ title: "Error", description: "No se pudo actualizar el contrato", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Editar Contrato
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Modifique los datos del contrato seleccionado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-gray-500">Cargando datos...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <FileText className="w-5 h-5" />
                📋 Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero_contrato_os">Número de Contrato/OS *</Label>
                  <Input 
                    id="numero_contrato_os" 
                    {...register("numero_contrato_os", { 
                      required: "El número de contrato es requerido",
                      maxLength: { value: 100, message: "No puede exceder 100 caracteres" }
                    })} 
                    placeholder="Ej: CON-2024-001"
                  />
                  {errors.numero_contrato_os && (
                    <p className="text-sm text-red-500">{errors.numero_contrato_os.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_tercero">Cliente/Tercero</Label>
                  <SearchableSelect
                    options={terceros}
                    value={currentTercero}
                    onChange={(value) => setValue('id_tercero', value)}
                    placeholder="Seleccione un tercero"
                    searchPlaceholder="Buscar tercero..."
                    displayKey="display"
                    valueKey="id_tercero"
                    formatOption={(tercero) => 
                      tercero.razon_social || 
                      `${tercero.primer_nombre || ''} ${tercero.primer_apellido || ''}`.trim() || 
                      'Sin nombre'
                    }
                  />
                  <input type="hidden" {...register("id_tercero")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estatus_contrato">Estado del Contrato</Label>
                  <SearchableSelect
                    options={[
                      { id: 'ACTIVO', name: 'Activo' },
                      { id: 'FINALIZADO', name: 'Finalizado' },
                      { id: 'SUSPENDIDO', name: 'Suspendido' },
                      { id: 'CANCELADO', name: 'Cancelado' },
                      { id: 'EN_NEGOCIACION', name: 'En Negociación' }
                    ]}
                    value={currentEstado}
                    onChange={(value) => setValue('estatus_contrato', value)}
                    placeholder="Seleccione el estado"
                    searchPlaceholder="Buscar estado..."
                    displayKey="name"
                    valueKey="id"
                  />
                  <input type="hidden" {...register("estatus_contrato")} />
                </div>
              </div>
            </div>

            {/* Descripción del Servicio */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Building className="w-5 h-5" />
                🏢 Descripción del Servicio Contratado
              </h3>
              <div className="space-y-2">
                <Label htmlFor="descripcion_servicio_contratado">Descripción del Servicio</Label>
                <Textarea 
                  id="descripcion_servicio_contratado" 
                  {...register("descripcion_servicio_contratado")} 
                  placeholder="Describa detalladamente el servicio o producto contratado"
                  rows={3}
                />
              </div>
            </div>

            {/* Fechas del Contrato */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Calendar className="w-5 h-5" />
                📅 Fechas del Contrato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_contrato">Fecha del Contrato</Label>
                  <Input 
                    id="fecha_contrato" 
                    type="date"
                    {...register("fecha_contrato")} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio_servicio">Fecha Inicio del Servicio</Label>
                  <Input 
                    id="fecha_inicio_servicio" 
                    type="date"
                    {...register("fecha_inicio_servicio")} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_final_servicio">Fecha Final del Servicio</Label>
                  <Input 
                    id="fecha_final_servicio" 
                    type="date"
                    {...register("fecha_final_servicio")} 
                  />
                </div>
              </div>
            </div>

            {/* Información Financiera */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <DollarSign className="w-5 h-5" />
                💰 Información Financiera
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_moneda_cotizacion">Moneda de Cotización</Label>
                  <SearchableSelect
                    options={monedas}
                    value={currentMoneda}
                    onChange={(value) => setValue('id_moneda_cotizacion', value)}
                    placeholder="Seleccione moneda"
                    searchPlaceholder="Buscar moneda..."
                    displayKey="nombre"
                    valueKey="id"
                    formatOption={(moneda) => moneda ? `${moneda.codigo_iso} - ${moneda.nombre}` : 'Moneda no válida'}
                  />
                  <input type="hidden" {...register("id_moneda_cotizacion")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_cotizado">Valor Cotizado</Label>
                  <Input 
                    id="valor_cotizado" 
                    type="number"
                    step="0.01"
                    {...register("valor_cotizado", { 
                      min: { value: 0, message: "El valor debe ser mayor o igual a 0" }
                    })} 
                    placeholder="0.00"
                  />
                  {errors.valor_cotizado && (
                    <p className="text-sm text-red-500">{errors.valor_cotizado.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_descuento">Valor de Descuento</Label>
                  <Input 
                    id="valor_descuento" 
                    type="number"
                    step="0.01"
                    {...register("valor_descuento", { 
                      min: { value: 0, message: "El valor debe ser mayor o igual a 0" }
                    })} 
                    placeholder="0.00"
                  />
                  {errors.valor_descuento && (
                    <p className="text-sm text-red-500">{errors.valor_descuento.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trm">TRM (Tasa de Cambio)</Label>
                  <Input 
                    id="trm" 
                    type="number"
                    step="0.0001"
                    {...register("trm", { 
                      min: { value: 0, message: "La TRM debe ser mayor a 0" }
                    })} 
                    placeholder="0.0000"
                  />
                  {errors.trm && (
                    <p className="text-sm text-red-500">{errors.trm.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_tax">Impuesto/Tax</Label>
                  <SearchableSelect
                    options={taxes}
                    value={currentTax}
                    onChange={(value) => setValue('id_tax', value)}
                    placeholder="Seleccione impuesto"
                    searchPlaceholder="Buscar impuesto..."
                    displayKey="titulo_impuesto"
                    valueKey="id_tax"
                    formatOption={(impuesto) => impuesto ? `${impuesto.titulo_impuesto}${impuesto.tipo_obligacion ? ' - ' + impuesto.tipo_obligacion : ''}` : 'Impuesto no válido'}
                  />
                  <input type="hidden" {...register("id_tax")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_tax">Valor del Impuesto</Label>
                  <Input 
                    id="valor_tax" 
                    type="number"
                    step="0.01"
                    {...register("valor_tax", { 
                      min: { value: 0, message: "El valor debe ser mayor o igual a 0" }
                    })} 
                    placeholder="0.00"
                  />
                  {errors.valor_tax && (
                    <p className="text-sm text-red-500">{errors.valor_tax.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Link className="w-5 h-5" />
                📎 Información Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modo_de_pago">Modo de Pago</Label>
                  <SearchableSelect
                    options={[
                      { id: 'CONTADO', name: 'Contado' },
                      { id: 'CREDITO_30', name: 'Crédito 30 días' },
                      { id: 'CREDITO_60', name: 'Crédito 60 días' },
                      { id: 'CREDITO_90', name: 'Crédito 90 días' },
                      { id: 'ANTICIPADO', name: 'Anticipado' },
                      { id: 'PARCIAL', name: 'Pagos parciales' }
                    ]}
                    value={currentModoPago}
                    onChange={(value) => setValue('modo_de_pago', value)}
                    placeholder="Seleccione modo de pago"
                    searchPlaceholder="Buscar modo de pago..."
                    displayKey="name"
                    valueKey="id"
                  />
                  <input type="hidden" {...register("modo_de_pago")} />
                </div>

                <div></div>

                <div className="space-y-2">
                  <Label htmlFor="url_cotizacion">URL de Cotización</Label>
                  <Input 
                    id="url_cotizacion" 
                    type="url"
                    {...register("url_cotizacion", { 
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: "Debe ser una URL válida"
                      },
                      maxLength: { value: 500, message: "No puede exceder 500 caracteres" }
                    })} 
                    placeholder="https://ejemplo.com/cotizacion"
                  />
                  {errors.url_cotizacion && (
                    <p className="text-sm text-red-500">{errors.url_cotizacion.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url_contrato">URL del Contrato</Label>
                  <Input 
                    id="url_contrato" 
                    type="url"
                    {...register("url_contrato", { 
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: "Debe ser una URL válida"
                      },
                      maxLength: { value: 500, message: "No puede exceder 500 caracteres" }
                    })} 
                    placeholder="https://ejemplo.com/contrato"
                  />
                  {errors.url_contrato && (
                    <p className="text-sm text-red-500">{errors.url_contrato.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <FileText className="w-5 h-5" />
                📝 Observaciones
              </h3>
              <div className="space-y-2">
                <Label htmlFor="observaciones_contrato">Observaciones del Contrato</Label>
                <Textarea 
                  id="observaciones_contrato" 
                  {...register("observaciones_contrato")} 
                  placeholder="Observaciones, notas o condiciones especiales del contrato"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Actualizar Contrato
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditarContratoDialog; 