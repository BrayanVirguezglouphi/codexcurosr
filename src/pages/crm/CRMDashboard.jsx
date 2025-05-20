
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Phone, Mail, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { useStorage } from '@/lib/storage';

const CRMDashboard = () => {
  const { getItems } = useStorage();
  const clientes = getItems('clientes');
  
  const moduleCards = [
    {
      title: 'Clientes',
      description: 'Gestión de clientes',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/crm/clientes',
      count: clientes.length
    },
    {
      title: 'Oportunidades',
      description: 'Seguimiento de oportunidades de venta',
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      path: '/crm/oportunidades',
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
          Gestione sus clientes, oportunidades y contactos
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
                <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                <h3 className="text-2xl font-bold mt-1">{clientes.length}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Oportunidades Abiertas</p>
                <h3 className="text-2xl font-bold mt-1">5</h3>
                <p className="text-xs mt-1 text-green-500">
                  +1 desde la semana pasada
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <TrendingUp className="h-8 w-8 text-primary" />
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

      {/* Clientes Recientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Clientes Recientes</h2>
        <Card>
          <CardHeader>
            <CardTitle>Últimos Clientes</CardTitle>
            <CardDescription>Clientes agregados recientemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientes.slice(0, 3).map((cliente, index) => (
                <div key={cliente.id} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground">{cliente.email}</p>
                    <p className="text-xs text-muted-foreground">{cliente.telefono}</p>
                  </div>
                  <div className="bg-muted px-2 py-1 rounded text-xs">
                    {cliente.tipo}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/crm/clientes" className="text-sm text-primary">
              Ver todos los clientes →
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default CRMDashboard;
