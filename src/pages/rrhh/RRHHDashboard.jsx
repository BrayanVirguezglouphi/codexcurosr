
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, BarChart3 } from 'lucide-react';

const RRHHDashboard = () => {
  
  const moduleCards = [
    {
      title: 'Contratos',
      description: 'Gestión de contratos laborales',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/rrhh/contratos',
      count: 2
    },
    {
      title: 'Cargos y Funciones',
      description: 'Definición de roles',
      icon: <Calendar className="h-10 w-10 text-primary" />,
      path: '/rrhh/cargos',
      count: 5
    },
    {
      title: 'Capacitaciones y Skills',
      description: 'Registro de habilidades',
      icon: <Clock className="h-10 w-10 text-primary" />,
      path: '/rrhh/capacitaciones',
      count: 4
    },
    {
      title: 'Asignaciones y Evaluaciones',
      description: 'Seguimiento de desempeño',
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      path: '/rrhh/asignaciones',
      count: 3
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">RRHH Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gestione contratos, cargos y capacitaciones
        </p>
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

    </div>
  );
};

export default RRHHDashboard;
