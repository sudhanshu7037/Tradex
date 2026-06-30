import api from '../api/axiosInstance';

export const tradeService = {
  executeTrade: async ({ stock_symbol, quantity, transaction_type }) => {
    const response = await api.post('/trade/execute', {
      stock_symbol,
      quantity: Number(quantity),
      transaction_type
    });
    return response.data;
  }
};
