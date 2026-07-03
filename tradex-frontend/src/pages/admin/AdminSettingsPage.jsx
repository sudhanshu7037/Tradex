import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Loader2, Sliders, Shield, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminSettingsService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const [settingsMap, setSettingsMap] = useState({
    welcome_bonus: '10000.00',
    brokerage_fee: '1.00',
    market_hours_start: '09:15',
    market_hours_end: '15:30',
    trading_fee_percentage: '0.15',
    min_trade_amount: '10.00',
    app_currency: 'USD',
    maintenance_mode: 'false',
    kyc_required: 'true',
    max_watchlist_items: '25'
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: adminSettingsService.getSettings,
  });

  useEffect(() => {
    if (data?.data?.settings) {
      const map = { ...settingsMap };
      data.data.settings.forEach(item => {
        map[item.key] = item.value;
      });
      setSettingsMap(map);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (settingsArray) => adminSettingsService.updateSettings(settingsArray),
    onSuccess: (res) => {
      toast.success(res.message || 'System settings updated successfully');
      queryClient.invalidateQueries(['adminSettings']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update system settings');
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    const payload = Object.entries(settingsMap).map(([key, value]) => ({
      key,
      value: String(value)
    }));
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center gap-3 text-trade-muted">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <span>Loading system parameter settings...</span>
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Failed to load system settings" retry={refetch} />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-emerald-500" />
            Global Platform Configuration
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Adjust global trading engine parameters, welcome cash bonuses, execution fees, and market operating hours.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trading Parameters */}
          <div className="glass-card p-6 border border-trade-border space-y-4 rounded-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-trade-border">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-trade-text">Trading Engine Parameters</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                  Welcome Bonus ($)
                </label>
                <input
                  type="text"
                  value={settingsMap.welcome_bonus}
                  onChange={(e) => setSettingsMap({...settingsMap, welcome_bonus: e.target.value})}
                  className="input-field py-2 text-sm font-mono font-bold text-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                  Brokerage Fee (%)
                </label>
                <input
                  type="text"
                  value={settingsMap.brokerage_fee}
                  onChange={(e) => setSettingsMap({...settingsMap, brokerage_fee: e.target.value})}
                  className="input-field py-2 text-sm font-mono font-bold text-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                  Market Open Time
                </label>
                <input
                  type="time"
                  value={settingsMap.market_hours_start}
                  onChange={(e) => setSettingsMap({...settingsMap, market_hours_start: e.target.value})}
                  className="input-field py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                  Market Close Time
                </label>
                <input
                  type="time"
                  value={settingsMap.market_hours_end}
                  onChange={(e) => setSettingsMap({...settingsMap, market_hours_end: e.target.value})}
                  className="input-field py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                Execution Fee Rate (%)
              </label>
              <input
                type="text"
                value={settingsMap.trading_fee_percentage}
                onChange={(e) => setSettingsMap({...settingsMap, trading_fee_percentage: e.target.value})}
                className="input-field py-2 text-sm font-mono"
              />
              <p className="text-[11px] text-trade-muted mt-1">Applied per executed buy or sell transaction.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                Minimum Trade Order Value ($)
              </label>
              <input
                type="text"
                value={settingsMap.min_trade_amount}
                onChange={(e) => setSettingsMap({...settingsMap, min_trade_amount: e.target.value})}
                className="input-field py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                Max Watchlist Stocks Per User
              </label>
              <input
                type="number"
                value={settingsMap.max_watchlist_items}
                onChange={(e) => setSettingsMap({...settingsMap, max_watchlist_items: e.target.value})}
                className="input-field py-2 text-sm font-mono"
              />
            </div>
          </div>

          {/* Compliance & Environment */}
          <div className="glass-card p-6 border border-trade-border space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-trade-border">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-trade-text">System Controls & Compliance</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                Platform Default Currency
              </label>
              <select
                value={settingsMap.app_currency}
                onChange={(e) => setSettingsMap({...settingsMap, app_currency: e.target.value})}
                className="input-field py-2 text-sm"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                Enforce KYC Verification Before Trading
              </label>
              <select
                value={settingsMap.kyc_required}
                onChange={(e) => setSettingsMap({...settingsMap, kyc_required: e.target.value})}
                className="input-field py-2 text-sm"
              >
                <option value="true">Strict Enforcement (Active)</option>
                <option value="false">Disabled (Open Trading)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-trade-muted uppercase mb-1">
                System Maintenance Mode
              </label>
              <select
                value={settingsMap.maintenance_mode}
                onChange={(e) => setSettingsMap({...settingsMap, maintenance_mode: e.target.value})}
                className="input-field py-2 text-sm font-semibold text-trade-red"
              >
                <option value="false">Normal Operation (Live)</option>
                <option value="true">Maintenance Mode Active (Block Traders)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Global Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
