import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaHistory,
  FaMagic,
  FaMinus,
  FaPlus,
  FaRobot,
  FaShoppingBag,
  FaShoppingCart,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';
import { ENABLE_DEMO_FALLBACK, apiFetch } from '../config/api';
import { getCurrentUser } from '../config/auth';
import { saveOrderToHistory } from '../config/orderHistory';
import { getMenuByRestaurantId, getRestaurantById } from '../data/restaurants';

const orderIdeas = [
  {
    label: 'Dinner for 1',
    prompt: 'Build a solo dinner under Rs 500',
  },
  {
    label: 'Spicy combo',
    prompt: 'Pick the spiciest combo from this menu',
  },
  {
    label: 'Family sharing',
    prompt: 'Create a family meal for 3 to 4 people',
  },
];

const buildAiSuggestion = (menuItems, restaurant, prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  const biryani = menuItems.find((item) => /biryani|mandi/i.test(item.name));
  const starter = menuItems.find((item) => /65|fish|tikka|samosa|haleem|555/i.test(item.name));
  const dessert = menuItems.find((item) => /meetha|dessert|baklava|falooda|kheer|ice cream/i.test(item.name));
  const beverage = menuItems.find((item) => /chai|coffee|soda|milk/i.test(item.name));

  let picks = [biryani, starter].filter(Boolean);

  if (lowerPrompt.includes('family')) {
    picks = [menuItems[0], menuItems[1], menuItems[2]].filter(Boolean);
  } else if (lowerPrompt.includes('under rs 500') || lowerPrompt.includes('under 500')) {
    const affordable = [];
    let total = 0;
    for (const item of menuItems) {
      if (total + item.price <= 500) {
        affordable.push(item);
        total += item.price;
      }
      if (affordable.length === 3) break;
    }
    picks = affordable;
  } else if (lowerPrompt.includes('spiciest')) {
    picks = [starter || menuItems[0], biryani || menuItems[1], beverage].filter(Boolean);
  }

  if (!picks.length) {
    picks = menuItems.slice(0, 2);
  }

  if (!picks.includes(dessert) && dessert && picks.length < 3) {
    picks.push(dessert);
  }

  const total = picks.reduce((sum, item) => sum + item.price, 0);

  return {
    message: `For ${restaurant.name}, I would go with ${picks.map((item) => item.name).join(', ')}. Estimated total: Rs ${total}.`,
    picks,
  };
};

