import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { useAdminAuthStore } from '../context/useAdminAuthStore';
import { adminAuthService } from '../services/adminService';

const AdminLayout = () => {
  const { isAuthenticated, setAdmin, logout } = useAdminAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (isAuthenticated) {
        try {
          const res = await adminAuthService.getProfile();
          const adminData = res.data || res.admin;
          if (res.success && adminData) {
            setAdmin(adminData);
          }
        } catch (error) {
          console.error("Failed to fetch admin profile:", error);
          if (error.response?.status === 401) {
            logout();
            navigate('/admin/login');
          }
        }
      }
    };
    fetchAdminProfile();
  }, [isAuthenticated, setAdmin, logout, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-trade-bg text-trade-text">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-trade-border bg-trade-card">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
