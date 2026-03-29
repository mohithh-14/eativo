import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCompass, FaFilter, FaSearch, FaSpinner } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';
import { apiFetch } from '../config/api';
import { getCurrentUser, subscribeToAuthChanges } from '../config/auth';
import { enrichRestaurant, searchRestaurants } from '../data/restaurants';

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLocation = searchParams.get('location') || '';
  const initialCuisine = searchParams.get('cuisine') || '';

  const [location, setLocation] = useState(initialLocation);
  const [cuisine, setCuisine] = useState(initialCuisine);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(() => getCurrentUser()?.id || '');

  useEffect(() => subscribeToAuthChanges((session) => setCurrentUserId(session?.user?.id || '')), []);

  const runFallbackSearch = useCallback(() => {
    const results = searchRestaurants({ location, cuisine });
    setRestaurants(results);
    setLoading(false);
  }, [cuisine, location]);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (cuisine) params.append('cuisine', cuisine);

      let path = currentUserId ? '/api/recommendations/me' : '/api/recommendations/guest';
      if (params.toString()) {
        path += `?${params.toString()}`;
      }

      const response = await apiFetch(path);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRestaurants(data.length ? data.map(enrichRestaurant) : searchRestaurants({ location, cuisine }));
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setTimeout(runFallbackSearch, 400);
    }
  }, [cuisine, currentUserId, location, runFallbackSearch]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleFilter = (event) => {
    event.preventDefault();
    setSearchParams({ location, cuisine });
    fetchRecommendations();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 transition-colors dark:bg-slate-950">
      <div className="sticky top-[72px] z-40 mb-10 border-b border-gray-200 bg-white/90 py-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="container mx-auto px-6">
          <div className="mb-2 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-secondary dark:text-white">
                <FaCompass className="text-primary" /> Discover
              </h1>
              <p className="mt-1 text-gray-500 dark:text-slate-300">Found {restaurants.length} Hyderabad restaurant matches</p>
            </div>

            <form onSubmit={handleFilter} className="flex w-full gap-3 md:w-auto">
              <input
                type="text"
                placeholder="Location"
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 dark:text-white md:w-48"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
              <input
                type="text"
                placeholder="Cuisine"
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 dark:bg-slate-900 dark:text-white md:w-48"
                value={cuisine}
                onChange={(event) => setCuisine(event.target.value)}
              />
              <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 font-semibold text-white transition-colors hover:bg-black dark:bg-slate-800">
                <FaFilter size={14} />
                <span className="hidden md:inline">Filter</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <FaSpinner className="animate-spin text-4xl text-primary" />
            <p className="font-medium text-gray-500 animate-pulse dark:text-slate-300">Curating your Hyderabad matches...</p>
          </div>
        ) : restaurants.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            {restaurants.map((restaurant) => (
              <motion.div key={restaurant.id} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}>
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
              <FaSearch size={32} className="text-gray-400" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-secondary dark:text-white">No matches found</h3>
            <p className="mx-auto mb-6 max-w-md text-gray-500 dark:text-slate-300">Try a broader Hyderabad area or search by cuisine like Hyderabadi, South Indian, Mughlai, mandi, or desserts.</p>
            <button
              onClick={() => {
                setLocation('');
                setCuisine('');
                setSearchParams({});
                setRestaurants(searchRestaurants({}));
              }}
              className="btn-secondary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
