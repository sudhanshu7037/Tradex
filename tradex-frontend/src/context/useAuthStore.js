import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('tradex_token') || null,
  isAuthenticated: !!localStorage.getItem('tradex_token'),
  setAuth: (user, token) => {
    localStorage.setItem('tradex_token', token);
    set({ user, token, isAuthenticated: true });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('tradex_token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
