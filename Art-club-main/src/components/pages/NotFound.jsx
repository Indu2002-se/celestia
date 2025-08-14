import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="celestia-container my-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center glass-card p-10"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-dark mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center btn-primary px-6 py-3"
          >
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
        </motion.div>
      </motion.div>
      
      <div className="mt-12 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-dark mb-4 text-center">Looking For Something?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/events" 
            className="glass-card p-4 text-center hover:shadow-lg transition-shadow"
          >
            Browse Events
          </Link>
          <Link 
            to="/login" 
            className="glass-card p-4 text-center hover:shadow-lg transition-shadow"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="glass-card p-4 text-center hover:shadow-lg transition-shadow"
          >
            Create Account
          </Link>
          <Link 
            to="/" 
            className="glass-card p-4 text-center hover:shadow-lg transition-shadow"
          >
            Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 