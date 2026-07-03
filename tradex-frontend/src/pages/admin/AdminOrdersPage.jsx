import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  Activity, Search, Filter, Ban, Eye, X, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const AdminOrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryClient = useQueryClient();

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['adminOrders', searchQuery, statusFilter, typeFilter],
    queryFn: () => adminOrderService.getOrders({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
    }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => adminOrderService.cancelOrder(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Order force cancelled');
      queryClient.invalidateQueries(['adminOrders']);
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    },
  });

  const orders = ordersResponse?.data?.items || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-trade-card p-6 rounded-2xl border border-trade-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-trade-text tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" />
            Order Book & Trade Execution Control
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Central control room to inspect BUY/SELL orders, filter by status, and force cancel pending executions.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-2xl border border-trade-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-trade-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Stock Symbol or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-trade-bg border border-trade-border rounded-xl text-sm text-trade-text focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-trade-muted hidden sm:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-trade-bg border border-trade-border rounded-xl px-3.5 py-2 text-sm text-trade-text focus:outline-none focus:border-emerald-500 transition-all w-full sm:w-36"
          >
            <option value="">All Types</option>
            <option value="BUY">BUY Orders</option>
            <option value="SELL">SELL Orders</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-trade-bg border border-trade-border rounded-xl px-3.5 py-2 text-sm text-trade-text focus:outline-none focus:border-emerald-500 transition-all w-full sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Executed">Executed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl border border-trade-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-trade-border bg-trade-bg/60 text-[11px] font-extrabold uppercase text-trade-muted tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Trader Account</th>
                <th className="py-4 px-6">Stock / Type</th>
                <th className="py-4 px-6">Quantity & Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Execution Time</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trade-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-trade-muted font-medium">
                    Loading order book...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-trade-muted font-medium">
                    No trading orders match the current filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-trade-primary/5 transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-trade-text">
                      #{order.id}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-trade-text">{order.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-trade-muted font-mono">{order.user?.email || `User #${order.user?.id || 'N/A'}`}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-trade-text tracking-wider">{order.stock_symbol}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase flex items-center gap-0.5 ${
                          order.transaction_type === 'BUY' 
                            ? 'bg-emerald-500/15 text-emerald-500' 
                            : 'bg-rose-500/15 text-rose-500'
                        }`}>
                          {order.transaction_type === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {order.transaction_type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-trade-text">{order.quantity} Shares</p>
                      <p className="text-xs font-mono text-trade-muted">@ ${Number(order.price_per_share || 0).toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        order.status === 'Executed'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : order.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {order.status === 'Executed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {order.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {order.status === 'Cancelled' && <Ban className="w-3.5 h-3.5" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-trade-muted font-mono">
                      {order.executed_at || 'Pending'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-trade-primary/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 border border-emerald-500/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        {order.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to force cancel Order #${order.id}?`)) {
                                cancelMutation.mutate(order.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 border border-rose-500/20"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Force Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 rounded-3xl border border-trade-border shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-trade-border">
              <h3 className="text-lg font-black text-trade-text flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Trade Execution Details #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl bg-trade-bg text-trade-muted hover:text-rose-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-trade-border/50">
                <span className="text-trade-muted font-medium">Trader Account</span>
                <span className="font-bold text-trade-text">{selectedOrder.user?.name} ({selectedOrder.user?.email})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-trade-border/50">
                <span className="text-trade-muted font-medium">Stock Asset</span>
                <span className="font-black text-emerald-500">{selectedOrder.stock_symbol}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-trade-border/50">
                <span className="text-trade-muted font-medium">Order Action</span>
                <span className={`font-extrabold ${selectedOrder.transaction_type === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {selectedOrder.transaction_type}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-trade-border/50">
                <span className="text-trade-muted font-medium">Quantity</span>
                <span className="font-bold text-trade-text">{selectedOrder.quantity} Shares</span>
              </div>
              <div className="flex justify-between py-2 border-b border-trade-border/50">
                <span className="text-trade-muted font-medium">Execution Price</span>
                <span className="font-mono font-bold text-trade-text">${Number(selectedOrder.price_per_share || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-trade-border/50">
                <span className="text-trade-muted font-medium">Total Execution Value</span>
                <span className="font-mono font-black text-emerald-500 text-base">
                  ${Number(selectedOrder.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-trade-muted font-medium">Order Status</span>
                <span className="font-bold uppercase text-trade-text">{selectedOrder.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-trade-border">
              {selectedOrder.status !== 'Cancelled' && (
                <button
                  onClick={() => {
                    cancelMutation.mutate(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Force Cancel Order</span>
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-trade-bg text-trade-text border border-trade-border hover:border-emerald-500"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
