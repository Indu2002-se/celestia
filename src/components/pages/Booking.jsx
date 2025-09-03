import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const Booking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get event and quantity from location state
  const eventFromState = location.state?.event;
  const quantityFromState = location.state?.quantity || 1;
  
  const [event, setEvent] = useState(eventFromState || null);
  const [quantity, setQuantity] = useState(quantityFromState);
  const [loading, setLoading] = useState(!eventFromState);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    section: '',
    batchNo: '',
    specialRequirements: ''
  });
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Prefill form data from user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setFormData(prevData => ({
            ...prevData,
            fullName: profile.full_name || '',
            email: session.user.email || '',
            phone: profile.phone || ''
          }));
        } else {
          setFormData(prevData => ({
            ...prevData,
            email: session.user.email || ''
          }));
        }
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    // If we don't have the event from location state, fetch it
    if (!eventFromState) {
      const fetchEvent = async () => {
        try {
          setLoading(true);
          
          // Fetch real data from Supabase
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          if (!data) throw new Error('Event not found');

          setEvent(data);
        } catch (error) {
          console.error('Error fetching event details:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchEvent();
    }
  }, [id, eventFromState]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= event.capacity) {
      setQuantity(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }
    
    if (!formData.batchNo.trim()) {
      newErrors.batchNo = 'Batch number is required';
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
      setSubmitting(true);
      
      // Calculate total price
      const totalPrice = parseFloat(event.price) * quantity;
      
      // Generate a reference number
      const referenceNumber = `CEL-${Date.now().toString(36).toUpperCase()}`;
      
      // Create a booking in Supabase
      const { data, error } = await supabase.from('bookings').insert({
        user_id: user?.id || null,
        event_id: event.id,
        tickets_count: quantity,
        total_price: totalPrice,
        reference_number: referenceNumber,
        status: 'pending',
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        student_id: formData.studentId,
        section: formData.section,
        batch_no: formData.batchNo,
        special_requirements: formData.specialRequirements || null,
        email_sent: false
      }).select().single();
      
      if (error) throw error;

      // Navigate to checkout with booking information
      navigate(`/checkout/${data.id}`, {
        state: {
          event,
          quantity,
          formData,
          booking: {
            id: data.id,
            reference_number: referenceNumber,
            total_amount: totalPrice
          }
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was an error creating your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/events')}
            className="btn-primary"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Event not found state
  if (!event) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you are trying to book does not exist or has been removed.</p>
          <button 
            onClick={() => navigate('/events')}
            className="btn-primary"
          >
            Back to Events
          </button>
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
        Book Tickets
      </motion.h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Event Summary */}
        <div className="w-full lg:w-1/3">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Event Summary</h2>
            
            {event.image_url && (
              <img 
                src={event.image_url} 
                alt={event.title} 
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x200?text=No+Image';
                }}
              />
            )}
            
            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiClock className="mr-2 text-primary" />
                <span>{formatTime(event.date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2 text-primary" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiUsers className="mr-2 text-primary" />
                <span>Capacity: {event.capacity}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Tickets x {quantity}</span>
                <span className="font-semibold">LKR {(event.price * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 font-bold mt-2">
                <span>Total</span>
                <span>LKR {(event.price * quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Form */}
        <div className="w-full lg:w-2/3">
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Your Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="John Smith"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="(123) 456-7890"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID*
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.studentId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="e.g., GM/HDCSE/01/01"
                  />
                  {errors.studentId && (
                    <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                    Section*
                  </label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.section ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="e.g., SE,BM,.."
                  />
                  {errors.section && (
                    <p className="text-red-500 text-sm mt-1">{errors.section}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="batchNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number*
                  </label>
                  <input
                    type="text"
                    id="batchNo"
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.batchNo ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                   
                  />
                  {errors.batchNo && (
                    <p className="text-red-500 text-sm mt-1">{errors.batchNo}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tickets*
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requirements
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Any special requirements or accessibility needs"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn-primary py-3 px-8 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking; 