import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import theme from './theme/mui-theme';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import './styles/login.css';
import MainLayout from '@/layouts/MainLayout';
import FacturasPage from '@/pages/contabilidad/Facturas';

// Pages
import Dashboard from '@/pages/Dashboard';

// Módulos
import CRMDashboard from '@/pages/crm/CRMDashboard';
import Contactos from '@/pages/crm/Contactos';
import Mercado from '@/pages/crm/Mercado';
import Buyer from '@/pages/crm/Buyer';
import Empresas from '@/pages/crm/Empresas';

import Facturas from '@/pages/contabilidad/Facturas';
import Transacciones from '@/pages/contabilidad/Transacciones';
import Contratos from '@/pages/contabilidad/Contratos';
import LineasServicios from '@/pages/contabilidad/LineasServicios';
import Impuestos from '@/pages/contabilidad/Impuestos';
import Terceros from '@/pages/contabilidad/Terceros';

import RRHHDashboard from '@/pages/rrhh/RRHHDashboard';
import ContratosLaborales from '@/pages/rrhh/Contratos';
import Cargos from '@/pages/rrhh/Cargos';
import CapacitacionesSkills from '@/pages/rrhh/CapacitacionesSkills';
import AsignacionesEvaluaciones from '@/pages/rrhh/AsignacionesEvaluaciones';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Router>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-background"
          >
            <Routes>
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                
                {/* CRM Routes */}
                <Route path="crm">
                  <Route index element={<CRMDashboard />} />
                  <Route path="contactos" element={<Contactos />} />
                  <Route path="mercado" element={<Mercado />} />
                  <Route path="buyer" element={<Buyer />} />
                  <Route path="empresas" element={<Empresas />} />
                </Route>

                {/* Contabilidad Routes */}
                <Route path="contabilidad">
                  <Route index element={<FacturasPage />} />
                  <Route path="facturas" element={<FacturasPage />} />
                  <Route path="transacciones" element={<Transacciones />} />
                  <Route path="contratos" element={<Contratos />} />
                  <Route path="servicios" element={<LineasServicios />} />
                  <Route path="impuestos" element={<Impuestos />} />
                  <Route path="terceros" element={<Terceros />} />
                </Route>

                {/* RRHH Routes */}
                <Route path="rrhh">
                  <Route index element={<RRHHDashboard />} />
                  <Route path="contratos" element={<ContratosLaborales />} />
                  <Route path="cargos" element={<Cargos />} />
                  <Route path="capacitaciones" element={<CapacitacionesSkills />} />
                  <Route path="asignaciones" element={<AsignacionesEvaluaciones />} />
                </Route>
              </Route>

              {/* Redirect unmatched routes to login if not authenticated, or dashboard if authenticated */}
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
            <Toaster />
          </motion.div>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
