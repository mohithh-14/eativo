import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaMapMarkerAlt, FaRobot, FaSearch, FaUtensils } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import restaurants from '../data/restaurants';

const Home = () => {
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const navigate = useNavigate();

  const featuredRestaurants = restaurants.slice(0, 3);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/discover?location=${encodeURIComponent(location)}&cuisine=${encodeURIComponent(cuisine)}`);
  };

  return (
    <div className="min-h-screen">
      <section className="relative flex min-h-[760px] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-50 via-rose-50 to-amber-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="container relative z-10 mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/20">
              Hyderabad-first food discovery
            </span>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-secondary dark:text-white lg:text-7xl">
              Find your perfect
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Hyderabad meal match</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-slate-300">
              Explore restaurants, open dedicated pages for each spot, get a separate recommendation feed, and use AI to build or cancel an order in seconds.
            </p>

            <div className="mb-6 flex flex-wrap gap-3">
              <Link to="/restaurants" className="btn-secondary py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                All restaurants
              </Link>
              <Link to="/recommendations" className="btn-primary py-3">
                Personalized recommendations
              </Link>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-primary/5 dark:border-slate-800 dark:bg-slate-900 md:flex-row">
              <div className="relative flex-1">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Area in Hyderabad"
                  className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <FaUtensils className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cuisine or dish"
                  className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:text-white"
                  value={cuisine}
                  onChange={(event) => setCuisine(event.target.value)}
                />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark active:scale-95">
                <FaSearch />
                Search
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
            <div className="relative mx-auto h-[620px] w-[520px] overflow-hidden rounded-[3rem] border-8 border-white/50 shadow-2xl backdrop-blur-sm dark:border-slate-800/80">
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop"
                alt="Hyderabad food spread"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-10 left-8 max-w-xs rounded-3xl bg-white/90 p-5 shadow-xl backdrop-blur dark:bg-slate-900/90"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <FaRobot />
                </div>
                <p className="text-sm font-bold text-secondary dark:text-white">AI order copilot</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">Ask for a spicy combo, quick dinner for two, or cancel a placed order from the menu page.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-secondary dark:text-white">Featured Hyderabad spots</h2>
              <p className="text-gray-500 dark:text-slate-300">Every featured restaurant now has its own page with menu highlights and direct actions.</p>
            </div>
            <Link to="/restaurants" className="group hidden items-center gap-2 font-semibold text-primary md:flex">
              See all
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-secondary py-24 text-white dark:bg-black">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="container relative z-10 mx-auto grid items-center gap-16 px-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="mb-6 text-4xl font-bold">Taste profile plus recommendation feed</h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-300">
              Your taste profile now feeds a separate recommendation page, so the personalized experience is easier to revisit without mixing it into the generic discovery list.
            </p>
            <ul className="mb-8 space-y-4">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">1</div>
                <span>Save cuisine, spice, diet, and budget preferences.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">2</div>
                <span>Review ranked restaurant matches on a dedicated page.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">3</div>
                <span>Jump into ordering or booking directly from each restaurant page.</span>
              </li>
            </ul>
            <Link to="/profile" className="btn-primary inline-flex">
              Build taste profile
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-semibold">Recommendation snapshot</h3>
                <span className="text-accent">3 top picks ready</span>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-gray-300">Best match</p>
                <p className="mt-1 text-2xl font-bold">Paradise Biryani</p>
                <p className="mt-2 text-sm text-gray-400">98% match for Hyderabadi, high-spice, non-veg preferences.</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-gray-300">AI suggestion</p>
                <p className="mt-2 text-sm text-gray-100">&quot;Build a comfort combo with biryani, one starter, and a dessert under Rs 700.&quot;</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
