import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add token from sessionStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status = error.response?.status;

    if (status === 401) {
      // Token expired — show flash message then redirect to login
      sessionStorage.removeItem('auth_token');
      Cookies.remove('auth_token');
      sessionStorage.setItem('login_flash', 'Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden — show toast without redirecting
      window.dispatchEvent(new CustomEvent('api:forbidden', {
        detail: 'Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.'
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
