import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const StorageContext = createContext(null);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage debe ser usado dentro de un StorageProvider');
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  const { toast } = useToast();
  
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
  
  useEffect(() => {
    // Datos de ejemplo para CRM
    if (!localStorage.getItem('contactos')) {
      const contactosEjemplo = [
        {
          id: '1',
          nombre: 'Juan Pérez',
          email: 'juan.perez@empresa.com',
          telefono: '555-1234',
          cargo: 'Director de TI',
          empresa: 'Empresa ABC',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          nombre: 'María López',
          email: 'maria.lopez@empresa.com',
          telefono: '555-5678',
          cargo: 'Gerente de Marketing',
          empresa: 'XYZ Corp',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('contactos', contactosEjemplo);
    }

    if (!localStorage.getItem('oportunidades')) {
      const oportunidadesEjemplo = [
        {
          id: '1',
          titulo: 'Implementación ERP',
          cliente: 'Empresa ABC',
          valor: 100000,
          etapa: 'Negociación',
          probabilidad: 75,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          titulo: 'Desarrollo App Móvil',
          cliente: 'XYZ Corp',
          valor: 50000,
          etapa: 'Propuesta',
          probabilidad: 50,
          createdAt: new Date().toISOString()
        }
      ];
      saveData('oportunidades', oportunidadesEjemplo);
    }

    // Datos de ejemplo para Contabilidad
    if (!localStorage.getItem('facturas')) {
      const facturasEjemplo = [
        {
          id: '1',
          numero: 'F-2024-001',
          cliente: 'Empresa ABC',
          monto: 5000,
          estado: 'Pagada',
          fechaEmision: '2024-03-01',
          fechaVencimiento: '2024-03-31',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          numero: 'F-2024-002',
          cliente: 'XYZ Corp',
          monto: 7500,
          estado: 'Pendiente',
          fechaEmision: '2024-03-05',
          fechaVencimiento: '2024-04-04',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('facturas', facturasEjemplo);
    }

    if (!localStorage.getItem('gastos')) {
      const gastosEjemplo = [
        {
          id: '1',
          concepto: 'Alquiler Oficina',
          categoria: 'Infraestructura',
          monto: 2000,
          fecha: '2024-03-01',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          concepto: 'Servicios Cloud',
          categoria: 'Tecnología',
          monto: 500,
          fecha: '2024-03-05',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('gastos', gastosEjemplo);
    }

    // Datos de ejemplo para RRHH
    if (!localStorage.getItem('empleados')) {
      const empleadosEjemplo = [
        {
          id: '1',
          nombre: 'Carlos Rodríguez',
          cargo: 'Desarrollador Senior',
          departamento: 'Tecnología',
          fechaIngreso: '2023-01-15',
          salario: 45000,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          nombre: 'Ana Martínez',
          cargo: 'Diseñadora UX',
          departamento: 'Diseño',
          fechaIngreso: '2023-03-01',
          salario: 38000,
          createdAt: new Date().toISOString()
        }
      ];
      saveData('empleados', empleadosEjemplo);
    }

    if (!localStorage.getItem('vacaciones')) {
      const vacacionesEjemplo = [
        {
          id: '1',
          empleado: 'Carlos Rodríguez',
          fechaInicio: '2024-04-01',
          fechaFin: '2024-04-15',
          estado: 'Aprobada',
          diasTotales: 15,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          empleado: 'Ana Martínez',
          fechaInicio: '2024-05-01',
          fechaFin: '2024-05-10',
          estado: 'Pendiente',
          diasTotales: 10,
          createdAt: new Date().toISOString()
        }
      ];
      saveData('vacaciones', vacacionesEjemplo);
    }

    if (!localStorage.getItem('capacitaciones')) {
      const capacitacionesEjemplo = [
        {
          id: '1',
          titulo: 'React Avanzado',
          instructor: 'Juan Experto',
          fechaInicio: '2024-04-01',
          fechaFin: '2024-04-30',
          participantes: ['Carlos Rodríguez', 'Ana Martínez'],
          estado: 'Programada',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          titulo: 'Gestión de Proyectos',
          instructor: 'María Experta',
          fechaInicio: '2024-05-01',
          fechaFin: '2024-05-15',
          participantes: ['Ana Martínez'],
          estado: 'Pendiente',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('capacitaciones', capacitacionesEjemplo);
    }

    if (!localStorage.getItem('perfiles_compradores')) {
      const perfilesCompradoresEjemplo = [
        {
          id: '1',
          titulo: 'Director de TI',
          industria: 'Tecnología',
          tamanoEmpresa: 'Grande',
          dolorPrincipal: 'Integración de sistemas legacy',
          presupuestoPromedio: '$50,000 - $100,000',
          criteriosDecision: 'ROI, Seguridad, Escalabilidad',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          titulo: 'Gerente de Marketing',
          industria: 'Retail',
          tamanoEmpresa: 'Mediana',
          dolorPrincipal: 'Automatización de campañas',
          presupuestoPromedio: '$10,000 - $50,000',
          criteriosDecision: 'Facilidad de uso, Integración con CRM',
          createdAt: new Date().toISOString()
        }
      ];
      saveData('perfiles_compradores', perfilesCompradoresEjemplo);
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