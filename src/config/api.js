// Configuración de API para diferentes entornos
const API_CONFIG = {
  development: {
    baseURL: '' // Usar rutas relativas para aprovechar el proxy de Vite
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

console.log('🌍 Entorno detectado:', currentEnv);
console.log('🔗 API Base URL:', apiConfig.baseURL);

// Función helper para hacer llamadas a la API
export const apiCall = async (endpoint, options = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  // Obtener token de autenticación si existe
  const token = localStorage.getItem('authToken');
  
  console.log('📡 API Call:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'sin token'
  });
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    console.log('🚀 Enviando petición...');
    const response = await fetch(url, defaultOptions);
    
    console.log('📨 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      ok: response.ok
    });
    
    // Intentar parsear como JSON siempre
    try {
      const data = await response.json();
      console.log('✅ JSON parseado:', Array.isArray(data) ? `Array[${data.length}]` : typeof data);
      
      // Si hay error de autenticación, limpiar token
      if (response.status === 401 || response.status === 403) {
        console.warn('🔒 Error de autenticación, limpiando token...');
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Si hay un error del servidor, lanzar excepción
      if (!response.ok) {
        const errorMessage = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
        console.error('❌ Error del servidor:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      throw new Error('Error parseando respuesta del servidor');
    }
  } catch (error) {
    console.error(`❌ Error en API call a ${url}:`, error);
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

  // Catálogos generales
  getCatalogos: (tipo) => apiCall(`/api/catalogos/${tipo}`),
  
  // Catálogos específicos
  getCuentas: () => apiCall('/api/catalogos/cuentas'),
  getTiposTransaccion: () => apiCall('/api/catalogos/tipos-transaccion'),
  getContratos: () => apiCall('/api/contratos'),
  getMonedas: () => apiCall('/api/catalogos/monedas'),
  getTaxes: () => apiCall('/api/impuestos'),
  getEtiquetasContables: () => apiCall('/api/catalogos/etiquetas-contables'),
  getConceptos: () => apiCall('/api/catalogos/conceptos-transacciones'),
  
  // Health check
  health: () => apiCall('/api/health')
}; 