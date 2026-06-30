import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '../services/stockService';
import { tradeService } from '../services/tradeService';
import { useWalletStore } from '../context/useWalletStore';

export const useStockSearch = (query) => {
  return useQuery({
    queryKey: ['stockSearch', query],
    queryFn: () => stockService.searchStocks(query),
    enabled: !!query && query.length > 0,
    staleTime: 60000,
  });
};

export const useStockDetail = (symbol) => {
  return useQuery({
    queryKey: ['stockDetail', symbol],
    queryFn: () => stockService.getStockDetail(symbol),
    enabled: !!symbol,
    refetchInterval: 30000, // Refresh every 30s
  });
};

export const useTrade = () => {
  const queryClient = useQueryClient();
  const setBalance = useWalletStore(state => state.setBalance);
  
  return useMutation({
    mutationFn: tradeService.executeTrade,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      // Update global wallet balance if provided in response
      if (data?.data?.wallet_balance !== undefined) {
        setBalance(data.data.wallet_balance);
      }
    }
  });
};
