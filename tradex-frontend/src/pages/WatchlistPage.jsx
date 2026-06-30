import { useWatchlist, useRemoveFromWatchlist } from '../hooks/useWatchlist';
import { SkeletonCard } from '../components/shared/Skeletons';
import { ErrorState, EmptyState } from '../components/shared/States';
import { Link } from 'react-router-dom';
import { Star, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const WatchlistPage = () => {
  const { data, isLoading, isError, error, refetch } = useWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  if (isLoading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-trade-text">Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (isError) return <ErrorState message={error.message} retry={refetch} />;

  const watchlist = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-trade-text">Watchlist</h1>
        <p className="text-trade-muted">Stocks you are keeping an eye on.</p>
      </div>

      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <div key={item.id} className="glass-card p-5 group flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-trade-text">{item.stock_symbol}</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeMutation.mutate(item.id, {
                      onSuccess: () => toast.success(`${item.stock_symbol} removed`),
                      onError: () => toast.error(`Failed to remove ${item.stock_symbol}`)
                    });
                  }}
                  disabled={removeMutation.isPending}
                  className="p-1.5 text-trade-muted hover:text-trade-red hover:bg-trade-redBg rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 cursor-pointer"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <Link 
                to={`/stocks/${item.stock_symbol}`}
                className="mt-4 flex items-center justify-between text-sm font-medium text-trade-primary hover:underline"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Star} 
          title="Watchlist is empty" 
          description="Go to the Markets page to find stocks to track." 
        />
      )}
    </div>
  );
};

export default WatchlistPage;
