import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Search, Loader2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { adminWatchlistService } from '../../services/adminService';
import { ErrorState } from '../../components/shared/States';

const AdminWatchlistsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminWatchlists', page, search],
    queryFn: () => adminWatchlistService.getWatchlists({
      page,
      search: search || undefined,
      per_page: 15
    }),
  });

  const watchlists = data?.data?.items || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-trade-text tracking-tight flex items-center gap-2.5">
            <Eye className="w-7 h-7 text-emerald-500" />
            User Watchlists
          </h1>
          <p className="text-sm text-trade-muted mt-1">
            Monitor market symbol interests and watchlist trackers created by traders across the platform.
          </p>
        </div>
      </div>

      <div className="glass-card p-4 border border-trade-border flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-trade-muted" />
          <input
            type="text"
            placeholder="Search by stock symbol or user email..."
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
            <span>Loading user watchlists...</span>
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load watchlists" retry={refetch} />
        ) : watchlists.length === 0 ? (
          <div className="p-12 text-center text-trade-muted">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-medium text-trade-text">No watchlists tracked yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-trade-border bg-trade-bg/50 text-xs font-bold text-trade-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Trader Account</th>
                  <th className="py-3.5 px-6">Tracked Symbol</th>
                  <th className="py-3.5 px-6">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trade-border/40 text-sm">
                {watchlists.map((w) => (
                  <tr key={w.id} className="hover:bg-trade-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-trade-text">{w.user?.name || `User #${w.user_id}`}</div>
                      <div className="text-xs text-trade-muted">{w.user?.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 font-bold border border-amber-500/20 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {w.stock_symbol}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-trade-muted">
                      {w.created_at ? new Date(w.created_at).toLocaleString() : 'N/A'}
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

export default AdminWatchlistsPage;
