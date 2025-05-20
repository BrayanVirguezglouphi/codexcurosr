import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  DollarSign,
  Briefcase,
  Contact,
  Target,
  Building2,
  UserSquare2,
  FileText,
  Receipt,
  PiggyBank,
  Wallet,
  Calendar,
  UserCog,
  ChevronDown,
  ChevronRight,
  Settings,
  CreditCard
} from 'lucide-react';

const menuItems = [
  {
    title: 'CRM',
    path: '/crm',
    icon: <Users className="h-5 w-5" />,
    items: [
      { name: 'Contactos', path: '/crm/contactos', icon: <Contact className="h-4 w-4" /> },
      { name: 'Oportunidades', path: '/crm/oportunidades', icon: <Target className="h-4 w-4" /> },
      { name: 'Mercado', path: '/crm/mercado', icon: <Building2 className="h-4 w-4" /> },
      { name: 'Perfiles de Compradores', path: '/crm/buyer', icon: <UserSquare2 className="h-4 w-4" /> },
      { name: 'Empresas', path: '/crm/empresas', icon: <Building2 className="h-4 w-4" /> },
    ]
  },
  {
    title: 'Contabilidad',
    path: '/contabilidad',
    icon: <DollarSign className="h-5 w-5" />,
    items: [
      { name: 'Facturas', path: '/contabilidad/facturas', icon: <FileText className="h-4 w-4" /> },
      { name: 'Avances de Factura', path: '/contabilidad/avances-factura', icon: <FileText className="h-4 w-4" /> },
      { name: 'Transacciones', path: '/contabilidad/transacciones', icon: <CreditCard className="h-4 w-4" /> },
      { name: 'Contratos', path: '/contabilidad/contratos', icon: <Receipt className="h-4 w-4" /> },
      { name: 'Gastos', path: '/contabilidad/gastos', icon: <Wallet className="h-4 w-4" /> },
      { name: 'Ingresos', path: '/contabilidad/ingresos', icon: <PiggyBank className="h-4 w-4" /> },
      { name: 'Centro de Costos', path: '/contabilidad/centros-costos', icon: <Building2 className="h-4 w-4" /> },
    ]
  },
  {
    title: 'RRHH',
    path: '/rrhh',
    icon: <Briefcase className="h-5 w-5" />,
    items: [
      { name: 'Empleados', path: '/rrhh/empleados', icon: <Users className="h-4 w-4" /> },
      { name: 'Contratos', path: '/rrhh/contratos', icon: <FileText className="h-4 w-4" /> },
      { name: 'Vacaciones', path: '/rrhh/vacaciones', icon: <Calendar className="h-4 w-4" /> },
      { name: 'Cargos y funciones', path: '/rrhh/cargos', icon: <UserCog className="h-4 w-4" /> },
    ]
  },
  {
    title: 'Ajustes',
    path: '/ajustes',
    icon: <Settings className="h-5 w-5" />,
    items: []
  }
];

const Sidebar = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (title) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-[#1e3a8a]">
      {/* Logo section */}
      <div className="p-4 border-b border-white/10">
        <img src="/logo.png" alt="Logo" className="h-8" />
      </div>

      {/* Menu section */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {menuItems.map((section, index) => (
            <div key={index}>
              <div 
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-white/5"
                onClick={() => section.items.length > 0 && toggleSection(section.title)}
              >
                <Link
                  to={section.path}
                  className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white flex-grow"
                >
                  {section.icon}
                  {section.title}
                </Link>
                {section.items.length > 0 && (
                  openSections[section.title] ? 
                    <ChevronDown className="h-4 w-4 text-white/70" /> : 
                    <ChevronRight className="h-4 w-4 text-white/70" />
                )}
              </div>
              {openSections[section.title] && section.items.length > 0 && (
                <div className="mt-1">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 py-2 pl-11 pr-4 text-sm font-medium transition-colors",
                        location.pathname === item.path 
                          ? "bg-white/10 text-white" 
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User profile section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <img 
            src="/avatar.png" 
            alt="Profile" 
            className="h-8 w-8 rounded-full bg-white/10"
          />
          <span className="text-sm font-medium text-white">
            Brayan Virguez
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 