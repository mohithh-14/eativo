import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, FaPaperPlane, FaTrash, FaShoppingBasket, 
  FaTimes, FaSpinner, FaUtensils, FaBan, 
  FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiFetch, ENABLE_DEMO_FALLBACK } from '../config/api';
import { getCurrentUser } from '../config/auth';

// --- 3D HOLOGRAPHIC AI AVATAR COMPONENT (HTML5 CANVAS) ---
const Ai3dAvatar = ({ state }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set display size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth || 350;
      canvas.height = canvas.parentElement.clientHeight || 350;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate 3D points on a sphere
    const particleCount = 180;
    const particles = [];
    const radius = 90;

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const theta = Math.acos(1 - (2 * i) / particleCount);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;

      particles.push({
        x: radius * Math.cos(phi) * Math.sin(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(theta),
        baseX: radius * Math.cos(phi) * Math.sin(theta),
        baseY: radius * Math.sin(phi) * Math.sin(theta),
        baseZ: radius * Math.cos(theta),
        colorIdx: i % 3
      });
    }

    // Animation angles
    let angleX = 0.005;
    let angleY = 0.005;
    let angleZ = 0.002;
    let pulseTime = 0;

    // Track mouse moves to rotate the 3D entity
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - canvas.width / 2;
      const y = e.clientY - rect.top - canvas.height / 2;
      mouseRef.current.targetX = x * 0.005;
      mouseRef.current.targetY = y * 0.005;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 3D Rotation Math
    const rotateX = (point, angle) => {
      const rad = angle;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const y = point.y * cos - point.z * sin;
      const z = point.y * sin + point.z * cos;
      return { ...point, y, z };
    };

    const rotateY = (point, angle) => {
      const rad = angle;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = point.x * cos + point.z * sin;
      const z = -point.x * sin + point.z * cos;
      return { ...point, x, z };
    };

    const rotateZ = (point, angle) => {
      const rad = angle;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = point.x * cos - point.y * sin;
      const y = point.x * sin + point.y * cos;
      return { ...point, x, y };
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Draw glowing background podium
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 170);
      if (state === 'thinking') {
        grad.addColorStop(0, 'rgba(255, 90, 95, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'speaking') {
        grad.addColorStop(0, 'rgba(223, 183, 67, 0.06)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'listening') {
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Smoothly interpolate mouse rotation offsets
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      pulseTime += 0.05;
      
      // Dynamic adjustments based on state
      let pulseAmp = 1.0;
      let rotSpeedMultiplier = 1.0;
      let particleColor = 'rgba(6, 182, 212, 0.8)'; // default teal
      let connectionColor = 'rgba(6, 182, 212, 0.15)';
      let secondaryColor = 'rgba(223, 183, 67, 0.8)'; // gold

      if (state === 'thinking') {
        pulseAmp = 1.0 + Math.sin(pulseTime * 2) * 0.15;
        rotSpeedMultiplier = 2.5;
        particleColor = 'rgba(255, 90, 95, 0.85)'; // coral
        connectionColor = 'rgba(255, 90, 95, 0.2)';
      } else if (state === 'speaking') {
        pulseAmp = 1.0 + Math.abs(Math.sin(pulseTime * 3)) * 0.25;
        rotSpeedMultiplier = 1.5;
        particleColor = 'rgba(223, 183, 67, 0.9)'; // gold
        connectionColor = 'rgba(223, 183, 67, 0.25)';
      } else if (state === 'listening') {
        pulseAmp = 1.1 + Math.sin(pulseTime * 4) * 0.08;
        rotSpeedMultiplier = 0.8;
        particleColor = 'rgba(168, 85, 247, 0.9)'; // purple
        connectionColor = 'rgba(168, 85, 247, 0.2)';
      } else { // idle
        pulseAmp = 1.0 + Math.sin(pulseTime * 0.5) * 0.05;
        rotSpeedMultiplier = 1.0;
        particleColor = 'rgba(6, 182, 212, 0.7)';
        connectionColor = 'rgba(6, 182, 212, 0.1)';
      }

      // Rotate and project points
      const projected = [];
      const perspective = 300;

      for (let i = 0; i < particles.length; i++) {
        let p = { ...particles[i] };

        // Deform coordinates based on state (pulsing waves)
        if (state === 'speaking') {
          // Wave ripple effect from bottom to top
          const factor = Math.sin(p.baseY * 0.05 - pulseTime * 2) * 10;
          p.x = p.baseX * pulseAmp + (p.baseX / radius) * factor;
          p.y = p.baseY * pulseAmp + (p.baseY / radius) * factor;
          p.z = p.baseZ * pulseAmp + (p.baseZ / radius) * factor;
        } else if (state === 'thinking') {
          // Spiraling contracting effect
          const factor = Math.cos(pulseTime * 3 + i * 0.1) * 8;
          p.x = p.baseX * pulseAmp + (p.baseY / radius) * factor;
          p.y = p.baseY * pulseAmp - (p.baseX / radius) * factor;
        } else {
          p.x = p.baseX * pulseAmp;
          p.y = p.baseY * pulseAmp;
          p.z = p.baseZ * pulseAmp;
        }

        // Apply continuous rotation + mouse interaction
        p = rotateX(p, (angleX * rotSpeedMultiplier) + mouseRef.current.y);
        p = rotateY(p, (angleY * rotSpeedMultiplier) + mouseRef.current.x);
        p = rotateZ(p, angleZ * rotSpeedMultiplier);

        // Update base coordinates slowly for passive drifting rotation
        particles[i].baseX = rotateX(particles[i], 0.004).x;
        particles[i].baseY = rotateX(particles[i], 0.004).y;
        particles[i].baseZ = rotateX(particles[i], 0.004).z;

        // Perspective Projection
        const scale = perspective / (perspective + p.z);
        const projX = p.x * scale + cx;
        const projY = p.y * scale + cy;

        projected.push({
          x: projX,
          y: projY,
          z: p.z,
          colorIdx: p.colorIdx
        });
      }

      // Sort by depth (Z) to render back-to-front (painter's algorithm)
      projected.sort((a, b) => b.z - a.z);

      // Draw faint connections (lines) between neighboring particles
      ctx.strokeStyle = connectionColor;
      ctx.lineWidth = 0.5;
      
      // Connect points that are close in index to make a mesh pattern
      for (let i = 0; i < projected.length; i += 2) {
        if (i + 12 < projected.length) {
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[i + 12].x, projected[i + 12].y);
          ctx.stroke();
        }
        if (i + 1 < projected.length && projected[i].z > 0) {
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[i + 1].x, projected[i + 1].y);
          ctx.stroke();
        }
      }

      // Draw particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        
        // Perspective sizing
        const size = Math.max(0.5, ((radius - p.z) / radius) * 2.5 + 0.5);
        
        // Calculate alpha based on depth
        const alpha = Math.max(0.1, ((radius - p.z) / (2 * radius)) * 0.8 + 0.2);

        // Gradient color blending
        ctx.fillStyle = p.z > 0 
          ? particleColor.replace('0.7', alpha.toString()).replace('0.8', alpha.toString()).replace('0.9', alpha.toString())
          : secondaryColor.replace('0.8', (alpha * 0.6).toString());

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add extra glow to front particles
        if (p.z < -60 && i % 4 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [state]);

  return (
    <div className="relative w-full h-72 md:h-80 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/25 border border-white/5 backdrop-blur-md">
      <canvas ref={canvasRef} className="cursor-pointer" />
      {/* Visual State Badges */}
      <div className="absolute bottom-4 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
        <span className={`h-2 w-2 rounded-full ${
          state === 'idle' ? 'bg-cyan-400 animate-pulse' :
          state === 'listening' ? 'bg-purple-400 animate-ping' :
          state === 'thinking' ? 'bg-rose-400 animate-spin' : 'bg-amber-400 animate-pulse'
        }`} />
        <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase">
          SYS_STATE: {state}
        </span>
      </div>
    </div>
  );
};

// --- MAIN AI ASSISTANT PAGE ---
const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Eativo AI holographic assistant. I can recommend culinary experiences tailored to your taste, help you search menus, place orders, or cancel pending orders. How can I help you dine today?',
      time: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [botState, setBotState] = useState('idle'); // idle, listening, thinking, speaking
  const [restaurants, setRestaurants] = useState([]); // eslint-disable-line no-unused-vars
  const [menuCache, setMenuCache] = useState([]);
  const [basket, setBasket] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false); // eslint-disable-line no-unused-vars
  
  // Order parameters
  const [address, setAddress] = useState('123 Gourmet Blvd, Foodie City');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const messagesEndRef = useRef(null);
  const currentUser = getCurrentUser();

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load active orders and restaurant/menu data on mount
  useEffect(() => {
    const loadInitData = async () => {
      setBotState('thinking');
      try {
        // 1. Fetch Restaurants
        const resResp = await apiFetch('/api/restaurants');
        if (resResp.ok) {
          const resData = await resResp.json();
          setRestaurants(resData);
          
          // 2. Fetch menus for all restaurants to build a smart search index
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
              console.error(`Error loading menu for restaurant ${rest.id}:`, err);
            }
          }
          setMenuCache(allMenuItems);
        } else {
          // Load fallback mock data if server is unconfigured
          loadMockData();
        }
      } catch (e) {
        console.error('Failed to load live data, entering demo fallback:', e);
        loadMockData();
      }

      // 3. Fetch active orders
      if (currentUser) {
        fetchUserOrders();
      } else {
        setBotState('idle');
      }
    };

    loadInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to load rich fallback mock data
  const loadMockData = () => {
    const mockRestaurants = [
      { id: 101, name: 'Spice Garden', cuisine: 'Indian', location: 'Downtown', priceRange: '$$' },
      { id: 102, name: 'Pasta Palace', cuisine: 'Italian', location: 'West End', priceRange: '$$$' },
      { id: 103, name: 'Burger Bistro', cuisine: 'American', location: 'Central Square', priceRange: '$' },
      { id: 104, name: 'Sushi Zen', cuisine: 'Japanese', location: 'Metro Mall', priceRange: '$$$$' }
    ];
    setRestaurants(mockRestaurants);

    const mockMenuItems = [
      { id: 1001, name: 'Butter Chicken', description: 'Tender chicken in a rich, creamy spiced tomato sauce.', price: 16.99, category: 'Main Course', restaurantId: 101, restaurantName: 'Spice Garden' },
      { id: 1002, name: 'Garlic Naan', description: 'Freshly baked leavened flatbread topped with garlic and butter.', price: 3.99, category: 'Bread', restaurantId: 101, restaurantName: 'Spice Garden' },
      { id: 1003, name: 'Penne Arrabbiata', description: 'Spicy pasta dish made with garlic, tomatoes, and dried red chili peppers.', price: 14.50, category: 'Main Course', restaurantId: 102, restaurantName: 'Pasta Palace' },
      { id: 1004, name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice infused with wild mushrooms and white truffle oil.', price: 19.99, category: 'Main Course', restaurantId: 102, restaurantName: 'Pasta Palace' },
      { id: 1005, name: 'Classic Cheeseburger', description: 'Grilled angus beef patty, cheddar, lettuce, tomato, house sauce, brioche bun.', price: 11.99, category: 'Burgers', restaurantId: 103, restaurantName: 'Burger Bistro' },
      { id: 1006, name: 'Loaded Truffle Fries', description: 'Crispy golden fries tossed in truffle salt, parmesan, and parsley.', price: 6.50, category: 'Sides', restaurantId: 103, restaurantName: 'Burger Bistro' },
      { id: 1007, name: 'Salmon Sashimi (5pcs)', description: 'Slices of premium raw Atlantic salmon, served with wasabi.', price: 15.00, category: 'Sashimi', restaurantId: 104, restaurantName: 'Sushi Zen' },
      { id: 1008, name: 'Dragon Roll', description: 'Eel and cucumber roll inside, topped with avocado and sweet eel sauce.', price: 17.50, category: 'Special Rolls', restaurantId: 104, restaurantName: 'Sushi Zen' }
    ];
    setMenuCache(mockMenuItems);
    setBotState('idle');
  };

  // Fetch orders from backend
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const response = await apiFetch('/api/orders/me');
      if (response.ok) {
        const data = await response.json();
        setActiveOrders(data);
      } else if (ENABLE_DEMO_FALLBACK) {
        loadMockOrders();
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (ENABLE_DEMO_FALLBACK) loadMockOrders();
    } finally {
      setLoadingOrders(false);
      setBotState('idle');
    }
  };

  const loadMockOrders = () => {
    const mock = [
      { id: 7001, status: 'Preparing', orderTime: new Date(Date.now() - 10 * 60000).toISOString(), deliveryTime: '25 mins', paymentMethod: 'UPI', totalAmount: 20.98, restaurantId: 101, restaurantName: 'Spice Garden' }
    ];
    setActiveOrders(mock);
  };

  // Calculate totals
  const basketTotal = useMemo(() => {
    return basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [basket]);

  const basketRestaurantId = useMemo(() => {
    return basket.length > 0 ? basket[0].restaurantId : null;
  }, [basket]);

  const basketRestaurantName = useMemo(() => {
    return basket.length > 0 ? basket[0].restaurantName : null;
  }, [basket]);

  // Handle placing order via AI
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
    const toastId = toast.loading('Placing order via Eativo AI...');
    
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
        
        const successMsg = {
          id: `order-success-${Date.now()}`,
          sender: 'ai',
          text: `🎉 Order #${orderRes.id} has been successfully placed at **${basketRestaurantName}**! They are preparing your food, estimated delivery is ${orderRes.deliveryTime || '30 mins'}.`,
          time: new Date(),
          richContent: {
            type: 'receipt',
            orderId: orderRes.id,
            restaurantName: basketRestaurantName,
            total: basketTotal,
            address: address
          }
        };

        setMessages(prev => [...prev, successMsg]);
        setBasket([]); // clear basket
        fetchUserOrders(); // reload orders
      } else {
        throw new Error('Server returned an error');
      }
    } catch (e) {
      console.error('Failed to place order:', e);
      if (ENABLE_DEMO_FALLBACK) {
        setTimeout(() => {
          toast.success('Demo Mode: Order placed successfully!', { id: toastId });
          const orderId = Math.floor(Math.random() * 9000) + 1000;
          const successMsg = {
            id: `order-success-${Date.now()}`,
            sender: 'ai',
            text: `🎉 **[DEMO MODE]** Order #${orderId} has been simulated at **${basketRestaurantName}**! Estimated delivery is 35 mins.`,
            time: new Date(),
            richContent: {
              type: 'receipt',
              orderId: orderId,
              restaurantName: basketRestaurantName,
              total: basketTotal,
              address: address
            }
          };
          
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
          setMessages(prev => [...prev, successMsg]);
          setBasket([]);
          setBotState('idle');
        }, 1000);
      } else {
        toast.error('Failed to place order. Please try again.', { id: toastId });
        setBotState('idle');
      }
    }
  };

  // Handle canceling order via AI
  const handleCancelOrder = async (orderId, restName) => {
    setBotState('thinking');
    const toastId = toast.loading(`Canceling Order #${orderId}...`);
    
    try {
      const response = await apiFetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success(`Order #${orderId} cancelled`, { id: toastId });
        
        setMessages(prev => [
          ...prev,
          {
            id: `cancel-success-${Date.now()}`,
            sender: 'ai',
            text: `🔴 Order #${orderId} from **${restName}** has been successfully cancelled. Your refund (if paid online) will be processed shortly.`,
            time: new Date()
          }
        ]);
        fetchUserOrders(); // refresh
      } else {
        throw new Error('Server returned an error');
      }
    } catch (e) {
      console.error('Failed to cancel order:', e);
      if (ENABLE_DEMO_FALLBACK) {
        setTimeout(() => {
          toast.success(`Demo Mode: Order #${orderId} cancelled`, { id: toastId });
          setMessages(prev => [
            ...prev,
            {
              id: `cancel-success-${Date.now()}`,
              sender: 'ai',
              text: `🔴 **[DEMO MODE]** Order #${orderId} from **${restName}** has been successfully cancelled.`,
              time: new Date()
            }
          ]);
          
          setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
          setBotState('idle');
        }, 800);
      } else {
        toast.error('Could not cancel order. It might already be in transit.', { id: toastId });
        setBotState('idle');
      }
    }
  };

  const addToBasket = (item) => {
    if (basket.length > 0 && basket[0].restaurantId !== item.restaurantId) {
      toast.error(`You can only order from one restaurant at a time. Active basket is from ${basket[0].restaurantName}.`);
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

    setBotState('speaking');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `add-basket-${Date.now()}`,
          sender: 'ai',
          text: `Added **${item.name}** ($${item.price.toFixed(2)}) to your basket. You can see your updated receipt in the basket panel. Type "place order" to finalize it!`,
          time: new Date()
        }
      ]);
      setBotState('idle');
    }, 500);
  };

  const processAIResponse = (query) => {
    setBotState('thinking');
    const lower = query.toLowerCase().trim();

    setTimeout(() => {
      setBotState('speaking');
      
      if (lower.match(/^(hello|hi|hey|greetings|hola|wasup|yo)/)) {
        setMessages(prev => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: 'Hello! I am your interactive holographic dining companion. I can search restaurants, recommend custom meals, place orders, or help you cancel active orders. Try asking: "recommend some spicy options" or "show active orders".',
            time: new Date()
          }
        ]);
        setBotState('idle');
        return;
      }

      if (lower.includes('order') && (lower.includes('cancel') || lower.includes('show') || lower.includes('history') || lower.includes('status'))) {
        if (!currentUser) {
          setMessages(prev => [
            ...prev,
            {
              id: `resp-${Date.now()}`,
              sender: 'ai',
              text: 'I can help you manage your active orders, but you need to be logged in first. Please sign in to view your orders.',
              time: new Date()
            }
          ]);
          setBotState('idle');
          return;
        }

        fetchUserOrders();
        
        const pending = activeOrders.filter(o => o.status !== 'Cancelled');
        if (pending.length === 0) {
          setMessages(prev => [
            ...prev,
            {
              id: `resp-${Date.now()}`,
              sender: 'ai',
              text: 'You do not have any active orders right now. Would you like to check out some restaurant menus? Try saying: "show italian food".',
              time: new Date()
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `resp-${Date.now()}`,
              sender: 'ai',
              text: `I found **${pending.length}** active order(s) for you. You can cancel any pending order below before it goes out for delivery:`,
              time: new Date(),
              richContent: {
                type: 'orders-list',
                orders: pending
              }
            }
          ]);
        }
        setBotState('idle');
        return;
      }

      if (lower.includes('checkout') || lower.includes('place order') || lower.includes('buy') || lower.includes('confirm order')) {
        if (basket.length === 0) {
          setMessages(prev => [
            ...prev,
            {
              id: `resp-${Date.now()}`,
              sender: 'ai',
              text: 'Your basket is currently empty. Add some delicious dishes by asking me to recommend something, e.g., "show burgers".',
              time: new Date()
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `resp-${Date.now()}`,
              sender: 'ai',
              text: `Perfect! Let's get that ordered. You have **${basket.reduce((s, i) => s + i.quantity, 0)}** item(s) from **${basketRestaurantName}** totaling **$${basketTotal.toFixed(2)}**.\n\nTo finalize, confirm your address and payment method in the basket panel and click **Confirm Order**, or tell me "confirm and place order".`,
              time: new Date()
            }
          ]);
        }
        setBotState('idle');
        return;
      }

      if (lower.includes('confirm and place') || lower.includes('confirm order')) {
        if (basket.length > 0) {
          handlePlaceOrder();
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `resp-${Date.now()}`,
              sender: 'ai',
              text: 'Your basket is empty. What would you like to add first?',
              time: new Date()
            }
          ]);
          setBotState('idle');
        }
        return;
      }

      let matches = [];
      let criteria = '';

      if (lower.includes('spicy') || lower.includes('hot') || lower.includes('pepper')) {
        criteria = 'spicy';
        matches = menuCache.filter(item => 
          item.name.toLowerCase().includes('spicy') || 
          item.description.toLowerCase().includes('spicy') ||
          item.name.toLowerCase().includes('chili') || 
          item.description.toLowerCase().includes('chili') ||
          item.name.toLowerCase().includes('arrabbiata')
        );
      } else if (lower.includes('vegan') || lower.includes('veg') || lower.includes('vegetarian')) {
        criteria = 'vegetarian/vegan';
        matches = menuCache.filter(item => 
          item.description.toLowerCase().includes('vegan') || 
          item.description.toLowerCase().includes('vegetarian') ||
          item.name.toLowerCase().includes('naan') || 
          item.name.toLowerCase().includes('risotto') ||
          item.category.toLowerCase().includes('bread')
        );
      } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('under 15') || lower.includes('low price')) {
        criteria = 'budget-friendly (under $15)';
        matches = menuCache.filter(item => item.price < 15.0);
      } else if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('cake') || lower.includes('ice cream')) {
        criteria = 'sweet desserts';
        matches = menuCache.filter(item => 
          item.category.toLowerCase().includes('dessert') || 
          item.description.toLowerCase().includes('sweet') ||
          item.name.toLowerCase().includes('cake')
        );
      } else if (lower.includes('italian') || lower.includes('pasta') || lower.includes('pizza') || lower.includes('risotto')) {
        criteria = 'Italian';
        matches = menuCache.filter(item => 
          item.restaurantName.toLowerCase().includes('pasta') || 
          item.name.toLowerCase().includes('penne') || 
          item.name.toLowerCase().includes('risotto')
        );
      } else if (lower.includes('indian') || lower.includes('chicken') || lower.includes('curry') || lower.includes('naan')) {
        criteria = 'Indian cuisine';
        matches = menuCache.filter(item => 
          item.restaurantName.toLowerCase().includes('spice') || 
          item.name.toLowerCase().includes('chicken') || 
          item.name.toLowerCase().includes('naan')
        );
      } else if (lower.includes('burger') || lower.includes('fries') || lower.includes('american')) {
        criteria = 'burger & fries';
        matches = menuCache.filter(item => 
          item.name.toLowerCase().includes('burger') || 
          item.name.toLowerCase().includes('fries')
        );
      } else if (lower.includes('sushi') || lower.includes('salmon') || lower.includes('japanese') || lower.includes('sashimi')) {
        criteria = 'sushi & sashimi';
        matches = menuCache.filter(item => 
          item.name.toLowerCase().includes('roll') || 
          item.name.toLowerCase().includes('sashimi') ||
          item.restaurantName.toLowerCase().includes('sushi')
        );
      }

      if (matches.length === 0 && lower.length > 2) {
        matches = menuCache.filter(item => 
          item.name.toLowerCase().includes(lower) || 
          item.description.toLowerCase().includes(lower) ||
          item.category.toLowerCase().includes(lower) ||
          item.restaurantName.toLowerCase().includes(lower)
        );
        criteria = `"${query}"`;
      }

      if (matches.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: `I searched Eativo and found **${matches.length}** premium **${criteria}** option(s) for you. Click **Add to Basket** to select any item:`,
            time: new Date(),
            richContent: {
              type: 'food-list',
              items: matches.slice(0, 4)
            }
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            sender: 'ai',
            text: `I couldn't find any exact matches for "${query}" in our active menus. Try asking for **spicy**, **vegan**, **Italian**, **Indian**, **burgers**, or **sushi**!`,
            time: new Date()
          }
        ]);
      }
      setBotState('idle');
    }, 1500);
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

  const handleSuggestionClick = (suggestionText) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: suggestionText,
      time: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    processAIResponse(suggestionText);
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,90,95,0.15),rgba(255,255,255,0))] py-24 px-4 md:px-8 text-white">
      <div className="container mx-auto max-w-7xl">
        
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary mb-4"
          >
            <FaRobot className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Next-Gen AI Companion</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
            Eativo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Holographic Assistant</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base">
            Interact with our AI dining entity to place or cancel orders, explore flavor compositions, and experience premium glassmorphic restaurant services.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 3D Entity & System Metrics (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Hologram Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-950/40 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                Holographic Projector
              </h2>

              <Ai3dAvatar state={botState} />

              <div className="w-40 h-2 bg-gradient-to-r from-cyan-500/0 via-cyan-400/30 to-cyan-500/0 rounded-full mx-auto filter blur-sm mt-3 animate-pulse" />
              
              <div className="flex justify-center items-center gap-1.5 mt-6 h-8">
                {[...Array(12)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-1 rounded-full bg-gradient-to-t from-primary to-accent transition-all duration-300 ${
                      botState === 'speaking' ? 'animate-bounce' :
                      botState === 'thinking' ? 'animate-pulse' : 'h-2 opacity-40'
                    }`}
                    style={{ 
                      height: botState === 'speaking' ? `${Math.random() * 24 + 6}px` : botState === 'thinking' ? `${Math.random() * 12 + 6}px` : '6px',
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Quick Actions Suggestions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-950/40 border border-white/10 backdrop-blur-xl rounded-3xl p-6"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Suggestive Inquiries</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Recommend something spicy!',
                  'Show me Indian dishes',
                  'Budget meals under $15',
                  'Cancel my active order',
                  'Healthy vegan dishes'
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-xs px-3.5 py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/30 transition-all text-slate-300 hover:text-white text-left active:scale-95"
                  >
                    ✦ {sug}
                  </button>
                ))}
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Chat Panel & Basket (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Chat Pane */}
            <div className={`${basket.length > 0 ? 'md:col-span-7' : 'md:col-span-12'} flex flex-col w-full`}>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col h-[70vh] overflow-hidden"
              >
                {/* Chat Panel Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-slate-950/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/10">
                      <FaRobot size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold tracking-wide">Eativo AI</h2>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">ONLINE</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMessages([{ id: 'welcome', sender: 'ai', text: 'Chat history cleared. How can I assist you?', time: new Date() }])}
                    className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors"
                    title="Clear Chat"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                {/* Messages Screen */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm transition-all shadow-md ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-tr-none'
                            : 'bg-slate-900/80 border border-white/5 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                        
                        {msg.richContent && (
                          <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                            
                            {msg.richContent.type === 'food-list' && (
                              <div className="grid grid-cols-1 gap-3">
                                {msg.richContent.items.map(food => (
                                  <div key={food.id} className="flex gap-3 bg-slate-950/40 border border-white/5 p-3 rounded-xl hover:border-primary/20 transition-all">
                                    <div className="h-14 w-14 rounded-lg bg-slate-800 flex items-center justify-center text-primary border border-white/10">
                                      <FaUtensils size={20} />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <div className="flex justify-between items-start gap-1">
                                        <h4 className="text-xs font-bold truncate text-white">{food.name}</h4>
                                        <span className="text-xs font-bold text-accent shrink-0">${food.price.toFixed(2)}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{food.description}</p>
                                      <div className="flex justify-between items-center mt-2">
                                        <span className="text-[9px] text-slate-500 font-mono">From: {food.restaurantName}</span>
                                        <button 
                                          onClick={() => addToBasket(food)}
                                          className="text-[10px] bg-primary/20 hover:bg-primary text-white font-bold px-2 py-1 rounded-lg transition-colors border border-primary/20 hover:border-transparent active:scale-95"
                                        >
                                          + Add Basket
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {msg.richContent.type === 'orders-list' && (
                              <div className="grid grid-cols-1 gap-3">
                                {msg.richContent.orders.map(order => (
                                  <div key={order.id} className="bg-slate-950/50 border border-white/5 p-3 rounded-xl">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-white">Order #{order.id}</span>
                                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                                        order.status === 'Cancelled' ? 'bg-rose-950 text-rose-400 border border-rose-800/30' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/30 animate-pulse'
                                      }`}>
                                        {order.status}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                                      <span>Restaurant: **{order.restaurantName}**</span>
                                      <span>Total: **${order.totalAmount.toFixed(2)}**</span>
                                    </div>
                                    {order.status !== 'Cancelled' && (
                                      <button 
                                        onClick={() => handleCancelOrder(order.id, order.restaurantName)}
                                        className="mt-3 w-full flex items-center justify-center gap-1.5 text-[10px] bg-rose-900/20 hover:bg-rose-600 border border-rose-900/40 text-rose-200 hover:text-white font-bold py-1.5 rounded-lg transition-all"
                                      >
                                        <FaBan size={10} /> Cancel Order
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {msg.richContent.type === 'receipt' && (
                              <div className="bg-slate-950/60 border border-primary/20 p-4 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-green-400">
                                  <FaCheckCircle />
                                  <h4 className="text-xs font-bold">AI Order Receipt</h4>
                                </div>
                                <div className="border-b border-white/5 pb-2 text-[10px] text-slate-400 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Order ID:</span>
                                    <span className="font-mono text-white">#{msg.richContent.orderId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Restaurant:</span>
                                    <span className="text-white font-semibold">{msg.richContent.restaurantName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Delivery Address:</span>
                                    <span className="text-white text-right max-w-[150px] truncate">{msg.richContent.address}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-xs font-bold text-slate-300">Amount Charged:</span>
                                  <span className="text-sm font-black text-accent">${msg.richContent.total.toFixed(2)}</span>
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                        
                        <div className={`text-[9px] mt-1 text-slate-500 text-right`}>
                          {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input box */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-950/30 flex gap-2">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask AI to order spicy food, show active orders..."
                    className="flex-grow px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/20"
                    disabled={botState === 'thinking'}
                  />
                  <button 
                    type="submit"
                    className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
                    disabled={botState === 'thinking'}
                  >
                    {botState === 'thinking' ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={14} />}
                  </button>
                </form>
              </motion.div>

            </div>

            {/* AI BASKET DRAWER / CARD */}
            <AnimatePresence>
              {basket.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="md:col-span-5 bg-slate-950/40 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col w-full"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center gap-2 text-accent">
                      <FaShoppingBasket />
                      <h3 className="font-bold text-sm">AI Basket</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px] uppercase">
                      {basketRestaurantName}
                    </span>
                  </div>

                  {/* Basket Items List */}
                  <div className="space-y-3 max-h-[30vh] overflow-y-auto mb-4 pr-1">
                    {basket.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-slate-900/50 border border-white/5 p-2 rounded-xl text-xs">
                        <div className="min-w-0 flex-grow mr-2">
                          <p className="font-semibold truncate text-white">{item.name}</p>
                          <p className="text-[10px] text-slate-400">${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => setBasket(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0))}
                            className="h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 active:scale-95"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => setBasket(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                            className="h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Parameters Form */}
                  <div className="space-y-3 border-t border-white/10 pt-4 mb-4">
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Delivery Address</label>
                      <input 
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-white/5 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Payment Method</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-white/5 bg-slate-900/60 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="UPI">UPI (Google Pay/PhonePe)</option>
                        <option value="CARD">Credit / Debit Card</option>
                        <option value="COD">Cash on Delivery</option>
                      </select>
                    </div>
                  </div>

                  {/* Cart Total & Place button */}
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300">Order Total:</span>
                      <span className="text-lg font-black text-accent">${basketTotal.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handlePlaceOrder}
                      className="w-full btn-gold py-3 text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FaCheckCircle /> Confirm Order via AI
                    </button>
                    <button 
                      onClick={() => setBasket([])}
                      className="w-full py-2 border border-white/10 rounded-full hover:bg-white/5 text-[10px] text-slate-400 hover:text-white transition-all text-center flex items-center justify-center gap-1 active:scale-95"
                    >
                      <FaTimes size={10} /> Clear Basket
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Assistant;
