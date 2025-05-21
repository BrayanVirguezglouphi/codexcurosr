
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Phone, BarChart3 } from 'lucide-react';

const CRMDashboard = () => {
  const moduleCards = [
    {
      title: 'Mercados',
      description: 'Segmentos y oportunidades',
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      path: '/crm/mercado',
      count: 3
    },
    {
      title: 'Perfiles Buyer',
      description: 'Caracterización de clientes',
      icon: <UserPlus className="h-10 w-10 text-primary" />,
      path: '/crm/buyer',
      count: 2
    },
    {
      title: 'Empresas',
      description: 'Información de empresas',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/crm/empresas',
      count: 5
    },
    {
      title: 'Contactos',
      description: 'Gestión de contactos',
      icon: <Phone className="h-10 w-10 text-primary" />,
      path: '/crm/contactos',
      count: 12
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gestione mercados, compradores y contactos
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
                <p className="text-sm font-medium text-muted-foreground">Mercados Activos</p>
                <h3 className="text-2xl font-bold mt-1">5</h3>
                <p className="text-xs mt-1 text-green-500">
                  +1 desde la semana pasada
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contactos Recientes</p>
                <h3 className="text-2xl font-bold mt-1">12</h3>
                <p className="text-xs mt-1 text-green-500">
                  +3 desde el mes pasado
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="h-8 w-8 text-primary" />
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
        <h2 className="text-2xl font-bold mb-4">Módulos CRM</h2>
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

export default CRMDashboard;
