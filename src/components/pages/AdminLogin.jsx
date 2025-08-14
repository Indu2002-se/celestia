import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { FiMail, FiLock, FiAlertCircle, FiLogIn } from 'react-icons/fi';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Hardcoded admin credentials
  const ADMIN_CREDENTIALS = {
    email: 'admin@celestia.com',
    password: 'admin123'
  };

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        if (session.user.email === ADMIN_CREDENTIALS.email) {
          navigate('/admin/dashboard');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear server error when user makes changes
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setServerError('');
      
      // Check if credentials match hardcoded admin credentials
      if (formData.email === ADMIN_CREDENTIALS.email && formData.password === ADMIN_CREDENTIALS.password) {
        // Create a mock session for admin access
        // In a real application, you would verify against the database
        console.log('Admin login successful');
        
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          user: {
            id: 'admin-user-id',
            email: ADMIN_CREDENTIALS.email,
            role: 'admin'
          },
          access_token: 'admin-token',
          refresh_token: 'admin-refresh-token'
        }));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // Try regular Supabase authentication as fallback
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
        // Check if user is admin (you can add more admin emails here)
        const adminEmails = [ADMIN_CREDENTIALS.email, 'admin@example.com'];
        if (adminEmails.includes(formData.email)) {
          navigate('/admin/dashboard');
        } else {
          setServerError('Access denied. Admin privileges required.');
          // Sign out non-admin users
          await supabase.auth.signOut();
        }
      }
      
    } catch (error) {
      console.error('Error signing in:', error);
      setServerError(error.message || 'Failed to sign in. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="celestia-container my-10">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
              Admin Login
            </h1>
            <p className="text-gray-600 mt-2">
              Access Celestia Admin Panel
            </p>
          </div>
          
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6 flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary py-2 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing In...' : (
                <>
                  <FiLogIn className="mr-2" /> Sign In as Admin
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm">
              Welcome to the Celestia Admin Panel
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin; 