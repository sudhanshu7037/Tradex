import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      setAuth(data.user, data.token);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-trade-text">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-trade-muted mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-trade-muted mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 mt-4 cursor-pointer"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-trade-muted">
        Don't have an account?{' '}
        <Link to="/register" className="text-trade-primary hover:underline font-medium cursor-pointer">
          Create one
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
