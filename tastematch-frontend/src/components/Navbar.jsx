import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHamburger, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { clearAuthSession, getCurrentUser, subscribeToAuthChanges } from '../config/auth';
import { apiFetch } from '../config/api';

const Navbar = ({ theme, onToggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();

  const userName = currentUser?.name;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => subscribeToAuthChanges((session) => setCurrentUser(session?.user || null)), []);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/users/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    clearAuthSession();
    setMobileMenuOpen(false);
    toast.success('Signed out');
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Discover', path: '/discover' },
    { name: 'Restaurants', path: '/restaurants' },
    { name: 'For You', path: '/recommendations' },
    ...(currentUser ? [{ name: 'Orders', path: '/orders' }] : []),
    { name: 'Reservations', path: '/reservations' },
    { name: 'Taste Profile', path: '/profile' },
  ];

  // Make navbar transparent and text white ONLY if we're on the home page and not scrolled
  const isTransparent = location.pathname === '/' && !isScrolled;

  return (
    <nav className={`fixed z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 py-3 shadow-sm backdrop-blur-md dark:bg-slate-950/95 dark:shadow-slate-950/20' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <FaHamburger size={24} />
          </div>
          <span className={`text-2xl font-bold tracking-tight ${!isTransparent ? 'text-secondary dark:text-white' : 'text-white'}`}>
            Eativo
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`text-sm font-semibold transition-colors hover:text-primary relative group ${
                    isActive 
                      ? 'text-primary' 
                      : (!isTransparent ? 'text-gray-600 dark:text-slate-300' : 'text-white/90 hover:text-white')
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div layoutId="underline" className="absolute left-0 right-0 h-0.5 bg-primary bottom-[-6px]" />
                  )}
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              !isTransparent
                ? 'border-gray-200 bg-white text-secondary hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          {userName ? (
            <div className={`text-sm font-semibold flex items-center gap-4 ${!isTransparent ? 'text-secondary dark:text-white' : 'text-white'}`}>
              <Link to="/profile" className="hover:underline">Hi, {userName}!</Link>
              <button 
                onClick={handleLogout}
                className={`py-2 px-4 rounded-full text-sm font-semibold transition-all border ${!isTransparent ? 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/register" className="btn-primary py-2 px-5 text-sm">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`md:hidden text-2xl ${!isTransparent ? 'text-secondary dark:text-white' : 'text-white'}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gray-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 md:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="border-b border-gray-50 py-2 font-medium text-gray-700 hover:text-primary dark:border-slate-800 dark:text-slate-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:text-white"
              >
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </button>
              {userName ? (
                <button 
                  className="mt-4 w-full rounded-full border border-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200"
                  onClick={handleLogout}
                >
                  Logout ({userName})
                </button>
              ) : (
                <Link 
                  to="/register" 
                  className="btn-primary mt-4 w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
