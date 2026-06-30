import { Outlet } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import BottomNav from '../components/shared/BottomNav';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-trade-bg">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-trade-border bg-trade-card">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-trade-card border-t border-trade-border">
        <BottomNav />
      </div>
    </div>
  );
};

export default DashboardLayout;
