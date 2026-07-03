import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAssetService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  Coins, Search, PlusCircle, ShieldAlert, CheckCircle2, Ban, DollarSign, Edit3, X, Lock, Unlock, AlertTriangle, TrendingUp
} from 'lucide-react';

const AdminAssetsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addModal, setAddModal] = useState({ open: false, symbol: '', name: '', sector: 'Technology', current_price: '' });
  const [overrideModal, setOverrideModal] = useState({ open: false, asset: null, price: '' });

  const queryClient = useQueryClient();

  const { data: assetsResponse, isLoading } = useQuery({
    queryKey: ['adminAssets', searchQuery],
    queryFn: () => adminAssetService.getAssets({ search: searchQuery || undefined }),
  });

  const assets = assetsResponse?.data?.items || [];
  const marketFrozen = assetsResponse?.data?.market_frozen || false;

  const addMutation = useMutation({
    mutationFn: (payload) => adminAssetService.addAsset(payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Stock added');
      setAddModal({ open: false, symbol: '', name: '', sector: 'Technology', current_price: '' });
      queryClient.invalidateQueries(['adminAssets']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add stock');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminAssetService.updateAsset(id, payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Asset updated');
      setOverrideModal({ open: false, asset: null, price: '' });
      queryClient.invalidateQueries(['adminAssets']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update asset');
    },
  });

  const freezeMutation = useMutation({
    mutationFn: (freeze) => adminAssetService.freezeMarket(freeze),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['adminAssets']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to toggle market freeze');
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addModal.symbol || !addModal.name || !addModal.current_price) {
      toast.error('Please fill all required fields');
      return;
    }
    addMutation.mutate({
      symbol: addModal.symbol,
      name: addModal.name,
      sector: addModal.sector,
      current_price: Number(addModal.current_price),
    });
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    if (!overrideModal.price || isNaN(overrideModal.price)) {
      toast.error('Enter valid price');
      return;
    }
    updateMutation.mutate({
      id: overrideModal.asset.id,
      payload: { override_price: Number(overrideModal.price) },
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Emergency Freeze Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        marketFrozen
          ? 'bg-rose-500/15 border-rose-500 text-rose-500 shadow-xl shadow-rose-500/10'
          : 'bg-trade-card border-trade-border text-trade-text'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${marketFrozen ? 'bg-rose-500 text-white animate-bounce' : 'bg-emerald-500/15 text-emerald-500'}`}>
            {marketFrozen ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black flex items-center gap-2">
              {marketFrozen ? '🚨 EMERGENCY GLOBAL MARKET FREEZE ACTIVE' : 'Global Trading Engine Active'}
            </h2>
            <p className="text-xs text-trade-muted mt-0.5">
              {marketFrozen 
                ? 'All live order matching, buy executions, and stock purchases across TRADEX are temporarily disabled.' 
                : 'Traders can freely submit BUY and SELL orders across all enabled stock assets.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const nextState = !marketFrozen;
            if (confirm(`Are you sure you want to ${nextState ? 'FREEZE' : 'UNFREEZE'} entire platform trading?`)) {
              freezeMutation.mutate(nextState);
            }
          }}
          className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
            marketFrozen
              ? 'bg-emerald-500 hover:bg-emerald-600 text-trade-bg shadow-emerald-500/20'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
          }`}
        >
          {marketFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{marketFrozen ? 'Unfreeze Market Now' : 'Freeze Entire Market'}</span>
        </button>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-trade-card p-6 rounded-2xl border border-trade-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-trade-text tracking-tight flex items-center gap-3">
            <Coins className="w-8 h-8 text-emerald-500" />
            Stock Asset Management
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Add new tradable stocks, disable specific assets, or override market ticker pricing.
          </p>
        </div>
        <button
          onClick={() => setAddModal({ open: true, symbol: '', name: '', sector: 'Technology', current_price: '' })}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-trade-bg font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Stock Asset</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-trade-border flex items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-trade-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets by Symbol (e.g. AAPL) or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-trade-bg border border-trade-border rounded-xl text-sm text-trade-text focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="glass-card rounded-2xl border border-trade-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-trade-border bg-trade-bg/60 text-[11px] font-extrabold uppercase text-trade-muted tracking-wider">
                <th className="py-4 px-6">Stock Symbol</th>
                <th className="py-4 px-6">Company Name</th>
                <th className="py-4 px-6">Sector</th>
                <th className="py-4 px-6">Current Price</th>
                <th className="py-4 px-6">Trading Status</th>
                <th className="py-4 px-6 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trade-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-trade-muted font-medium">
                    Loading stock assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-trade-muted font-medium">
                    No assets found matching query.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-trade-primary/5 transition-colors group">
                    <td className="py-4 px-6 font-mono font-black text-emerald-500 text-base">
                      {asset.symbol}
                    </td>
                    <td className="py-4 px-6 font-bold text-trade-text">
                      {asset.name}
                    </td>
                    <td className="py-4 px-6 text-xs text-trade-muted font-medium">
                      {asset.sector || 'Technology'}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-trade-text">
                      ${Number(asset.current_price || 100).toFixed(2)}
                      {asset.override_price && (
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">
                          OVERRIDDEN
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        asset.is_active !== false && !marketFrozen
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {asset.is_active !== false && !marketFrozen ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {asset.is_active !== false && !marketFrozen ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setOverrideModal({ open: true, asset, price: asset.current_price })}
                          className="px-3 py-1.5 bg-trade-primary/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 border border-emerald-500/20"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Override Price</span>
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: asset.id, payload: { is_active: asset.is_active === false ? true : false } })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            asset.is_active !== false
                              ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border-emerald-500/20'
                          }`}
                        >
                          {asset.is_active !== false ? 'Disable Stock' : 'Enable Stock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {addModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-trade-border shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-trade-text flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" /> Add New Stock Asset
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-trade-muted uppercase">Stock Symbol (Ticker)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. META"
                  value={addModal.symbol}
                  onChange={(e) => setAddModal({ ...addModal, symbol: e.target.value.toUpperCase() })}
                  className="w-full mt-1 px-4 py-2.5 bg-trade-bg border border-trade-border rounded-xl text-trade-text font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-trade-muted uppercase">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meta Platforms Inc."
                  value={addModal.name}
                  onChange={(e) => setAddModal({ ...addModal, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-trade-bg border border-trade-border rounded-xl text-trade-text focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-trade-muted uppercase">Initial Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="500.00"
                    value={addModal.current_price}
                    onChange={(e) => setAddModal({ ...addModal, current_price: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-trade-bg border border-trade-border rounded-xl text-trade-text font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-trade-muted uppercase">Sector</label>
                  <input
                    type="text"
                    placeholder="Technology"
                    value={addModal.sector}
                    onChange={(e) => setAddModal({ ...addModal, sector: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 bg-trade-bg border border-trade-border rounded-xl text-trade-text focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModal({ open: false, symbol: '', name: '', sector: 'Technology', current_price: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-trade-bg text-trade-muted border border-trade-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-trade-bg shadow-lg shadow-emerald-500/20"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Price Modal */}
      {overrideModal.open && overrideModal.asset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-trade-border shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-trade-text flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-500" /> Override Stock Price
            </h3>
            <p className="text-xs text-trade-muted">
              Manual ticker override for <span className="font-bold text-trade-text">{overrideModal.asset.symbol}</span> ({overrideModal.asset.name}).
            </p>
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-trade-muted uppercase">New Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="215.40"
                  value={overrideModal.price}
                  onChange={(e) => setOverrideModal({ ...overrideModal, price: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-trade-bg border border-trade-border rounded-xl text-trade-text font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModal({ open: false, asset: null, price: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-trade-bg text-trade-muted border border-trade-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-trade-bg shadow-lg shadow-emerald-500/20"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssetsPage;
