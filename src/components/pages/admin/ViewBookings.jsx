import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiFilter, FiRefreshCw, FiPackage, FiUsers, FiDollarSign } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, movie, movie+photobooth
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // First try to get bookings with joined data
      let { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          events (
            title,
            date,
            venue
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Joined query failed, trying direct select:', error);
        // Fallback to direct select if joined query fails
        const { data: directData, error: directError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (directError) throw directError;
        data = directData;
      }

      // Process the data to ensure consistent format
      const processedBookings = (data || []).map(booking => ({
        ...booking,
        // Use joined data if available, otherwise use direct data
        events: booking.events || {
          title: booking.event_title,
          date: booking.event_date,
          venue: booking.event_location
        },
        profiles: booking.profiles || {
          full_name: booking.customer_name,
          email: booking.customer_email
        }
      }));

      setBookings(processedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      console.log(`Booking ${bookingId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getFilteredBookings = () => {
    switch (filter) {
      case 'pending':
        return bookings.filter(booking => !booking.status || booking.status === 'pending');
      case 'confirmed':
        return bookings.filter(booking => booking.status === 'confirmed');
      case 'movie':
        return bookings.filter(booking => booking.package_type === 'movie');
      case 'movie+photobooth':
        return bookings.filter(booking => booking.package_type === 'movie+photobooth');
      default:
        return bookings;
    }
  };

  const getStatusBadge = (status, packageType) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (status === 'confirmed') {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>✓ Confirmed</span>;
    }
    
    return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>⏳ Pending</span>;
  };

  const getPackageBadge = (packageType) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (packageType === 'movie+photobooth') {
      return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>🎬 + 📸 Movie + Photobooth</span>;
    }
    
    return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>🎬 Movie Only</span>;
  };

  const getPriceBadge = (packageType) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (packageType === 'movie+photobooth') {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>LKR 350.00</span>;
    }
    
    return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>LKR 300.00</span>;
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="celestia-container my-10">
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text"
        >
          Booking Management
        </motion.h1>
        
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card mb-6">
        <div className="flex flex-wrap gap-2 p-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <FiUsers /> All Bookings ({bookings.length})
          </button>
          
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <FiX /> Pending ({bookings.filter(b => !b.status || b.status === 'pending').length})
          </button>
          
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'confirmed' 
                ? 'bg-green-500 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <FiCheck /> Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          
          <button
            onClick={() => setFilter('movie')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'movie' 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <FiPackage /> Movie Only ({bookings.filter(b => b.package_type === 'movie').length})
          </button>
          
          <button
            onClick={() => setFilter('movie+photobooth')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'movie+photobooth' 
                ? 'bg-purple-500 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <FiPackage /> Movie + Photobooth ({bookings.filter(b => b.package_type === 'movie+photobooth').length})
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card">
        {loading ? (
          <div className="p-8 text-center">
            <FiRefreshCw className="animate-spin text-4xl mx-auto mb-4 text-primary" />
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiUsers className="text-4xl mx-auto mb-4" />
            <p>No bookings found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Package</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.profiles?.full_name || booking.customer_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.profiles?.email || booking.customer_email || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ref: {booking.reference_number}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.events?.title || booking.event_title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.events?.date || booking.event_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {booking.events?.venue || booking.event_location || 'N/A'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      {getPackageBadge(booking.package_type)}
                    </td>
                    
                    <td className="px-4 py-4">
                      {getPriceBadge(booking.package_type)}
                    </td>
                    
                    <td className="px-4 py-4 text-center">
                      <span className="font-medium">{booking.quantity || booking.tickets_count}</span>
                    </td>
                    
                    <td className="px-4 py-4">
                      <span className="font-bold text-lg text-primary">
                        LKR {parseFloat(booking.total_amount || booking.total_price).toFixed(2)}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4">
                      {getStatusBadge(booking.status, booking.package_type)}
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {(!booking.status || booking.status === 'pending') ? (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            disabled={updating}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                            title="Confirm Booking"
                          >
                            <FiCheck />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'pending')}
                            disabled={updating}
                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                            title="Mark as Pending"
                          >
                            <FiX />
                          </button>
                        )}
                        
                        <button
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{bookings.length}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => !b.status || b.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {bookings.filter(b => b.package_type === 'movie').length}
          </div>
          <div className="text-sm text-gray-600">Movie Only (300 LKR)</div>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {bookings.filter(b => b.package_type === 'movie+photobooth').length}
          </div>
          <div className="text-sm text-gray-600">Movie + Photobooth (350 LKR)</div>
        </div>
      </div>
    </div>
  );
};

export default ViewBookings;