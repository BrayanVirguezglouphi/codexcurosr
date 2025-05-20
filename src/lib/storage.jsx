
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Contexto para el almacenamiento
const StorageContext = createContext(null);

// Hook personalizado para usar el contexto
export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage debe ser usado dentro de un StorageProvider');
  }
  return context;
};

// Proveedor del contexto
export const StorageProvider = ({ children }) => {
  const { toast } = useToast();
  
  // Función para obtener datos del localStorage
  const getData = (key, defaultValue = []) => {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : defaultValue;
    } catch (error) {
      console.error(`Error al obtener datos de ${key}:`, error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos de ${key}`,
        variant: "destructive",
      });
      return defaultValue;
    }
  };
  
  // Función para guardar datos en localStorage
  const saveData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error al guardar datos en ${key}:`, error);
      toast({
        title: "Error",
        description: `No se pudieron guardar los datos en ${key}`,
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Funciones CRUD genéricas
  const createItem = (key, item) => {
    const items = getData(key);
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedItems = [...items, newItem];
    const success = saveData(key, updatedItems);
    
    if (success) {
      toast({
        title: "Éxito",
        description: "Elemento creado correctamente",
      });
    }
    
    return success ? newItem : null;
  };
  
  const getItems = (key) => {
    return getData(key);
  };
  
  const getItemById = (key, id) => {
    const items = getData(key);
    return items.find(item => item.id === id) || null;
  };
  
  const updateItem = (key, id, updatedData) => {
    const items = getData(key);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      toast({
        title: "Error",
        description: "Elemento no encontrado",
        variant: "destructive",
      });
      return false;
    }
    
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    
    const success = saveData(key, updatedItems);
    
    if (success) {
      toast({
        title: "Éxito",
        description: "Elemento actualizado correctamente",
      });
    }
    
    return success;
  };
  
  const deleteItem = (key, id) => {
    const items = getData(key);
    const updatedItems = items.filter(item => item.id !== id);
    
    if (updatedItems.length === items.length) {
      toast({
        title: "Error",
        description: "Elemento no encontrado",
        variant: "destructive",
      });
      return false;
    }
    
    const success = saveData(key, updatedItems);
    
    if (success) {
      toast({
        title: "Éxito",
        description: "Elemento eliminado correctamente",
      });
    }
    
    return success;
  };
  
  // Inicializar datos de ejemplo si no existen
  useEffect(() => {
    // Clientes de ejemplo
    if (!localStorage.getItem('clientes')) {
      const clientesEjemplo = [
        {
          id: '1',
          nombre: 'Empresa ABC',
          email: 'contacto@empresaabc.com',
          telefono: '555-1234',
          direccion: 'Calle Principal 123',
          tipo: 'Corporativo',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          nombre: 'Distribuidora XYZ',
          email: 'info@distribuidoraxyz.com',
          telefono: '555-5678',
          direccion: 'Avenida Central 456',
          tipo: 'Distribuidor',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('clientes', clientesEjemplo);
    }
    
    // Empleados de ejemplo
    if (!localStorage.getItem('empleados')) {
      const empleadosEjemplo = [
        {
          id: '1',
          nombre: 'Juan Pérez',
          email: 'juan.perez@empresa.com',
          telefono: '555-9876',
          departamento: 'Ventas',
          cargo: 'Gerente de Ventas',
          fechaContratacion: '2022-01-15',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          nombre: 'María López',
          email: 'maria.lopez@empresa.com',
          telefono: '555-5432',
          departamento: 'Marketing',
          cargo: 'Especialista en Marketing Digital',
          fechaContratacion: '2022-03-10',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('empleados', empleadosEjemplo);
    }
    
    // Facturas de ejemplo
    if (!localStorage.getItem('facturas')) {
      const facturasEjemplo = [
        {
          id: '1',
          numero: 'F-2023-001',
          cliente: 'Empresa ABC',
          fecha: '2023-05-10',
          monto: 1500.00,
          estado: 'Pagada',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          numero: 'F-2023-002',
          cliente: 'Distribuidora XYZ',
          fecha: '2023-05-15',
          monto: 2300.00,
          estado: 'Pendiente',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('facturas', facturasEjemplo);
    }
  }, []);
  
  const value = {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem
  };
  
  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
