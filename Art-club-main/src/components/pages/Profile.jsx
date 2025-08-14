import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiLogOut, FiCheck, FiX } from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        setUser(user);
        setProfileData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
        });

        // Fetch bookings
        // In production, you'll fetch real data from Supabase
        // const { data, error } = await supabase
        //   .from('bookings')
        //   .select(`
        //     *,
        //     events (*)
        //   `)
        //   .eq('user_id', user.id)
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        
        // Placeholder bookings data
        const placeholderBookings = [
          {
            id: 1,
            reference_number: 'CEL-1A2B3C',
            quantity: 2,
            total_amount: 21.00,
            status: 'confirmed',
            created_at: '2025-07-10T15:30:00',
            events: {
              id: 1,
              title: 'Modern Art Exhibition',
              date: '2025-08-15T18:00:00',
              location: 'University Gallery'
            }
          },
          {
            id: 2,
            reference_number: 'CEL-4D5E6F',
            quantity: 1,
            total_amount: 26.25,
            status: 'confirmed',
            created_at: '2025-06-25T10:15:00',
            events: {
              id: 2,
              title: 'Sculpting Workshop',
              date: '2025-08-22T15:30:00',
              location: 'Art Studio B'
            }
          }
        ];
        
        setBookings(placeholderBookings);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: profileData.fullName 
        }
      });
      
      if (error) throw error;
      
      // Update user in state
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: profileData.fullName
        }
      });
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="celestia-container my-10">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text text-center"
      >
        Your Profile
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Information */}
        <div className="w-full lg:w-1/3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-dark">Profile Information</h2>
              {!editMode && (
                <button 
                  onClick={() => setEditMode(true)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <FiEdit2 size={20} />
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {editMode ? (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed.</p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => {
                        setEditMode(false);
                        setProfileData({
                          fullName: user.user_metadata?.full_name || '',
                          email: user.email || '',
                        });
                      }}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      disabled={updating}
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="flex items-center btn-primary"
                      disabled={updating}
                    >
                      {updating ? 'Saving...' : (
                        <>
                          <FiCheck className="mr-2" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <FiUser className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-lg font-medium">{profileData.fullName || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FiMail className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-lg">{profileData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FiCalendar className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center mt-4 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="mr-2" /> Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Booking History */}
        <div className="w-full lg:w-2/3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-semibold text-dark mb-6">Your Bookings</h2>
            
            {bookings.length > 0 ? (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="glass-card p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-dark">{booking.events.title}</h3>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 text-gray-600 text-sm mt-1">
                          <p>{formatDate(booking.events.date)} at {formatTime(booking.events.date)}</p>
                          <p>{booking.events.location}</p>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 flex flex-col items-start md:items-end">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <p className="text-gray-600 text-sm mt-1">Reference: {booking.reference_number}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 mt-3 pt-3 flex flex-col sm:flex-row justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Tickets: {booking.quantity}</p>
                        <p className="text-gray-600 text-sm">Booked on: {formatDate(booking.created_at)}</p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center">
                        <span className="font-medium mr-2">Total:</span>
                        <span className="font-bold text-primary">${booking.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't booked any events yet.</p>
                <button 
                  onClick={() => navigate('/events')}
                  className="btn-primary"
                >
                  Browse Events
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 