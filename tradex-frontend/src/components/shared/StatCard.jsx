export const StatCard = ({ title, value, prefix = '', suffix = '', icon: Icon, trend }) => {
  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-trade-muted">{title}</h3>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-trade-primary/10 border border-trade-primary/20 flex items-center justify-center shadow-inner">
            <Icon className="w-5 h-5 text-trade-primary" />
          </div>
        )}
      </div>
      
      <div>
        <div className="text-2xl font-bold text-trade-text">
          {prefix}{value}{suffix}
        </div>
        {trend !== undefined && (
          <div className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-trade-primary' : 'text-trade-red'}`}>
            {trend >= 0 ? '+' : ''}{trend}% from last month
          </div>
        )}
      </div>
    </div>
  );
};
