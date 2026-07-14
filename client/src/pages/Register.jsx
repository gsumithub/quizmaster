import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, User, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, role } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(username, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Spheres */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 p-3 rounded-2xl shadow-xl shadow-primary-600/20 mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white text-center">Create account</h2>
          <p className="mt-2 text-sm text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
              Sign In
            </Link>
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center space-x-2 bg-red-950/40 border border-red-900/30 text-red-400 p-4 rounded-2xl text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-dark-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="bg-dark-900/80 border border-dark-850 hover:border-dark-750 focus:border-primary-500 text-dark-50 w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-dark-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="bg-dark-900/80 border border-dark-850 hover:border-dark-750 focus:border-primary-500 text-dark-50 w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-dark-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-dark-900/80 border border-dark-850 hover:border-dark-750 focus:border-primary-500 text-dark-50 w-full pl-11 pr-11 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-dark-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-dark-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-dark-900/80 border border-dark-850 hover:border-dark-750 focus:border-primary-500 text-dark-50 w-full pl-11 pr-11 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-primary-600/20 hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 mt-2"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
