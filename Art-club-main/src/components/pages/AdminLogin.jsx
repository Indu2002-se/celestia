import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if admin is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminLastLogin = localStorage.getItem('adminLastLogin');
    
    if (adminToken && adminLastLogin) {
      const lastLoginTime = parseInt(adminLastLogin);
      const currentTime = new Date().getTime();
      
      // Token valid for 24 hours (86400000 ms)
      if (currentTime - lastLoginTime < 86400000) {
        navigate('/admin/dashboard');
      } else {
        // Token expired
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminLastLogin');
      }
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Hardcoded admin credentials
    const validUsername = 'admin';
    const validPassword = 'admin123';

    // Simulate API call delay
    setTimeout(() => {
      if (username === validUsername && password === validPassword) {
        // Set admin token and login time
        localStorage.setItem('adminToken', 'admin-token-' + new Date().getTime());
        localStorage.setItem('adminLastLogin', new Date().getTime().toString());
        
        // Set admin role for ViewBookings component
        localStorage.setItem('userRole', 'admin');
        
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="celestia-container my-16 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FiLock className="text-primary text-2xl" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-primary py-3 flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-primary"
          >
            Return to Website
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin; 