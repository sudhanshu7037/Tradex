import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Search, Loader2, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { adminPortfolioService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminPortfoliosPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminPortfolios', page, search],
    queryFn: () => adminPortfolioService.getPortfolios({
      page,
      search: search || undefined,
      per_page: 15
    }),
  });

  const portfolios = data?.data?.items || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-emerald-500" />
            Platform Asset Portfolios
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Review stock positions, quantities, and purchase valuations across all user portfolios.
          </p>
        </div>
      </div>

      <div className="glass-card p-4 border border-trade-border flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-muted" />
          <input
            type="text"
            placeholder="Search by ticker symbol or trader name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-trade-border shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-trade-muted">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Loading user portfolio allocations...</span>
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load portfolio records" retry={refetch} />
        ) : portfolios.length === 0 ? (
          <div className="p-12 text-center text-trade-muted">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-medium text-trade-text">No portfolio holdings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-trade-border bg-trade-bg/50 text-xs font-bold text-trade-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Trader Account</th>
                  <th className="py-3.5 px-6">Stock Symbol</th>
                  <th className="py-3.5 px-6">Quantity</th>
                  <th className="py-3.5 px-6">Avg Buy Price</th>
                  <th className="py-3.5 px-6">Total Cost Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trade-border/40 text-sm">
                {portfolios.map((p) => (
                  <tr key={p.id} className="hover:bg-trade-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-trade-text">{p.user?.name || `User #${p.user_id}`}</div>
                      <div className="text-xs text-trade-muted">{p.user?.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {p.stock_symbol}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-trade-text">
                      {p.quantity} shares
                    </td>
                    <td className="py-4 px-6 text-trade-muted">
                      ${Number(p.average_buy_price || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-bold text-trade-text">
                      ${(Number(p.quantity) * Number(p.average_buy_price || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
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

export default AdminPortfoliosPage;
