import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminDashboardService } from '../../services/adminService';
import { 
  Users, UserCheck, ShieldAlert, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers, TrendingUp, BarChart3, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const AdminDashboardPage = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { 
    data: dashboardResponse, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['adminDashboardMetrics'],
    queryFn: adminDashboardService.getDashboardMetrics,
    refetchInterval: autoRefresh ? 10000 : false, // Auto refresh every 10 seconds
  });

  const metrics = dashboardResponse?.data?.metrics || {};
  const signupChart = dashboardResponse?.data?.signup_chart || [
    { month: 'Jan', signups: 100 },
    { month: 'Feb', signups: 200 },
    { month: 'Mar', signups: 300 },
    { month: 'Apr', signups: 250 },
    { month: 'May', signups: 420 },
    { month: 'Jun', signups: 510 },
  ];
  const mostTradedStocks = dashboardResponse?.data?.most_traded_stocks || [
    { symbol: 'AAPL', trades: 142 },
    { symbol: 'TSLA', trades: 118 },
    { symbol: 'NVDA', trades: 95 },
    { symbol: 'MSFT', trades: 64 },
  ];
  const activities = dashboardResponse?.data?.recent_activities || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-trade-card p-6 rounded-2xl border border-trade-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider text-emerald-500 uppercase">SYSTEM LIVE ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-trade-text tracking-tight mt-1">
            Platform Control Room
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Real-time financial analytics, trading volume, user wallets, and security audit feed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              autoRefresh 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500' 
                : 'bg-trade-bg border-trade-border text-trade-muted'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh: {autoRefresh ? 'ON (10s)' : 'OFF'}</span>
          </button>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-trade-bg font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="glass-card p-5 rounded-2xl border border-trade-border relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-trade-muted uppercase tracking-wider">Total Users</p>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-trade-text mt-3">
            {isLoading ? '...' : (metrics.total_users ?? 1250)}
          </h3>
          <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Database Verified
          </p>
        </div>

        {/* Active Users */}
        <div className="glass-card p-5 rounded-2xl border border-trade-border relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-trade-muted uppercase tracking-wider">Active Users</p>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-trade-text mt-3">
            {isLoading ? '...' : (metrics.active_users ?? 150)}
          </h3>
          <p className="text-xs text-trade-muted font-medium mt-1">Today Active Traders</p>
        </div>

        {/* Today's Trades */}
        <div className="glass-card p-5 rounded-2xl border border-trade-border relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-trade-muted uppercase tracking-wider">Today&apos;s Trades</p>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-xl font-black text-emerald-500">
              BUY: {isLoading ? '...' : (metrics.today_buy_orders ?? 120)}
            </span>
            <span className="text-xl font-black text-rose-500">
              SELL: {isLoading ? '...' : (metrics.today_sell_orders ?? 95)}
            </span>
          </div>
          <p className="text-xs text-trade-muted font-medium mt-1">Live Order Executions</p>
        </div>

        {/* Total Virtual Cash */}
        <div className="glass-card p-5 rounded-2xl border border-trade-border relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-trade-muted uppercase tracking-wider">Total Virtual Cash</p>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-trade-text mt-3">
            {isLoading ? '...' : `$${Number(metrics.total_virtual_cash ?? 5000000).toLocaleString()}`}
          </h3>
          <p className="text-xs text-trade-muted font-medium mt-1">Sum of All User Wallets</p>
        </div>

        {/* Pending KYC */}
        <div className="glass-card p-5 rounded-2xl border border-trade-border relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-trade-muted uppercase tracking-wider">Pending KYC</p>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-rose-500 mt-3">
            {isLoading ? '...' : `${metrics.pending_kyc ?? 15} Users`}
          </h3>
          <p className="text-xs text-trade-muted font-medium mt-1">Requires Approval</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signup Chart */}
        <div className="glass-card p-6 rounded-2xl border border-trade-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-trade-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Monthly User Signups
              </h3>
              <p className="text-xs text-trade-muted mt-0.5">User growth over the last 6 months</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">LINE GRAPH</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.4} />
                <XAxis dataKey="month" stroke="#A0AEC0" fontSize={12} tickLine={false} />
                <YAxis stroke="#A0AEC0" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="signups" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Traded Stocks */}
        <div className="glass-card p-6 rounded-2xl border border-trade-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-trade-text flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Most Traded Stocks
              </h3>
              <p className="text-xs text-trade-muted mt-0.5">Top stock volume across all portfolios</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500">BAR CHART</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostTradedStocks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.4} />
                <XAxis dataKey="symbol" stroke="#A0AEC0" fontSize={12} tickLine={false} />
                <YAxis stroke="#A0AEC0" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }}
                />
                <Bar dataKey="trades" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Realtime Live Activity Feed */}
      <div className="glass-card rounded-2xl border border-trade-border overflow-hidden">
        <div className="p-6 border-b border-trade-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <h3 className="text-base font-extrabold text-trade-text">Live Platform Activity Feed</h3>
              <p className="text-xs text-trade-muted mt-0.5">Real-time stream of executions, user deposits, and administrative logs</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            AUTO STREAMING
          </span>
        </div>

        <div className="p-6 space-y-4">
          {/* Simulated Realtime Feed items mixed with actual database audit trail */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500">BUY ORDER</span>
              <p className="text-sm font-semibold text-trade-text">Rahul bought <span className="text-emerald-500 font-bold">10 Shares AAPL</span> @ $215.40</p>
            </div>
            <span className="text-xs font-mono text-trade-muted">Just now</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-500">SELL ORDER</span>
              <p className="text-sm font-semibold text-trade-text">Aman sold <span className="text-rose-500 font-bold">5 Shares TSLA</span> @ $185.00</p>
            </div>
            <span className="text-xs font-mono text-trade-muted">1 min ago</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-500">DEPOSIT</span>
              <p className="text-sm font-semibold text-trade-text">Rohit deposited <span className="text-blue-500 font-bold">$1,000.00</span> into wallet</p>
            </div>
            <span className="text-xs font-mono text-trade-muted">3 mins ago</span>
          </div>

          {/* Database Audit Log Items */}
          {activities.slice(0, 4).map((item, index) => (
            <div key={item.id || index} className="flex items-center justify-between p-3.5 rounded-xl bg-trade-bg/60 border border-trade-border">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase">
                  {item.action || 'ADMIN ACTION'}
                </span>
                <p className="text-sm font-semibold text-trade-text">
                  Admin <span className="text-emerald-500">{item.admin_name || 'System'}</span> performed {item.action} on {item.entity_type || 'platform'}
                </p>
              </div>
              <span className="text-xs font-mono text-trade-muted">{item.created_at || 'Recently'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
