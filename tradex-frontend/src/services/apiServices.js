import api from '../api/axiosInstance';

export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export const portfolioService = {
  getPortfolio: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  }
};

export const transactionService = {
  getTransactions: async (page = 1) => {
    const response = await api.get('/transactions', { params: { page } });
    return response.data;
  }
};

export const watchlistService = {
  getWatchlist: async () => {
    const response = await api.get('/watchlist');
    return response.data;
  },
  
  addToWatchlist: async (stock_symbol) => {
    const response = await api.post('/watchlist', { stock_symbol });
    return response.data;
  },
  
  removeFromWatchlist: async (id) => {
    const response = await api.delete(`/watchlist/${id}`);
    return response.data;
  }
};
