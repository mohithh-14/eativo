import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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

  // OTP-specific states
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const isRegisterMode = mode === 'register';

  useEffect(() => {
    if (!showOtpScreen || timer <= 0) {
      if (timer === 0) setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtpScreen, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleOtpChange = (element, index) => {
    const val = element.value;
    if (isNaN(val)) return;

    const newOtp = [...otpValues];
    newOtp[index] = val.substring(val.length - 1);
    setOtpValues(newOtp);

    // Auto-focus next input
    if (val && element.nextElementSibling) {
      element.nextElementSibling.focus();
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === 'Backspace') {
      const newOtp = [...otpValues];
      if (!otpValues[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        if (event.target.previousElementSibling) {
          event.target.previousElementSibling.focus();
        }
      } else {
        newOtp[index] = '';
        setOtpValues(newOtp);
      }
    }
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

  const handleRequestOtp = async (event) => {
    if (event) event.preventDefault();

    if (!formData.email || !formData.password || !formData.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic frontend password check to help users
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/users/register/request-otp', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to request verification code';
        try {
          const data = await response.json();
          errMsg = data.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }

      toast.success('Verification code sent to your email!');
      setShowOtpScreen(true);
      setTimer(300);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
    } catch (error) {
      console.error('Request OTP error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error(error.message || 'Could not send verification code. Please try again.');
        setLoading(false);
        return;
      }

      // Demo fallback: simulate sending OTP
      toast.success('Demo mode: verification code sent! (Use code: 123456)');
      setShowOtpScreen(true);
      setTimer(300);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const otpCode = otpValues.join('');
    if (otpCode.length < 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/users/register/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email.trim(),
          otpCode: otpCode,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (error) {}

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      saveAuthSession(data);
      toast.success(`Welcome, ${data.name}! Account verified.`);
      navigate('/profile');
    } catch (error) {
      console.error('Verify OTP error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error(error.message || 'Invalid code. Please try again.');
        setLoading(false);
        return;
      }

      // Demo fallback: simulate successful verification
      if (otpCode === '123456' || otpCode === '000000') {
        saveAuthSession({
          id: `demo_${Math.random().toString(36).slice(2, 9)}`,
          name: formData.name.trim() || 'Foodie',
          email: formData.email.trim(),
          token: 'demo-session',
          hasTasteProfile: false,
        });
        toast.success('Demo mode: account verified locally');
        navigate('/profile');
      } else {
        toast.error('Demo mode: invalid code. (Please use 123456 or 000000)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (error) {}

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      saveAuthSession(data);

      if (data.hasTasteProfile) {
        await hydrateTasteProfile();
      }

      toast.success(`Welcome back, ${data.name}!`);
      navigate(data.hasTasteProfile ? '/recommendations' : '/profile');
    } catch (error) {
      console.error('Login error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error(error.message || 'Could not reach the server. Please try again.');
        setLoading(false);
        return;
      }

      const demoName = formData.email.split('@')[0] || 'Foodie';

      saveAuthSession({
        id: `demo_${Math.random().toString(36).slice(2, 9)}`,
        name: demoName,
        email: formData.email.trim(),
        token: 'demo-session',
        hasTasteProfile: false,
      });
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
        <AnimatePresence mode="wait">
          {isRegisterMode && showOtpScreen ? (
            <motion.div
              key="otp-verification"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <FaEnvelope />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-secondary dark:text-white">Verify your email</h1>
                <p className="text-sm text-gray-500 dark:text-slate-300">
                  We have sent a 6-digit verification code to <span className="font-semibold text-secondary dark:text-white">{formData.email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-50/50 text-center text-xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  ))}
                </div>

                <div className="text-center text-sm">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => handleRequestOtp()}
                      className="font-semibold text-primary hover:underline"
                    >
                      Resend verification code
                    </button>
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400">
                      Resend code in <span className="font-mono font-bold text-primary">{formatTime(timer)}</span>
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold py-3 shadow-gold-sm hover:shadow-gold-md"
                  >
                    {loading ? <FaSpinner className="animate-spin text-xl text-slate-900" /> : 'Verify & Register'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtpScreen(false)}
                    className="btn-secondary py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    Back to details
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="auth-forms"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 inline-flex rounded-full bg-gray-100 p-1 dark:bg-slate-950">
                  {[
                    { id: 'register', label: 'Create account' },
                    { id: 'login', label: 'Sign in' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMode(item.id);
                        setShowOtpScreen(false);
                      }}
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

              <form onSubmit={isRegisterMode ? handleRequestOtp : handleLoginSubmit} className="space-y-5">
                {isRegisterMode && (
                  <div>
                    <label className="ml-1 mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">Full name</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
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
                      placeholder="Enter your email address"
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
                  {isRegisterMode && (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400 dark:text-slate-500">
                      Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-6 w-full py-3 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    <span>{isRegisterMode ? 'Send Verification Code' : 'Sign in'}</span>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
                {isRegisterMode
                  ? 'Already have an account? Switch to Sign in above.'
                  : 'New here? Switch to Create account above.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;
