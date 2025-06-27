import GestionDashboard from '@/pages/gestion/GestionDashboard';
import OKRView from '@/pages/gestion/okr/OKRView';

export const gestionRoutes = [
  {
    path: '/gestion',
    element: <GestionDashboard />
  },
  {
    path: '/gestion/okr',
    element: <OKRView />
  }
]; 