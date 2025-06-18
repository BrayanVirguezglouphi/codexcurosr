
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Briefcase, TrendingUp, BarChart3, Calendar, FileText, Mail } from 'lucide-react';

const moduleCards = [
  {
    title: 'CRM',
    description: 'Gestión de clientes, oportunidades y contactos',
    icon: <Users className="h-10 w-10 text-primary" />,
    path: '/crm',
    stats: '24 clientes activos'
  },
  {
    title: 'Contabilidad',
    description: 'Facturas, gastos e ingresos',
    icon: <DollarSign className="h-10 w-10 text-primary" />,
    path: '/contabilidad',
    stats: '12 facturas pendientes'
  },
  {
    title: 'RRHH',
    description: 'Empleados, vacaciones y nóminas',
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    path: '/rrhh',
    stats: '18 empleados'
  }
];

const statCards = [
  {
    title: 'Ingresos Mensuales',
    value: '$24,500',
    change: '+12%',
    icon: <TrendingUp className="h-8 w-8 text-green-500" />
  },
  {
    title: 'Nuevos Clientes',
    value: '8',
    change: '+5%',
    icon: <Users className="h-8 w-8 text-blue-500" />
  },
  {
    title: 'Facturas Pendientes',
    value: '12',
    change: '-3%',
    icon: <FileText className="h-8 w-8 text-yellow-500" />
  },
  {
    title: 'Solicitudes RRHH',
    value: '5',
    change: '+2%',
    icon: <Calendar className="h-8 w-8 text-purple-500" />
  }
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Sistema Empresarial ENTER</h1>
        <p className="text-muted-foreground mt-2">
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
          <Card key={index} className="overflow-hidden border-primary/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} desde el mes pasado
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">{stat.icon}</div>
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
        <h2 className="text-2xl font-bold mb-4">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {moduleCards.map((module, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={module.path} className="block h-full">
                <Card className="h-full module-card border-primary/10 hover:border-primary/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      {module.icon}
                      <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                        {module.stats}
                      </div>
                    </div>
                    <CardTitle className="mt-4">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <p className="text-sm text-primary">Ver módulo →</p>
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
        <h2 className="text-2xl font-bold mb-4">Actividad Reciente</h2>
        <Card>
          <CardHeader>
            <CardTitle>Últimas Actualizaciones</CardTitle>
            <CardDescription>Actividades recientes en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: <Users className="h-5 w-5" />, text: 'Nuevo cliente agregado: Empresa XYZ', time: 'Hace 2 horas' },
                { icon: <FileText className="h-5 w-5" />, text: 'Factura #1234 marcada como pagada', time: 'Hace 5 horas' },
                { icon: <Calendar className="h-5 w-5" />, text: 'Solicitud de vacaciones aprobada para Juan Pérez', time: 'Hace 1 día' },
                { icon: <Mail className="h-5 w-5" />, text: 'Nuevo contacto añadido a Oportunidad #5678', time: 'Hace 2 días' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
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
