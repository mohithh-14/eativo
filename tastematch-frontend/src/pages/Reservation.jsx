import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaSpinner, FaUsers } from 'react-icons/fa';
import { ENABLE_DEMO_FALLBACK, apiFetch } from '../config/api';
import { getCurrentUser } from '../config/auth';
import restaurants, { getRestaurantById } from '../data/restaurants';

const Reservation = () => {
  const [searchParams] = useSearchParams();
  const initRestaurantId = searchParams.get('restaurantId') || restaurants[0]?.id || '';

  const [restaurantId, setRestaurantId] = useState(initRestaurantId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);

  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const selectedRestaurant = getRestaurantById(restaurantId);

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please login to make a reservation');
      navigate('/register');
    }

    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setTime('19:00');
  }, [currentUser, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!restaurantId || !date || !time || !guests) {
      toast.error('Please fill in all booking details');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(`/api/reservations?restaurantId=${restaurantId}`, {
        method: 'POST',
        body: JSON.stringify({ date, time, guests: Number(guests) }),
      });

      if (!response.ok) {
        throw new Error('Reservation failed');
      }

      const data = await response.json();
      setReservationDetails({
        id: data.id,
        restaurantName: selectedRestaurant?.name || data.restaurantName,
        date: data.date || data.reservationDate,
        time: data.time || data.reservationTime,
        guests: data.guests || data.numberOfGuests,
      });
      setConfirmed(true);
      toast.success('Table reserved successfully');
    } catch (error) {
      console.error('Reservation error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error('Could not complete the reservation. Please try again.');
        setLoading(false);
        return;
      }
      setTimeout(() => {
        setReservationDetails({
          id: `res_${Math.random().toString(36).slice(2, 9)}`,
          restaurantName: selectedRestaurant?.name || 'Selected restaurant',
          date,
          time,
          guests,
        });
        setConfirmed(true);
        setLoading(false);
        toast.success('Demo mode: table reserved');
      }, 500);
      return;
    }

    setLoading(false);
  };

  if (confirmed && reservationDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 pb-12 pt-24 dark:bg-slate-950">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute left-0 top-0 h-32 w-full bg-green-50 dark:bg-emerald-500/10" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }} className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-500 shadow-lg dark:bg-emerald-500/20 dark:text-emerald-300">
            <FaCheckCircle size={40} />
          </motion.div>

          <h2 className="relative z-10 mb-2 text-3xl font-bold text-secondary dark:text-white">Booking confirmed</h2>
          <p className="relative z-10 mb-8 text-gray-500 dark:text-slate-300">Your table is ready at {reservationDetails.restaurantName}.</p>

          <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left dark:border-slate-800 dark:bg-slate-950">
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-gray-500 dark:text-slate-400">Booking ID</div>
              <div className="text-right font-semibold text-secondary dark:text-white">{reservationDetails.id}</div>
              <div className="text-gray-500 dark:text-slate-400">Restaurant</div>
              <div className="text-right font-semibold text-secondary dark:text-white">{reservationDetails.restaurantName}</div>
              <div className="text-gray-500 dark:text-slate-400">Date</div>
              <div className="text-right font-semibold text-secondary dark:text-white">{reservationDetails.date}</div>
              <div className="text-gray-500 dark:text-slate-400">Time</div>
              <div className="text-right font-semibold text-secondary dark:text-white">{reservationDetails.time}</div>
              <div className="text-gray-500 dark:text-slate-400">Guests</div>
              <div className="text-right font-semibold text-secondary dark:text-white">{reservationDetails.guests}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate('/restaurants')} className="btn-secondary flex-1 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              Explore more
            </button>
            <button onClick={() => setConfirmed(false)} className="btn-primary flex-1 py-3 text-sm">
              Book another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-6 pb-12 pt-24 dark:bg-slate-950">
      <div className="absolute left-[20%] top-[10%] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-secondary dark:text-white">Reserve a table</h1>
            <p className="text-gray-500 dark:text-slate-300">Book your dining experience in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="ml-1 mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">Restaurant</label>
              <select className="input-field cursor-pointer" value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)}>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} - {restaurant.area}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="ml-1 mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" className="input-field pl-11" value={date} onChange={(event) => setDate(event.target.value)} />
                </div>
              </div>
              <div>
                <label className="ml-1 mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">Time</label>
                <div className="relative">
                  <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="time" className="input-field pl-11" value={time} onChange={(event) => setTime(event.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label className="ml-1 mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">Guests</label>
              <div className="relative">
                <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select className="input-field cursor-pointer appearance-none pl-11" value={guests} onChange={(event) => setGuests(event.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-8 w-full py-4 text-lg disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? <FaSpinner className="animate-spin text-2xl" /> : 'Confirm reservation'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Reservation;
