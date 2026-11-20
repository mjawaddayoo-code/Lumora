import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
}

export function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
}
