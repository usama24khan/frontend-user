import axios from 'axios';
import { API_URL as PHASES_API_URL } from '../constants/phases';

const API_URL = PHASES_API_URL;

const STORAGE_KEY = 'kkb4_resident_auth';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Inject resident bearer token from localStorage when present.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && config.headers) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch { /* ignore */ }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired/invalid — clear and bounce to login (unless we're already there)
      localStorage.removeItem(STORAGE_KEY);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export { API_URL };
export default api;
