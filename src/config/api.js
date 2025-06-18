// Configuración de API para diferentes entornos
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8081'
  },
  production: {
    baseURL: 'https://pros-backend-996366858087.us-central1.run.app'
  }
};

// Detectar entorno actual
const getEnvironment = () => {
  // Si estamos en desarrollo local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  // Si estamos en producción
  return 'production';
};

// Obtener configuración actual
const currentEnv = getEnvironment();
const apiConfig = API_CONFIG[currentEnv];

// Función helper para hacer llamadas a la API
export const apiCall = async (endpoint, options = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error(`Error en API call a ${url}:`, error);
    throw error;
  }
};

// Exportar configuración para uso directo si es necesario
export const API_BASE_URL = apiConfig.baseURL;

// Funciones helper para endpoints comunes
export const api = {
  // Transacciones
  getTransacciones: () => apiCall('/api/transacciones'),
  createTransaccion: (data) => apiCall('/api/transacciones', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTransaccion: (id, data) => apiCall(`/api/transacciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTransaccion: (id) => apiCall(`/api/transacciones/${id}`, {
    method: 'DELETE'
  }),

  // Facturas
  getFacturas: () => apiCall('/api/facturas'),
  createFactura: (data) => apiCall('/api/facturas', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateFactura: (id, data) => apiCall(`/api/facturas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteFactura: (id) => apiCall(`/api/facturas/${id}`, {
    method: 'DELETE'
  }),

  // Terceros
  getTerceros: () => apiCall('/api/terceros'),
  createTercero: (data) => apiCall('/api/terceros', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTercero: (id, data) => apiCall(`/api/terceros/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTercero: (id) => apiCall(`/api/terceros/${id}`, {
    method: 'DELETE'
  }),

  // Catálogos
  getCatalogos: (tipo) => apiCall(`/api/catalogos/${tipo}`),
  
  // Health check
  health: () => apiCall('/api/health')
}; 