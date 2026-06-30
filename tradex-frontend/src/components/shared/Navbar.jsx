import { Bell, Wallet, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../context/useAuthStore';
import { useWalletStore } from '../../context/useWalletStore';
import { useThemeStore } from '../../context/useThemeStore';

const Navbar = () => {
  const { user } = useAuthStore();
  const { balance } = useWalletStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="h-16 bg-trade-card border-b border-trade-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center md:hidden">
        <h1 className="text-xl font-bold tracking-tight text-trade-text">TradeX</h1>
      </div>
      
      <div className="hidden md:block">
        {/* Breadcrumbs or Page Title could go here */}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-trade-bg rounded-lg border border-trade-border">
          <Wallet className="w-4 h-4 text-trade-muted" />
          <span className="text-sm font-medium text-trade-text">
            ${Number(balance ?? user?.wallet_balance ?? 0).toFixed(2)}
          </span>
        </div>

        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Theme"
          className="p-2 text-trade-muted hover:text-trade-primary hover:bg-trade-primary/10 rounded-full transition-colors cursor-pointer flex items-center justify-center border border-trade-border"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>

        <button className="p-2 text-trade-muted hover:bg-trade-primary/10 rounded-full transition-colors relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-trade-red rounded-full"></span>
        </button>

        <Link
          to="/profile"
          title="Go to Profile"
          className="flex items-center gap-2 pl-2 border-l border-trade-border hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <div className="w-8 h-8 bg-trade-primary/10 group-hover:bg-trade-primary/20 text-trade-primary rounded-full flex items-center justify-center font-bold text-sm transition-colors border border-trade-primary/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium hidden lg:block text-trade-text group-hover:text-trade-primary transition-colors">{user?.name || 'User'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
