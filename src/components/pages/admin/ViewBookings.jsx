import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiRefreshCw, FiPackage, FiUsers } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
// EmailJS removed - not needed

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, movie, movie+photobooth
  const [updating, setUpdating] = useState(false);
  // Email functionality removed
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching bookings...');
      console.log('🔑 Admin session:', localStorage.getItem('adminSession'));
      
      // Use direct select to avoid joined query issues
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 Query result:', { data, error });
      
      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Raw bookings data:', data);

      // Process the data to ensure consistent format
      const processedBookings = (data || []).map(booking => ({
        ...booking,
        // Ensure consistent data structure
        events: {
          title: booking.event_title,
          date: booking.event_date,
          venue: booking.event_location
        },
        profiles: {
          full_name: booking.customer_name,
          email: booking.customer_email
        }
      }));

      console.log('🔄 Processed bookings:', processedBookings);
      setBookings(processedBookings);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
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

      // Booking status updated successfully

      console.log(`Booking ${bookingId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      console.log('Error updating booking status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setShowBookingModal(false);
  };

  // Email functionality removed - not needed

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
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>? Confirmed</span>;
    }
    
    return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>⏳ Pending</span>;
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

      {/* Debug Info */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <p><strong>Total Bookings:</strong> {bookings.length}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Admin Session:</strong> {localStorage.getItem('adminSession') ? 'Present' : 'Missing'}</p>
        <p><strong>Filter:</strong> {filter}</p>
        <p><strong>Filtered Bookings:</strong> {filteredBookings.length}</p>
      </div>

      {/* Bookings Tables - Separated by Package Type */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <FiRefreshCw className="animate-spin text-4xl mx-auto mb-4 text-primary" />
          <p>Loading bookings...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Movie Only Bookings Table */}
          <div className="glass-card">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                <FiPackage /> Movie Only Bookings (LKR 300.00)
                <span className="text-sm font-normal text-gray-500">
                  ({bookings.filter(b => b.package_type === 'movie').length} bookings)
                </span>
              </h2>
            </div>
            
            {bookings.filter(b => b.package_type === 'movie').length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiUsers className="text-4xl mx-auto mb-4" />
                <p>No Movie Only bookings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.filter(b => b.package_type === 'movie').map((booking) => (
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
                              {booking.customer_phone || 'N/A'}
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              ID: {booking.student_id || 'N/A'} | Section: {booking.section || 'N/A'} | Batch: {booking.batch_no || 'N/A'}
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
                        
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium">{booking.quantity || booking.tickets_count}</span>
                        </td>
                        
                        <td className="px-4 py-4">
                          <span className="font-bold text-lg text-blue-600">
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
                              onClick={() => handleViewBookingDetails(booking)}
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

          {/* Movie + Photobooth Bookings Table */}
          <div className="glass-card">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-purple-600 flex items-center gap-2">
                <FiPackage /> Movie + Photobooth Bookings (LKR 350.00)
                <span className="text-sm font-normal text-gray-500">
                  ({bookings.filter(b => b.package_type === 'movie+photobooth').length} bookings)
                </span>
              </h2>
            </div>
            
            {bookings.filter(b => b.package_type === 'movie+photobooth').length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiUsers className="text-4xl mx-auto mb-4" />
                <p>No Movie + Photobooth bookings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.filter(b => b.package_type === 'movie+photobooth').map((booking) => (
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
                              {booking.customer_phone || 'N/A'}
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              ID: {booking.student_id || 'N/A'} | Section: {booking.section || 'N/A'} | Batch: {booking.batch_no || 'N/A'}
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
                        
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium">{booking.quantity || booking.tickets_count}</span>
                        </td>
                        
                        <td className="px-4 py-4">
                          <span className="font-bold text-lg text-purple-600">
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
                              onClick={() => handleViewBookingDetails(booking)}
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
        </div>
      )}

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

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">👤 Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-gray-900">{selectedBooking.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedBooking.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedBooking.customer_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                      <p className="text-gray-900 font-mono">{selectedBooking.reference_number}</p>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🎓 Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student ID</label>
                      <p className="text-gray-900 font-mono">{selectedBooking.student_id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Section</label>
                      <p className="text-gray-900">{selectedBooking.section || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                      <p className="text-gray-900">{selectedBooking.batch_no || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🎬 Event Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Event Title</label>
                      <p className="text-gray-900">{selectedBooking.events?.title || selectedBooking.event_title || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                      <p className="text-gray-900">
                        {selectedBooking.events?.date 
                          ? new Date(selectedBooking.events.date).toLocaleString()
                          : selectedBooking.event_date 
                          ? new Date(selectedBooking.event_date).toLocaleString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{selectedBooking.events?.venue || selectedBooking.event_location || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Package Type</label>
                      <p className="text-gray-900">
                        {selectedBooking.package_type === 'movie+photobooth' ? 'Movie + Photobooth' : 'Movie Only'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Number of Tickets</label>
                      <p className="text-gray-900">{selectedBooking.tickets_count || selectedBooking.quantity || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price per Ticket</label>
                      <p className="text-gray-900">LKR {selectedBooking.package_price || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="text-gray-900 font-bold text-lg">LKR {parseFloat(selectedBooking.total_price || selectedBooking.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="text-gray-900">
                        {selectedBooking.status === 'confirmed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ? Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Pending
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                {selectedBooking.special_requirements && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Special Requirements</h3>
                    <p className="text-gray-900">{selectedBooking.special_requirements}</p>
                  </div>
                )}

                {/* Booking Timestamps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">⏰ Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Booking Created</label>
                      <p className="text-gray-900">
                        {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="text-gray-900">
                        {selectedBooking.updated_at ? new Date(selectedBooking.updated_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeBookingModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBookings;
