import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Bell, ExternalLink, Menu, X } from 'lucide-react';
import { useAdminAuthStore } from '../../context/useAdminAuthStore';
import AdminSidebar from './AdminSidebar';

const AdminNavbar = () => {
  const { admin } = useAdminAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-trade-border bg-trade-card/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-trade-muted hover:text-trade-text hover:bg-trade-bg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-trade-muted hidden sm:inline">System Live & Protected</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-trade-bg hover:bg-trade-primary/10 text-trade-text hover:text-emerald-500 transition-colors border border-trade-border"
          >
            <span>Trader Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2 pl-4 border-l border-trade-border">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-trade-text leading-none">{admin?.name}</p>
              <p className="text-[10px] text-emerald-500 font-medium uppercase mt-0.5">
                {typeof admin?.roles?.[0] === 'string' ? admin.roles[0].replace(/_/g, ' ') : (admin?.roles?.[0]?.name || 'Admin')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-trade-card h-full shadow-2xl flex flex-col z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-trade-muted hover:text-trade-text"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto" onClick={() => setMobileOpen(false)}>
              <AdminSidebar />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
