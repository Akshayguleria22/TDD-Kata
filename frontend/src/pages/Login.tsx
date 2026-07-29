import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogIn, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      login(token, user);
      navigate('/inventory');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-polka-dots px-4">
      <div className="max-w-md w-full bg-white border-2 border-foreground rounded-2xl shadow-pop-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border-2 border-accent text-accent mb-4">
            <LogIn size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-foreground">Welcome Back</h2>
          <p className="text-foreground/50 mt-2 font-body font-medium">Sign in to manage inventory</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 border-2 border-red-300 p-4 rounded-xl mb-6 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5 font-body">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-body transition-all outline-none focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6]"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5 font-body">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-body transition-all outline-none focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-bold border-2 border-foreground rounded-full py-3 shadow-pop transition-all duration-200 flex items-center justify-center hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-pop-hover active:translate-y-0.5 active:translate-x-0.5 active:shadow-pop-active disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-pop"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} strokeWidth={2.5} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-foreground/60 text-sm font-body">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-secondary font-bold transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
