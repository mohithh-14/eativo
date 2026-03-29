import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaMagic, FaSlidersH, FaSpinner } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';
import { apiFetch } from '../config/api';
import {
  clearPersistedTasteProfile,
  getCurrentUser,
  getStoredTasteProfile,
  normalizeTasteProfile,
  persistTasteProfile,
  subscribeToAuthChanges,
} from '../config/auth';
import { enrichRestaurant, getPersonalizedRestaurants } from '../data/restaurants';

const Recommendations = () => {
  const [currentUserId, setCurrentUserId] = useState(() => getCurrentUser()?.id || '');
  const [preferences, setPreferences] = useState(() => getStoredTasteProfile(getCurrentUser()?.id) || {});
  const [profileAvailable, setProfileAvailable] = useState(() => Boolean(getStoredTasteProfile(getCurrentUser()?.id)));
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeToAuthChanges((session) => setCurrentUserId(session?.user?.id || '')), []);

  useEffect(() => {
    let isCancelled = false;

    const loadRecommendations = async () => {
      setLoading(true);
      let nextPreferences = getStoredTasteProfile(currentUserId) || {};
      let nextProfileAvailable = Boolean(Object.keys(nextPreferences).length);
      let recommendationPath = currentUserId ? '/api/recommendations/me' : '/api/recommendations/guest';

      try {
        if (currentUserId) {
          const profileResponse = await apiFetch('/api/profile/me');
          if (profileResponse.ok) {
            nextPreferences = normalizeTasteProfile(await profileResponse.json());
            persistTasteProfile(nextPreferences);
            nextProfileAvailable = true;
          } else if (profileResponse.status === 404) {
            clearPersistedTasteProfile();
            nextPreferences = {};
            nextProfileAvailable = false;
          } else if (profileResponse.status === 401 || profileResponse.status === 403) {
            clearPersistedTasteProfile();
            nextPreferences = {};
            nextProfileAvailable = false;
            recommendationPath = '/api/recommendations/guest';
          }
        }

        const response = await apiFetch(recommendationPath);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        if (isCancelled) {
          return;
        }

        setPreferences(nextPreferences);
        setProfileAvailable(nextProfileAvailable);
        setRecommendations(
          data.length
            ? data.map((restaurant) => enrichRestaurant(restaurant))
            : getPersonalizedRestaurants(nextProfileAvailable ? nextPreferences : undefined)
        );
      } catch (error) {
        console.error('Recommendations error:', error);
        if (isCancelled) {
          return;
        }

        setPreferences(nextPreferences);
        setProfileAvailable(nextProfileAvailable);
        setRecommendations(getPersonalizedRestaurants(nextProfileAvailable ? nextPreferences : undefined));
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      isCancelled = true;
    };
  }, [currentUserId]);

  const topThree = recommendations.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 transition-colors dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <section className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/20">
                <FaMagic />
                Personalized recommendations
              </span>
              <h1 className="text-4xl font-bold text-secondary dark:text-white">Your Eativo picks for Hyderabad</h1>
              <p className="mt-4 max-w-2xl text-gray-500 dark:text-slate-300">
                We rank local restaurants using your saved taste profile when you are signed in, then blend that with Hyderabad-specific restaurant pages and menus.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/profile" className="btn-primary py-3">
                  <FaSlidersH />
                  Update taste profile
                </Link>
                <Link to="/restaurants" className="btn-secondary py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  Browse all restaurants
                </Link>
                {!currentUserId && (
                  <Link to="/register" className="btn-secondary py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    Sign in for better matches
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-secondary p-6 text-white dark:bg-slate-800">
              <p className="text-sm uppercase tracking-[0.25em] text-white/60">Current signals</p>
              {profileAvailable ? (
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Cuisine</span>
                    <span className="font-semibold">{preferences.cuisine}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Diet</span>
                    <span className="font-semibold">{preferences.dietType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Budget</span>
                    <span className="font-semibold">{preferences.budgetRange}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Spice level</span>
                    <span className="font-semibold">{preferences.spiceLevel}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Ratings</span>
                    <span className="font-semibold">{preferences.ratingImportance}/5</span>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <p className="text-sm leading-6 text-white/75">
                    {currentUserId
                      ? 'You are signed in, but no saved taste profile was found yet. Add one to influence these rankings.'
                      : 'Sign in and save your taste profile to tailor recommendations by cuisine, diet, spice, budget, and ratings.'}
                  </p>
                  <Link
                    to={currentUserId ? '/profile' : '/register'}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {currentUserId ? 'Create taste profile' : 'Sign in to personalize'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <FaSpinner className="animate-spin text-4xl text-primary" />
            <p className="font-medium text-gray-500 dark:text-slate-300">Ranking your Hyderabad picks...</p>
          </div>
        ) : (
          <>
            <section className="mt-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-secondary dark:text-white">Top matches</h2>
                <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Discover feed
                  <FaArrowRight />
                </Link>
              </div>

              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {topThree.map((restaurant, index) => (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="mb-6 text-2xl font-bold text-secondary dark:text-white">All ranked picks</h2>
              <div className="space-y-4">
                {recommendations.map((restaurant, index) => (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                          <h3 className="text-xl font-bold text-secondary dark:text-white">{restaurant.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                          {restaurant.cuisine} in {restaurant.area} . {restaurant.specialties.slice(0, 2).join(' . ')}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-accent/15 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                          {restaurant.matchScore}% match
                        </span>
                        <Link to={`/restaurants/${restaurant.id}`} className="btn-secondary py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                          View page
                        </Link>
                        <Link to={`/menu/${restaurant.id}`} className="btn-primary py-2">
                          Order now
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
