export const SkeletonCard = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-4 w-1/3 bg-trade-primary/10 rounded mb-4"></div>
    <div className="h-8 w-1/2 bg-trade-primary/20 rounded mb-2"></div>
    <div className="h-4 w-1/4 bg-trade-primary/10 rounded"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="w-full">
    <div className="h-10 bg-trade-primary/5 rounded-t-xl border-b border-trade-border"></div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex justify-between items-center p-4 border-b border-trade-border animate-pulse">
        <div className="h-4 w-1/4 bg-trade-primary/10 rounded"></div>
        <div className="h-4 w-1/4 bg-trade-primary/10 rounded"></div>
        <div className="h-4 w-1/4 bg-trade-primary/10 rounded"></div>
      </div>
    ))}
  </div>
);

export const SkeletonStockCard = () => (
  <div className="glass-card p-4 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 w-1/3 bg-trade-primary/20 rounded"></div>
      <div className="h-6 w-1/4 bg-trade-primary/10 rounded"></div>
    </div>
    <div className="h-4 w-2/3 bg-trade-primary/10 rounded mb-2"></div>
    <div className="flex gap-2">
      <div className="h-8 w-full bg-trade-primary/10 rounded"></div>
    </div>
  </div>
);
