import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiShare2, FiCheckCircle, FiCamera } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState('movie'); // 'movie' or 'movie+photobooth'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [user, setUser] = useState(null);
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
  const [submitting, setSubmitting] = useState(false);

  // Pricing configuration
  const pricing = {
    movie: 300, // Movie only price
    'movie+photobooth': 350 // Movie + photobooth price
  };

  useEffect(() => {
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
    
    // Get current user
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
            phone: profile.phone || '',
            studentId: profile.student_id || '',
            section: profile.section || '',
            batchNo: profile.batch_no || ''
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
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      // Handle the date string properly
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      // Extract time from the date string and display as intended
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // Get the time components
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      
      // Format as 12-hour time
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const minutesStr = minutes.toString().padStart(2, '0');
      
      return `${hour12}:${minutesStr} ${ampm}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDescription = (description) => {
    if (!description) return '';
    
    // Split by line breaks and format each line
    return description.split('\n').map((line, index) => {
      // If line starts with bullet point, format as list item
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="text-primary mr-2 mt-1">•</span>
            <span className="text-gray-700">{line.trim().substring(1).trim()}</span>
          </div>
        );
      }
      // If line is empty, add spacing
      else if (line.trim() === '') {
        return <div key={index} className="mb-2"></div>;
      }
      // Regular paragraph
      else {
        return (
          <p key={index} className="text-gray-700 mb-2">
            {line.trim()}
          </p>
        );
      }
    });
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (event?.capacity || 1)) {
      setTicketQuantity(value);
    }
  };

  const handlePackageSelection = (packageType) => {
    setSelectedPackage(packageType);
  };

  const getSelectedPrice = () => {
    return pricing[selectedPackage];
  };

  const getTotalPrice = () => {
    return getSelectedPrice() * ticketQuantity;
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

  const handleBookTickets = async () => {
    // For movie events, show the form first
    if (event.category === 'movie') {
      if (!showConfirmation) {
        setShowConfirmation(true);
        return;
      }
      
      // If form is already shown, validate and submit
      if (!validateForm()) {
        return;
      }
      
      try {
        setSubmitting(true);
        
        // Create a booking in Supabase
        const totalPrice = getTotalPrice();
        
        // Generate a reference number
        const referenceNumber = `MOV-${Date.now().toString(36).toUpperCase()}`;
        
        const { data, error } = await supabase.from('bookings').insert({
          user_id: user?.id || null,
          event_id: event.id,
          tickets_count: ticketQuantity,
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
          event_title: event.title,
          event_date: event.date,
          event_location: event.venue,
          package_type: selectedPackage, // Store the selected package
          package_price: getSelectedPrice() // Store the individual package price
        }).select().single();
        
        if (error) throw error;
        
        // Set booking details for confirmation display
        setBookingDetails({
          id: data.id,
          reference_number: referenceNumber,
          total_amount: totalPrice,
          package_type: selectedPackage,
          package_price: getSelectedPrice()
        });
        
        // Send confirmation email via EmailJS
        try {
          const { sendBookingConfirmationEmail } = await import('../../utils/emailjsService');
          
          await sendBookingConfirmationEmail({
            booking_id: data.id,
            email: formData.email,
            name: formData.fullName,
            event_title: event.title,
            event_date: event.date,
            event_location: event.venue,
            quantity: ticketQuantity,
            reference_number: referenceNumber,
            total_amount: totalPrice,
            package_type: selectedPackage,
            package_price: getSelectedPrice(),
            student_id: formData.studentId,
            section: formData.section,
            batch_no: formData.batchNo,
            phone: formData.phone,
            special_requirements: formData.specialRequirements
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
        
        // Show success message briefly before navigating
        setShowSuccessMessage(true);
        setTimeout(() => {
          // Navigate to confirmation page with booking details
          navigate(`/confirmation/${data.id}`, {
            state: {
              event,
              quantity: ticketQuantity,
              formData,
              booking: {
                id: data.id,
                reference_number: referenceNumber,
                total_amount: totalPrice,
                package_type: selectedPackage,
                package_price: getSelectedPrice()
              }
            }
          });
        }, 2000);
        
      } catch (error) {
        console.error('Error creating booking:', error);
        alert('There was an error creating your booking. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // For non-movie events, use the regular booking flow
      navigate(`/booking/${event.id}`, { 
        state: { 
          event, 
          quantity: ticketQuantity 
        } 
      });
    }
  };

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      })
      .catch((error) => console.error('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((error) => console.error('Could not copy link', error));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600">Loading event details...</p>
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
          <p className="text-gray-600 mb-4">The event you are looking for does not exist or has been removed.</p>
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

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <div className="mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-4">
              🎬 Join Celestia Movie Festival
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Create your account to book tickets for this amazing event!
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">✨ What You'll Get:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Access to exclusive movie screenings</li>
                <li>• Photobooth packages with soft copy photos</li>
                <li>• Complimentary popcorn and refreshments</li>
                <li>• Professional event management</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary px-8 py-3 text-lg"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="btn-secondary px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Already have an account? Sign in to book your tickets!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate end time (assuming events are 3 hours long if not specified)
  const eventDate = new Date(event.date);
  const endTime = event.end_time 
    ? new Date(event.end_time) 
    : new Date(eventDate.getTime() + (3 * 60 * 60 * 1000));

  // If we have booking details, show confirmation modal
  if (bookingDetails) {
    return (
      <div className="celestia-container my-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card max-w-3xl mx-auto p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <FiCheckCircle className="text-green-500 text-6xl" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Booking Confirmed!
          </h1>
          
          <p className="text-gray-700 mb-8">
            Thank you for your purchase. Your tickets have been booked successfully.
            A confirmation email has been sent to your email address.
          </p>
          
          <div className="glass-card mb-8">
            <div className="p-6 text-left">
              <h2 className="text-2xl font-semibold mb-4 text-dark">Booking Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2 text-primary">Event Information</h3>
                  <p className="text-gray-700 font-semibold text-lg mb-2">{event.title}</p>
                  <div className="flex items-center text-gray-600 mb-1">
                    <FiCalendar className="mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <FiClock className="mr-2" />
                    <span>{formatTime(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-2" />
                    <span>{event.venue}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 text-primary">Ticket Information</h3>
                  <p className="text-gray-700 mb-1"><span className="font-medium">Reference:</span> {bookingDetails.reference_number}</p>
                  <p className="text-gray-700 mb-1"><span className="font-medium">Quantity:</span> {ticketQuantity}</p>
                  <p className="text-gray-700 mb-1"><span className="font-medium">Name:</span> {formData.fullName}</p>
                  <p className="text-gray-700 mb-1"><span className="font-medium">Email:</span> {formData.email}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Package</span>
                  <span className="font-semibold text-primary">
                    {selectedPackage === 'movie' ? 'Movie Only' : 'Movie + Photobooth'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Price per ticket</span>
                  <span className="font-semibold">LKR {bookingDetails.package_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Tickets x {ticketQuantity}</span>
                  <span className="font-semibold">LKR {(bookingDetails.package_price * ticketQuantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 font-bold mt-2 text-lg">
                  <span>Total Paid</span>
                  <span className="text-primary">LKR {bookingDetails.total_amount.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Package Benefits */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-800 mb-2">What's Included:</h4>
                <div className="text-sm text-blue-700">
                  {selectedPackage === 'movie' ? (
                    <div>• Movie screening with professional sound and projection</div>
                  ) : (
                    <>
                      <div>• Movie screening with professional sound and projection</div>
                      <div>• Photobooth session with professional photographer</div>
                      <div>• Soft copy photo will be sent to your email after the event</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/events')}
              className="flex items-center justify-center px-6 py-2 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              Browse More Events
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="celestia-container my-10">
      {/* Event Header */}
      <div className="glass-card mb-8">
        <div className="p-6 md:p-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-dark mb-4"
          >
            {event.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-4 text-gray-600"
          >
            <span className="flex items-center">
              <FiCalendar className="mr-2" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center">
              <FiClock className="mr-2" />
              {formatTime(event.date)} - {formatTime(endTime)}
            </span>
            <span className="flex items-center">
              <FiMapPin className="mr-2" />
              {event.venue}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="glass-card p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-dark">About This Event</h2>
            <div className="mb-6">
              {formatDescription(event.full_description || event.description)}
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                onClick={handleShareEvent}
                className="flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <FiShare2 className="mr-2" /> Share Event
              </button>
            </div>
            

            
            {/* Event Details */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-dark">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <h4 className="text-lg font-medium mb-2 text-primary">Date & Time</h4>
                  <p className="text-gray-700">{formatDate(event.date)}</p>
                  <p className="text-gray-700">{formatTime(event.date)} - {formatTime(endTime)}</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-lg font-medium mb-2 text-primary">Location</h4>
                  <p className="text-gray-700">{event.venue}</p>
                  <p className="text-gray-700">{event.address || ''}</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-lg font-medium mb-2 text-primary">Organizer</h4>
                  <p className="text-gray-700">{event.organizer || 'Celestia Events'}</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="text-lg font-medium mb-2 text-primary">Category</h4>
                  <p className="text-gray-700">
                    {event.category 
                      ? event.category.charAt(0).toUpperCase() + event.category.slice(1)
                      : 'General'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Booking */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 text-dark">Tickets</h3>
              
              {!showConfirmation ? (
                <>
                  {/* Package Selection */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3 text-dark">Select Your Package</h4>
                    <div className="space-y-3">
                      {/* Movie Only Option */}
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPackage === 'movie' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePackageSelection('movie')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              selectedPackage === 'movie' 
                                ? 'border-primary bg-primary' 
                                : 'border-gray-300'
                            }`}>
                              {selectedPackage === 'movie' && (
                                <div className="w-2 h-2 bg-white rounded-full m-auto"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-dark">Movie Only</div>
                              <div className="text-sm text-gray-600">Watch the movie</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-primary">LKR 300.00</div>
                            <div className="text-xs text-gray-500">per ticket</div>
                          </div>
                        </div>
                      </div>

                      {/* Movie + Photobooth Option */}
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPackage === 'movie+photobooth' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePackageSelection('movie+photobooth')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              selectedPackage === 'movie+photobooth' 
                                ? 'border-primary bg-primary' 
                                : 'border-gray-300'
                            }`}>
                              {selectedPackage === 'movie+photobooth' && (
                                <div className="w-2 h-2 bg-white rounded-full m-auto"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-dark">Movie + Photobooth</div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <FiCamera className="mr-1" />
                                Movie + Soft copy photo
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-primary">LKR 350.00</div>
                            <div className="text-xs text-gray-500">per ticket</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">Package Details:</div>
                      {selectedPackage === 'movie' ? (
                        <div>• Movie screening only</div>
                      ) : (
                        <div>• Movie screening + Photobooth session</div>
                      )}
                      {selectedPackage === 'movie+photobooth' && (
                        <div>• Soft copy photo will be provided after the event</div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Quantity and Total */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Availability</span>
                      <span>{event.capacity} tickets</span>
                    </div>
                    
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Tickets
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={event.capacity}
                        value={ticketQuantity}
                        onChange={handleQuantityChange}
                        className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-center"
                      />
                      <div className="ml-4">
                        <div className="font-medium">Total</div>
                        <div className="font-bold text-lg text-primary">LKR {getTotalPrice().toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-4">
                  <h3 className="font-medium text-lg mb-4">Your Information</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
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
                  
                  <div className="mb-4">
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
                  
                  <div className="mb-4">
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
                  
                  <div className="mb-4">
                    <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements (Optional)
                    </label>
                    <textarea
                      id="specialRequirements"
                      name="specialRequirements"
                      rows="3"
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>

                  <div className="flex justify-between items-center py-2 font-bold mt-4 mb-4">
                    <span>Total</span>
                    <span>LKR {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleBookTickets}
                disabled={submitting}
                className={`w-full btn-primary py-3 flex justify-center items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <FiUsers className="mr-2" /> 
                {showConfirmation 
                  ? (submitting ? 'Processing...' : 'Confirm Booking') 
                  : 'Book Tickets'}
              </button>
              
              {showSuccessMessage && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <div>
                      <p className="text-green-800 font-medium">Booking Confirmed!</p>
                      <p className="text-green-700 text-sm">Redirecting to confirmation page with bank details and PDF download...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p>* Tickets are non-refundable</p>
                <p>* Please arrive 15 minutes before the event starts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 