import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistService } from '../services/apiServices';

export const useWatchlist = () => {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: watchlistService.getWatchlist
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: watchlistService.addToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: watchlistService.removeFromWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }
  });
};
