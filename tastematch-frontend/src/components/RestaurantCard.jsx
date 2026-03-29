import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaFire, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RestaurantCard = ({ restaurant }) => {
  // Destructure with default values
  const { 
    id, 
    name, 
    cuisine, 
    rating, 
    priceRange, 
    imageUrl, 
    distance, 
    isTrending, 
    isTopRated, 
    matchScore 
  } = restaurant;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="card group cursor-pointer dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
        <img 
          src={imageUrl || 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop'} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isTopRated && (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-md">
              <FaFire /> Top Rated
            </span>
          )}
          {isTrending && (
            <span className="bg-white text-secondary text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <FaChartLine className="text-blue-500" /> Trending
            </span>
          )}
        </div>
        
        {matchScore && (
          <div className="absolute top-4 right-4 bg-accent text-secondary text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
            {matchScore}% Match
          </div>
        )}
      </div>

      <div className="flex justify-between items-start gap-3 mb-2">
        <Link to={`/restaurants/${id}`} className="line-clamp-1 text-xl font-bold text-secondary transition-colors group-hover:text-primary dark:text-white">
          {name}
        </Link>
        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-sm font-semibold">
          <FaStar className="text-accent" />
          <span>{rating}</span>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-4">{cuisine} • {priceRange}</p>
      
      {distance && (
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4 dark:text-slate-400">
          <FaMapMarkerAlt />
          <span>{distance}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
        <Link 
          to={`/restaurants/${id}`}
          className="btn-secondary flex-1 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          View Page
        </Link>
        <Link 
          to={`/reservations?restaurantId=${id}`}
          className="btn-secondary flex-1 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          Book Table
        </Link>
        <Link 
          to={`/menu/${id}`}
          className="btn-primary flex-1 py-2 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Order Food
        </Link>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
