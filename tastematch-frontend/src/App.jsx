import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import TasteProfile from './pages/TasteProfile';
import Discover from './pages/Discover';
import Reservation from './pages/Reservation';
import Menu from './pages/Menu';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Recommendations from './pages/Recommendations';
import OrderHistory from './pages/OrderHistory';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-background transition-colors dark:bg-slate-950">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<TasteProfile />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:restaurantId" element={<RestaurantDetails />} />
            <Route path="/reservations" element={<Reservation />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: theme === 'dark' ? '#0f172a' : '#ffffff',
              color: theme === 'dark' ? '#f8fafc' : '#0f172a',
              border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e5e7eb',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
