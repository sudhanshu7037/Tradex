import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { usePortfolio } from '../../hooks/useQueries';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#1D9E75', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#6366F1'];

const AssetAllocationChart = () => {
  const { data: rawData, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="glass-card p-6 h-[400px] flex items-center justify-center animate-pulse">
        <div className="w-40 h-40 rounded-full border-8 border-trade-primary/20"></div>
      </div>
    );
  }

  const portfolio = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

  // Calculate allocation values
  const chartData = portfolio
    .filter(item => Number(item.total_quantity) > 0)
    .map(item => ({
      name: item.stock_symbol,
      value: Number((Number(item.total_quantity) * Number(item.average_buy_price)).toFixed(2)),
      quantity: item.total_quantity
    }));

  const totalPortfolioValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="glass-card p-6 flex flex-col h-full border border-trade-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-trade-text flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-trade-primary" />
            Asset Allocation
          </h3>
          <p className="text-xs text-trade-muted mt-0.5">Distribution of holdings by invested value</p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="var(--card-main)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Invested Value']}
                  contentStyle={{
                    backgroundColor: 'var(--card-main)',
                    borderColor: 'var(--border-main)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-main)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {chartData.map((entry, index) => {
              const percentage = totalPortfolioValue > 0 ? ((entry.value / totalPortfolioValue) * 100).toFixed(1) : 0;
              return (
                <div key={entry.name} className="flex items-center justify-between p-2.5 rounded-lg bg-trade-primary/5 border border-trade-border">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <div className="font-bold text-sm text-trade-text">{entry.name}</div>
                      <div className="text-xs text-trade-muted">{entry.quantity} shares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-trade-text">${entry.value.toLocaleString()}</div>
                    <div className="text-xs font-bold text-trade-primary">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-trade-primary/10 border border-trade-primary/20 flex items-center justify-center mb-3">
            <PieIcon className="w-7 h-7 text-trade-primary" />
          </div>
          <h4 className="font-bold text-trade-text mb-1">No Active Holdings</h4>
          <p className="text-xs text-trade-muted max-w-xs">
            Buy stocks from the market to view your real-time portfolio weightage and asset allocation graph.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssetAllocationChart;
