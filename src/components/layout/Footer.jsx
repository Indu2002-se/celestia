import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiLock } from 'react-icons/fi';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="glass-card mt-12">
      <div className="celestia-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                Celestia
              </span>
            </Link>
            <p className="text-gray-600">
              The premier art club at the university, showcasing talented artists and hosting exciting events for all art enthusiasts.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-dark">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/events" className="text-gray-600 hover:text-primary transition-colors">
                Events
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-gray-600 hover:text-primary transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-dark">Contact Us</h3>
            <div className="space-y-2 text-gray-600">
              <p>University Art Department</p>
              <p>Room 302, Arts Building</p>
              <p>Email: info@celestia.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <FiTwitter size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex justify-between items-center text-gray-600">
          <p>&copy; {year} Celestia Art Club. All rights reserved.</p>
          <Link to="/admin/login" className="flex items-center text-gray-500 hover:text-primary transition-colors text-sm">
            <FiLock className="mr-1" /> Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 