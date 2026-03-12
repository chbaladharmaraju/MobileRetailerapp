import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ag_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if NOT an auth request (login/register)
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('ag_token');
      localStorage.removeItem('ag_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
