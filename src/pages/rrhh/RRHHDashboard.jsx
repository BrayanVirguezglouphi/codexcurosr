
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, Clock, BarChart3 } from 'lucide-react';
import { useStorage } from '@/lib/storage';

const RRHHDashboard = () => {
  const { getItems } = useStorage();
  const empleados = getItems('empleados');
  
  const moduleCards = [
    {
      title: 'Empleados',
      description: 'Gestión de empleados',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/rrhh/empleados',
      count: empleados.length
    },
    {
      title: 'Vacaciones',
      description: 'Gestión de vacaciones',
      icon: <Calendar className="h-10 w-10 text-primary" />,
      path: '/rrhh/vacaciones',
      count: 5
    },
    {
      title: 'Nóminas',
      description: 'Gestión de nóminas',
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      path: '/rrhh/nominas',
      count: 12
    }
  ];

  // Calcular estadísticas
  const departamentos = {};
  empleados.forEach(empleado => {
    if (empleado.departamento) {
      departamentos[empleado.departamento] = (departamentos[empleado.departamento] || 0) + 1;
    }
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">RRHH Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gestione sus empleados, vacaciones y nóminas
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
                <p className="text-sm font-medium text-muted-foreground">Total Empleados</p>
                <h3 className="text-2xl font-bold mt-1">{empleados.length}</h3>
                <p className="text-xs mt-1 text-green-500">
                  +2 desde el mes pasado
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solicitudes Pendientes</p>
                <h3 className="text-2xl font-bold mt-1">3</h3>
                <p className="text-xs mt-1 text-yellow-500">
                  +1 desde la semana pasada
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas Nóminas</p>
                <h3 className="text-2xl font-bold mt-1">15 Mayo</h3>
                <p className="text-xs mt-1 text-blue-500">
                  En 2 días
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Módulos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-4">Módulos de RRHH</h2>
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

      {/* Distribución por Departamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Distribución por Departamento</h2>
        <Card>
          <CardHeader>
            <CardTitle>Empleados por Departamento</CardTitle>
            <CardDescription>Distribución actual de personal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departamentos).map(([departamento, cantidad], index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{departamento}</span>
                    <span className="text-sm text-muted-foreground">{cantidad} empleados</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(cantidad / empleados.length) * 100}%` }}
                    ></div>
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

export default RRHHDashboard;
