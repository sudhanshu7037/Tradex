import { useState } from 'react';
import { useTrade } from '../../hooks/useStockTrade';
import { useWalletStore } from '../../context/useWalletStore';
import toast from 'react-hot-toast';

const TradeModal = ({ symbol, currentPrice, onClose }) => {
  const [tab, setTab] = useState('BUY'); // 'BUY' | 'SELL'
  const [quantity, setQuantity] = useState(1);
  const { balance } = useWalletStore();
  const tradeMutation = useTrade();

  const estCost = (currentPrice * quantity).toFixed(2);
  const isValidQuantity = quantity > 0 && Number.isInteger(Number(quantity));
  const isSufficientBalance = tab === 'SELL' || (balance >= estCost);

  const handleTrade = () => {
    if (!isValidQuantity) return;
    tradeMutation.mutate({
      stock_symbol: symbol,
      transaction_type: tab,
      quantity: Number(quantity)
    }, {
      onSuccess: () => {
        toast.success(`Successfully ${tab === 'BUY' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}`);
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Trade execution failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-trade-primary/10 border border-trade-border rounded-lg p-1">
        <button
          onClick={() => setTab('BUY')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            tab === 'BUY' ? 'bg-trade-card shadow text-trade-primary font-bold' : 'text-trade-muted hover:text-trade-text'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTab('SELL')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            tab === 'SELL' ? 'bg-trade-card shadow text-trade-red font-bold' : 'text-trade-muted hover:text-trade-text'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-trade-muted">Current Price:</span>
          <span className="font-semibold">${Number(currentPrice || 0).toFixed(2)}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-trade-muted mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input-field text-right text-lg font-semibold"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-trade-muted">Estimated Cost:</span>
          <span className="font-semibold">${estCost}</span>
        </div>

        {tab === 'BUY' && (
          <div className="flex justify-between text-xs text-trade-muted pb-4 border-b border-gray-100">
            <span>Available Balance:</span>
            <span className={!isSufficientBalance ? 'text-trade-red' : ''}>
              ${Number(balance || 0).toFixed(2)}
            </span>
          </div>
        )}

        {tradeMutation.isError && (
          <div className="text-xs text-trade-red bg-trade-redBg p-2 rounded">
            {tradeMutation.error?.response?.data?.message || "Trade execution failed"}
          </div>
        )}
      </div>

      <button
        onClick={handleTrade}
        disabled={!isValidQuantity || !isSufficientBalance || tradeMutation.isPending}
        className={`w-full py-3 rounded-xl font-bold text-white transition-opacity cursor-pointer ${
          tab === 'BUY' ? 'bg-trade-primary' : 'bg-trade-red'
        } disabled:opacity-50`}
      >
        {tradeMutation.isPending ? 'Processing...' : `${tab} ${symbol}`}
      </button>
    </div>
  );
};

export default TradeModal;
