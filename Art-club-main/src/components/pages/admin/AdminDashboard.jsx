import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiList, FiCalendar, FiLogOut, FiUser, FiHome } from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Ensure admin role is set
  useEffect(() => {
    if (!localStorage.getItem('userRole')) {
      localStorage.setItem('userRole', 'admin');
    }
  }, []);
  
  // Admin logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLastLogin');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  return (
    <div className="celestia-container my-10">
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text"
        >
          Admin Dashboard
        </motion.h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center gap-2"
          >
            <FiHome /> View Site
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
      
      {/* Admin Navigation */}
      <div className="glass-card mb-8">
        <div className="flex overflow-x-auto p-4 gap-4">
          <Link 
            to="/admin/dashboard"
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === 'overview' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <FiHome /> Overview
          </Link>
          <Link 
            to="/admin/events"
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === 'events' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('events')}
          >
            <FiCalendar /> Manage Events
          </Link>
          <Link 
            to="/admin/bookings"
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === 'bookings' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            <FiList /> View Bookings
          </Link>
        </div>
      </div>

      {/* Dashboard Overview Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Event Management</h2>
              <FiCalendar className="text-primary text-2xl" />
            </div>
            <p className="text-gray-600 mb-4">Create, update, and delete events on the platform.</p>
            <Link 
              to="/admin/events" 
              className="btn-primary py-2 px-4 text-sm w-full flex justify-center items-center"
              onClick={() => setActiveTab('events')}
            >
              Manage Events
            </Link>
          </div>
          
          <div className="glass-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Booking Management</h2>
              <FiList className="text-primary text-2xl" />
            </div>
            <p className="text-gray-600 mb-4">View and manage all customer bookings across events.</p>
            <Link 
              to="/admin/bookings" 
              className="btn-primary py-2 px-4 text-sm w-full flex justify-center items-center"
              onClick={() => setActiveTab('bookings')}
            >
              View Bookings
            </Link>
          </div>
          
          <div className="glass-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Admin Account</h2>
              <FiUser className="text-primary text-2xl" />
            </div>
            <p className="text-gray-600 mb-4">Manage your admin account and security settings.</p>
            <button 
              onClick={handleLogout} 
              className="btn-secondary py-2 px-4 text-sm w-full flex justify-center items-center"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 