import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Trophy, LogOut, LayoutDashboard, Settings, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
        : 'text-dark-300 hover:text-white hover:bg-dark-800'
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-600 text-white'
        : 'text-dark-300 hover:text-white hover:bg-dark-800'
    }`;

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-dark-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-white group">
          <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-dark-50 to-primary-500 bg-clip-text text-transparent">
            QuizMaster Admin
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-dark-300 hover:text-white border border-dark-700/50 transition-all duration-200 cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>
          {user ? (
            <>
              <Link to="/" className={linkClass('/')}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-dark-800 mx-2"></div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{user.username}</div>
                  <div className="text-xs text-dark-400 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-dark-800 hover:bg-red-950/40 text-dark-300 hover:text-red-400 p-2.5 rounded-xl border border-dark-700/50 hover:border-red-900/30 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-dark-900 border border-dark-850 text-dark-300 hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
          </button>
          {user ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-dark-300 hover:text-white p-2 rounded-lg hover:bg-dark-800 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && user && (
        <div className="md:hidden mt-3 p-2 bg-dark-900/90 rounded-2xl border border-dark-850 animate-fade-in">
          <div className="flex flex-col space-y-2 py-2">
            <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-white">{user.username}</div>
                <div className="text-xs text-dark-400 capitalize">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-400 hover:bg-red-950/20 px-3 py-2 rounded-xl text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={mobileLinkClass('/')}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
