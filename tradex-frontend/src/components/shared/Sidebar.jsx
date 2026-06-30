import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LineChart, Briefcase, History, Star, LogOut } from 'lucide-react';
import { useAuthStore } from '../../context/useAuthStore';
import { authService } from '../../services/authService';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/markets', label: 'Markets', icon: LineChart },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/transactions', label: 'Transactions', icon: History },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
];

const Sidebar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="h-full flex flex-col py-6">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-trade-primary rounded-lg flex items-center justify-center">
          <LineChart className="text-white w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-trade-text">TradeX</h2>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-trade-primary/10 text-trade-primary font-medium'
                  : 'text-trade-muted hover:bg-trade-primary/10 hover:text-trade-text'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-trade-red  font-medium cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
