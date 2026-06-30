import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './context/useAuthStore';
import { authService } from './services/authService';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages (placeholders for now)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketsPage from './pages/MarketsPage';
import StockDetailPage from './pages/StockDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import TransactionsPage from './pages/TransactionsPage';
import WatchlistPage from './pages/WatchlistPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        try {
          const res = await authService.getProfile();
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, setUser, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/stocks/:symbol" element={<StockDetailPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
