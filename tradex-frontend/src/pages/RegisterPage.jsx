import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-trade-text">Create Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-trade-muted mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-trade-muted mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-trade-muted mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            placeholder="Min 8 characters"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-trade-muted mb-1">Confirm Password</label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="input-field"
            placeholder="Repeat password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 mt-4 cursor-pointer"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-trade-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-trade-primary hover:underline font-medium cursor-pointer">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
