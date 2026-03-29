import React from 'react';
import { Link } from 'react-router-dom';
import { FaHamburger, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-secondary pt-16 pb-8 text-white dark:bg-black">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-xl">
                <FaHamburger size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Eativo</span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Discover the best food and drinks near you. Personalized recommendations, seamless reservations, and quick ordering.
            </p>
            <div className="flex gap-4">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary" aria-label="Eativo on Twitter"><FaTwitter /></button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary" aria-label="Eativo on Instagram"><FaInstagram /></button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary" aria-label="Eativo on Facebook"><FaFacebook /></button>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/discover" className="hover:text-primary transition-colors">Discover</Link></li>
              <li><Link to="/restaurants" className="hover:text-primary transition-colors">Restaurants</Link></li>
              <li><Link to="/recommendations" className="hover:text-primary transition-colors">For You</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Orders</Link></li>
              <li><Link to="/reservations" className="hover:text-primary transition-colors">Reservations</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">Taste Profile</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button type="button" className="hover:text-primary transition-colors">Help Center</button></li>
              <li><button type="button" className="hover:text-primary transition-colors">Safety Center</button></li>
              <li><button type="button" className="hover:text-primary transition-colors">Cancellation Options</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Eativo. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button type="button" className="hover:text-white transition-colors">Privacy</button>
            <button type="button" className="hover:text-white transition-colors">Terms</button>
            <button type="button" className="hover:text-white transition-colors">Site Map</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
