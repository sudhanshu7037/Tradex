import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '../services/stockService';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; // We need to create this
import { SkeletonStockCard } from '../components/shared/Skeletons';
import { EmptyState } from '../components/shared/States';

const MarketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['stockSearch', debouncedSearch],
    queryFn: () => stockService.searchStocks(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-trade-text">Markets</h1>
        <p className="text-trade-muted">Discover and search for stocks to trade.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-4 bg-trade-card text-trade-text border border-trade-border rounded-xl focus:outline-none focus:ring-2 focus:ring-trade-primary focus:border-transparent shadow-sm text-lg"
          placeholder="Search for stocks (e.g., TSLA, AAPL)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mt-8">
        {isLoading && debouncedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonStockCard />
            <SkeletonStockCard />
            <SkeletonStockCard />
          </div>
        )}

        {data?.data?.result && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.result.map((stock) => (
              <Link 
                key={stock.symbol} 
                to={`/stocks/${stock.symbol}`}
                className="block"
              >
                <div className="glass-card p-5 hover:shadow-md hover:border-trade-primary/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-trade-text">{stock.symbol}</h3>
                      <p className="text-sm text-trade-muted line-clamp-1 mt-1">{stock.description}</p>
                    </div>
                    <span className="text-xs bg-trade-primary/10 text-trade-primary px-2 py-1 rounded font-medium">
                      {stock.type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {debouncedSearch && data?.data?.result?.length === 0 && (
          <EmptyState title="No stocks found" description={`Could not find any stocks matching "${debouncedSearch}".`} />
        )}

        {!debouncedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Some default popular stocks to show when not searching */}
            {['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'].map((symbol) => (
              <Link 
                key={symbol} 
                to={`/stocks/${symbol}`}
                className="block"
              >
                <div className="glass-card p-5 hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                  <h3 className="text-lg font-bold text-trade-text">{symbol}</h3>
                  <div className="w-8 h-8 rounded-full bg-trade-primary/10 border border-trade-primary/20 flex items-center justify-center">
                    <Search className="w-4 h-4 text-trade-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketsPage;
