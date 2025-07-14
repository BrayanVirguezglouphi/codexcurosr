import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiCall } from '@/config/api';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Building2, 
  User, 
  FileCheck, 
  Link,
  CreditCard,
  Target,
  Receipt,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

export default function VerTransaccionDialog({ open, onClose, transaccion }) {
  
  const [cargando, setCargando] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [etiquetasContables, setEtiquetasContables] = useState([]);
  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [conceptos, setConceptos] = useState([]);

  useEffect(() => {
    if (open && transaccion) {
      cargarDatosCompletos();
    }
  }, [open, transaccion]);

  const cargarDatosCompletos = async () => {
    setCargando(true);
    try {
      console.log('🔄 Cargando datos completos para transacción:', transaccion.id_transaccion);
      
      // Cargar datos completos de la transacción y catálogos en paralelo
      const transaccionCompleta = await apiCall(`/api/transacciones/${transaccion.id_transaccion}`);
      
      console.log('📊 Transacción completa recibida:', transaccionCompleta);
      
      // Cargar catálogos después de obtener la transacción
      await cargarCatalogos();
      
    } catch (error) {
      console.error('❌ Error al cargar datos completos:', error);
      // Si hay error, aún intentar cargar catálogos
      await cargarCatalogos();
    }
  };

  const cargarCatalogos = async () => {
    try {
      console.log('🔄 Cargando catálogos para VerTransaccion...');
      
      const [
        cuentasData,
        monedasData,
        tercerosData,
        etiquetasData,
        tiposData,
        conceptosData
      ] = await Promise.all([
        apiCall('/api/catalogos/cuentas'),
        apiCall('/api/catalogos/monedas'),
        apiCall('/api/catalogos/terceros'),
        apiCall('/api/catalogos/etiquetas-contables'),
        apiCall('/api/catalogos/tipos-transaccion'),
        apiCall('/api/catalogos/conceptos-transacciones')
      ]);

      console.log('✅ Catálogos cargados en VerTransaccion:', {
        cuentas: cuentasData?.length || 0,
        monedas: monedasData?.length || 0,
        terceros: tercerosData?.length || 0,
        etiquetas: etiquetasData?.length || 0,
        tipos: tiposData?.length || 0,
        conceptos: conceptosData?.length || 0
      });

      setCuentas(cuentasData || []);
      setMonedas(monedasData || []);
      setTerceros(tercerosData || []);
      setEtiquetasContables(etiquetasData || []);
      setTiposTransaccion(tiposData || []);
      setConceptos(conceptosData || []);
    } catch (error) {
      console.error('❌ Error al cargar catálogos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los catálogos",
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  // Funciones auxiliares para obtener nombres legibles
  const getNombreCuenta = (id) => {
    if (!id) return '—';
    const cuenta = cuentas.find(c => c.id_cuenta === parseInt(id));
    return cuenta ? cuenta.titulo_cuenta : `ID: ${id}`;
  };

  const getNombreMoneda = (id) => {
    if (!id) return '—';
    const moneda = monedas.find(m => m.id_moneda === parseInt(id));
    return moneda ? `${moneda.codigo_iso} - ${moneda.nombre_moneda}` : `ID: ${id}`;
  };

  const getNombreTercero = (id) => {
    if (!id) return '—';
    const tercero = terceros.find(t => t.id === parseInt(id));
    if (!tercero) return `ID: ${id}`;
    
    return tercero.nombre || tercero.label || 'Sin nombre';
  };

  const getNombreEtiquetaContable = (id) => {
    if (!id) return '—';
    const etiqueta = etiquetasContables.find(e => e.id_etiqueta_contable === parseInt(id));
    return etiqueta ? etiqueta.etiqueta_contable : `ID: ${id}`;
  };

  const getNombreTipoTransaccion = (id) => {
    if (!id) return '—';
    const tipo = tiposTransaccion.find(t => t.id_tipotransaccion === parseInt(id));
    return tipo ? tipo.tipo_transaccion : `ID: ${id}`;
  };

  const getNombreConcepto = (id) => {
    if (!id) return '—';
    const concepto = conceptos.find(c => c.id === parseInt(id));
    return concepto ? `${concepto.codigo} - ${concepto.nombre}` : `ID: ${id}`;
  };

  if (!transaccion) return null;

  if (cargando) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cargando detalles</DialogTitle>
            <DialogDescription>
              Obteniendo información de la transacción...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Utilidades para mostrar valores legibles
  const mostrarBooleano = (valor) => valor ? 'Sí' : 'No';
  const mostrarVacio = (valor) => valor ?? '—';
  
  // Formatear moneda
  const formatearMoneda = (valor) => {
    if (!valor) return '—';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determinar badge para booleanos
  const getBadgeVariant = (valor) => {
    if (valor === true) return "default";
    if (valor === false) return "secondary";
    return "outline";
  };

  const getBadgeIcon = (valor) => {
    if (valor === true) return <CheckCircle className="w-3 h-3 mr-1" />;
    if (valor === false) return <XCircle className="w-3 h-3 mr-1" />;
    return <AlertCircle className="w-3 h-3 mr-1" />;
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
                Detalles de la Transacción
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Transacción #{transaccion.id_transaccion} - {transaccion.titulo_transaccion}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Información Básica */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileCheck className="w-5 h-5" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">ID Transacción</p>
                <p className="text-sm text-gray-900">{transaccion.id_transaccion}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Título</p>
                <p className="text-sm text-gray-900">{mostrarVacio(transaccion.titulo_transaccion)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Tipo de Transacción</p>
                <p className="text-sm text-gray-900">{getNombreTipoTransaccion(transaccion.id_tipotransaccion)}</p>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <DollarSign className="w-5 h-5" />
              Información Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-lg font-bold text-green-600">
                  {formatearMoneda(transaccion.valor_total_transaccion)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Moneda</p>
                <p className="text-sm text-gray-900">{getNombreMoneda(transaccion.id_moneda_transaccion)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">TRM Moneda Base</p>
                <p className="text-sm text-gray-900">{mostrarVacio(transaccion.trm_moneda_base)}</p>
              </div>
            </div>
          </div>

          {/* Cuentas */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Building2 className="w-5 h-5" />
              Cuentas Contables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Cuenta Origen</p>
                <p className="text-sm text-gray-900">{getNombreCuenta(transaccion.id_cuenta)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Cuenta Destino</p>
                <p className="text-sm text-gray-900">{getNombreCuenta(transaccion.id_cuenta_destino_transf)}</p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5" />
              Fecha de la Transacción
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Fecha</p>
              <p className="text-sm text-gray-900">{formatearFecha(transaccion.fecha_transaccion)}</p>
            </div>
          </div>

          {/* Información de Tercero y Conceptos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <User className="w-5 h-5" />
              Tercero y Conceptos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Tercero</p>
                <p className="text-sm text-gray-900">{getNombreTercero(transaccion.id_tercero)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Concepto DIAN</p>
                <p className="text-sm text-gray-900">{getNombreConcepto(transaccion.id_concepto)}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-600">Etiqueta Contable</p>
                <p className="text-sm text-gray-900">{getNombreEtiquetaContable(transaccion.id_etiqueta_contable)}</p>
              </div>
            </div>
          </div>

          {/* Estados y Configuraciones */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Receipt className="w-5 h-5" />
              Estados y Configuraciones
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Registro Auxiliar</p>
                <Badge variant={getBadgeVariant(transaccion.registro_auxiliar)} className="text-xs">
                  {getBadgeIcon(transaccion.registro_auxiliar)}
                  {mostrarBooleano(transaccion.registro_auxiliar)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Registro Validado</p>
                <Badge variant={getBadgeVariant(transaccion.registro_validado)} className="text-xs">
                  {getBadgeIcon(transaccion.registro_validado)}
                  {mostrarBooleano(transaccion.registro_validado)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Aplica Retención</p>
                <Badge variant={getBadgeVariant(transaccion.aplica_retencion)} className="text-xs">
                  {getBadgeIcon(transaccion.aplica_retencion)}
                  {mostrarBooleano(transaccion.aplica_retencion)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Aplica Impuestos</p>
                <Badge variant={getBadgeVariant(transaccion.aplica_impuestos)} className="text-xs">
                  {getBadgeIcon(transaccion.aplica_impuestos)}
                  {mostrarBooleano(transaccion.aplica_impuestos)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Enlaces y Documentos */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Link className="w-5 h-5" />
              Enlaces y Documentos
            </h3>
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">URL Soporte Adjunto</p>
                {transaccion.url_soporte_adjunto ? (
                  <a 
                    href={transaccion.url_soporte_adjunto} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    <Link className="w-3 h-3" />
                    Ver documento adjunto
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Sin documento adjunto</p>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="w-5 h-5" />
              Observaciones
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-900 leading-relaxed">
                {transaccion.observacion || 'Sin observaciones'}
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 