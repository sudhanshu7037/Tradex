import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../context/useAdminAuthStore';

const AdminProtectedRoute = () => {
  const { isAuthenticated } = useAdminAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
