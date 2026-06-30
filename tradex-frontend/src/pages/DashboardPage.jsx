import { useEffect } from 'react';
import { useDashboard } from '../hooks/useQueries';
import { useWalletStore } from '../context/useWalletStore';
import { StatCard } from '../components/shared/StatCard';
import { SkeletonCard } from '../components/shared/Skeletons';
import { ErrorState } from '../components/shared/States';
import { Wallet, PieChart, TrendingUp, TrendingDown, Layers, History } from 'lucide-react';
import TradingViewMarketOverview from '../components/stocks/TradingViewMarketOverview';
import AssetAllocationChart from '../components/dashboard/AssetAllocationChart';

const DashboardPage = () => {
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const setBalance = useWalletStore(state => state.setBalance);

  useEffect(() => {
    if (data?.wallet_balance !== undefined) {
      setBalance(data.wallet_balance);
    }
  }, [data, setBalance]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error.message || "Failed to load dashboard."} retry={refetch} />;
  }

  const {
    wallet_balance,
    total_holdings,
    invested_value,
    current_value,
    profit_loss,
    total_transactions
  } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-trade-text">Overview</h1>
        <p className="text-trade-muted">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Wallet Balance"
          value={Number(wallet_balance || 0).toFixed(2)}
          prefix="$"
          icon={Wallet}
        />
        <StatCard
          title="Current Portfolio Value"
          value={Number(current_value || 0).toFixed(2)}
          prefix="$"
          icon={PieChart}
        />
        <StatCard
          title="Total Profit/Loss"
          value={Math.abs(profit_loss || 0).toFixed(2)}
          prefix={profit_loss < 0 ? '-$' : '$'}
          icon={profit_loss >= 0 ? TrendingUp : TrendingDown}
          trend={invested_value ? ((profit_loss / invested_value) * 100).toFixed(2) : 0}
        />
        <StatCard
          title="Invested Value"
          value={Number(invested_value || 0).toFixed(2)}
          prefix="$"
          icon={Layers}
        />
        <StatCard
          title="Total Holdings"
          value={total_holdings}
          icon={Layers}
        />
        <StatCard
          title="Total Transactions"
          value={total_transactions}
          icon={History}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-trade-text mb-4">Market Overview</h2>
        <div className="h-[400px] rounded-xl overflow-hidden glass-card border border-trade-border">
          <TradingViewMarketOverview />
        </div>
      </div>

      <div className="mt-8">
        <AssetAllocationChart />
      </div>
    </div>
  );
};

export default DashboardPage;
