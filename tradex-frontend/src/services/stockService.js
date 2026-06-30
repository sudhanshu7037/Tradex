import api from '../api/axiosInstance';

export const stockService = {
  searchStocks: async (query) => {
    const response = await api.get('/stocks/search', { params: { query } });
    return response.data;
  },
  
  getStockDetail: async (symbol) => {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  }
};
