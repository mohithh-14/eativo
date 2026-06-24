import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, FaPaperPlane, FaTrash, FaShoppingBasket, 
  FaTimes, FaSpinner, FaUtensils, FaBan, 
  FaCheckCircle, FaChevronDown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiFetch, ENABLE_DEMO_FALLBACK } from '../config/api';
import { getCurrentUser } from '../config/auth';

const FloatingAiWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hi! I am Eativo AI, your personal dining companion. Ask me to recommend dishes, place orders, or cancel active orders right here!',
      time: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [botState, setBotState] = useState('idle'); // idle, thinking, speaking
  const [menuCache, setMenuCache] = useState([]);
  const [basket, setBasket] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  
  // Order settings
  const [address, setAddress] = useState('123 Gourmet Blvd, Foodie City');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showBasket, setShowBasket] = useState(false);

  const messagesEndRef = useRef(null);
  const location = useLocation();
  const currentUser = getCurrentUser();


  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Fetch initial restaurant, menu, and order data
  useEffect(() => {
    const loadInitData = async () => {
      try {
        const resResp = await apiFetch('/api/restaurants');
        if (resResp.ok) {
          const resData = await resResp.json();
          const allMenuItems = [];
          for (const rest of resData) {
            try {
              const menuResp = await apiFetch(`/api/menu/restaurant/${rest.id}`);
              if (menuResp.ok) {
                const menuData = await menuResp.json();
                const mapped = menuData.map(item => ({
                  ...item,
                  restaurantName: rest.name,
                  restaurantId: rest.id
                }));
                allMenuItems.push(...mapped);
              }
            } catch (err) {
              console.error(`Error loading menu:`, err);
            }
          }
          setMenuCache(allMenuItems);
        } else {
          loadMockData();
        }
      } catch (e) {
        loadMockData();
      }

      if (currentUser) {
        fetchUserOrders();
      }
    };

    loadInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMockData = () => {
    const mockMenuItems = [
      { id: 1001, name: 'Butter Chicken', description: 'Tender chicken in a rich, creamy spiced tomato sauce.', price: 16.99, category: 'Main Course', restaurantId: 101, restaurantName: 'Spice Garden' },
      { id: 1002, name: 'Garlic Naan', description: 'Freshly baked leavened flatbread topped with garlic and butter.', price: 3.99, category: 'Bread', restaurantId: 101, restaurantName: 'Spice Garden' },
      { id: 1003, name: 'Penne Arrabbiata', description: 'Spicy pasta dish made with garlic, tomatoes, and dried red chili peppers.', price: 14.50, category: 'Main Course', restaurantId: 102, restaurantName: 'Pasta Palace' },
      { id: 1004, name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice infused with wild mushrooms and white truffle oil.', price: 19.99, category: 'Main Course', restaurantId: 102, restaurantName: 'Pasta Palace' },
      { id: 1005, name: 'Classic Cheeseburger', description: 'Grilled beef patty, cheddar, lettuce, tomato, house sauce.', price: 11.99, category: 'Burgers', restaurantId: 103, restaurantName: 'Burger Bistro' },
      { id: 1007, name: 'Salmon Sashimi (5pcs)', description: 'Slices of premium raw Atlantic salmon, served with wasabi.', price: 15.00, category: 'Sashimi', restaurantId: 104, restaurantName: 'Sushi Zen' }
    ];
    setMenuCache(mockMenuItems);
  };

  const fetchUserOrders = async () => {
    if (!currentUser) return;
    try {
      const response = await apiFetch('/api/orders/me');
      if (response.ok) {
        const data = await response.json();
        setActiveOrders(data);
      } else if (ENABLE_DEMO_FALLBACK) {
        loadMockOrders();
      }
    } catch (error) {
      if (ENABLE_DEMO_FALLBACK) loadMockOrders();
    }
  };

  const loadMockOrders = () => {
    setActiveOrders([
      { id: 7001, status: 'Preparing', orderTime: new Date(Date.now() - 10 * 60000).toISOString(), deliveryTime: '25 mins', paymentMethod: 'UPI', totalAmount: 20.98, restaurantId: 101, restaurantName: 'Spice Garden' }
    ]);
  };

  const basketTotal = useMemo(() => {
    return basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [basket]);

  const basketRestaurantId = useMemo(() => {
    return basket.length > 0 ? basket[0].restaurantId : null;
  }, [basket]);

  const basketRestaurantName = useMemo(() => {
    return basket.length > 0 ? basket[0].restaurantName : null;
  }, [basket]);

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error('Please sign in to place an order');
      return;
    }
    if (basket.length === 0) {
      toast.error('Your basket is empty');
      return;
    }

    setBotState('thinking');
    const toastId = toast.loading('Placing order...');
    
    try {
      const payload = {
        totalAmount: basketTotal,
        paymentMethod: paymentMethod,
        address: address
      };

      const response = await apiFetch(`/api/orders?restaurantId=${basketRestaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const orderRes = await response.json();
        toast.success('Order placed successfully!', { id: toastId });
        
        setMessages(prev => [...prev, {
          id: `order-success-${Date.now()}`,
          sender: 'ai',
          text: `🎉 Order #${orderRes.id} has been placed at **${basketRestaurantName}**! Estimated delivery: ${orderRes.deliveryTime || '30 mins'}.`,
          time: new Date(),
          richContent: {
            type: 'receipt',
            orderId: orderRes.id,
            restaurantName: basketRestaurantName,
            total: basketTotal,
            address: address
          }
        }]);
        setBasket([]);
        setShowBasket(false);
        fetchUserOrders();
      } else {
        throw new Error('Order failed');
      }
    } catch (e) {
      if (ENABLE_DEMO_FALLBACK) {
        setTimeout(() => {
          toast.success('Demo Mode: Order placed!', { id: toastId });
          const orderId = Math.floor(Math.random() * 9000) + 1000;
          
          const newOrder = {
            id: orderId,
            status: 'Preparing',
            orderTime: new Date().toISOString(),
            deliveryTime: '35 mins',
            paymentMethod: paymentMethod,
            totalAmount: basketTotal,
            restaurantId: basketRestaurantId,
            restaurantName: basketRestaurantName
          };
          
          setActiveOrders(prev => [newOrder, ...prev]);
          setMessages(prev => [...prev, {
            id: `order-success-${Date.now()}`,
            sender: 'ai',
            text: `🎉 **[DEMO]** Order #${orderId} simulated at **${basketRestaurantName}**!`,
            time: new Date(),
            richContent: {
              type: 'receipt',
              orderId: orderId,
              restaurantName: basketRestaurantName,
              total: basketTotal,
              address: address
            }
          }]);
          setBasket([]);
          setShowBasket(false);
          setBotState('idle');
        }, 1000);
      } else {
        toast.error('Failed to place order', { id: toastId });
        setBotState('idle');
      }
    }
  };

  const handleCancelOrder = async (orderId, restName) => {
    setBotState('thinking');
    const toastId = toast.loading(`Canceling Order #${orderId}...`);
    
    try {
      const response = await apiFetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success(`Order cancelled`, { id: toastId });
        setMessages(prev => [...prev, {
          id: `cancel-success-${Date.now()}`,
          sender: 'ai',
          text: `🔴 Order #${orderId} from **${restName}** has been cancelled.`,
          time: new Date()
        }]);
        fetchUserOrders();
      } else {
        throw new Error('Cancel failed');
      }
    } catch (e) {
      if (ENABLE_DEMO_FALLBACK) {
        setTimeout(() => {
          toast.success(`Demo Mode: Order cancelled`, { id: toastId });
          setMessages(prev => [...prev, {
            id: `cancel-success-${Date.now()}`,
            sender: 'ai',
            text: `🔴 **[DEMO]** Order #${orderId} has been cancelled.`,
            time: new Date()
          }]);
          setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
          setBotState('idle');
        }, 800);
      } else {
        toast.error('Could not cancel order', { id: toastId });
        setBotState('idle');
      }
    }
  };

  const addToBasket = (item) => {
    if (basket.length > 0 && basket[0].restaurantId !== item.restaurantId) {
      toast.error(`You can only order from one restaurant at a time.`);
      return;
    }

    setBasket(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`Added ${item.name} to AI basket`);
  };

  const processAIResponse = (query) => {
    setBotState('thinking');
    const lower = query.toLowerCase().trim();

    setTimeout(() => {
      setBotState('idle');
      
      if (lower.match(/^(hello|hi|hey|greetings|hola)/)) {
        setMessages(prev => [...prev, {
          id: `resp-${Date.now()}`,
          sender: 'ai',
          text: 'Hello! I can help you search menus, place orders, or cancel active orders right here. Try: "show my orders" or "spicy food".',
          time: new Date()
        }]);
        return;
      }

      if (lower.includes('order') && (lower.includes('cancel') || lower.includes('show') || lower.includes('history') || lower.includes('status'))) {
        if (!currentUser) {
          setMessages(prev => [...prev, {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: 'Please sign in to view your orders.',
            time: new Date()
          }]);
          return;
        }

        fetchUserOrders();
        const pending = activeOrders.filter(o => o.status !== 'Cancelled');
        if (pending.length === 0) {
          setMessages(prev => [...prev, {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: 'You do not have any active orders. Say "show burgers" to order!',
            time: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: 'Here are your active orders. You can cancel them below:',
            time: new Date(),
            richContent: { type: 'orders-list', orders: pending }
          }]);
        }
        return;
      }

      if (lower.includes('checkout') || lower.includes('place order') || lower.includes('confirm order')) {
        if (basket.length === 0) {
          setMessages(prev => [...prev, {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: 'Your basket is empty. Add some food first, e.g. "recommend chicken".',
            time: new Date()
          }]);
        } else {
          setShowBasket(true);
          setMessages(prev => [...prev, {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: `I've opened your AI Basket drawer! Confirm details and click "Confirm Order" to place it.`,
            time: new Date()
          }]);
        }
        return;
      }

      // Recommend food engine
      let matches = [];
      let criteria = '';

      if (lower.includes('spicy') || lower.includes('chili') || lower.includes('pepper')) {
        criteria = 'spicy';
        matches = menuCache.filter(item => 
          item.name.toLowerCase().includes('spicy') || item.description.toLowerCase().includes('spicy') ||
          item.name.toLowerCase().includes('chili') || item.name.toLowerCase().includes('arrabbiata')
        );
      } else if (lower.includes('vegan') || lower.includes('veg') || lower.includes('vegetarian')) {
        criteria = 'vegetarian';
        matches = menuCache.filter(item => 
          item.description.toLowerCase().includes('vegan') || item.description.toLowerCase().includes('vegetarian') ||
          item.name.toLowerCase().includes('naan') || item.name.toLowerCase().includes('risotto')
        );
      } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('under 15')) {
        criteria = 'budget-friendly';
        matches = menuCache.filter(item => item.price < 15.0);
      } else if (lower.includes('burger') || lower.includes('american')) {
        criteria = 'burger';
        matches = menuCache.filter(item => item.name.toLowerCase().includes('burger') || item.name.toLowerCase().includes('fries'));
      } else if (lower.includes('italian') || lower.includes('pasta') || lower.includes('risotto')) {
        criteria = 'Italian';
        matches = menuCache.filter(item => item.name.toLowerCase().includes('penne') || item.name.toLowerCase().includes('risotto'));
      }

      if (matches.length === 0 && lower.length > 2) {
        matches = menuCache.filter(item => 
          item.name.toLowerCase().includes(lower) || item.description.toLowerCase().includes(lower)
        );
        criteria = `"${query}"`;
      }

      if (matches.length > 0) {
        setMessages(prev => [...prev, {
          id: `resp-${Date.now()}`,
          sender: 'ai',
          text: `I found **${matches.length}** **${criteria}** option(s). Add them to your basket:`,
          time: new Date(),
          richContent: { type: 'food-list', items: matches.slice(0, 3) }
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `resp-${Date.now()}`,
          sender: 'ai',
          text: `I couldn't find matches for "${query}". Try: "spicy", "vegan", "burgers", or "italian".`,
          time: new Date()
        }]);
      }
    }, 1200);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    processAIResponse(inputText);
  };

  // Hide floating widget on the dedicated full-page assistant route
  if (location.pathname === '/assistant') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      
      {/* 1. LIQUID GLASS FLOATING ACTION BUTTON (FAB) */}
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 rounded-full flex items-center justify-center relative cursor-pointer group border border-white/20 dark:border-white/10"
        style={{
          // Refractive Liquid Glass
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)',
          backdropFilter: 'blur(16px) saturate(160%)',
          boxShadow: '0 8px 32px 0 rgba(255, 90, 95, 0.25), inset 1px 1px 3px rgba(255,255,255,0.4)',
        }}
      >
        {/* Pulsing Liquid Core inside Button */}
        <div 
          className="absolute inset-2.5 rounded-full opacity-85 transition-transform group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #ff5a5f 0%, #dfb743 100%)',
            boxShadow: '0 0 8px #ff5a5f',
            animation: 'pulse 2s infinite ease-in-out'
          }}
        />
        <FaRobot className="relative z-10 text-white text-lg group-hover:animate-bounce" />
        
        {/* Pulse Ring */}
        <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-ping pointer-events-none opacity-40" />
      </motion.button>

      {/* 2. COMPACT LIQUID GLASS CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="absolute bottom-18 right-0 w-[350px] h-[480px] rounded-3xl overflow-hidden flex flex-col border border-white/20 dark:border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.6) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            {/* Glossy Header */}
            <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-md">
                  <FaRobot size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase">Eativo AI Companion</h3>
                  <span className="text-[9px] font-mono text-green-400 tracking-widest flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> ONLINE
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FaChevronDown size={14} />
              </button>
            </div>

            {/* Chat Body & Basket Overlays */}
            <div className="flex-grow overflow-hidden relative flex flex-col">
              
              {/* MESSAGES DISPLAY LIST */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md border ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary-light border-primary/25 rounded-tr-none text-white'
                          : 'bg-slate-900/50 border-white/5 rounded-tl-none text-slate-100'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                      
                      {/* Rich Elements (Menu Cards, Order Cards, Receipts) */}
                      {msg.richContent && (
                        <div className="mt-3 border-t border-white/10 pt-3 space-y-2">
                          
                          {/* Food Suggestions */}
                          {msg.richContent.type === 'food-list' && (
                            <div className="space-y-2">
                              {msg.richContent.items.map(food => (
                                <div key={food.id} className="flex gap-2.5 bg-slate-950/40 border border-white/5 p-2.5 rounded-xl hover:border-primary/20 transition-all">
                                  <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center text-primary border border-white/10">
                                    <FaUtensils size={14} />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start gap-1">
                                      <h4 className="text-[10px] font-bold truncate text-white">{food.name}</h4>
                                      <span className="text-[10px] font-bold text-accent shrink-0">${food.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-[8px] text-slate-500 truncate max-w-[100px]">{food.restaurantName}</span>
                                      <button 
                                        onClick={() => addToBasket(food)}
                                        className="text-[9px] bg-primary/20 hover:bg-primary text-white font-bold px-2 py-0.5 rounded transition-colors border border-primary/20 hover:border-transparent active:scale-95"
                                      >
                                        + Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Active Orders */}
                          {msg.richContent.type === 'orders-list' && (
                            <div className="space-y-2">
                              {msg.richContent.orders.map(order => (
                                <div key={order.id} className="bg-slate-950/50 border border-white/5 p-2 rounded-xl text-[10px]">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">Order #{order.id}</span>
                                    <span className="text-[8px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-2 py-0.5 rounded-full animate-pulse">
                                      {order.status}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1 text-[9px] text-slate-400">
                                    <span>{order.restaurantName}</span>
                                    <span>${order.totalAmount.toFixed(2)}</span>
                                  </div>
                                  {order.status !== 'Cancelled' && (
                                    <button 
                                      onClick={() => handleCancelOrder(order.id, order.restaurantName)}
                                      className="mt-2 w-full flex items-center justify-center gap-1.5 text-[9px] bg-rose-900/20 hover:bg-rose-600 border border-rose-900/40 text-rose-200 hover:text-white font-bold py-1 rounded transition-all"
                                    >
                                      <FaBan size={8} /> Cancel Order
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Order Receipt */}
                          {msg.richContent.type === 'receipt' && (
                            <div className="bg-slate-950/60 border border-primary/20 p-3 rounded-xl text-[10px] space-y-1.5">
                              <div className="flex items-center gap-1.5 text-green-400 font-bold">
                                <FaCheckCircle size={12} />
                                <span>AI Order Placed</span>
                              </div>
                              <div className="border-b border-white/5 pb-1.5 text-[9px] text-slate-400 space-y-1">
                                <div className="flex justify-between">
                                  <span>Receipt ID:</span>
                                  <span className="font-mono text-white">#{msg.richContent.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Restaurant:</span>
                                  <span className="text-white font-semibold">{msg.richContent.restaurantName}</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-0.5">
                                <span className="font-bold text-slate-300">Charged Amount:</span>
                                <span className="font-black text-accent">${msg.richContent.total.toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* FLOATING LIQUID GLASS BASKET DRAWER OVERLAY */}
              <AnimatePresence>
                {showBasket && basket.length > 0 && (
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute inset-x-0 bottom-0 max-h-[85%] border-t border-white/10 flex flex-col p-4 z-20 shadow-[0_-8px_24px_rgba(0,0,0,0.5)] rounded-t-3xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                      <div className="flex items-center gap-1.5 text-accent text-xs">
                        <FaShoppingBasket />
                        <span className="font-bold">AI Basket</span>
                      </div>
                      <button onClick={() => setShowBasket(false)} className="text-slate-400 hover:text-white p-1">
                        <FaTimes size={12} />
                      </button>
                    </div>

                    {/* Basket Items List */}
                    <div className="space-y-2 overflow-y-auto flex-grow mb-3 pr-1">
                      {basket.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-900/50 border border-white/5 p-2 rounded-lg text-[11px]">
                          <div className="min-w-0 flex-grow mr-2">
                            <p className="font-semibold truncate text-white">{item.name}</p>
                            <p className="text-[9px] text-slate-400">${item.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => setBasket(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0))}
                              className="h-5 w-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold w-3 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => setBasket(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                              className="h-5 w-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Form Details */}
                    <div className="space-y-2 border-t border-white/5 pt-3 mb-3 text-[10px]">
                      <div>
                        <label className="text-[8px] font-mono uppercase text-slate-400 block mb-0.5">Address</label>
                        <input 
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/5 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Order Trigger */}
                    <div className="border-t border-white/5 pt-3 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Total:</span>
                        <span className="font-black text-accent text-sm">${basketTotal.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={handlePlaceOrder}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:brightness-105 active:scale-95 text-white py-2 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                      >
                        <FaCheckCircle size={12} /> Confirm Order
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>

            {/* Quick Actions Suggestions Bar (above input, hide if basket open) */}
            {!showBasket && (
              <div className="px-4 py-1.5 border-t border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-950/20 select-none">
                {[
                  { text: 'Spicy Meals', val: 'recommend something spicy!' },
                  { text: 'My Orders', val: 'show active orders' },
                  { text: 'Burgers', val: 'show burgers' },
                  { text: 'Vegan Diet', val: 'healthy vegan dishes' }
                ].map((chip) => (
                  <button
                    key={chip.text}
                    onClick={() => {
                      const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: chip.val, time: new Date() };
                      setMessages(prev => [...prev, userMsg]);
                      processAIResponse(chip.val);
                    }}
                    className="text-[9px] font-semibold bg-white/5 border border-white/5 hover:bg-primary/20 hover:border-primary/20 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            )}

            {/* Glossy Chat Input Block */}
            <div className="p-3 border-t border-white/10 bg-slate-950/40 flex gap-2">
              {basket.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBasket(!showBasket)}
                  className="h-9 w-9 shrink-0 rounded-xl bg-accent/20 hover:bg-accent/40 text-accent flex items-center justify-center transition-colors relative cursor-pointer border border-accent/20"
                  title="View AI Basket"
                >
                  <FaShoppingBasket size={12} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {basket.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </button>
              )}
              <form onSubmit={handleSendMessage} className="flex-grow flex gap-1.5">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={basket.length > 0 ? "Type 'place order' or chat..." : "Order spicy food, show orders..."}
                  className="flex-grow px-3 py-2 rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-xs focus:ring-1 focus:ring-primary/20"
                  disabled={botState === 'thinking'}
                />
                <button 
                  type="submit"
                  className="h-9 w-9 shrink-0 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                  disabled={botState === 'thinking'}
                >
                  {botState === 'thinking' ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane size={11} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FloatingAiWidget;
