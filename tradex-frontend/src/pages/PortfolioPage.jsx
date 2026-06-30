import { useState } from 'react';
import { usePortfolio } from '../hooks/useQueries';
import { SkeletonTable } from '../components/shared/Skeletons';
import { ErrorState, EmptyState } from '../components/shared/States';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '../components/shared/Badge';

const PortfolioPage = () => {
  const { data, isLoading, isError, error, refetch } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-trade-text">Portfolio</h1>
      <div className="glass-card"><SkeletonTable rows={4} /></div>
    </div>
  );

  if (isError) return <ErrorState message={error.message} retry={refetch} />;

  const portfolio = data?.data || [];

  const filteredPortfolio = portfolio.filter(item => 
    item.stock_symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-trade-text">Your Portfolio</h1>
          <p className="text-trade-muted">Manage your current holdings.</p>
        </div>
        
        <input
          type="text"
          placeholder="Filter symbol..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      <div className="glass-card overflow-hidden">
        {filteredPortfolio.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-trade-primary/5 border-b border-trade-border text-trade-muted font-medium">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Avg Buy Price</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trade-border">
                {filteredPortfolio.map((item) => (
                  <tr key={item.id} className="hover:bg-trade-primary/10 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/stocks/${item.stock_symbol}`} className="font-bold text-trade-text hover:text-trade-primary">
                        {item.stock_symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-trade-text">{item.total_quantity}</td>
                    <td className="px-6 py-4 font-medium">${Number(item.average_buy_price || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Link to={`/stocks/${item.stock_symbol}`} className="text-trade-primary hover:underline font-medium text-sm">
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            icon={Briefcase} 
            title="Empty Portfolio" 
            description={searchTerm ? "No matching stocks found." : "You haven't bought any stocks yet."} 
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
