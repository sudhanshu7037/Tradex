import { useAuthStore } from '../context/useAuthStore';
import { User, Mail, Calendar, LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProfilePage = () => {
  const { user, logout } = useAuthStore();
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-trade-text">Profile</h1>
        <p className="text-trade-muted">Manage your account settings.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="bg-trade-primary/10 p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-trade-primary text-white rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg shadow-trade-primary/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h2 className="text-2xl font-bold text-trade-text">{user?.name}</h2>
          <p className="text-trade-primary font-medium">{user?.email}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 border border-trade-border rounded-xl">
            <div className="w-10 h-10 bg-trade-primary/10 border border-trade-primary/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-trade-primary" />
            </div>
            <div>
              <div className="text-sm text-trade-muted">Full Name</div>
              <div className="font-medium">{user?.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-trade-border rounded-xl">
            <div className="w-10 h-10 bg-trade-primary/10 border border-trade-primary/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-trade-primary" />
            </div>
            <div>
              <div className="text-sm text-trade-muted">Email Address</div>
              <div className="font-medium">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-trade-border rounded-xl">
            <div className="w-10 h-10 bg-trade-primary/10 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-trade-primary" />
            </div>
            <div>
              <div className="text-sm text-trade-muted">Wallet Balance</div>
              <div className="font-medium text-trade-primary">${Number(user?.wallet_balance || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-trade-border rounded-xl">
            <div className="w-10 h-10 bg-trade-primary/10 border border-trade-primary/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-trade-primary" />
            </div>
            <div>
              <div className="text-sm text-trade-muted">Member Since</div>
              <div className="font-medium">
                {user?.member_since ? new Date(user.member_since).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 bg-trade-redBg text-trade-red rounded-xl font-medium hover:bg-trade-red/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
};

export default ProfilePage;
