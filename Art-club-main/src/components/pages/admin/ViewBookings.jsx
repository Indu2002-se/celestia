import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { FiRefreshCw, FiFilter, FiUser, FiCheckSquare, FiXSquare, FiMail } from 'react-icons/fi';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Make sure admin role is set for RLS policies
    localStorage.setItem('userRole', 'admin');
    
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching bookings...');

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      console.log('Bookings data:', data);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Bookings</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchBookings} 
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Refresh Bookings"
          >
            <FiRefreshCw />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showFilters 
                ? 'bg-primary text-white hover:bg-primary-dark' 
                : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            <FiFilter />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-2 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">Bookings count: {bookings.length}</p>
        <p className="text-sm text-gray-600">Loading: {loading ? 'Yes' : 'No'}</p>
        <p className="text-sm text-gray-600">Admin role: {localStorage.getItem('userRole')}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.reference_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>{booking.customer_name}</span>
                      <span className="text-xs text-gray-400">{booking.customer_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.event_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetails(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                        title="View Details"
                      >
                        <FiUser />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setShowDetails(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Booking Information</h4>
                <p><strong>Reference:</strong> {selectedBooking.reference_number}</p>
                <p><strong>Status:</strong> {selectedBooking.status}</p>
                <p><strong>Date:</strong> {formatDate(selectedBooking.created_at)}</p>
                <p><strong>Tickets:</strong> {selectedBooking.tickets_count}</p>
                <p><strong>Total:</strong> ${parseFloat(selectedBooking.total_price || 0).toFixed(2)}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                <p><strong>Name:</strong> {selectedBooking.customer_name}</p>
                <p><strong>Email:</strong> {selectedBooking.customer_email}</p>
                <p><strong>Phone:</strong> {selectedBooking.customer_phone || 'N/A'}</p>
              </div>
              
              {selectedBooking.special_requirements && (
                <div className="col-span-2 mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Special Requirements</h4>
                  <p>{selectedBooking.special_requirements}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setShowDetails(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBookings;