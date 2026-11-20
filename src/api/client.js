import axios from 'axios';

export const TOKEN_KEY = 'lumora_token';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 30000 });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || '';
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/admin-login') || url.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthForm && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('lumora:logout'));
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e, fallback = 'Something went wrong. Please try again.') =>
  e?.response?.data?.message || (e?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the API running?' : fallback);

export default api;
