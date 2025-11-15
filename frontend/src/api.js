import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Debug: Log API URL in development
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add admin token to requests if available
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken) {
    config.headers['X-Admin-Token'] = adminToken;
  }
  return config;
});

// Handle 401 errors (unauthorized) and log responses
api.interceptors.response.use(
  (response) => {
    // Log API responses for debugging
    if (import.meta.env.DEV || window.location.hostname.includes('netlify')) {
      console.log(`[API Response] ${response.config?.method?.toUpperCase()} ${response.config?.url}:`, {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
      });
    }
    return response;
  },
  (error) => {
    // Log API errors
    if (import.meta.env.DEV || window.location.hostname.includes('netlify')) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
    
    if (error.response?.status === 401 && error.config?.url?.includes('/admin/')) {
      // Clear token and redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_authenticated');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getAvailableSlots = (productId, date) => 
  api.get('/orders/slots', { params: { product_id: productId, date } });

// Admin Authentication
const ADMIN_USER_ID = 'Vapor_managerr';

export const adminRequestCode = () => 
  api.post('/admin/auth/request-code', { user_id: ADMIN_USER_ID });

export const adminVerifyCode = (code) => 
  api.post('/admin/auth/verify-code', { 
    user_id: ADMIN_USER_ID,
    code: code 
  });

export const adminCheckSession = () => {
  const token = localStorage.getItem('admin_token');
  return api.post('/admin/auth/check-session', {}, {
    headers: token ? { 'X-Admin-Token': token } : {}
  });
};

export const adminLogout = () => {
  const token = localStorage.getItem('admin_token');
  return api.post('/admin/auth/logout', {}, {
    headers: token ? { 'X-Admin-Token': token } : {}
  });
};

// Admin
export const adminGetProducts = () => api.get('/admin/products');
export const adminGetOrders = () => api.get('/admin/orders');
export const adminGetStatistics = () => api.get('/admin/statistics');
export const adminCreateProduct = (formData) => 
  api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const adminUpdateProduct = (id, formData) => {
  // Используем POST с _method=PUT для FormData (method spoofing)
  // Это необходимо, так как PUT с multipart/form-data не работает корректно в Laravel
  formData.append('_method', 'PUT');
  return api.post(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const adminRemoveFlavor = (id, volume, flavorName) => 
  api.post(`/admin/products/${id}/remove-flavor`, { volume, flavor_name: flavorName });
export const adminAddFlavor = (id, volume, name, image) => {
  const formData = new FormData();
  formData.append('volume', volume);
  formData.append('name', name);
  if (image) {
    formData.append('image', image);
  }
  return api.post(`/admin/products/${id}/add-flavor`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const adminAddFlavorToProduct = (id, name, image) => {
  const formData = new FormData();
  formData.append('name', name);
  if (image) {
    formData.append('image', image);
  }
  return api.post(`/admin/products/${id}/add-flavor-to-product`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const adminRemoveFlavorFromProduct = (id, flavorName) => 
  api.post(`/admin/products/${id}/remove-flavor-from-product`, { flavor_name: flavorName });
export const adminToggleFlavorStatus = (id, volume, flavorName, isActive) => 
  api.post(`/admin/products/${id}/toggle-flavor-status`, { volume, flavor_name: flavorName, is_active: isActive });
export const adminToggleFlavorStatusFromProduct = (id, flavorName, isActive) => 
  api.post(`/admin/products/${id}/toggle-flavor-status-from-product`, { flavor_name: flavorName, is_active: isActive });
export const adminUpdateOrder = (id, data) => api.put(`/admin/orders/${id}`, data);
export const adminGetOrder = (id) => api.get(`/admin/orders/${id}`);

// Finance
export const adminGetFinanceStats = () => api.get('/admin/finance/stats');
export const adminUpdateProductQuantity = (id, quantity) => 
  api.post(`/admin/products/${id}/update-quantity`, { quantity });
export const adminUpdateVolumeQuantity = (id, volume, quantity, purchasePrice = null) => 
  api.post(`/admin/products/${id}/update-volume-quantity`, { 
    volume, 
    quantity, 
    purchase_price: purchasePrice 
  });

export default api;

