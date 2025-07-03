import { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '@/config/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    name: 'Ana Torres',
    email: 'ana.torres@example.com',
    role: 'admin'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    // Simulamos que ya estamos autenticados
    setIsAuthenticated(true);
  }, []);

  const login = async (email, password) => {
    // Simulamos un login exitoso
    return { success: true };
  };

  const logout = async () => {
    // Por ahora no hacemos nada en el logout
    console.log('Logout simulado');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 