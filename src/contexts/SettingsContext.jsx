import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Configuraciones por defecto
const defaultSettings = {
  fontSize: 'medium', // small, medium, large
  theme: 'light', // light, dark
  language: 'es', // es, en
  animations: true,
  sidebar: {
    isCollapsed: false
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Cargar configuraciones del localStorage al inicializar
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.warn('Error al cargar configuraciones guardadas:', error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Guardar configuraciones en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  // Aplicar el tema al DOM
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Aplicar el tamaño de fuente al DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Remover clases previas de fontSize
    root.classList.remove('text-small', 'text-medium', 'text-large');
    
    // Aplicar nueva clase
    if (settings.fontSize !== 'medium') {
      root.classList.add(`text-${settings.fontSize}`);
    }
  }, [settings.fontSize]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedSetting = (parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('app-settings');
  };

  const toggleTheme = () => {
    updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light');
  };

  const setFontSize = (size) => {
    updateSetting('fontSize', size);
  };

  const value = {
    settings,
    updateSetting,
    updateNestedSetting,
    resetSettings,
    toggleTheme,
    setFontSize,
    // Valores de conveniencia
    isDarkMode: settings.theme === 'dark',
    fontSize: settings.fontSize,
    isAnimationsEnabled: settings.animations
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 