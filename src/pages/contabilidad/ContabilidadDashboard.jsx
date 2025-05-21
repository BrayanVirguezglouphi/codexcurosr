import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CreditCard, Receipt, PiggyBank, Users } from 'lucide-react';

const ContabilidadDashboard = () => {
  const moduleCards = [
    {
      title: 'Facturas',
      description: 'Administración de facturas',
      icon: <FileText className="h-10 w-10 text-primary" />,
      path: '/contabilidad/facturas',
      count: 8
    },
    {
      title: 'Transacciones',
      description: 'Registro de ingresos y gastos',
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      path: '/contabilidad/transacciones',
      count: 4
    },
    {
      title: 'Contratos',
      description: 'Contratos financieros',
      icon: <Receipt className="h-10 w-10 text-primary" />,
      path: '/contabilidad/contratos',
      count: 2
    },
    {
      title: 'Línea de Servicios',
      description: 'Servicios facturables',
      icon: <FileText className="h-10 w-10 text-primary" />,
      path: '/contabilidad/servicios',
      count: 5
    },
    {
      title: 'Impuestos',
      description: 'Configuración tributaria',
      icon: <PiggyBank className="h-10 w-10 text-primary" />,
      path: '/contabilidad/impuestos',
      count: 3
    },
    {
      title: 'Terceros',
      description: 'Administración de terceros',
      icon: <Users className="h-10 w-10 text-primary" />,
      path: '/contabilidad/terceros',
      count: 1
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Contabilidad Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gestione facturas, transacciones e impuestos
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
    </div>
  );
};

export default ContabilidadDashboard;
