import { useState } from 'react';
import { useTransactions } from '../hooks/useQueries';
import { SkeletonTable } from '../components/shared/Skeletons';
import { ErrorState, EmptyState } from '../components/shared/States';
import { Badge } from '../components/shared/Badge';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

const TransactionsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useTransactions(page);

  if (isLoading && !isFetching) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-trade-text">Transactions</h1>
      <div className="glass-card"><SkeletonTable rows={6} /></div>
    </div>
  );

  if (isError) return <ErrorState message={error.message} retry={refetch} />;

  const transactions = data?.data?.data || [];
  const meta = data?.data; // Laravel paginator usually includes meta info if configured, otherwise we use next_page_url

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-trade-text">Transaction History</h1>
        <p className="text-trade-muted">View your past trades and activities.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {transactions.length > 0 ? (
          <>
            <div className={`overflow-x-auto ${isFetching ? 'opacity-50' : ''}`}>
              <table className="w-full text-left text-sm">
                <thead className="bg-trade-primary/5 border-b border-trade-border text-trade-muted font-medium">
                  <tr>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Total Value</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-trade-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-trade-primary/10 transition-colors">
                      <td className="px-6 py-4">
                        <Badge type={tx.transaction_type}>{tx.transaction_type}</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-trade-text">{tx.stock_symbol}</td>
                      <td className="px-6 py-4 text-trade-text">{tx.quantity}</td>
                      <td className="px-6 py-4 text-trade-text">${Number(tx.price_per_share || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 font-medium">${Number(tx.total_value || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-trade-muted text-right">
                        {new Date(tx.executed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-trade-border flex items-center justify-between">
              <span className="text-sm text-trade-muted">
                Page {meta?.current_page || page}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(old => Math.max(old - 1, 1))}
                  disabled={page === 1 || isFetching}
                  className="p-2 border border-trade-border rounded-lg hover:bg-trade-primary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(old => old + 1)}
                  disabled={!meta?.next_page_url || isFetching}
                  className="p-2 border border-trade-border rounded-lg hover:bg-trade-primary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState 
            icon={History} 
            title="No Transactions" 
            description="You haven't made any trades yet." 
          />
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
