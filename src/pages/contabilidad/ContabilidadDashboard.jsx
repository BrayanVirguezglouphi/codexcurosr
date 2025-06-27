import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { apiCall } from '@/config/api';
import { 
  FileText, 
  CreditCard, 
  Receipt, 
  PiggyBank, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ContabilidadDashboard = () => {
  const { isDarkMode } = useSettings();
  const [dashboardData, setDashboardData] = useState({
    facturas: { count: 0, total: 0, pendientes: 0, vencidas: 0 },
    transacciones: { count: 0, ingresos: 0, gastos: 0, balance: 0 },
    contratos: { count: 0, activos: 0, valor: 0, vencen: 0 },
    servicios: { count: 0, tipos: 0 },
    impuestos: { count: 0, activos: 0, proximos: 0 },
    terceros: { count: 0, naturales: 0, juridicas: 0, activos: 0 },
    clasificaciones: { count: 0, centrosCostos: 0, etiquetas: 0, conceptos: 0 },
    loading: true
  });

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    if (!valor) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Cargar datos del dashboard
  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        console.log('🔄 Cargando datos REALES del dashboard...');
        
        // Cargar datos reales desde las APIs
        const [
          facturasRes,
          transaccionesRes,
          contratosRes,
          serviciosRes,
          impuestosRes,
          tercerosRes
        ] = await Promise.all([
          apiCall('/api/facturas').catch(() => []),
          apiCall('/api/transacciones').catch(() => []),
          apiCall('/api/contratos').catch(() => []),
          apiCall('/api/lineas-servicios').catch(() => []),
          apiCall('/api/impuestos').catch(() => []),
          apiCall('/api/terceros').catch(() => [])
        ]);

        // Si todas las llamadas fallaron, usar datos de demostración
        if (!facturasRes.length && !transaccionesRes.length && !contratosRes.length) {
          console.log('⚠️ Usando datos de demostración por error en API');
          setDashboardData({
            facturas: { count: 5, total: 15000000, pendientes: 2, vencidas: 1 },
            transacciones: { count: 10, ingresos: 25000000, gastos: 18000000, balance: 7000000 },
            contratos: { count: 3, activos: 2, valor: 30000000, vencen: 1 },
            servicios: { count: 8, tipos: 4 },
            impuestos: { count: 6, activos: 4, proximos: 2 },
            terceros: { count: 15, naturales: 8, juridicas: 7, activos: 12 },
            clasificaciones: { count: 12, centrosCostos: 4, etiquetas: 5, conceptos: 3 },
            loading: false
          });
          return;
        }

        const [facturas, transacciones, contratos, servicios, impuestos, terceros] = await Promise.all([
                  facturasRes,
        transaccionesRes,
        contratosRes,
        serviciosRes,
        impuestosRes,
        tercerosRes
        ]);

        console.log('✅ Datos REALES cargados:', {
          facturas: facturas.length,
          transacciones: transacciones.length,
          contratos: contratos.length,
          servicios: servicios.length,
          impuestos: impuestos.length,
          terceros: terceros.length
        });

                // Datos de clasificaciones contables (usar datos de demostración por ahora)
        const centrosCostos = [
          { id: 1, nombre_centro_costo: 'Administración' },
          { id: 2, nombre_centro_costo: 'Ventas' },
          { id: 3, nombre_centro_costo: 'Producción' }
        ];
        
        const etiquetasContables = [
          { id: 1, etiqueta_contable: 'Gastos Administrativos' },
          { id: 2, etiqueta_contable: 'Ingresos por Ventas' },
          { id: 3, etiqueta_contable: 'Costos de Producción' },
          { id: 4, etiqueta_contable: 'Gastos de Marketing' }
        ];
        
        const conceptosTransacciones = [
          { id: 1, concepto_dian: 'Honorarios' },
          { id: 2, concepto_dian: 'Servicios' },
          { id: 3, concepto_dian: 'Productos' }
        ];

      // Procesar datos de facturas
      const facturasData = {
        count: facturas.length,
        total: facturas.reduce((acc, f) => acc + (parseFloat(f.subtotal_facturado_moneda) || 0), 0),
        pendientes: facturas.filter(f => f.estado_factura === 'PENDIENTE').length,
        vencidas: facturas.filter(f => {
          const fechaVencimiento = new Date(f.fecha_estimada_pago);
          return fechaVencimiento < new Date() && f.estado_factura === 'PENDIENTE';
        }).length
      };

      // Procesar datos de transacciones
      const ingresos = transacciones
        .filter(t => t.tipo_transaccion === 'VENTA' || t.tipo_transaccion === 'REEMBOLSO')
        .reduce((acc, t) => acc + (parseFloat(t.valor_total_transaccion) || 0), 0);
      
      const gastos = transacciones
        .filter(t => t.tipo_transaccion === 'COMPRA' || t.tipo_transaccion === 'PAGO')
        .reduce((acc, t) => acc + (parseFloat(t.valor_total_transaccion) || 0), 0);

      const transaccionesData = {
        count: transacciones.length,
        ingresos,
        gastos,
        balance: ingresos - gastos
      };

      // Procesar datos de contratos
      const contratosData = {
        count: contratos.length,
        activos: contratos.filter(c => c.estado_contrato === 'ACTIVO').length,
        valor: contratos.reduce((acc, c) => acc + (parseFloat(c.valor_cotizado) || 0), 0),
        vencen: contratos.filter(c => {
          const fechaFin = new Date(c.fecha_fin_contrato);
          const proximoMes = new Date();
          proximoMes.setMonth(proximoMes.getMonth() + 1);
          return fechaFin <= proximoMes && c.estado_contrato === 'ACTIVO';
        }).length
      };

      // Procesar datos de servicios
      const serviciosData = {
        count: servicios.length,
        tipos: [...new Set(servicios.map(s => s.tipo_servicio))].length
      };

      // Procesar datos de impuestos
      const impuestosData = {
        count: impuestos.length,
        activos: impuestos.filter(i => i.estado_impuesto === 'ACTIVO').length,
        proximos: impuestos.filter(i => {
          const fechaInicio = new Date(i.fecha_inicio);
          const proximoMes = new Date();
          proximoMes.setMonth(proximoMes.getMonth() + 1);
          return fechaInicio <= proximoMes && i.estado_impuesto === 'PENDIENTE';
        }).length
      };

      // Procesar datos de terceros
      const tercerosData = {
        count: terceros.length,
        naturales: terceros.filter(t => t.tipo_personalidad === 'NATURAL').length,
        juridicas: terceros.filter(t => t.tipo_personalidad === 'JURIDICA').length,
        activos: terceros.filter(t => t.estado_tercero === 'ACTIVO').length
      };

      // Procesar datos de clasificaciones contables
      const clasificacionesData = {
        count: centrosCostos.length + etiquetasContables.length + conceptosTransacciones.length,
        centrosCostos: centrosCostos.length,
        etiquetas: etiquetasContables.length,
        conceptos: conceptosTransacciones.length
      };

      console.log('✅ Datos procesados:', {
        facturas: facturasData,
        transacciones: transaccionesData,
        contratos: contratosData,
        servicios: serviciosData,
        impuestos: impuestosData,
        terceros: tercerosData,
        clasificaciones: clasificacionesData
      });

        setDashboardData({
          facturas: facturasData,
          transacciones: transaccionesData,
          contratos: contratosData,
          servicios: serviciosData,
          impuestos: impuestosData,
          terceros: tercerosData,
          clasificaciones: clasificacionesData,
          loading: false
        });
        
      } catch (error) {
        console.error('❌ Error cargando datos del dashboard:', error);
        // Usar datos de demostración en caso de error
        setDashboardData({
          facturas: { count: 5, total: 15000000, pendientes: 2, vencidas: 1 },
          transacciones: { count: 10, ingresos: 25000000, gastos: 18000000, balance: 7000000 },
          contratos: { count: 3, activos: 2, valor: 30000000, vencen: 1 },
          servicios: { count: 8, tipos: 4 },
          impuestos: { count: 6, activos: 4, proximos: 2 },
          terceros: { count: 15, naturales: 8, juridicas: 7, activos: 12 },
          clasificaciones: { count: 12, centrosCostos: 4, etiquetas: 5, conceptos: 3 },
          loading: false
        });
      }
    };

    // Cargar datos inmediatamente
    cargarDatosDashboard();
  }, []);

  // Configuración de módulos con datos dinámicos
  const moduleCards = [
    {
      title: 'Facturas',
      description: 'Administración de facturas',
      icon: <FileText className={cn("h-10 w-10", isDarkMode ? "text-blue-400" : "text-blue-600")} />,
      path: '/contabilidad/facturas',
      count: dashboardData.facturas.count,
      metrics: [
        { 
          label: 'Total Facturado', 
          value: formatearMoneda(dashboardData.facturas.total),
          color: isDarkMode ? 'text-green-400' : 'text-green-600',
          icon: <DollarSign className="w-4 h-4" />
        },
        { 
          label: 'Pendientes', 
          value: dashboardData.facturas.pendientes,
          color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
          icon: <Clock className="w-4 h-4" />
        },
        { 
          label: 'Vencidas', 
          value: dashboardData.facturas.vencidas,
          color: isDarkMode ? 'text-red-400' : 'text-red-600',
          icon: <AlertTriangle className="w-4 h-4" />
        }
      ],
      progress: dashboardData.facturas.count > 0 ? 
        ((dashboardData.facturas.count - dashboardData.facturas.pendientes) / dashboardData.facturas.count) * 100 : 0,
      progressLabel: 'Facturas Procesadas',
      bgColor: isDarkMode ? 'bg-slate-800/50' : 'bg-blue-50',
      borderColor: isDarkMode ? 'border-blue-500/20' : 'border-blue-200'
    },
    {
      title: 'Transacciones',
      description: 'Registro de ingresos y gastos',
      icon: <CreditCard className={cn("h-10 w-10", isDarkMode ? "text-emerald-400" : "text-emerald-600")} />,
      path: '/contabilidad/transacciones',
      count: dashboardData.transacciones.count,
      metrics: [
        { 
          label: 'Ingresos', 
          value: formatearMoneda(dashboardData.transacciones.ingresos),
          color: isDarkMode ? 'text-green-400' : 'text-green-600',
          icon: <TrendingUp className="w-4 h-4" />
        },
        { 
          label: 'Gastos', 
          value: formatearMoneda(dashboardData.transacciones.gastos),
          color: isDarkMode ? 'text-red-400' : 'text-red-600',
          icon: <TrendingDown className="w-4 h-4" />
        },
        { 
          label: 'Balance', 
          value: formatearMoneda(dashboardData.transacciones.balance),
          color: dashboardData.transacciones.balance >= 0 ? 
            (isDarkMode ? 'text-green-400' : 'text-green-600') : 
            (isDarkMode ? 'text-red-400' : 'text-red-600'),
          icon: dashboardData.transacciones.balance >= 0 ? 
            <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
        }
      ],
      progress: dashboardData.transacciones.ingresos > 0 ? 
        (dashboardData.transacciones.ingresos / (dashboardData.transacciones.ingresos + dashboardData.transacciones.gastos)) * 100 : 50,
      progressLabel: 'Ratio Ingresos vs Total',
      bgColor: isDarkMode ? 'bg-slate-800/50' : 'bg-emerald-50',
      borderColor: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-200'
    },
    {
      title: 'Contratos',
      description: 'Contratos financieros',
      icon: <Receipt className={cn("h-10 w-10", isDarkMode ? "text-purple-400" : "text-purple-600")} />,
      path: '/contabilidad/contratos',
      count: dashboardData.contratos.count,
      metrics: [
        { 
          label: 'Valor Total', 
          value: formatearMoneda(dashboardData.contratos.valor),
          color: isDarkMode ? 'text-green-400' : 'text-green-600',
          icon: <DollarSign className="w-4 h-4" />
        },
        { 
          label: 'Activos', 
          value: dashboardData.contratos.activos,
          color: isDarkMode ? 'text-purple-400' : 'text-purple-600',
          icon: <CheckCircle className="w-4 h-4" />
        },
        { 
          label: 'Vencen Pronto', 
          value: dashboardData.contratos.vencen,
          color: isDarkMode ? 'text-orange-400' : 'text-orange-600',
          icon: <Calendar className="w-4 h-4" />
        }
      ],
      progress: dashboardData.contratos.count > 0 ? 
        (dashboardData.contratos.activos / dashboardData.contratos.count) * 100 : 0,
      progressLabel: 'Contratos Activos',
      bgColor: isDarkMode ? 'bg-slate-800/50' : 'bg-purple-50',
      borderColor: isDarkMode ? 'border-purple-500/20' : 'border-purple-200'
    },
    {
      title: 'Línea de Servicios',
      description: 'Servicios facturables',
      icon: <FileText className={cn("h-10 w-10", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />,
      path: '/contabilidad/servicios',
      count: dashboardData.servicios.count,
      metrics: [
        { 
          label: 'Tipos de Servicios', 
          value: dashboardData.servicios.tipos,
          color: isDarkMode ? 'text-indigo-400' : 'text-indigo-600',
          icon: <BarChart3 className="w-4 h-4" />
        }
      ],
      progress: dashboardData.servicios.count > 0 ? 85 : 0,
      progressLabel: 'Servicios Configurados',
      bgColor: isDarkMode ? 'bg-slate-800/50' : 'bg-indigo-50',
      borderColor: isDarkMode ? 'border-indigo-500/20' : 'border-indigo-200'
    },
    {
      title: 'Impuestos',
      description: 'Configuración tributaria',
      icon: <PiggyBank className={cn("h-10 w-10", isDarkMode ? "text-amber-400" : "text-amber-600")} />,
      path: '/contabilidad/impuestos',
      count: dashboardData.impuestos.count,
      metrics: [
        { 
          label: 'Activos', 
          value: dashboardData.impuestos.activos,
          color: isDarkMode ? 'text-amber-400' : 'text-amber-600',
          icon: <CheckCircle className="w-4 h-4" />
        },
        { 
          label: 'Próximos', 
          value: dashboardData.impuestos.proximos,
          color: isDarkMode ? 'text-orange-400' : 'text-orange-600',
          icon: <Calendar className="w-4 h-4" />
        }
      ],
      progress: dashboardData.impuestos.count > 0 ? 
        (dashboardData.impuestos.activos / dashboardData.impuestos.count) * 100 : 0,
      progressLabel: 'Impuestos Activos',
      bgColor: isDarkMode ? 'bg-slate-800/50' : 'bg-amber-50',
      borderColor: isDarkMode ? 'border-amber-500/20' : 'border-amber-200'
    },
    {
      title: 'Terceros',
      description: 'Administración de terceros',
      icon: <Users className={cn("h-10 w-10", isDarkMode ? "text-cyan-400" : "text-cyan-600")} />,
      path: '/contabilidad/terceros',
      count: dashboardData.terceros.count,
      metrics: [
        { 
          label: 'Personas Naturales', 
          value: dashboardData.terceros.naturales,
          color: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
          icon: <Users className="w-4 h-4" />
        },
        { 
          label: 'Personas Jurídicas', 
          value: dashboardData.terceros.juridicas,
          color: isDarkMode ? 'text-violet-400' : 'text-violet-600',
          icon: <Building className="w-4 h-4" />
        },
        { 
          label: 'Activos', 
          value: dashboardData.terceros.activos,
          color: isDarkMode ? 'text-green-400' : 'text-green-600',
          icon: <CheckCircle className="w-4 h-4" />
        }
      ],
      progress: dashboardData.terceros.count > 0 ? 
        (dashboardData.terceros.activos / dashboardData.terceros.count) * 100 : 0,
      progressLabel: 'Terceros Activos',
      bgColor: isDarkMode ? 'bg-slate-800/50' : 'bg-cyan-50',
      borderColor: isDarkMode ? 'border-cyan-500/20' : 'border-cyan-200'
    },
    {
      title: 'Clasificaciones Contables',
      description: 'Centros de costos, etiquetas y conceptos',
      icon: <BarChart3 className={cn("h-10 w-10", isDarkMode ? "text-rose-400" : "text-rose-600")} />,
      path: '/contabilidad/clasificaciones-contables',
      count: dashboardData.clasificaciones.count,
      metrics: [
        { 
          label: 'Centros de Costos', 
          value: dashboardData.clasificaciones.centrosCostos,
          color: isDarkMode ? 'text-rose-400' : 'text-rose-600',
          icon: <Building className="w-4 h-4" />
        },
        { 
          label: 'Etiquetas Contables', 
          value: dashboardData.clasificaciones.etiquetas,
          color: isDarkMode ? 'text-fuchsia-400' : 'text-fuchsia-600',
          icon: <BarChart3 className="w-4 h-4" />
        },
        { 
          label: 'Conceptos DIAN', 
          value: dashboardData.clasificaciones.conceptos,
          color: isDarkMode ? 'text-pink-400' : 'text-pink-600',
          icon: <FileText className="w-4 h-4" />
        }
      ],
      progress: dashboardData.clasificaciones.count > 0 ? 90 : 0,
      progressLabel: 'Configuración Completa',
      bgColor: isDarkMode ? 'bg-slate-800/50' : 'bg-rose-50',
      borderColor: isDarkMode ? 'border-rose-500/20' : 'border-rose-200'
    }
  ];

  if (dashboardData.loading) {
    return (
      <div className="w-full max-w-[1800px] mx-auto py-6">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className={cn("h-8 rounded w-1/3 mb-4", isDarkMode ? "bg-slate-700" : "bg-gray-200")}></div>
            <div className={cn("h-4 rounded w-1/2", isDarkMode ? "bg-slate-700" : "bg-gray-200")}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={cn(
                  "border rounded-lg p-6",
                  isDarkMode ? "border-slate-700" : "border-gray-200"
                )}>
                  <div className={cn("h-20 rounded mb-4", isDarkMode ? "bg-slate-700" : "bg-gray-200")}></div>
                  <div className={cn("h-4 rounded mb-2", isDarkMode ? "bg-slate-700" : "bg-gray-200")}></div>
                  <div className={cn("h-4 rounded w-2/3", isDarkMode ? "bg-slate-700" : "bg-gray-200")}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>Contabilidad Dashboard</h1>
          <p className={cn(
            "mt-2",
            isDarkMode ? "text-gray-400" : "text-muted-foreground"
          )}>
            Gestione facturas, transacciones e impuestos
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={cn(
            "text-2xl font-bold mb-6",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>Módulos de Contabilidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {moduleCards.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="h-full"
              >
                <Link to={module.path} className="block h-full">
                  <Card className={cn(
                    "h-full border-2 hover:shadow-lg transition-all duration-300",
                    module.bgColor,
                    module.borderColor,
                    isDarkMode && "hover:shadow-blue-500/10"
                  )}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "p-3 rounded-lg shadow-sm",
                          isDarkMode ? "bg-slate-700" : "bg-white"
                        )}>
                          {module.icon}
                        </div>
                        <div className={cn(
                          "text-sm font-medium px-3 py-1 rounded-full shadow-sm",
                          isDarkMode ? "bg-slate-700 text-gray-300" : "bg-white/80 text-gray-700"
                        )}>
                          {module.count} registros
                        </div>
                      </div>
                      <CardTitle className={cn(
                        "mt-4 text-xl",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}>{module.title}</CardTitle>
                      <CardDescription className={cn(
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}>{module.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {module.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={metric.color}>{metric.icon}</span>
                              <span className={cn(
                                "text-sm",
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              )}>{metric.label}</span>
                            </div>
                            <span className={`text-sm font-medium ${metric.color}`}>
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                            {module.progressLabel || 'Progreso'}
                          </span>
                          <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                            {Math.round(module.progress)}%
                          </span>
                        </div>
                        <Progress 
                          value={module.progress} 
                          className={cn(
                            "h-2",
                            isDarkMode && "bg-slate-700"
                          )}
                        />
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <p className={cn(
                        "text-sm font-medium transition-colors",
                        isDarkMode 
                          ? "text-blue-400 hover:text-blue-300" 
                          : "text-primary hover:text-primary/80"
                      )}>
                        Ver módulo →
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContabilidadDashboard;
