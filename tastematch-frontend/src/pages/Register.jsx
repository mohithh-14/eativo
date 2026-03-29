import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSpinner, FaUser } from 'react-icons/fa';
import { ENABLE_DEMO_FALLBACK, apiFetch } from '../config/api';
import {
  clearPersistedTasteProfile,
  normalizeTasteProfile,
  persistTasteProfile,
  saveAuthSession,
} from '../config/auth';

const Register = () => {
  const [mode, setMode] = useState('register');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isRegisterMode = mode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const hydrateTasteProfile = async () => {
    const response = await apiFetch('/api/profile/me');
    if (!response.ok) {
      clearPersistedTasteProfile();
      return false;
    }

    const profile = normalizeTasteProfile(await response.json());
    persistTasteProfile(profile);
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password || (isRegisterMode && !formData.name.trim())) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(isRegisterMode ? '/api/users/register' : '/api/users/login', {
        method: 'POST',
        body: JSON.stringify(
          isRegisterMode
            ? {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
              }
            : {
                email: formData.email.trim(),
                password: formData.password,
              }
        ),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (error) {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      saveAuthSession(data);

      if (data.hasTasteProfile) {
        await hydrateTasteProfile();
      } else {
        clearPersistedTasteProfile();
      }

      toast.success(isRegisterMode ? `Welcome ${data.name}!` : `Welcome back, ${data.name}!`);
      navigate(data.hasTasteProfile ? '/recommendations' : '/profile');
    } catch (error) {
      console.error('Authentication error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error(error.message || 'Could not reach the server. Please try again.');
        setLoading(false);
        return;
      }

      const demoName = isRegisterMode
        ? formData.name.trim()
        : formData.email.split('@')[0] || 'Foodie';

      saveAuthSession({
        id: `demo_${Math.random().toString(36).slice(2, 9)}`,
        name: demoName,
        email: formData.email.trim(),
        token: 'demo-session',
        hasTasteProfile: false,
      });
      clearPersistedTasteProfile();
      toast.success('Demo mode: signed in locally');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 pb-12 pt-20 dark:bg-slate-950">
      <div className="absolute left-[10%] top-[10%] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[10%] right-[10%] h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 inline-flex rounded-full bg-gray-100 p-1 dark:bg-slate-950">
              {[
                { id: 'register', label: 'Create account' },
                { id: 'login', label: 'Sign in' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    mode === item.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-500 hover:text-secondary dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <h1 className="mb-2 text-3xl font-bold text-secondary dark:text-white">
              {isRegisterMode ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 dark:text-slate-300">
              {isRegisterMode
                ? 'Join Eativo and save your Hyderabad dining preferences.'
                : 'Sign in to continue ordering, booking, and getting personalized picks.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegisterMode && (
              <div>
                <label className="ml-1 mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">Full name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className="input-field pl-11"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="ml-1 mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">Email address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  className="input-field pl-11"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="ml-1 mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="input-field pl-11"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 w-full py-3 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                <span>{isRegisterMode ? 'Create account' : 'Sign in'}</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
            {isRegisterMode
              ? 'Already have an account? Switch to Sign in above.'
              : 'New here? Switch to Create account above.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
