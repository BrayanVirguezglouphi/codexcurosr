import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Save
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

const EditarTransaccionDialog = ({ open, onClose, transaccion, onTransaccionActualizada }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
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
      console.log('🔄 Cargando catálogos para EditarTransaccion...');
      Promise.all([
        apiCall('/api/catalogos/cuentas'),
        apiCall('/api/catalogos/tipos-transaccion'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/catalogos/etiquetas-contables'),
        apiCall('/api/terceros'),
        apiCall('/api/catalogos/conceptos-transacciones')
      ]).then(([cuentasData, tiposData, monedasData, etiquetasData, tercerosData, conceptosData]) => {
        console.log('✅ Catálogos cargados en EditarTransaccion:', {
          cuentas: cuentasData?.length || 0,
          tipos: tiposData?.length || 0,
          monedas: monedasData?.length || 0,
          etiquetas: etiquetasData?.length || 0,
          terceros: tercerosData?.length || 0,
          conceptos: conceptosData?.length || 0
        });
        
        setCuentas(cuentasData || []);
        setTiposTransaccion(tiposData || []);
        setMonedas(monedasData || []);
        setEtiquetas(etiquetasData || []);
        setTerceros(tercerosData || []);
        setConceptos(conceptosData || []);
      }).catch(error => {
        console.error('❌ Error al cargar catálogos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los catálogos",
          variant: "destructive",
        });
      });
    }
  }, [open]);

  // Sincronizar valores cuando se cargan los catálogos y la transacción
  useEffect(() => {
    if (transaccion && cuentas.length > 0 && tiposTransaccion.length > 0 && monedas.length > 0) {
      console.log('🔄 Inicializando valores en EditarTransaccion:', {
        transaccion: transaccion.id_transaccion,
        registro_auxiliar: transaccion.registro_auxiliar,
        registro_validado: transaccion.registro_validado,
        aplica_retencion: transaccion.aplica_retencion,
        aplica_impuestos: transaccion.aplica_impuestos
      });
      
      const fecha = transaccion.fecha_transaccion ? new Date(transaccion.fecha_transaccion).toISOString().split('T')[0] : '';
      
      // Resetear todo el formulario de una vez con todos los valores
      reset({
        titulo_transaccion: transaccion.titulo_transaccion || '',
        fecha_transaccion: fecha,
        valor_total_transaccion: transaccion.valor_total_transaccion !== undefined && transaccion.valor_total_transaccion !== null ? transaccion.valor_total_transaccion.toString() : '',
        id_cuenta: transaccion.id_cuenta ? String(transaccion.id_cuenta) : '',
        id_tipotransaccion: transaccion.id_tipotransaccion ? String(transaccion.id_tipotransaccion) : '',
        id_moneda_transaccion: transaccion.id_moneda_transaccion ? String(transaccion.id_moneda_transaccion) : '',
        id_etiqueta_contable: transaccion.id_etiqueta_contable ? String(transaccion.id_etiqueta_contable) : '',
        id_tercero: transaccion.id_tercero ? String(transaccion.id_tercero) : '',
        id_cuenta_destino_transf: transaccion.id_cuenta_destino_transf ? String(transaccion.id_cuenta_destino_transf) : '',
        id_concepto: transaccion.id_concepto ? String(transaccion.id_concepto) : '',
        observacion: transaccion.observacion || '',
        trm_moneda_base: transaccion.trm_moneda_base ? String(transaccion.trm_moneda_base) : '',
        registro_auxiliar: transaccion.registro_auxiliar === true,
        registro_validado: transaccion.registro_validado === true,
        aplica_retencion: transaccion.aplica_retencion === true,
        aplica_impuestos: transaccion.aplica_impuestos === true,
        url_soporte_adjunto: transaccion.url_soporte_adjunto || '',
      });
      
      console.log('✅ Formulario inicializado con valores:', {
        titulo: transaccion.titulo_transaccion,
        fecha: fecha,
        valor: transaccion.valor_total_transaccion,
        cuenta: transaccion.id_cuenta,
        tipo: transaccion.id_tipotransaccion,
        moneda: transaccion.id_moneda_transaccion,
        etiqueta: transaccion.id_etiqueta_contable,
        tercero: transaccion.id_tercero
      });
    }
  }, [transaccion, cuentas, tiposTransaccion, monedas, etiquetas, terceros, conceptos, reset]);

  const onSubmit = async (data) => {
    try {
      console.log('📋 EditarTransaccion - Datos del formulario antes de formatear:', data);
      console.log('🆔 EditarTransaccion - ID de transacción:', transaccion.id_transaccion);
      
      const formattedData = {
        titulo_transaccion: data.titulo_transaccion?.trim() || '',
        fecha_transaccion: data.fecha_transaccion || null,
        valor_total_transaccion: data.valor_total_transaccion ? parseFloat(data.valor_total_transaccion) : null,
        id_cuenta: data.id_cuenta ? parseInt(data.id_cuenta) : null,
        id_tipotransaccion: data.id_tipotransaccion ? parseInt(data.id_tipotransaccion) : null,
        id_moneda_transaccion: data.id_moneda_transaccion ? parseInt(data.id_moneda_transaccion) : null,
        id_etiqueta_contable: data.id_etiqueta_contable ? parseInt(data.id_etiqueta_contable) : null,
        id_tercero: data.id_tercero ? parseInt(data.id_tercero) : null,
        id_cuenta_destino_transf: data.id_cuenta_destino_transf ? parseInt(data.id_cuenta_destino_transf) : null,
        id_concepto: data.id_concepto ? parseInt(data.id_concepto) : null,
        observacion: data.observacion?.trim() || '',
        trm_moneda_base: data.trm_moneda_base ? parseFloat(data.trm_moneda_base) : null,
        registro_auxiliar: Boolean(data.registro_auxiliar),
        registro_validado: Boolean(data.registro_validado),
        aplica_retencion: Boolean(data.aplica_retencion),
        aplica_impuestos: Boolean(data.aplica_impuestos),
        url_soporte_adjunto: data.url_soporte_adjunto?.trim() || ''
      };

      console.log('📤 EditarTransaccion - Datos formateados para enviar:', formattedData);
      console.log('🌐 EditarTransaccion - URL del endpoint:', `/api/transacciones/${transaccion.id_transaccion}`);
      
      const response = await apiCall(`/api/transacciones/${transaccion.id_transaccion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      console.log('📨 EditarTransaccion - Respuesta recibida completa:', response);
      console.log('📨 EditarTransaccion - Tipo de respuesta:', typeof response);
      console.log('📨 EditarTransaccion - Keys de respuesta:', Object.keys(response || {}));
      
      // Verificar si la actualización fue exitosa
      if (response && (response.id_transaccion || response.success !== false)) {
        console.log('✅ EditarTransaccion - Actualización exitosa');
        toast({
          title: "Éxito",
          description: "Transacción actualizada correctamente"
        });
        onTransaccionActualizada?.();
        onClose();
        reset();
      } else {
        console.log('❌ EditarTransaccion - Respuesta indica fallo:', response);
        throw new Error(response?.message || response?.error || 'Error al actualizar la transacción');
      }
    } catch (error) {
      console.error('❌ EditarTransaccion - Error completo en onSubmit:', error);
      console.error('❌ EditarTransaccion - Error message:', error.message);
      console.error('❌ EditarTransaccion - Error stack:', error.stack);
      toast({ 
        title: "Error", 
        description: `No se pudo actualizar la transacción: ${error.message}`, 
        variant: "destructive" 
      });
    }
  };

  if (!transaccion) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transacción</DialogTitle>
          <DialogDescription>
            Modifique los detalles de la transacción
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo_transaccion">Título de la Transacción *</Label>
                <Input
                  id="titulo_transaccion"
                  {...register('titulo_transaccion', { required: true })}
                  placeholder="Ingrese el título"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_tipotransaccion">Tipo de Transacción *</Label>
                <SearchableSelect
                  options={tiposTransaccion}
                  value={currentTipo}
                  onChange={(value) => setValue('id_tipotransaccion', value)}
                  placeholder="Seleccione un tipo"
                  searchPlaceholder="Buscar tipo..."
                  displayKey="tipo_transaccion"
                  valueKey="id_tipotransaccion"
                  formatOption={(option) => `${option.tipo_transaccion}${option.descripcion_tipo_transaccion ? ` - ${option.descripcion_tipo_transaccion}` : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_transaccion">Fecha *</Label>
                <Input
                  id="fecha_transaccion"
                  type="date"
                  {...register('fecha_transaccion', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_moneda_transaccion">Moneda *</Label>
                <SearchableSelect
                  options={monedas}
                  value={currentMoneda}
                  onChange={(value) => setValue('id_moneda_transaccion', value)}
                  placeholder="Seleccione moneda"
                  searchPlaceholder="Buscar moneda..."
                  displayKey="nombre_moneda"
                  valueKey="id_moneda"
                  formatOption={(option) => `${option.codigo_iso} - ${option.nombre_moneda}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_total_transaccion">Valor Total *</Label>
                <Input
                  id="valor_total_transaccion"
                  type="number"
                  step="0.01"
                  {...register('valor_total_transaccion', { required: true })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trm_moneda_base">TRM Moneda Base</Label>
                <Input
                  id="trm_moneda_base"
                  type="number"
                  step="0.000001"
                  {...register('trm_moneda_base')}
                  placeholder="1.000000"
                />
              </div>
            </div>
          </div>

          {/* Cuentas */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_cuenta">Cuenta Origen *</Label>
                <SearchableSelect
                  options={cuentas}
                  value={currentCuenta}
                  onChange={(value) => setValue('id_cuenta', value)}
                  placeholder="Seleccione cuenta origen"
                  searchPlaceholder="Buscar cuenta..."
                  displayKey="titulo_cuenta"
                  valueKey="id_cuenta"
                  formatOption={(option) => `${option.titulo_cuenta}${option.numero_cuenta ? ` - ${option.numero_cuenta}` : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_cuenta_destino_transf">Cuenta Destino</Label>
                <SearchableSelect
                  options={cuentas}
                  value={currentCuentaDestino}
                  onChange={(value) => setValue('id_cuenta_destino_transf', value)}
                  placeholder="Seleccione cuenta destino"
                  searchPlaceholder="Buscar cuenta..."
                  displayKey="titulo_cuenta"
                  valueKey="id_cuenta"
                  formatOption={(option) => `${option.titulo_cuenta}${option.numero_cuenta ? ` - ${option.numero_cuenta}` : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Tercero y Concepto */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_tercero">Tercero *</Label>
                <SearchableSelect
                  options={terceros}
                  value={currentTercero}
                  onChange={(value) => setValue('id_tercero', value)}
                  placeholder="Seleccione tercero"
                  searchPlaceholder="Buscar tercero..."
                                      displayKey="label"
                                      valueKey="id"
                                      formatOption={(option) => option.label || option.nombre}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_concepto">Concepto DIAN</Label>
                <SearchableSelect
                  options={conceptos}
                  value={currentConcepto}
                  onChange={(value) => setValue('id_concepto', value)}
                  placeholder="Seleccione concepto"
                  searchPlaceholder="Buscar concepto..."
                  displayKey="nombre"
                  valueKey="id"
                  formatOption={(option) => `${option.codigo || ''} - ${option.nombre || ''}`}
                />
              </div>
            </div>
          </div>

          {/* Etiqueta Contable */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_etiqueta_contable">Etiqueta Contable</Label>
                <SearchableSelect
                  options={etiquetas}
                  value={currentEtiqueta}
                  onChange={(value) => setValue('id_etiqueta_contable', value)}
                  placeholder="Seleccione etiqueta"
                  searchPlaceholder="Buscar etiqueta..."
                  displayKey="etiqueta_contable"
                  valueKey="id_etiqueta_contable"
                  formatOption={(option) => `${option.etiqueta_contable}${option.descripcion_etiqueta ? ` - ${option.descripcion_etiqueta}` : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observacion">Observaciones</Label>
            <Textarea
              id="observacion"
              {...register('observacion')}
              placeholder="Ingrese observaciones adicionales"
              className="min-h-[100px]"
            />
          </div>

          {/* Opciones Adicionales */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url_soporte_adjunto">URL Soporte</Label>
                <Input
                  id="url_soporte_adjunto"
                  {...register('url_soporte_adjunto')}
                  placeholder="URL del documento soporte"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registro_auxiliar"
                  checked={currentRegistroAuxiliar}
                  onCheckedChange={(checked) => setValue('registro_auxiliar', checked)}
                />
                <Label htmlFor="registro_auxiliar">Registro Auxiliar</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registro_validado"
                  checked={currentRegistroValidado}
                  onCheckedChange={(checked) => setValue('registro_validado', checked)}
                />
                <Label htmlFor="registro_validado">Registro Validado</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aplica_retencion"
                  checked={currentAplicaRetencion}
                  onCheckedChange={(checked) => setValue('aplica_retencion', checked)}
                />
                <Label htmlFor="aplica_retencion">Aplica Retención</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aplica_impuestos"
                  checked={currentAplicaImpuestos}
                  onCheckedChange={(checked) => setValue('aplica_impuestos', checked)}
                />
                <Label htmlFor="aplica_impuestos">Aplica Impuestos</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarTransaccionDialog; 