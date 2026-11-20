import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '../api/client';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener('lumora:logout', logout);
    return () => window.removeEventListener('lumora:logout', logout);
  }, [logout]);

  const accept = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  };
  const login = async (email, password) => accept((await api.post('/auth/login', { email, password })).data);
  const adminLogin = async (email, password) => accept((await api.post('/auth/admin-login', { email, password })).data);
  const register = async (form) => accept((await api.post('/auth/register', form)).data);
  const updateProfile = async (form) => setUser((await api.put('/auth/me', form)).data.user);
  const changePassword = async (currentPassword, newPassword) => accept((await api.put('/auth/password', { currentPassword, newPassword })).data);

  return (
    <AuthCtx.Provider value={{ user, loading, isAdmin: user?.role === 'admin', login, adminLogin, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthCtx.Provider>
  );
}
