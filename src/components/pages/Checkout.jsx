import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { event, quantity, formData, booking } = location.state || {};

  useEffect(() => {
    // Automatically redirect to confirmation page after a short delay
    const timer = setTimeout(() => {
      if (event && booking) {
        navigate(`/confirmation/${booking.id}`, {
          state: { event, quantity, formData, booking }
        });
      } else {
        navigate('/events');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [event, booking, navigate]);

  if (!event || !booking) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Redirecting...</h2>
          <p className="text-gray-600 mb-4">Please wait while we process your booking.</p>
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
        className="glass-card max-w-2xl mx-auto p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <FiCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Booking Created Successfully!
        </h1>
        
        <p className="text-gray-700 mb-8">
          Your booking has been created and is now pending payment confirmation.
          You will be redirected to the confirmation page with payment details.
        </p>
        
        <div className="flex items-center justify-center text-primary">
          <FiArrowRight className="mr-2 animate-pulse" />
          <span>Redirecting to confirmation page...</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;