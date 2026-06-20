import axios from 'axios';
import { API_URL as PHASES_API_URL } from '../constants/phases';

const API_URL = PHASES_API_URL;
const STORAGE_KEY = 'kkb4_resident_auth';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Error classifier ──────────────────────────────────────────────────────────
function classifyError(error: any): Error {
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const e = new Error('Request timed out — check your connection and try again.');
      (e as any).status = 408;
      return e;
    }
    const e = new Error('No internet connection — check your network and try again.');
    (e as any).status = 0;
    return e;
  }

  const status: number = error.response.status;
  const serverMsg: string | undefined = error.response?.data?.message;

  const fallbacks: Record<number, string> = {
    400: 'Invalid request — please check your input.',
    401: 'Session expired — please log in again.',
    403: "You don't have permission to view this.",
    404: 'The requested data was not found.',
    408: 'Request timed out — please try again.',
    429: 'Too many requests — please wait a moment and try again.',
    500: 'Server error — try again in a moment.',
    502: 'Service unavailable — try again shortly.',
    503: 'Service unavailable — try again shortly.',
    504: 'Server took too long to respond — try again shortly.',
  };

  const message = serverMsg || fallbacks[status] || `Unexpected error (${status}) — please try again.`;
  const e = new Error(message);
  (e as any).status = status;
  return e;
}

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

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(classifyError(error));
  }
);

export { API_URL };
export default api;