const Menu = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const restaurant = getRestaurantById(restaurantId);
  const fallbackMenu = getMenuByRestaurantId(restaurantId);

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('Ask for a combo, budget meal, spicy order, or help canceling your active order.');

  const currentUser = getCurrentUser();

  useEffect(() => {
    const storedOrder = JSON.parse(localStorage.getItem(`activeOrder:${restaurantId}`) || 'null');
    if (storedOrder) {
      setOrderConfirmed(storedOrder);
    }
  }, [restaurantId]);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`/api/menu/restaurant/${restaurantId}`);
        if (!response.ok) {
          throw new Error('Menu fetch failed');
        }
        const data = await response.json();
        setMenuItems(data.length ? data : fallbackMenu);
        setLoading(false);
      } catch (error) {
        console.error('Menu load error:', error);
        setTimeout(() => {
          setMenuItems(fallbackMenu);
          setLoading(false);
        }, 300);
      }
    };

    fetchMenu();
  }, [fallbackMenu, restaurantId]);

  const addToCart = (item, quantity = 1) => {
    setCart((currentCart) => {
      const existing = currentCart.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      }
      return [...currentCart, { ...item, quantity }];
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const removeFromCart = (itemId) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === itemId);
      if (!existing) return currentCart;
      if (existing.quantity === 1) {
        return currentCart.filter((item) => item.id !== itemId);
      }
      return currentCart.map((item) => (item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item));
    });
  };

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

  const groupedMenu = useMemo(
    () =>
      menuItems.reduce((accumulator, item) => {
        if (!accumulator[item.category]) accumulator[item.category] = [];
        accumulator[item.category].push(item);
        return accumulator;
      }, {}),
    [menuItems]
  );

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error('Please login to place an order');
      navigate('/register');
      return;
    }

    if (!cart.length) return;

    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setPlacingOrder(true);

    const payload = {
      id: `ord_${Math.random().toString(36).slice(2, 9)}`,
      status: 'Preparing',
      estimatedDelivery: '35 mins',
      paymentMethod,
      orderTime: new Date().toISOString(),
      items: cart,
      totalAmount: cartTotal,
      restaurantId: restaurant?.id,
      restaurantName: restaurant?.name || 'Restaurant',
    };

    try {
      const response = await apiFetch(`/api/orders?restaurantId=${restaurantId}`, {
        method: 'POST',
        body: JSON.stringify({ items: cart, totalAmount: cartTotal, address: deliveryAddress, paymentMethod }),
      });

      if (response.ok) {
        const data = await response.json();
        const confirmedOrder = { ...payload, ...data };
        setOrderConfirmed(confirmedOrder);
        localStorage.setItem(`activeOrder:${restaurantId}`, JSON.stringify(confirmedOrder));
        saveOrderToHistory(currentUser.id, confirmedOrder);
      } else {
        throw new Error('Order failed');
      }
    } catch (error) {
      console.error('Order error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error('Could not place the order. Please try again.');
        setPlacingOrder(false);
        return;
      }
      localStorage.setItem(`activeOrder:${restaurantId}`, JSON.stringify(payload));
      setOrderConfirmed(payload);
      saveOrderToHistory(currentUser.id, payload);
      toast.success('Demo mode: order placed successfully');
    }

    setCart([]);
    setIsCartOpen(false);
    setPlacingOrder(false);
  };

  const handleCancelOrder = async () => {
    if (!orderConfirmed) {
      setAiResponse('There is no active order to cancel right now.');
      return;
    }

    try {
      const response = await apiFetch(`/api/orders/${orderConfirmed.id}/cancel`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Cancel failed');
      }
      const data = await response.json();
      if (currentUser?.id) {
        saveOrderToHistory(currentUser.id, { ...orderConfirmed, ...data });
      }
    } catch (error) {
      console.error('Cancel error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error('Could not cancel the order right now.');
        return;
      }
      if (currentUser?.id) {
        saveOrderToHistory(currentUser.id, { ...orderConfirmed, status: 'Cancelled' });
      }
    }

    localStorage.removeItem(`activeOrder:${restaurantId}`);
    setOrderConfirmed(null);
    setAiResponse(`Your order for ${restaurant?.name || 'this restaurant'} has been canceled.`);
    toast.success('Order canceled');
  };

  const handleAiAssist = (promptText = aiPrompt) => {
    const trimmedPrompt = promptText.trim();
    if (!trimmedPrompt) {
      setAiResponse('Tell me what you want, like a quick dinner, a spicy combo, or cancel my order.');
      return;
    }

    if (/cancel/i.test(trimmedPrompt)) {
      handleCancelOrder();
      setAiPrompt('');
      return;
    }

    const suggestion = buildAiSuggestion(menuItems, restaurant || { name: 'this restaurant' }, trimmedPrompt);
    suggestion.picks.forEach((item) => addToCart(item));
    setAiResponse(`${suggestion.message} I added the suggested items to your cart.`);
    setAiPrompt('');
  };

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 pt-24 dark:bg-slate-950">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Restaurant not found</h1>
          <Link to="/restaurants" className="btn-primary mt-6 inline-flex">
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 pt-24 dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-shadow hover:text-primary dark:bg-slate-900 dark:text-slate-300"
            >
              <FaArrowLeft />
            </button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{restaurant.area}</p>
              <h1 className="text-3xl font-bold text-secondary dark:text-white">{restaurant.name}</h1>
              <p className="text-gray-500 dark:text-slate-300">{restaurant.cuisine} . {restaurant.priceRange}</p>
            </div>
          </div>
          <Link to={`/restaurants/${restaurant.id}`} className="btn-secondary dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            Restaurant page
          </Link>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <img src={restaurant.heroImageUrl} alt={restaurant.name} className="h-64 w-full object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-secondary dark:text-white">Order with AI support</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">Ask for a personalized combo, let AI add items to your cart, or cancel your active order.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/15 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FaRobot />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary dark:text-white">Eativo AI</h2>
                <p className="text-sm text-gray-500 dark:text-slate-300">Smart ordering and cancellation</p>
              </div>
            </div>

            <div className="space-y-3">
              {orderIdeas.map((idea) => (
                <button
                  key={idea.label}
                  type="button"
                  onClick={() => handleAiAssist(idea.prompt)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:text-white"
                >
                  <span>{idea.label}</span>
                  <FaMagic className="text-primary" />
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-slate-950 dark:text-slate-300">
              {aiResponse}
            </div>

            <textarea
              rows="3"
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="Example: Build a biryani combo for two under Rs 800 or cancel my order"
              className="mt-4 w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => handleAiAssist()} className="btn-primary py-3">
                <FaMagic />
                Ask AI
              </button>
              <button type="button" onClick={handleCancelOrder} className="btn-secondary py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                <FaTimes />
                Cancel order
              </button>
            </div>
          </div>
        </div>

        {orderConfirmed && (
          <div className="mb-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <FaCheckCircle />
                  Active order ready for tracking
                </p>
                <h2 className="mt-2 text-2xl font-bold text-secondary dark:text-white">Order {orderConfirmed.id}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{orderConfirmed.status} . ETA {orderConfirmed.estimatedDelivery} . Paid via {orderConfirmed.paymentMethod}</p>
              </div>
              <button type="button" onClick={handleCancelOrder} className="btn-secondary dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                Cancel this order
              </button>
              <Link to="/orders" className="inline-flex items-center gap-2 px-1 py-3 text-sm font-semibold text-primary">
                <FaHistory />
                View order history
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <FaSpinner className="mb-4 animate-spin text-4xl text-primary" />
            <p className="font-medium text-gray-500 dark:text-slate-300">Loading menu...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category}>
                <h2 className="mb-6 flex items-center gap-4 text-2xl font-bold text-secondary dark:text-white">
                  {category}
                  <div className="h-px flex-1 bg-gray-200 dark:bg-slate-800" />
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -4 }}
                      className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-xl font-bold text-secondary dark:text-white">{item.name}</h3>
                          <span className="text-lg font-bold text-emerald-600">Rs {item.price}</span>
                        </div>
                        <p className="mb-6 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-500 dark:bg-slate-950 dark:text-slate-300">
                          {item.description}
                        </p>
                      </div>
                      <button onClick={() => addToCart(item)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-2.5 font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                        <FaPlus size={12} /> Add to cart
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItemCount > 0 && !isCartOpen && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-4 rounded-2xl bg-secondary p-4 text-white shadow-2xl transition-transform hover:scale-105 dark:bg-slate-800"
          onClick={() => setIsCartOpen(true)}
        >
          <div className="relative rounded-xl border border-white/10 bg-white/5 p-2">
            <FaShoppingBag size={24} />
            <span className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-secondary bg-primary text-xs font-bold text-white shadow-sm dark:border-slate-800">
              {cartItemCount}
            </span>
          </div>
          <div className="pr-4 text-left hidden md:block">
            <p className="text-xs font-medium text-gray-400">Your cart</p>
            <p className="text-lg font-bold">Rs {cartTotal}</p>
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-secondary/60 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                <h2 className="flex items-center gap-3 text-xl font-bold text-secondary dark:text-white">
                  <FaShoppingCart className="text-primary" /> Your order
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 dark:bg-slate-950">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400 dark:text-slate-400">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-900">
                      <FaShoppingBag size={32} className="opacity-40" />
                    </div>
                    <p className="text-lg font-medium text-gray-500 dark:text-slate-300">Your cart is empty.</p>
                    <p className="text-sm">Add a few dishes or let AI build a combo.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                          <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
                          <div className="flex-1 pl-2">
                            <h4 className="text-sm font-bold leading-tight text-secondary dark:text-white md:text-base">{item.name}</h4>
                            <p className="mt-1 text-sm font-semibold text-emerald-600">Rs {item.price * item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-slate-700 dark:bg-slate-950">
                            <button onClick={() => removeFromCart(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-600 shadow-sm transition-colors hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              <FaMinus size={10} />
                            </button>
                            <span className="w-4 text-center text-sm font-bold text-secondary dark:text-white">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-600 shadow-sm transition-colors hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              <FaPlus size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <h3 className="mb-4 text-sm font-bold text-secondary dark:text-white">Delivery and payment</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-slate-400">Delivery address</label>
                          <textarea
                            rows="2"
                            placeholder="Flat or house no., street, landmark"
                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            value={deliveryAddress}
                            onChange={(event) => setDeliveryAddress(event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-500 dark:text-slate-400">Payment method</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['UPI', 'Card', 'COD'].map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                                  paymentMethod === method
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-secondary dark:text-white">Rs {cartTotal}</span>
                </div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Delivery fee</span>
                  <span className="font-medium text-secondary dark:text-white">Rs 40</span>
                </div>
                <div className="mb-6 flex items-center justify-between border-t border-dashed border-gray-200 pt-4 dark:border-slate-800">
                  <span className="font-bold text-gray-800 dark:text-white">Total</span>
                  <span className="text-3xl font-bold text-primary">Rs {cartTotal + (cartTotal > 0 ? 40 : 0)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0 || placingOrder}
                  className="btn-primary w-full py-4 text-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? <FaSpinner className="mx-auto animate-spin text-2xl" /> : `Place order . ${cartItemCount} items`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
