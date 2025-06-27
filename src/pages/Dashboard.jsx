import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Briefcase, TrendingUp, BarChart3, Calendar, FileText, Mail, Loader2 } from 'lucide-react';
import { getDashboardData } from '@/services/dashboard';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { isDarkMode } = useSettings();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const dashboardData = await getDashboardData();
        if (dashboardData) {
          setData(dashboardData);
        } else {
          // Usar datos de demostración si falla la carga
          setData({
            stats: {
              ingresosMensuales: { valor: 24500, cambio: 12 },
              nuevosClientes: { valor: 8, cambio: 5 },
              facturasPendientes: { valor: 12, cambio: -3 },
              solicitudesRRHH: { valor: 5, cambio: 2 }
            },
            modulos: {
              crm: { clientesActivos: 24 },
              contabilidad: { facturasPendientes: 12 },
              rrhh: { empleadosActivos: 18 }
            },
            actividades: [
              { tipo: 'CLIENTE', descripcion: 'Nuevo cliente agregado: Empresa XYZ', tiempo: 'Hace 2 horas' },
              { tipo: 'FACTURA', descripcion: 'Factura #1234 marcada como pagada', tiempo: 'Hace 5 horas' },
              { tipo: 'RRHH', descripcion: 'Solicitud de vacaciones aprobada para Juan Pérez', tiempo: 'Hace 1 día' },
              { tipo: 'CRM', descripcion: 'Nuevo contacto añadido a Oportunidad #5678', tiempo: 'Hace 2 días' }
            ]
          });
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const statCards = data ? [
    {
      title: 'Ingresos Mensuales',
      value: formatearMoneda(data.stats.ingresosMensuales.valor),
      change: `${data.stats.ingresosMensuales.cambio > 0 ? '+' : ''}${data.stats.ingresosMensuales.cambio}%`,
      icon: <TrendingUp className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Nuevos Clientes',
      value: data.stats.nuevosClientes.valor,
      change: `${data.stats.nuevosClientes.cambio > 0 ? '+' : ''}${data.stats.nuevosClientes.cambio}%`,
      icon: <Users className="h-8 w-8 text-blue-500" />
    },
    {
      title: 'Facturas Pendientes',
      value: data.stats.facturasPendientes.valor,
      change: `${data.stats.facturasPendientes.cambio > 0 ? '+' : ''}${data.stats.facturasPendientes.cambio}%`,
      icon: <FileText className="h-8 w-8 text-yellow-500" />
    },
    {
      title: 'Solicitudes RRHH',
      value: data.stats.solicitudesRRHH.valor,
      change: `${data.stats.solicitudesRRHH.cambio > 0 ? '+' : ''}${data.stats.solicitudesRRHH.cambio}%`,
      icon: <Calendar className="h-8 w-8 text-purple-500" />
    }
  ] : [];

  const moduleCards = data ? [
    {
      title: 'CRM',
      description: 'Gestión de clientes, oportunidades y contactos',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/crm',
      stats: `${data.modulos.crm.clientesActivos} clientes activos`
    },
    {
      title: 'Contabilidad',
      description: 'Facturas, gastos e ingresos',
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      path: '/contabilidad',
      stats: `${data.modulos.contabilidad.facturasPendientes} facturas pendientes`
    },
    {
      title: 'RRHH',
      description: 'Empleados, vacaciones y nóminas',
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      path: '/rrhh',
      stats: `${data.modulos.rrhh.empleadosActivos} empleados`
    }
  ] : [];

  const getActividadIcon = (tipo) => {
    switch (tipo) {
      case 'CLIENTE':
        return <Users className="h-5 w-5" />;
      case 'FACTURA':
        return <FileText className="h-5 w-5" />;
      case 'RRHH':
        return <Calendar className="h-5 w-5" />;
      case 'CRM':
        return <Mail className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={cn(
          "text-3xl font-bold tracking-tight",
          isDarkMode ? "text-slate-100" : "text-slate-800"
        )}>Sistema Empresarial ENTER</h1>
        <p className={cn(
          "mt-2",
          isDarkMode ? "text-slate-400" : "text-slate-600"
        )}>
          Gestione todos los aspectos de su empresa desde un solo lugar
        </p>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <Card key={index} className={cn(
            "overflow-hidden",
            isDarkMode 
              ? "bg-slate-800/50 border-slate-700/50" 
              : "bg-white border-slate-200"
          )}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  )}>{stat.title}</p>
                  <h3 className={cn(
                    "text-2xl font-bold mt-1",
                    isDarkMode ? "text-slate-100" : "text-slate-800"
                  )}>{stat.value}</h3>
                  <p className={cn(
                    "text-xs mt-1",
                    stat.change.startsWith('+') 
                      ? "text-green-500" 
                      : "text-red-500"
                  )}>
                    {stat.change} desde el mes pasado
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-full",
                  isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                )}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Módulos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className={cn(
          "text-2xl font-bold mb-4",
          isDarkMode ? "text-slate-100" : "text-slate-800"
        )}>Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {moduleCards.map((module, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={module.path} className="block h-full">
                <Card className={cn(
                  "h-full module-card",
                  isDarkMode 
                    ? "bg-slate-800/50 border-slate-700/50 hover:border-slate-600" 
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      {module.icon}
                      <div className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        isDarkMode 
                          ? "bg-slate-700/50 text-slate-300" 
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {module.stats}
                      </div>
                    </div>
                    <CardTitle className={cn(
                      "mt-4",
                      isDarkMode ? "text-slate-100" : "text-slate-800"
                    )}>{module.title}</CardTitle>
                    <CardDescription className={
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }>{module.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    )}>Ver módulo →</p>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Actividad Reciente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className={cn(
          "text-2xl font-bold mb-4",
          isDarkMode ? "text-slate-100" : "text-slate-800"
        )}>Actividad Reciente</h2>
        <Card className={cn(
          isDarkMode 
            ? "bg-slate-800/50 border-slate-700/50" 
            : "bg-white border-slate-200"
        )}>
          <CardHeader>
            <CardTitle className={
              isDarkMode ? "text-slate-100" : "text-slate-800"
            }>Últimas Actualizaciones</CardTitle>
            <CardDescription className={
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }>Actividades recientes en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.actividades.map((actividad, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
                  )}>
                    {getActividadIcon(actividad.tipo)}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    )}>{actividad.descripcion}</p>
                    <p className={cn(
                      "text-xs",
                      isDarkMode ? "text-slate-500" : "text-slate-500"
                    )}>{actividad.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
