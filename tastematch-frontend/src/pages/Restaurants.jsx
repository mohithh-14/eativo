import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkedAlt } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';
import { getAllRestaurants } from '../data/restaurants';

const Restaurants = () => {
  const restaurants = getAllRestaurants();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 transition-colors dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/20">
              Hyderabad Dining Guide
            </span>
            <h1 className="text-4xl font-bold text-secondary dark:text-white">All Restaurants</h1>
            <p className="mt-2 max-w-2xl text-gray-500 dark:text-slate-300">
              Browse every Eativo partner restaurant in Hyderabad, from biryani institutions to breakfast favorites.
            </p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-secondary dark:text-white">
              <FaMapMarkedAlt className="text-primary" />
              <div>
                <p className="text-sm font-semibold">{restaurants.length} restaurants live</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Across Secunderabad, Banjara Hills, Charminar, Tolichowki and more.</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4"
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
            <motion.div
              key={restaurant.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Restaurants;
