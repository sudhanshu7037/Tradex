import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStockDetail } from '../hooks/useStockTrade';
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '../hooks/useWatchlist';
import TradingViewChart from '../components/stocks/TradingViewChart';
import Modal from '../components/shared/Modal';
import TradeModal from '../components/shared/TradeModal';
import { SkeletonStockCard } from '../components/shared/Skeletons';
import { ErrorState } from '../components/shared/States';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const StockDetailPage = () => {
  const { symbol } = useParams();
  const { data, isLoading, isError, error, refetch } = useStockDetail(symbol);
  const { data: watchlistData } = useWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const [isTradeOpen, setIsTradeOpen] = useState(false);

  if (isLoading) return <SkeletonStockCard />;
  if (isError) return <ErrorState message={error.message} retry={refetch} />;
  
  // According to StockController, API returns data inside a 'data' property
  const stock = data?.data;
  if (!stock) return <ErrorState message="Stock not found" />;

  const isInWatchlist = watchlistData?.data?.some(w => w.stock_symbol === symbol);

  const toggleWatchlist = () => {
    if (isInWatchlist) {
      const item = watchlistData.data.find(w => w.stock_symbol === symbol);
      removeFromWatchlist.mutate(item.id, {
        onSuccess: () => toast.success(`${symbol} removed from watchlist`),
        onError: () => toast.error(`Failed to remove ${symbol}`)
      });
    } else {
      addToWatchlist.mutate(symbol, {
        onSuccess: () => toast.success(`${symbol} added to watchlist`),
        onError: () => toast.error(`Failed to add ${symbol}`)
      });
    }
  };

  const isUp = stock.current_price >= stock.previous_close;
  const change = stock.current_price - stock.previous_close;
  const changePercent = (change / stock.previous_close) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-trade-text">{stock.symbol}</h1>
            <button 
              onClick={toggleWatchlist}
              disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isInWatchlist ? 'bg-yellow-500/20 text-yellow-500' : 'bg-trade-primary/10 text-trade-muted hover:text-yellow-500'
              }`}
            >
              <Star className={`w-5 h-5 ${isInWatchlist ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-3xl font-semibold">${Number(stock.current_price || 0).toFixed(2)}</span>
            <span className={`text-lg font-medium mb-1 ${isUp ? 'text-trade-primary' : 'text-trade-red'}`}>
              {isUp ? '+' : ''}{Number(change || 0).toFixed(2)} ({isUp ? '+' : ''}{Number(changePercent || 0).toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsTradeOpen(true)}
            className="flex-1 md:flex-none px-8 py-3 bg-trade-primary text-white font-bold rounded-xl hover:bg-trade-primary/90 transition-all shadow-lg shadow-trade-primary/20 cursor-pointer"
          >
            Trade
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: stock.open_price },
          { label: 'High', value: stock.high_price },
          { label: 'Low', value: stock.low_price },
          { label: 'Prev Close', value: stock.previous_close }
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className="text-xs text-trade-muted mb-1">{stat.label}</div>
            <div className="text-lg font-semibold text-trade-text">${Number(stat.value || 0).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-4 h-[500px]">
        <TradingViewChart symbol={symbol} />
      </div>

      {/* Trade Modal */}
      <Modal 
        isOpen={isTradeOpen} 
        onClose={() => setIsTradeOpen(false)}
        title={`Trade ${symbol}`}
      >
        <TradeModal 
          symbol={symbol} 
          currentPrice={stock.current_price} 
          onClose={() => setIsTradeOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default StockDetailPage;
