import { AlertCircle } from 'lucide-react';

export const ErrorState = ({ message = "Something went wrong.", retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-trade-redBg rounded-xl border border-trade-red/20">
    <AlertCircle className="w-10 h-10 text-trade-red mb-3" />
    <h3 className="text-lg font-semibold text-trade-red mb-1">Error</h3>
    <p className="text-trade-red/80 mb-4">{message}</p>
    {retry && (
      <button onClick={retry} className="px-4 py-2 bg-trade-red text-white rounded-lg text-sm font-medium hover:bg-trade-red/90 transition-colors">
        Try Again
      </button>
    )}
  </div>
);

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center glass-card border-dashed">
    <div className="w-16 h-16 bg-trade-primary/10 border border-trade-primary/20 rounded-full flex items-center justify-center mb-4">
      {Icon && <Icon className="w-8 h-8 text-trade-primary" />}
    </div>
    <h3 className="text-lg font-semibold text-trade-text mb-1">{title}</h3>
    <p className="text-trade-muted max-w-sm">{description}</p>
  </div>
);
