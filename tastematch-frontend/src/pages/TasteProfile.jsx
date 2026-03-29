import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaFire, FaHeart, FaLeaf, FaMoneyBillWave, FaSpinner, FaStar } from 'react-icons/fa';
import { ENABLE_DEMO_FALLBACK, apiFetch } from '../config/api';
import {
  clearPersistedTasteProfile,
  getCurrentUser,
  normalizeTasteProfile,
  persistTasteProfile,
  subscribeToAuthChanges,
} from '../config/auth';

const INITIAL_FORM_DATA = {
  cuisine: 'Hyderabadi',
  spiceLevel: 80,
  dietType: 'Non-Veg',
  budgetRange: 'Rs 900',
  ratingImportance: 4,
};

const TasteProfile = () => {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  const cuisines = ['Hyderabadi', 'South Indian', 'Mughlai', 'Multi-Cuisine', 'Indian'];
  const dietTypes = ['Veg', 'Non-Veg', 'Eggetarian', 'Vegan'];
  const budgets = ['Rs 700', 'Rs 900', 'Rs 1000', 'Rs 1200+'];

  const currentUserId = currentUser?.id || '';
  const userName = currentUser?.name || 'Foodie';

  useEffect(() => subscribeToAuthChanges((session) => setCurrentUser(session?.user || null)), []);

  useEffect(() => {
    let isCancelled = false;

    const loadExistingProfile = async () => {
      if (!currentUserId) {
        setProfileLoading(false);
        toast.error('Please register first');
        navigate('/register');
        return;
      }

      setProfileLoading(true);

      try {
        const response = await apiFetch('/api/profile/me');

        if (isCancelled) {
          return;
        }

        if (response.status === 404) {
          clearPersistedTasteProfile();
          setFormData(INITIAL_FORM_DATA);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          clearPersistedTasteProfile();
          toast.error('Please sign in again');
          navigate('/register');
          return;
        }

        if (!response.ok) {
          toast.error('We could not load your saved taste profile. You can still update it below.');
          return;
        }

        const profile = normalizeTasteProfile(await response.json());
        setFormData(profile);
        persistTasteProfile(profile);
      } catch (error) {
        console.error('Profile load error:', error);
        if (!isCancelled) {
          toast.error('We could not load your saved taste profile. You can still update it below.');
        }
      } finally {
        if (!isCancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadExistingProfile();

    return () => {
      isCancelled = true;
    };
  }, [currentUserId, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSliderChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: Number(value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const profilePayload = normalizeTasteProfile(formData);

    try {
      const response = await apiFetch('/api/profile/me', {
        method: 'POST',
        body: JSON.stringify(profilePayload),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearPersistedTasteProfile();
          toast.error('Please sign in again');
          navigate('/register');
          return;
        }

        let message = 'Failed to save profile';
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch (parseError) {
          message = 'Failed to save profile';
        }
        throw new Error(message);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error('Could not save your taste profile. Please try again.');
        return;
      }
    } finally {
      setLoading(false);
    }

    persistTasteProfile(profilePayload);
    toast.success('Taste profile saved');
    navigate('/recommendations');
  };

  const getSpiceLabel = (value) => {
    if (value < 40) return 'Mild';
    if (value < 70) return 'Medium';
    if (value < 90) return 'Hot';
    return 'Extra Hot';
  };

  const getRatingLabel = (value) => {
    if (value <= 2) return 'Flexible';
    if (value <= 4) return 'Important';
    return 'Essential';
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 pb-12 pt-24 dark:bg-slate-950">
      <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[20%] left-[10%] h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="relative overflow-hidden bg-secondary p-8 text-center text-white dark:bg-black">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/40 mix-blend-screen" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-tr-full bg-accent/30 mix-blend-screen" />
            <h1 className="relative z-10 mb-2 text-3xl font-bold">Hi, {userName}</h1>
            <p className="relative z-10 text-gray-300">Tell us what you love and we will shape a dedicated recommendations page around it.</p>
          </div>

          {profileLoading ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
              <FaSpinner className="animate-spin text-4xl text-primary" />
              <p className="max-w-md text-sm font-medium text-gray-500 dark:text-slate-300">
                Loading your saved taste profile so your selections start from the latest choices.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <FaHeart className="text-primary" /> Favorite cuisine
                  </label>
                  <select name="cuisine" value={formData.cuisine} onChange={handleChange} className="input-field cursor-pointer">
                    {cuisines.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <FaLeaf className="text-green-500" /> Dietary preference
                  </label>
                  <select name="dietType" value={formData.dietType} onChange={handleChange} className="input-field cursor-pointer">
                    {dietTypes.map((diet) => (
                      <option key={diet} value={diet}>
                        {diet}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                    <FaMoneyBillWave className="text-emerald-500" /> Budget range
                  </label>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {budgets.map((budget) => (
                      <button
                        key={budget}
                        type="button"
                        onClick={() => setFormData((current) => ({ ...current, budgetRange: budget }))}
                        className={`rounded-xl border px-2 py-3 text-sm transition-all ${
                          formData.budgetRange === budget
                            ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300'
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8 border-t border-gray-100 pt-6 dark:border-slate-800">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                      <FaFire className="text-orange-500" /> Spice tolerance
                    </label>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                      {formData.spiceLevel}% ({getSpiceLabel(formData.spiceLevel)})
                    </span>
                  </div>
                  <input type="range" name="spiceLevel" min="0" max="100" step="10" value={formData.spiceLevel} onChange={handleSliderChange} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-orange-500" />
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                      <FaStar className="text-yellow-400" /> Rating importance
                    </label>
                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-bold text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-300">
                      {getRatingLabel(formData.ratingImportance)}
                    </span>
                  </div>
                  <input type="range" name="ratingImportance" min="1" max="5" value={formData.ratingImportance} onChange={handleSliderChange} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-yellow-400" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-8 w-full py-4 text-lg disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? <FaSpinner className="text-2xl animate-spin" /> : 'See personalized recommendations'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TasteProfile;
