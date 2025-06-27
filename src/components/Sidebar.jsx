import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/layouts/MainLayout';
import { useSettings } from '@/contexts/SettingsContext';
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
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Home className="h-5 w-5" />,
    items: []
  },
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
    title: 'Sistema de Gestión',
    path: '/gestion',
    icon: <Target className="h-5 w-5" />,
    items: [
      { name: 'OKR', path: '/gestion/okr', icon: <Target className="h-4 w-4" /> },
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
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { isDarkMode } = useSettings();
  const [openSections, setOpenSections] = useState({});

  // Sincronizar con localStorage al montar el componente
  useEffect(() => {
    const savedOpenSections = localStorage.getItem('sidebar-open-sections');
    if (savedOpenSections) {
      try {
        setOpenSections(JSON.parse(savedOpenSections));
      } catch (error) {
        console.warn('Error al cargar secciones abiertas del sidebar:', error);
      }
    }
  }, []);

  // Guardar estado de secciones abiertas
  useEffect(() => {
    localStorage.setItem('sidebar-open-sections', JSON.stringify(openSections));
  }, [openSections]);

  const toggleSection = (title) => {
    if (!isCollapsed) {
      setOpenSections(prev => ({
        ...prev,
        [title]: !prev[title]
      }));
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenSections({});
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 ease-in-out z-50",
      "backdrop-blur-xl border-r shadow-2xl",
      isDarkMode 
        ? "bg-slate-900/95 border-slate-700/50 shadow-slate-900/50" 
        : "bg-[#1e3a8a]/95 border-white/10 shadow-blue-900/20",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header con logo y toggle */}
      <div className={cn(
        "relative p-4 border-b bg-gradient-to-r from-white/5 to-transparent",
        isDarkMode ? "border-slate-700/50" : "border-white/10"
      )}>
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isCollapsed && "justify-center"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm border shadow-lg",
              isDarkMode 
                ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50" 
                : "bg-gradient-to-br from-white/20 to-white/10 border-white/20"
            )}>
              <span className="text-white text-lg font-bold">G</span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-white text-xl font-bold tracking-wide">GLOUPHI</h1>
                <p className="text-white/60 text-xs">Sistema Empresarial</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 group",
              isDarkMode 
                ? "hover:bg-slate-700/50" 
                : "hover:bg-white/10"
            )}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
            ) : (
              <X className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Menu section */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
        <div className="space-y-2 px-2">
          {menuItems.map((section, index) => (
            <div key={index} className="relative">
              {/* Main menu item */}
              <div 
                className={cn(
                  "relative group rounded-xl transition-all duration-200",
                  isDarkMode 
                    ? "hover:bg-slate-700/50 hover:shadow-lg hover:shadow-slate-700/20" 
                    : "hover:bg-white/10 hover:shadow-lg hover:shadow-blue-900/20"
                )}
              >
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => section.items.length > 0 && toggleSection(section.title)}
                >
                  <Link
                    to={section.path}
                    className={cn(
                      "flex items-center gap-3 text-sm font-medium transition-all duration-200 flex-grow",
                      (location.pathname === section.path || location.pathname.startsWith(section.path + '/'))
                        ? "text-white" 
                        : "text-white/70 group-hover:text-white"
                    )}
                  >
                    <span className={cn(
                      "transition-all duration-200 group-hover:scale-110",
                      (location.pathname === section.path || location.pathname.startsWith(section.path + '/'))
                        ? "text-white shadow-lg" 
                        : "text-white/70"
                    )}>
                      {section.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="tracking-wide">{section.title}</span>
                    )}
                  </Link>
                  {!isCollapsed && section.items.length > 0 && (
                    <div className="ml-2">
                      {openSections[section.title] ? 
                        <ChevronDown className="h-4 w-4 text-white/70 group-hover:text-white transition-all duration-200" /> : 
                        <ChevronRight className="h-4 w-4 text-white/70 group-hover:text-white transition-all duration-200" />
                      }
                    </div>
                  )}
                </div>

                {/* Active indicator */}
                {(location.pathname === section.path || 
                  (section.path !== '/' && location.pathname.startsWith(section.path + '/'))) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-white/50" />
                )}

                {/* Tooltip para estado colapsado */}
                {isCollapsed && (
                  <div className={cn(
                    "absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50",
                    isDarkMode ? "bg-slate-800" : "bg-gray-900"
                  )}>
                    {section.title}
                    <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45",
                      isDarkMode ? "bg-slate-800" : "bg-gray-900"
                    )} />
                  </div>
                )}
              </div>

              {/* Submenu items */}
              {!isCollapsed && openSections[section.title] && section.items.length > 0 && (
                <div className={cn(
                  "mt-2 space-y-1 ml-4 border-l-2 pl-4",
                  isDarkMode ? "border-slate-700/50" : "border-white/10"
                )}>
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 py-2.5 px-3 text-sm font-medium transition-all duration-200 rounded-lg group relative",
                        location.pathname === item.path 
                          ? cn(
                              "text-white shadow-lg border",
                              isDarkMode 
                                ? "bg-slate-700/50 shadow-slate-700/20 border-slate-600/50" 
                                : "bg-white/15 shadow-blue-900/20 border-white/20"
                            )
                          : cn(
                              "text-white/60 hover:text-white",
                              isDarkMode 
                                ? "hover:bg-slate-700/30 hover:shadow-md" 
                                : "hover:bg-white/10 hover:shadow-md"
                            )
                      )}
                    >
                      <span className={cn(
                        "transition-all duration-200 group-hover:scale-110",
                        location.pathname === item.path ? "text-white" : "text-white/60"
                      )}>
                        {item.icon}
                      </span>
                      <span className="tracking-wide">{item.name}</span>
                      
                      {location.pathname === item.path && (
                        <div className="absolute right-2">
                          <div className="w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50" />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User profile section */}
      <div className={cn(
        "border-t p-4 bg-gradient-to-r from-white/5 to-transparent",
        isDarkMode ? "border-slate-700/50" : "border-white/10"
      )}>
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="relative">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border shadow-lg backdrop-blur-sm",
              isDarkMode 
                ? "bg-gradient-to-br from-slate-600/50 to-slate-700/50 border-slate-500/50" 
                : "bg-gradient-to-br from-white/30 to-white/20 border-white/30"
            )}>
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 shadow-lg"
                 style={{ borderColor: isDarkMode ? '#0f172a' : '#1e3a8a' }} />
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.email || 'correo@ejemplo.com'}
                </p>
              </div>
              <button
                onClick={logout}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 group",
                  isDarkMode 
                    ? "hover:bg-slate-700/50" 
                    : "hover:bg-white/10"
                )}
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
              </button>
            </>
          )}
          
          {isCollapsed && (
            <div className={cn(
              "absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 text-white text-sm rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50",
              isDarkMode ? "bg-slate-800" : "bg-gray-900"
            )}>
              {user?.name || 'Usuario'}
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45",
                isDarkMode ? "bg-slate-800" : "bg-gray-900"
              )} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 