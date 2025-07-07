import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import theme from './theme/mui-theme';
import { SettingsProvider } from '@/contexts/SettingsContext';
import MainLayout from '@/layouts/MainLayout';
import FacturasPage from '@/pages/contabilidad/Facturas';

// Pages
import Dashboard from '@/pages/Dashboard';
import Ajustes from '@/pages/Ajustes';

// Módulos
import CRMDashboard from '@/pages/crm/CRMDashboard';
import Contactos from '@/pages/crm/Contactos';
import Mercado from '@/pages/crm/Mercado';
import Buyer from '@/pages/crm/Buyer';
import Empresas from '@/pages/crm/Empresas';

import ContabilidadDashboard from '@/pages/contabilidad/ContabilidadDashboard';
import Transacciones from '@/pages/contabilidad/Transacciones';
import Contratos from '@/pages/contabilidad/Contratos';
import LineasServicios from '@/pages/contabilidad/LineasServicios';
import Impuestos from '@/pages/contabilidad/Impuestos';
import ClasificacionesContables from '@/pages/contabilidad/ClasificacionesContables';
import Terceros from '@/pages/contabilidad/Terceros';

import RRHHDashboard from '@/pages/rrhh/RRHHDashboard';
import Cargos from '@/pages/rrhh/Cargos';
import CapacitacionesSkills from '@/pages/rrhh/CapacitacionesSkills';
import AsignacionesEvaluaciones from '@/pages/rrhh/AsignacionesEvaluaciones';
import ContratosRRHH from '@/pages/rrhh/ContratosRRHH';

// Sistema de Gestión
import GestionDashboard from '@/pages/gestion/GestionDashboard';
import OKRView from '@/pages/gestion/okr/OKRView';

// Componente principal de la aplicación
function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <SettingsProvider>
          <Router>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen bg-background"
            >
              <Routes>
                <Route path="/" element={<MainLayout />}>
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
                    <Route index element={<ContabilidadDashboard />} />
                    <Route path="facturas" element={<FacturasPage />} />
                    <Route path="transacciones" element={<Transacciones />} />
                    <Route path="contratos" element={<Contratos />} />
                    <Route path="servicios" element={<LineasServicios />} />
                    <Route path="impuestos" element={<Impuestos />} />
                    <Route path="clasificaciones-contables" element={<ClasificacionesContables />} />
                    <Route path="terceros" element={<Terceros />} />
                  </Route>

                  {/* RRHH Routes */}
                  <Route path="rrhh">
                    <Route index element={<RRHHDashboard />} />
                    <Route path="contratos-rrhh" element={<ContratosRRHH />} />
                    <Route path="cargos" element={<Cargos />} />
                    <Route path="capacitaciones" element={<CapacitacionesSkills />} />
                    <Route path="asignaciones" element={<AsignacionesEvaluaciones />} />
                  </Route>

                  {/* Sistema de Gestión Routes */}
                  <Route path="gestion">
                    <Route index element={<GestionDashboard />} />
                    <Route path="okr" element={<OKRView />} />
                  </Route>

                  {/* Ajustes Route */}
                  <Route path="ajustes" element={<Ajustes />} />
                </Route>

                {/* Redirect unmatched routes to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </motion.div>
          </Router>
        </SettingsProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
