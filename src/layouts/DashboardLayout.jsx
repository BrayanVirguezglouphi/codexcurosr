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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      { title: 'Nóminas', path: '/rrhh/nominas' }
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
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#2B4465] text-white relative z-10"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-white">Sistema Empresarial</h1>
          ) : (
            <span className="text-xl font-bold text-white">SE</span>
          )}
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleSidebar}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-64px-64px)]">
          {menuItems.map((item) => (
            <div key={item.title} className="space-y-1">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`sidebar-item w-full flex items-center justify-between p-3 rounded-md transition-colors ${
                      isActive(item.path) 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {isSidebarOpen && <span className="ml-3">{item.title}</span>}
                    </div>
                    {isSidebarOpen && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedMenus[item.title] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {isSidebarOpen && expandedMenus[item.title] && (
                    <div className="pl-10 space-y-1">
                      {item.submenu.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block p-2 rounded-md transition-colors ${
                              isActive 
                                ? 'bg-white/20 text-white' 
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`
                          }
                        >
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
                    `flex items-center p-3 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10'
                    }`
                  }
                >
                  {item.icon}
                  {isSidebarOpen && <span className="ml-3">{item.title}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-white/10 text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-white/70">admin@empresa.com</p>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
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
