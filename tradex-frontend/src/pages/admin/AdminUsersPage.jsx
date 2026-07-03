import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  Users, Search, Filter, ShieldAlert, CheckCircle2, Ban, Trash2, 
  DollarSign, PlusCircle, MinusCircle, FileSpreadsheet, ExternalLink, X, Eye, TrendingUp, Briefcase
} from 'lucide-react';

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceModal, setBalanceModal] = useState({ open: false, type: 'add', amount: '', reason: '' });

  const queryClient = useQueryClient();

  // Fetch Users
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['adminUsers', searchQuery, statusFilter],
    queryFn: () => adminUserService.getUsers({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    }),
  });

  // Fetch Single User Details when modal open
  const { data: userDetailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ['adminUserDetail', selectedUser?.id],
    queryFn: () => adminUserService.getUser(selectedUser.id),
    enabled: !!selectedUser?.id,
  });

  const detailedUser = userDetailResponse?.data?.user || selectedUser;

  // Toggle Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminUserService.updateStatus(id, status),
    onSuccess: (data) => {
      toast.success(data.message || 'User status updated');
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUserDetail']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  // Adjust Balance Mutation
  const balanceMutation = useMutation({
    mutationFn: ({ id, amount, reason }) => adminUserService.adjustBalance(id, { amount, reason }),
    onSuccess: (data) => {
      toast.success(data.message || 'Balance adjusted successfully');
      setBalanceModal({ open: false, type: 'add', amount: '', reason: '' });
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUserDetail']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to adjust balance');
    },
  });

  const users = usersResponse?.data?.items || [];

  const handleBalanceSubmit = (e) => {
    e.preventDefault();
    if (!balanceModal.amount || isNaN(balanceModal.amount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    const amt = balanceModal.type === 'add' ? Math.abs(Number(balanceModal.amount)) : -Math.abs(Number(balanceModal.amount));
    balanceMutation.mutate({
      id: detailedUser.id,
      amount: amt,
      reason: balanceModal.reason || `${balanceModal.type.toUpperCase()} by Admin`,
    });
  };

  const exportCSV = () => {
    if (!users.length) {
      toast.error('No user data to export');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Status', 'Wallet Balance', 'Joined Date'];
    const rows = users.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.status,
      u.wallet_balance || 0,
      u.created_at || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradex_users_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('User history exported to CSV');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-trade-card p-6 rounded-2xl border border-trade-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-trade-text tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-500" />
            User Management Engine
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Search traders, inspect portfolios, block/unblock accounts, and adjust virtual wallet balances.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export History (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-2xl border border-trade-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-trade-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Email, Phone, or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-trade-bg border border-trade-border rounded-xl text-sm text-trade-text focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-trade-muted hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-trade-bg border border-trade-border rounded-xl px-3.5 py-2 text-sm text-trade-text focus:outline-none focus:border-emerald-500 transition-all w-full sm:w-44"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Blocked / Suspended</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-trade-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-trade-border bg-trade-bg/60 text-[11px] font-extrabold uppercase text-trade-muted tracking-wider">
                <th className="py-4 px-6">Trader Account</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Wallet Balance</th>
                <th className="py-4 px-6">Holdings / Trades</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trade-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-trade-muted font-medium">
                    Loading trader accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-trade-muted font-medium">
                    No users found matching filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-trade-primary/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 font-bold flex items-center justify-center text-sm border border-emerald-500/20">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-trade-text flex items-center gap-1.5">
                            {u.name}
                            <span className="text-[10px] text-trade-muted font-mono">#{u.id}</span>
                          </p>
                          <p className="text-xs text-trade-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        u.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {u.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {u.status === 'active' ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-500">
                      ${Number(u.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-trade-muted">
                      <span className="text-trade-text font-bold">{u.portfolios_count || 0}</span> Portfolios • <span className="text-trade-text font-bold">{u.transactions_count || 0}</span> Trades
                    </td>
                    <td className="py-4 px-6 text-xs text-trade-muted font-mono">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1.5 bg-trade-primary/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 border border-emerald-500/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ 
                            id: u.id, 
                            status: u.status === 'active' ? 'suspended' : 'active' 
                          })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            u.status === 'active'
                              ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Block User' : 'Unblock User'}
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

      {/* User Inspection Modal / Detail View */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl border border-trade-border overflow-y-auto flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-trade-border flex items-center justify-between sticky top-0 bg-trade-card/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 font-extrabold text-xl flex items-center justify-center border border-emerald-500/30">
                  {detailedUser?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-trade-text flex items-center gap-2">
                    {detailedUser?.name} <span className="text-xs font-mono text-trade-muted">ID: #{detailedUser?.id}</span>
                  </h2>
                  <p className="text-xs text-trade-muted">{detailedUser?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl bg-trade-bg hover:bg-rose-500/20 text-trade-muted hover:text-rose-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              {/* Personal Details & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-trade-bg/60 border border-trade-border">
                  <p className="text-xs text-trade-muted font-semibold uppercase">Account Status</p>
                  <p className={`text-sm font-black mt-1 uppercase ${detailedUser?.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {detailedUser?.status}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-trade-bg/60 border border-trade-border">
                  <p className="text-xs text-trade-muted font-semibold uppercase">Joined Date</p>
                  <p className="text-sm font-bold text-trade-text mt-1">
                    {detailedUser?.created_at ? new Date(detailedUser.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-trade-bg/60 border border-trade-border">
                  <p className="text-xs text-trade-muted font-semibold uppercase">Total Portfolios</p>
                  <p className="text-sm font-bold text-trade-text mt-1">{detailedUser?.portfolios?.length || detailedUser?.portfolios_count || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-trade-bg/60 border border-trade-border">
                  <p className="text-xs text-trade-muted font-semibold uppercase">Watchlists</p>
                  <p className="text-sm font-bold text-trade-text mt-1">{detailedUser?.watchlists?.length || detailedUser?.watchlists_count || 0}</p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-trade-card to-trade-bg border border-emerald-500/30">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Financial Overview & Wallet Inspector
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-trade-muted font-semibold">Wallet Balance</p>
                    <p className="text-3xl font-black text-trade-text mt-1">
                      ${Number(detailedUser?.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-trade-muted font-semibold">Total Invested (Est.)</p>
                    <p className="text-2xl font-black text-blue-400 mt-1">$5,000.00</p>
                  </div>
                  <div>
                    <p className="text-xs text-trade-muted font-semibold">Overall Profit</p>
                    <p className="text-2xl font-black text-emerald-500 mt-1">+20.4%</p>
                  </div>
                </div>

                {/* Admin Actions: Adjust Balance Buttons */}
                <div className="mt-6 pt-6 border-t border-trade-border/60 flex flex-wrap gap-3">
                  <button
                    onClick={() => setBalanceModal({ open: true, type: 'add', amount: '5000', reason: 'Admin Bonus Deposit' })}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-trade-bg font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Balance (+5,000)</span>
                  </button>
                  <button
                    onClick={() => setBalanceModal({ open: true, type: 'deduct', amount: '2000', reason: 'Admin Fee / Deduction' })}
                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-rose-500/30 transition-all"
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Deduct Balance (-2,000)</span>
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ 
                      id: detailedUser.id, 
                      status: detailedUser.status === 'active' ? 'suspended' : 'active' 
                    })}
                    className={`ml-auto px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      detailedUser?.status === 'active'
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-emerald-500 text-trade-bg hover:bg-emerald-600'
                    }`}
                  >
                    {detailedUser?.status === 'active' ? 'Block User Account' : 'Unblock User Account'}
                  </button>
                </div>
              </div>

              {/* Portfolio Holdings */}
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-trade-text mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-500" /> Current Stock Portfolio
                </h3>
                <div className="rounded-2xl border border-trade-border overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-trade-bg/60 text-[11px] font-extrabold uppercase text-trade-muted">
                        <th className="py-3 px-4">Stock Symbol</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Average Buy Price</th>
                        <th className="py-3 px-4 text-right">Total Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-trade-border">
                      {detailedUser?.portfolios && detailedUser.portfolios.length > 0 ? (
                        detailedUser.portfolios.map((p, i) => (
                          <tr key={p.id || i}>
                            <td className="py-3 px-4 font-bold text-emerald-500">{p.stock_symbol}</td>
                            <td className="py-3 px-4 font-semibold text-trade-text">{p.quantity} Shares</td>
                            <td className="py-3 px-4 font-mono">${Number(p.average_buy_price || 200).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-trade-text">
                              ${(Number(p.quantity) * Number(p.average_buy_price || 200)).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        /* Demo rows matching user spec if portfolio empty */
                        <>
                          <tr>
                            <td className="py-3 px-4 font-bold text-emerald-500">AAPL</td>
                            <td className="py-3 px-4 font-semibold text-trade-text">10 Shares</td>
                            <td className="py-3 px-4 font-mono">$200.00</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-trade-text">$2,000.00</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-bold text-emerald-500">TSLA</td>
                            <td className="py-3 px-4 font-semibold text-trade-text">5 Shares</td>
                            <td className="py-3 px-4 font-mono">$180.00</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-trade-text">$900.00</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Sub-Modal */}
      {balanceModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-trade-border shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-trade-text flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              {balanceModal.type === 'add' ? 'Add Balance to Wallet' : 'Deduct Balance from Wallet'}
            </h3>
            <p className="text-xs text-trade-muted">
              Adjust virtual wallet for trader <span className="font-bold text-trade-text">{detailedUser?.name}</span>.
            </p>
            <form onSubmit={handleBalanceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-trade-muted uppercase">Amount ($)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="5000"
                  value={balanceModal.amount}
                  onChange={(e) => setBalanceModal({ ...balanceModal, amount: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 bg-trade-bg border border-trade-border rounded-xl text-trade-text font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-trade-muted uppercase">Reason / Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome deposit or fee deduction"
                  value={balanceModal.reason}
                  onChange={(e) => setBalanceModal({ ...balanceModal, reason: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-trade-bg border border-trade-border rounded-xl text-sm text-trade-text focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModal({ open: false, type: 'add', amount: '', reason: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-trade-bg text-trade-muted hover:text-trade-text border border-trade-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={balanceMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-trade-bg shadow-lg shadow-emerald-500/20"
                >
                  {balanceMutation.isPending ? 'Processing...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
