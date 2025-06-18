import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
          apiCall('/api/facturas'),
          apiCall('/api/transacciones'),
          apiCall('/api/contratos'),
          apiCall('/api/lineas-servicios'),
          apiCall('/api/impuestos'),
          apiCall('/api/terceros')
        ]);

        const [facturas, transacciones, contratos, servicios, impuestos, terceros] = await Promise.all([
          facturasRes.json(),
          transaccionesRes.json(),
          contratosRes.json(),
          serviciosRes.json(),
          impuestosRes.json(),
          tercerosRes.json()
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
        console.error('❌ Error cargando datos reales:', error);
        console.log('🔄 Usando datos de demostración por error en API');
        
        // En caso de error, usar datos de demostración
        setDashboardData({
          facturas: {
            count: 0,
            total: 0,
            pendientes: 0,
            vencidas: 0,
            procesadas: 0
          },
          transacciones: {
            count: 0,
            ingresos: 0,
            gastos: 0,
            balance: 0,
            ratioIngresos: 0
          },
          contratos: {
            count: 0,
            activos: 0,
            valor: 0,
            vencen: 0,
            porcentajeActivos: 0
          },
          servicios: {
            count: 0,
            tipos: 0,
            configurados: 0
          },
          impuestos: {
            count: 0,
            activos: 0,
            proximos: 0,
            porcentajeActivos: 0
          },
          terceros: {
            count: 0,
            naturales: 0,
            juridicas: 0,
            activos: 0,
            porcentajeActivos: 0
          },
          clasificaciones: {
            count: 0,
            centrosCostos: 0,
            etiquetas: 0,
            conceptos: 0
          },
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
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      path: '/contabilidad/facturas',
      count: dashboardData.facturas.count,
      metrics: [
        { 
          label: 'Total Facturado', 
          value: formatearMoneda(dashboardData.facturas.total),
          color: 'text-green-600',
          icon: <DollarSign className="w-4 h-4" />
        },
        { 
          label: 'Pendientes', 
          value: dashboardData.facturas.pendientes,
          color: 'text-yellow-600',
          icon: <Clock className="w-4 h-4" />
        },
        { 
          label: 'Vencidas', 
          value: dashboardData.facturas.vencidas,
          color: 'text-red-600',
          icon: <AlertTriangle className="w-4 h-4" />
        }
      ],
      progress: dashboardData.facturas.count > 0 ? 
        ((dashboardData.facturas.count - dashboardData.facturas.pendientes) / dashboardData.facturas.count) * 100 : 0,
      progressLabel: 'Facturas Procesadas',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Transacciones',
      description: 'Registro de ingresos y gastos',
      icon: <CreditCard className="h-10 w-10 text-green-600" />,
      path: '/contabilidad/transacciones',
      count: dashboardData.transacciones.count,
      metrics: [
        { 
          label: 'Ingresos', 
          value: formatearMoneda(dashboardData.transacciones.ingresos),
          color: 'text-green-600',
          icon: <TrendingUp className="w-4 h-4" />
        },
        { 
          label: 'Gastos', 
          value: formatearMoneda(dashboardData.transacciones.gastos),
          color: 'text-red-600',
          icon: <TrendingDown className="w-4 h-4" />
        },
        { 
          label: 'Balance', 
          value: formatearMoneda(dashboardData.transacciones.balance),
          color: dashboardData.transacciones.balance >= 0 ? 'text-green-600' : 'text-red-600',
          icon: dashboardData.transacciones.balance >= 0 ? 
            <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
        }
      ],
      progress: dashboardData.transacciones.ingresos > 0 ? 
        (dashboardData.transacciones.ingresos / (dashboardData.transacciones.ingresos + dashboardData.transacciones.gastos)) * 100 : 50,
      progressLabel: 'Ratio Ingresos vs Total',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Contratos',
      description: 'Contratos financieros',
      icon: <Receipt className="h-10 w-10 text-purple-600" />,
      path: '/contabilidad/contratos',
      count: dashboardData.contratos.count,
      metrics: [
        { 
          label: 'Valor Total', 
          value: formatearMoneda(dashboardData.contratos.valor),
          color: 'text-green-600',
          icon: <DollarSign className="w-4 h-4" />
        },
        { 
          label: 'Activos', 
          value: dashboardData.contratos.activos,
          color: 'text-green-600',
          icon: <CheckCircle className="w-4 h-4" />
        },
        { 
          label: 'Vencen Pronto', 
          value: dashboardData.contratos.vencen,
          color: 'text-orange-600',
          icon: <Calendar className="w-4 h-4" />
        }
      ],
      progress: dashboardData.contratos.count > 0 ? 
        (dashboardData.contratos.activos / dashboardData.contratos.count) * 100 : 0,
      progressLabel: 'Contratos Activos',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Línea de Servicios',
      description: 'Servicios facturables',
      icon: <FileText className="h-10 w-10 text-indigo-600" />,
      path: '/contabilidad/servicios',
      count: dashboardData.servicios.count,
      metrics: [
        { 
          label: 'Tipos de Servicios', 
          value: dashboardData.servicios.tipos,
          color: 'text-indigo-600',
          icon: <BarChart3 className="w-4 h-4" />
        }
      ],
      progress: dashboardData.servicios.count > 0 ? 85 : 0,
      progressLabel: 'Servicios Configurados',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      title: 'Impuestos',
      description: 'Configuración tributaria',
      icon: <PiggyBank className="h-10 w-10 text-yellow-600" />,
      path: '/contabilidad/impuestos',
      count: dashboardData.impuestos.count,
      metrics: [
        { 
          label: 'Activos', 
          value: dashboardData.impuestos.activos,
          color: 'text-green-600',
          icon: <CheckCircle className="w-4 h-4" />
        },
        { 
          label: 'Próximos', 
          value: dashboardData.impuestos.proximos,
          color: 'text-orange-600',
          icon: <Calendar className="w-4 h-4" />
        }
      ],
      progress: dashboardData.impuestos.count > 0 ? 
        (dashboardData.impuestos.activos / dashboardData.impuestos.count) * 100 : 0,
      progressLabel: 'Impuestos Activos',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Terceros',
      description: 'Administración de terceros',
      icon: <Users className="h-10 w-10 text-teal-600" />,
      path: '/contabilidad/terceros',
      count: dashboardData.terceros.count,
      metrics: [
        { 
          label: 'Personas Naturales', 
          value: dashboardData.terceros.naturales,
          color: 'text-blue-600',
          icon: <Users className="w-4 h-4" />
        },
        { 
          label: 'Personas Jurídicas', 
          value: dashboardData.terceros.juridicas,
          color: 'text-purple-600',
          icon: <Building className="w-4 h-4" />
        },
        { 
          label: 'Activos', 
          value: dashboardData.terceros.activos,
          color: 'text-green-600',
          icon: <CheckCircle className="w-4 h-4" />
        }
      ],
      progress: dashboardData.terceros.count > 0 ? 
        (dashboardData.terceros.activos / dashboardData.terceros.count) * 100 : 0,
      progressLabel: 'Terceros Activos',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    },
    {
      title: 'Clasificaciones Contables',
      description: 'Centros de costos, etiquetas y conceptos',
      icon: <BarChart3 className="h-10 w-10 text-orange-600" />,
      path: '/contabilidad/clasificaciones-contables',
      count: dashboardData.clasificaciones.count,
      metrics: [
        { 
          label: 'Centros de Costos', 
          value: dashboardData.clasificaciones.centrosCostos,
          color: 'text-blue-600',
          icon: <Building className="w-4 h-4" />
        },
        { 
          label: 'Etiquetas Contables', 
          value: dashboardData.clasificaciones.etiquetas,
          color: 'text-purple-600',
          icon: <BarChart3 className="w-4 h-4" />
        },
        { 
          label: 'Conceptos DIAN', 
          value: dashboardData.clasificaciones.conceptos,
          color: 'text-green-600',
          icon: <FileText className="w-4 h-4" />
        }
      ],
      progress: dashboardData.clasificaciones.count > 0 ? 90 : 0,
      progressLabel: 'Configuración Completa',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  if (dashboardData.loading) {
    return (
      <div className="w-full max-w-[1800px] mx-auto py-6">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border rounded-lg p-6">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Contabilidad Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Gestione facturas, transacciones e impuestos
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Módulos de Contabilidad</h2>
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
                  <Card className={`h-full ${module.bgColor} ${module.borderColor} border-2 hover:shadow-lg transition-all duration-300`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="p-3 rounded-lg bg-white shadow-sm">
                          {module.icon}
                        </div>
                        <div className="bg-white/80 text-gray-700 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                          {module.count} registros
                        </div>
                      </div>
                      <CardTitle className="mt-4 text-xl">{module.title}</CardTitle>
                      <CardDescription className="text-gray-600">{module.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Métricas */}
                      <div className="space-y-3">
                        {module.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={metric.color}>{metric.icon}</span>
                              <span className="text-sm text-gray-600">{metric.label}</span>
                            </div>
                            <span className={`text-sm font-medium ${metric.color}`}>
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Barra de progreso */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{module.progressLabel || 'Progreso'}</span>
                          <span>{Math.round(module.progress)}%</span>
                        </div>
                        <Progress 
                          value={module.progress} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <p className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
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
