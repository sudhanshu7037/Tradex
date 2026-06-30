import { Outlet } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-trade-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-trade-text">TradeX</h1>
          </div>
          <p className="text-trade-muted">The future of intelligent trading</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
