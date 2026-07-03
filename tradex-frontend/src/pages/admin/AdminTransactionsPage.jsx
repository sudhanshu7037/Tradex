import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Search, Filter, Loader2, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adminTransactionService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminTransactionsPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminTransactions', page, search, typeFilter],
    queryFn: () => adminTransactionService.getTransactions({
      page,
      search: search || undefined,
      transaction_type: typeFilter || undefined,
      per_page: 15
    }),
  });

  const transactions = data?.data?.items || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-500" />
            Transaction Ledger
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Auditing all executed BUY and SELL order records across platform users.
          </p>
        </div>
      </div>

      <div className="glass-card p-4 border border-trade-border flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-muted" />
          <input
            type="text"
            placeholder="Search symbol or trader email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-trade-muted hidden sm:block" />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="input-field py-2 text-sm w-full md:w-44"
          >
            <option value="">All Order Types</option>
            <option value="BUY">BUY Orders Only</option>
            <option value="SELL">SELL Orders Only</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-trade-border shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-trade-muted">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Loading transaction history...</span>
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load transaction ledger" retry={refetch} />
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-trade-muted">
            <History className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-medium text-trade-text">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-trade-border bg-trade-bg/50 text-xs font-bold text-trade-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Order Type</th>
                  <th className="py-3.5 px-6">Trader Account</th>
                  <th className="py-3.5 px-6">Stock Symbol</th>
                  <th className="py-3.5 px-6">Quantity</th>
                  <th className="py-3.5 px-6">Execution Price</th>
                  <th className="py-3.5 px-6">Total Value</th>
                  <th className="py-3.5 px-6">Executed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trade-border/40 text-sm">
                {transactions.map((tx) => {
                  const isBuy = tx.transaction_type?.toUpperCase() === 'BUY';
                  return (
                    <tr key={tx.id} className="hover:bg-trade-bg/40 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isBuy 
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-trade-red/15 text-trade-red border border-trade-red/20'
                        }`}>
                          {isBuy ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-trade-text">{tx.user?.name || `User #${tx.user_id}`}</div>
                        <div className="text-xs text-trade-muted">{tx.user?.email}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-trade-text">
                        {tx.stock_symbol}
                      </td>
                      <td className="py-4 px-6 text-trade-muted">
                        {tx.quantity}
                      </td>
                      <td className="py-4 px-6 text-trade-muted">
                        ${Number(tx.price_per_share || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-trade-text">
                        ${Number(tx.total_value || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-xs text-trade-muted whitespace-nowrap">
                        {tx.executed_at ? new Date(tx.executed_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-trade-border flex items-center justify-between text-xs text-trade-muted">
            <div>
              Showing page <span className="font-bold text-trade-text">{pagination.current_page}</span> of <span className="font-bold text-trade-text">{pagination.last_page}</span>
            </div>
            <div className="flex gap-2">
              <button disabled={pagination.current_page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-secondary px-3 py-1.5 flex items-center gap-1 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 flex items-center gap-1 disabled:opacity-40">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
