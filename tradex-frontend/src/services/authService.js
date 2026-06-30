import api from '../api/axiosInstance';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  register: async (data) => {
    const response = await api.post('/register', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  }
};
