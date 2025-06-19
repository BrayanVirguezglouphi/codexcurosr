import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  CreditCard,
  Zap,
  LogOut
} from 'lucide-react';

const menuItems = [
  {
    title: 'CRM',
    path: '/crm',
    icon: <Users className="h-5 w-5" />,
    items: [
      { name: 'Contactos', path: '/crm/contactos', icon: <Contact className="h-4 w-4" /> },
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
      
      { name: 'Transacciones', path: '/contabilidad/transacciones', icon: <CreditCard className="h-4 w-4" /> },
      { name: 'Contratos', path: '/contabilidad/contratos', icon: <Receipt className="h-4 w-4" /> },
      { name: 'Línea de Servicios', path: '/contabilidad/servicios', icon: <FileText className="h-4 w-4" /> },
      { name: 'Impuestos', path: '/contabilidad/impuestos', icon: <PiggyBank className="h-4 w-4" /> },
      { name: 'Clasificaciones Contables', path: '/contabilidad/clasificaciones-contables', icon: <Target className="h-4 w-4" /> },
      { name: 'Terceros', path: '/contabilidad/terceros', icon: <Users className="h-4 w-4" /> },
    ]
  },
  {
    title: 'RRHH',
    path: '/rrhh',
    icon: <Briefcase className="h-5 w-5" />,
    items: [
      { name: 'Contratos RRHH', path: '/rrhh/contratos-rrhh', icon: <FileText className="h-4 w-4" /> },
      { name: 'Cargos y funciones', path: '/rrhh/cargos', icon: <UserCog className="h-4 w-4" /> },
      { name: 'Capacitaciones y Skills', path: '/rrhh/capacitaciones', icon: <Calendar className="h-4 w-4" /> },
      { name: 'Asignaciones y Evaluaciones', path: '/rrhh/asignaciones', icon: <Users className="h-4 w-4" /> },
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
  const { user, logout } = useAuth();
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
        <div className="h-20 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">GLOUPHI</h1>
        </div>
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
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-white/70">{user?.role || 'user'}</p>
          </div>
          <button
            onClick={logout}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 