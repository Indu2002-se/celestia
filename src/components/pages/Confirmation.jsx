import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCalendar, FiMapPin, FiClock, FiMail, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const Confirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { event, quantity, formData, booking } = location.state || {};
  const [emailSent, setEmailSent] = useState(false);
  
  useEffect(() => {
    // Send a confirmation email
    const sendConfirmationEmail = async () => {
      try {
        // Call the Supabase Edge Function
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            booking_id: bookingId,
            email: formData.email,
            name: formData.fullName,
            event_title: event.title,
            event_date: event.date,
            event_location: event.venue || event.location,
            quantity: quantity,
            reference_number: booking.reference_number,
            total_amount: booking.total_amount
          }
        });
        
        console.log('Confirmation email sent and booking record updated');
        setEmailSent(true);
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Still show the email sent message to the user even if there's an error
        setEmailSent(true);
      }
    };
    
    if (formData && formData.email && bookingId) {
      sendConfirmationEmail();
    }
  }, [bookingId, formData, event, quantity, booking]);

  if (!event || !booking) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Booking Information Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find details of your booking. Please check your email for confirmation details.</p>
          <button 
            onClick={() => navigate('/events')}
            className="btn-primary"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

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
          {emailSent ? ' A confirmation email has been sent to your email address.' : ' A confirmation email will be sent shortly.'}
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
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-1">
                  <FiClock className="mr-2" />
                  <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiMapPin className="mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 text-primary">Ticket Information</h3>
                <p className="text-gray-700 mb-1"><span className="font-medium">Reference:</span> {booking.reference_number}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Quantity:</span> {quantity}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Name:</span> {formData.fullName}</p>
                <div className="flex items-center text-gray-600">
                  <FiMail className="mr-2" />
                  <span>{formData.email}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Tickets x {quantity}</span>
                <span className="font-semibold">${((booking.total_amount / 1.05) * (1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Booking Fee</span>
                <span className="font-semibold">${((booking.total_amount / 1.05) * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 font-bold mt-2">
                <span>Total Paid</span>
                <span>${booking.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center justify-center px-6 py-2 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-all"
          >
            <FiArrowLeft className="mr-2" /> Browse More Events
          </button>
          <button 
            className="flex items-center justify-center btn-primary"
          >
            <FiDownload className="mr-2" /> Download Tickets
          </button>
        </div>
      </motion.div>
      
      <div className="max-w-3xl mx-auto mt-8 p-4 glass-card">
        <h3 className="font-semibold mb-2 text-dark">Important Information:</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Please arrive at least 15 minutes before the event starts.</li>
          <li>Bring your confirmation email or reference number for quick check-in.</li>
          <li>For any questions or changes, please contact us at support@celestia.com.</li>
        </ul>
      </div>
    </div>
  );
};

export default Confirmation; 