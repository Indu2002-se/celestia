import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiLogOut, FiCheck, FiX, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
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
        
        // Fetch user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }
        
        setProfile(profileData);
        setProfileData({
          fullName: profileData?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: profileData?.phone || '',
        });

        // Fetch real bookings from Supabase
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            events (
              id,
              title,
              description,
              date,
              venue,
              price,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else {
          setBookings(bookingsData || []);
        }

        // Fetch upcoming events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(6);
        
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else {
          setUpcomingEvents(eventsData || []);
        }
        
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
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: profileData.fullName 
        }
      });
      
      if (authError) throw authError;
      
      // Update or create profile in profiles table
      if (profile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: profileData.fullName,
            phone: profileData.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: profileData.fullName,
            phone: profileData.phone
          });
        
        if (insertError) throw insertError;
      }
      
      // Update user in state
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: profileData.fullName
        }
      });
      
      // Refresh profile data
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(newProfile);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => {
                        setEditMode(false);
                        setProfileData({
                          fullName: profile?.full_name || user.user_metadata?.full_name || '',
                          email: user.email || '',
                          phone: profile?.phone || '',
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
                    <FiMapPin className="text-primary mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-lg">{profileData.phone || 'Not provided'}</p>
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
                          <p>{booking.events.venue}</p>
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
                        <span className="font-bold text-primary">LKR {parseFloat(booking.total_price).toFixed(2)}</span>
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

      {/* Upcoming Events */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-card p-6 mt-10"
      >
        <h2 className="text-2xl font-semibold text-dark mb-6">Upcoming Events</h2>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-dark mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <FiClock className="mr-2" /> {formatDateTime(event.date)}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FiMapPin className="mr-2" /> {event.venue}
                  </div>
                                     <div className="mt-4 flex justify-between items-center">
                     <div className="text-primary text-lg font-bold">
                       <FiDollarSign className="mr-2" /> LKR {parseFloat(event.price).toFixed(2)}
                     </div>
                     <button 
                       onClick={() => navigate(`/events/${event.id}`)}
                       className="btn-primary text-sm"
                     >
                       View Event
                     </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
                 ) : (
           <div className="text-center py-8">
             <p className="text-gray-600 mb-4">No upcoming events found.</p>
             <button 
               onClick={() => navigate('/events')}
               className="btn-primary"
             >
               Browse All Events
             </button>
           </div>
         )}
      </motion.div>
    </div>
  );
};

export default Profile; 