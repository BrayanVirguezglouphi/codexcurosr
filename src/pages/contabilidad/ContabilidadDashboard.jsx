import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, TrendingUp, TrendingDown, BarChart3, CreditCard } from 'lucide-react';
import { useStorage } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ContabilidadDashboard = () => {
  const { getItems } = useStorage();
  const facturas = getItems('facturas');
  
  // Datos de ejemplo para la gráfica de transacciones
  const datosTransacciones = [
    { mes: 'Enero', ingresos: 45000, gastos: 32000 },
    { mes: 'Febrero', ingresos: 52000, gastos: 28000 },
    { mes: 'Marzo', ingresos: 48000, gastos: 35000 },
    { mes: 'Abril', ingresos: 61000, gastos: 42000 },
    { mes: 'Mayo', ingresos: 55000, gastos: 38000 },
    { mes: 'Junio', ingresos: 67000, gastos: 41000 }
  ];

  const moduleCards = [
    {
      title: 'Facturas',
      description: 'Gestión de facturas',
      icon: <FileText className="h-10 w-10 text-primary" />,
      path: '/contabilidad/facturas',
      count: facturas.length
    },
    {
      title: 'Transacciones',
      description: 'Gestión de transacciones',
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      path: '/contabilidad/transacciones',
      count: 0
    },
    {
      title: 'Ingresos',
      description: 'Registro de ingresos',
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      path: '/contabilidad/ingresos',
      count: 8
    },
    {
      title: 'Gastos',
      description: 'Control de gastos',
      icon: <TrendingDown className="h-10 w-10 text-primary" />,
      path: '/contabilidad/gastos',
      count: 15
    }
  ];

  // Calcular totales
  const totalFacturas = facturas.reduce((sum, factura) => sum + Number(factura.monto), 0);
  const facturasPendientes = facturas.filter(factura => factura.estado === 'Pendiente');
  const totalPendiente = facturasPendientes.reduce((sum, factura) => sum + Number(factura.monto), 0);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Contabilidad Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gestione sus facturas, ingresos y gastos
        </p>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Facturado</p>
                <h3 className="text-2xl font-bold mt-1">${totalFacturas.toLocaleString()}</h3>
                <p className="text-xs mt-1 text-green-500">
                  +15% desde el mes pasado
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facturas Pendientes</p>
                <h3 className="text-2xl font-bold mt-1">{facturasPendientes.length}</h3>
                <p className="text-xs mt-1 text-red-500">
                  +2 desde la semana pasada
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto Pendiente</p>
                <h3 className="text-2xl font-bold mt-1">${totalPendiente.toLocaleString()}</h3>
                <p className="text-xs mt-1 text-yellow-500">
                  -5% desde el mes pasado
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <TrendingDown className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráfica de Transacciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transacciones por Mes</CardTitle>
            <CardDescription>Comparativa de ingresos y gastos mensuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosTransacciones}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" />
                  <Bar dataKey="gastos" name="Gastos" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Módulos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Módulos de Contabilidad</h2>
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
                        {module.count} registros
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

      {/* Facturas Recientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-4">Facturas Recientes</h2>
        <Card>
          <CardHeader>
            <CardTitle>Últimas Facturas</CardTitle>
            <CardDescription>Facturas emitidas recientemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facturas.slice(0, 3).map((factura) => (
                <div key={factura.id} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{factura.numero} - {factura.cliente}</p>
                    <p className="text-xs text-muted-foreground">Fecha: {factura.fecha}</p>
                    <p className="text-xs text-muted-foreground">Monto: ${Number(factura.monto).toLocaleString()}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    factura.estado === 'Pagada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {factura.estado}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/contabilidad/facturas" className="text-sm text-primary">
              Ver todas las facturas →
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContabilidadDashboard;
