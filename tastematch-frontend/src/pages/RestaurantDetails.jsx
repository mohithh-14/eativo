import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaMapMarkerAlt, FaStar, FaUtensils } from 'react-icons/fa';
import { getRestaurantById } from '../data/restaurants';

const RestaurantDetails = () => {
  const { restaurantId } = useParams();
  const restaurant = getRestaurantById(restaurantId);

  if (!restaurant) {
    return <Navigate to="/restaurants" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 transition-colors dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[360px]">
              <img src={restaurant.heroImageUrl} alt={restaurant.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                  {restaurant.cuisine} in {restaurant.area}
                </span>
                <h1 className="max-w-xl text-4xl font-bold">{restaurant.name}</h1>
                <p className="mt-3 max-w-xl text-white/80">{restaurant.vibe}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between p-8">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <FaStar />
                    {restaurant.rating} rating
                  </span>
                  <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/20">
                    {restaurant.priceRange}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-slate-300">{restaurant.description}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-slate-800/70">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-secondary dark:text-white">
                      <FaMapMarkerAlt className="text-primary" />
                      Address
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-300">{restaurant.address}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-slate-800/70">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-secondary dark:text-white">
                      <FaClock className="text-primary" />
                      Timings
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-300">{restaurant.timings}</p>
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-lg font-bold text-secondary dark:text-white">Popular picks</h2>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={`/menu/${restaurant.id}`} className="btn-primary flex-1 py-3">
                  <FaUtensils />
                  Order from this restaurant
                </Link>
                <Link to={`/reservations?restaurantId=${restaurant.id}`} className="btn-secondary flex-1 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  Book a table
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary dark:text-white">Menu highlights</h2>
            <Link to="/restaurants" className="text-sm font-semibold text-primary">
              Back to all restaurants
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {restaurant.menu.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{item.category}</p>
                    <h3 className="mt-2 text-xl font-bold text-secondary dark:text-white">{item.name}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Rs {item.price}
                  </span>
                </div>
                <p className="text-sm leading-6 text-gray-500 dark:text-slate-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RestaurantDetails;
