import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaArrowRight,
  FaClock,
  FaHistory,
  FaReceipt,
  FaSpinner,
  FaStore,
  FaTimesCircle,
} from 'react-icons/fa';
import { apiFetch } from '../config/api';
import { getCurrentUser } from '../config/auth';
import { getStoredOrderHistory, saveOrdersToHistory } from '../config/orderHistory';
import { getRestaurantById } from '../data/restaurants';

const formatOrderTime = (value) => {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getStatusStyles = (status) => {
  if (status === 'Cancelled') {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300';
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      toast.error('Please sign in to view your order history');
      navigate('/register');
      return;
    }

    let isCancelled = false;

    const loadOrders = async () => {
      setLoading(true);

      try {
        const response = await apiFetch('/api/orders/me');
        if (!response.ok) {
          throw new Error('Could not load order history');
        }

        const data = await response.json();
        if (isCancelled) {
          return;
        }

        const normalizedOrders = Array.isArray(data) ? data : [];
        setOrders(normalizedOrders);
        saveOrdersToHistory(currentUser.id, normalizedOrders);
      } catch (error) {
        console.error('Order history error:', error);
        if (isCancelled) {
          return;
        }

        const cachedOrders = getStoredOrderHistory(currentUser.id);
        setOrders(cachedOrders);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [currentUser?.id, navigate]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      active: orders.filter((order) => order.status !== 'Cancelled').length,
      cancelled: orders.filter((order) => order.status === 'Cancelled').length,
    }),
    [orders]
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl px-6">
        <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_360px]">
            <div className="p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/20">
                <FaHistory />
                Order history
              </span>
              <h1 className="mt-5 text-4xl font-bold text-secondary dark:text-white">Every order you placed in Hyderabad, in one timeline</h1>
              <p className="mt-4 max-w-2xl text-gray-500 dark:text-slate-300">
                Revisit active and past orders, jump back to a restaurant page, and quickly reorder your favorite dishes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/restaurants" className="btn-primary py-3">
                  Explore restaurants
                </Link>
                <Link to="/discover" className="btn-secondary py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  Discover more
                </Link>
              </div>
            </div>

            <div className="bg-secondary p-8 text-white dark:bg-black">
              <p className="text-sm uppercase tracking-[0.25em] text-white/50">Snapshot</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Total orders</p>
                  <p className="mt-2 text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Active orders</p>
                  <p className="mt-2 text-3xl font-bold">{stats.active}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Cancelled orders</p>
                  <p className="mt-2 text-3xl font-bold">{stats.cancelled}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-4">
            <FaSpinner className="animate-spin text-4xl text-primary" />
            <p className="font-medium text-gray-500 dark:text-slate-300">Loading your order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-gray-300 bg-white px-8 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-slate-950 dark:text-slate-400">
              <FaReceipt size={28} />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-secondary dark:text-white">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-lg text-gray-500 dark:text-slate-300">
              Once you place an order, it will appear here with restaurant details, payment method, and status updates.
            </p>
            <Link to="/restaurants" className="btn-primary mt-8 inline-flex py-3">
              Start ordering
            </Link>
          </div>
        ) : (
          <section className="mt-10 space-y-5">
            {orders.map((order, index) => {
              const restaurant = getRestaurantById(order.restaurantId);

              return (
                <motion.article
                  key={order.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
                    <div className="h-full bg-gray-100 dark:bg-slate-950">
                      {restaurant ? (
                        <img src={restaurant.imageUrl} alt={restaurant.name} className="h-full min-h-[220px] w-full object-cover" />
                      ) : (
                        <div className="flex h-full min-h-[220px] items-center justify-center text-gray-400 dark:text-slate-500">
                          <FaStore size={30} />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-bold text-secondary dark:text-white">{order.restaurantName || restaurant?.name || 'Restaurant'}</h2>
                            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusStyles(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
                            Order #{order.id} {restaurant?.area ? `· ${restaurant.area}` : ''}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-sm text-gray-500 dark:text-slate-400">Total</p>
                          <p className="text-3xl font-bold text-primary">Rs {order.totalAmount}</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 rounded-2xl bg-gray-50 p-5 dark:bg-slate-950 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Ordered on</p>
                          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-secondary dark:text-white">
                            <FaClock className="text-primary" />
                            {formatOrderTime(order.orderTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Payment</p>
                          <p className="mt-2 text-sm font-semibold text-secondary dark:text-white">{order.paymentMethod || 'UPI'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">ETA at order time</p>
                          <p className="mt-2 text-sm font-semibold text-secondary dark:text-white">{order.estimatedDelivery || '35 mins'}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        {order.restaurantId && (
                          <Link to={`/menu/${order.restaurantId}`} className="btn-primary py-3">
                            Order again
                          </Link>
                        )}
                        {order.restaurantId && (
                          <Link to={`/restaurants/${order.restaurantId}`} className="btn-secondary py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                            Restaurant page
                          </Link>
                        )}
                        {order.status === 'Cancelled' && (
                          <span className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-300">
                            <FaTimesCircle />
                            Cancelled order kept in history
                          </span>
                        )}
                        {order.status !== 'Cancelled' && (
                          <Link to={`/menu/${order.restaurantId}`} className="inline-flex items-center gap-2 px-1 py-3 text-sm font-semibold text-primary">
                            Continue from this restaurant
                            <FaArrowRight />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
