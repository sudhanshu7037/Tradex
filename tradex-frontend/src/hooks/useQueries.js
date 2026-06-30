import { useQuery } from '@tanstack/react-query';
import { dashboardService, portfolioService, transactionService } from '../services/apiServices';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData
  });
};

export const usePortfolio = () => {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioService.getPortfolio
  });
};

export const useTransactions = (page = 1) => {
  return useQuery({
    queryKey: ['transactions', page],
    queryFn: () => transactionService.getTransactions(page),
    keepPreviousData: true
  });
};
