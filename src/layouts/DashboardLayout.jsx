import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Home,
  DollarSign,
  Briefcase,
  FileText,
  CreditCard,
  Calendar,
  Mail,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

const menuItems = [
  {
    title: 'Principal',
    icon: <Home className="h-5 w-5" />,
    path: '/',
    exact: true
  },
  {
    title: 'CRM',
    icon: <Users className="h-5 w-5" />,
    path: '/crm',
    submenu: [
      { title: 'Clientes', path: '/crm/clientes' },
      { title: 'Oportunidades', path: '/crm/oportunidades' },
      { title: 'Contactos', path: '/crm/contactos' }
    ]
  },
  {
    title: 'Contabilidad',
    icon: <DollarSign className="h-5 w-5" />,
    path: '/contabilidad',
    submenu: [
      { title: 'Facturas', path: '/contabilidad/facturas', icon: <FileText className="h-4 w-4" /> },
      { title: 'Transacciones', path: '/contabilidad/transacciones', icon: <CreditCard className="h-4 w-4" /> },
      { title: 'Gastos', path: '/contabilidad/gastos', icon: <DollarSign className="h-4 w-4" /> },
      { title: 'Ingresos', path: '/contabilidad/ingresos', icon: <BarChart3 className="h-4 w-4" /> },
      { title: 'Contratos', path: '/contabilidad/contratos', icon: <FileText className="h-4 w-4" /> }
    ]
  },
  {
    title: 'RRHH',
    icon: <Briefcase className="h-5 w-5" />,
    path: '/rrhh',
    submenu: [
      { title: 'Empleados', path: '/rrhh/empleados' },
      { title: 'Evaluaciones', path: '/rrhh/evaluaciones' },
      { title: 'Vacaciones', path: '/rrhh/vacaciones' },
      { title: 'Nóminas', path: '/rrhh/nominas' },
      { title: 'Contratos RRHH', path: '/rrhh/contratos-rrhh' }
    ]
  }
];

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSubmenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleMenuClick = (item) => {
    if (item.submenu) {
      toggleSubmenu(item.title);
      navigate(item.path); // Navega al dashboard cuando se hace clic en el título
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 280 : 72 }}
        animate={{ width: isSidebarOpen ? 280 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-10 h-screen shadow-xl border-r border-white/10 bg-[#2B4465]/80 backdrop-blur-md flex flex-col"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {isSidebarOpen ? (
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-lg select-none transition-all duration-300">Sistema Empresarial</h1>
          ) : (
            <span className="text-2xl font-extrabold text-white drop-shadow-lg select-none transition-all duration-300">SE</span>
          )}
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 transition-all duration-200" onClick={toggleSidebar}>
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        <nav className="p-2 space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {menuItems.map((item) => (
            <div key={item.title} className="space-y-1">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`sidebar-item w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group
                      ${isActive(item.path) ? 'bg-white/30 text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>
                      {isSidebarOpen && <span className="font-medium text-base tracking-wide">{item.title}</span>}
                    </div>
                    {isSidebarOpen && (
                      <ChevronDown
                        className={`h-4 w-4 ml-2 transition-transform duration-200 ${expandedMenus[item.title] ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>
                  {isSidebarOpen && expandedMenus[item.title] && (
                    <div className="pl-8 space-y-1 border-l border-white/10 ml-2">
                      {item.submenu.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ml-2
                              ${isActive ? 'bg-white/30 text-white shadow' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
                          }
                        >
                          {subItem.icon && <span className="mr-2 align-middle">{subItem.icon}</span>}
                          {subItem.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-base tracking-wide
                      ${isActive ? 'bg-white/30 text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span>{item.title}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4 bg-[#2B4465]/90 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar>
                <AvatarFallback className="bg-[#2B4465] text-white shadow-lg">
                  <UserCircle className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white">Admin</p>
                  <p className="text-xs text-white/70">admin@empresa.com</p>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => 
                location.pathname === item.path || 
                (item.submenu && item.submenu.some(sub => location.pathname === sub.path))
              )?.title || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date().toLocaleDateString()}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
