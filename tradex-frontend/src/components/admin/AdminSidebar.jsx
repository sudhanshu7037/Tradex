import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Eye, 
  History, 
  ShieldCheck, 
  Lock, 
  UserCog, 
  FileText, 
  Settings, 
  LogOut,
  ShieldAlert,
  Activity,
  Coins
} from 'lucide-react';
import { useAdminAuthStore } from '../../context/useAdminAuthStore';
import { adminAuthService } from '../../services/adminService';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
  { path: '/admin/users', label: 'User Directory', icon: Users, permission: 'manage_users' },
  { path: '/admin/orders', label: 'Order Execution Book', icon: Activity, permission: 'manage_orders' },
  { path: '/admin/assets', label: 'Stock Assets & Market', icon: Coins, permission: 'manage_assets' },
  { path: '/admin/portfolios', label: 'Portfolios', icon: Briefcase, permission: 'manage_assets' },
  { path: '/admin/watchlists', label: 'Watchlists', icon: Eye, permission: 'manage_assets' },
  { path: '/admin/transactions', label: 'Trade Transactions', icon: History, permission: 'manage_orders' },
  { path: '/admin/roles', label: 'Roles Management', icon: ShieldCheck, permission: 'manage_roles' },
  { path: '/admin/permissions', label: 'Permissions', icon: Lock, permission: 'manage_permissions' },
  { path: '/admin/admins', label: 'Administrators', icon: UserCog, permission: 'manage_admins' },
  { path: '/admin/audit-logs', label: 'Security Audit Logs', icon: FileText, permission: 'view_audit_logs' },
  { path: '/admin/settings', label: 'System Settings', icon: Settings, permission: 'manage_settings' },
];

const AdminSidebar = () => {
  const { admin, logout, hasPermission } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminAuthService.logout();
    } catch (error) {
      console.error('Admin logout failed:', error);
    } finally {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <div className="h-full flex flex-col py-6">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldAlert className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-trade-text flex items-center gap-1.5">
            TradeX <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">ADMIN</span>
          </h2>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="p-3 rounded-xl bg-trade-primary/5 border border-trade-border/60">
          <p className="text-xs font-semibold text-trade-text truncate">{admin?.name || 'Administrator'}</p>
          <p className="text-[11px] text-trade-muted truncate mt-0.5">{admin?.email}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {admin?.roles?.map((r, idx) => (
              <span key={r?.id || idx} className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                {typeof r === 'string' ? r.replace(/_/g, ' ') : (r?.name || r?.slug || 'Admin')}
              </span>
            ))}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          // If admin has permission or is super admin
          if (!hasPermission(item.permission)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-500 font-semibold shadow-sm'
                    : 'text-trade-muted hover:bg-emerald-500/10 hover:text-trade-text'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 mt-auto pt-4 border-t border-trade-border/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-trade-red hover:bg-trade-red/10 font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Admin
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
