import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm, Controller } from 'react-hook-form';
import { 
  Building, 
  Info,
  FileText,
  Hash,
  Target,
  Layers,
  Plus,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

const CrearCentroCostoDialog = ({ open, onClose, onCentroCostoCreado }) => {
  const [loading, setLoading] = useState(false);
  const [centrosMacroExistentes, setCentrosMacroExistentes] = useState([]);
  const [mostrarInputNuevo, setMostrarInputNuevo] = useState(false);
  const [valorNuevoMacro, setValorNuevoMacro] = useState('');
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      sub_centro_costo: '',
      centro_costo_macro: '',
      descripcion_cc: ''
    }
  });

  // Cargar centros macro existentes
  const cargarCentrosMacroExistentes = async () => {
    try {
      const response = await fetch('/api/centros-costos');
      const data = await response.json();
      
      // Extraer centros macro únicos (no vacíos)
      const macrosUnicos = [...new Set(
        data
          .map(c => c.centro_costo_macro)
          .filter(macro => macro && macro.trim() !== '')
      )].sort();
      
      setCentrosMacroExistentes(macrosUnicos);
    } catch (error) {
      console.error('Error al cargar centros macro:', error);
    }
  };

  // Cargar centros macro cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarCentrosMacroExistentes();
      setMostrarInputNuevo(false);
      setValorNuevoMacro('');
    }
  }, [open]);

  // Manejar selección del dropdown
  const manejarSeleccionMacro = (valor) => {
    if (valor === '__crear_nuevo__') {
      setMostrarInputNuevo(true);
      setValue('centro_costo_macro', '');
    } else {
      setMostrarInputNuevo(false);
      setValue('centro_costo_macro', valor);
      setValorNuevoMacro('');
    }
  };

  // Manejar input manual de nuevo macro
  const manejarCambioNuevoMacro = (e) => {
    const valor = e.target.value;
    setValorNuevoMacro(valor);
    setValue('centro_costo_macro', valor);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/centros-costos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Centro de costo creado correctamente",
        });
        
        reset();
        setMostrarInputNuevo(false);
        setValorNuevoMacro('');
        onCentroCostoCreado?.();
        onClose(false);
      } else {
        throw new Error('Error al crear el centro de costo');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el centro de costo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado Elegante */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Crear Nuevo Centro de Costo
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Complete la información para crear un nuevo centro de costo
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
                <Label htmlFor="sub_centro_costo">Sub Centro de Costo *</Label>
                <Input 
                  id="sub_centro_costo" 
                  {...register("sub_centro_costo", { 
                    required: "El sub centro de costo es requerido",
                    maxLength: { value: 100, message: "No puede exceder 100 caracteres" },
                    minLength: { value: 3, message: "Debe tener al menos 3 caracteres" }
                  })} 
                  placeholder="Ingrese el nombre del sub centro de costo"
                />
                {errors.sub_centro_costo && (
                  <p className="text-sm text-red-500">{errors.sub_centro_costo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="centro_costo_macro">Centro Costo Macro</Label>
                
                {/* Dropdown con opciones existentes */}
                <div className="space-y-2">
                  <Controller
                    name="centro_costo_macro_selector"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={manejarSeleccionMacro}
                        value={mostrarInputNuevo ? '__crear_nuevo__' : watch('centro_costo_macro') || ''}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar centro macro existente o crear nuevo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Sin centro macro (centro principal)</span>
                            </div>
                          </SelectItem>
                          
                          {centrosMacroExistentes.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
                                Centros Macro Existentes
                              </div>
                              {centrosMacroExistentes.map((macro, index) => (
                                <SelectItem key={index} value={macro}>
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-blue-500" />
                                    <span>{macro}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border-t">
                            Crear Nuevo
                          </div>
                          <SelectItem value="__crear_nuevo__">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-green-500" />
                              <span className="text-green-700 font-medium">Crear nuevo centro macro</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  
                  {/* Input para crear nuevo centro macro */}
                  {mostrarInputNuevo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Crear nuevo centro macro</span>
                      </div>
                      <Input
                        value={valorNuevoMacro}
                        onChange={manejarCambioNuevoMacro}
                        placeholder="Ingrese el nombre del nuevo centro macro"
                        className="border-green-300 focus:border-green-500"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMostrarInputNuevo(false);
                            setValue('centro_costo_macro', '');
                            setValorNuevoMacro('');
                          }}
                          className="text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cargarCentrosMacroExistentes}
                          className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Actualizar lista
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Mostrar valor seleccionado/creado */}
                  {watch('centro_costo_macro') && !mostrarInputNuevo && (
                    <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>Seleccionado:</strong> {watch('centro_costo_macro')}
                    </div>
                  )}
                </div>
                
                {errors.centro_costo_macro && (
                  <p className="text-sm text-red-500">{errors.centro_costo_macro.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Descripción Detallada */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              📝 Descripción Detallada
            </h3>
            <div className="space-y-2">
              <Label htmlFor="descripcion_cc">Descripción del Centro de Costo</Label>
              <Textarea 
                id="descripcion_cc" 
                {...register("descripcion_cc", { 
                  maxLength: { value: 1000, message: "No puede exceder 1000 caracteres" }
                })} 
                placeholder="Describa detalladamente el propósito, alcance y responsabilidades de este centro de costo (opcional)"
                rows={5}
              />
              {errors.descripcion_cc && (
                <p className="text-sm text-red-500">{errors.descripcion_cc.message}</p>
              )}
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Target className="w-5 h-5" />
              ⚙️ Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Estado</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Activo</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">El centro se creará en estado activo</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Tipo</span>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Centro de Costo</span>
                </div>
                <p className="text-xs text-green-700 mt-1">Para control de costos operacionales</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">Propósito</span>
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Control</span>
                </div>
                <p className="text-xs text-purple-700 mt-1">Seguimiento financiero y control</p>
              </div>
            </div>
          </div>

          {/* Jerarquía y Organización */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Layers className="w-5 h-5" />
              🏗️ Jerarquía y Organización
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-900">Nivel</span>
                  <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">Sub-centro</span>
                </div>
                <p className="text-xs text-orange-700 mt-1">Centro de costo a nivel operativo</p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-900">Estructura</span>
                  <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Jerárquica</span>
                </div>
                <p className="text-xs text-indigo-700 mt-1">Puede depender de un centro macro</p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose(false)}
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
                  Crear Centro de Costo
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearCentroCostoDialog; 