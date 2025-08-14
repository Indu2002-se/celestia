import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const Checkout = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from location state
  const { event, quantity, formData, booking } = location.state || {};
  
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setPaymentData({
        ...paymentData,
        [name]: formattedValue,
      });
    } 
    // Format expiry date with slash
    else if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\//g, '')
        .replace(/(\d{2})(\d{2})/, '$1/$2')
        .slice(0, 5);
      
      setPaymentData({
        ...paymentData,
        [name]: formattedValue,
      });
    }
    // Format CVV to only allow numbers
    else if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      
      setPaymentData({
        ...paymentData,
        [name]: formattedValue,
      });
    } 
    else {
      setPaymentData({
        ...paymentData,
        [name]: value,
      });
    }

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    
    if (!paymentData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }
    
    if (!paymentData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!paymentData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date format should be MM/YY';
    }
    
    if (!paymentData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }
    
    try {
      setProcessing(true);
      
      // Generate payment intent ID (in production, this would come from your payment gateway)
      const paymentIntentId = `pi_${Date.now().toString(36).toUpperCase()}`;
      
      // Update booking status in Supabase
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_intent_id: paymentIntentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Send confirmation email using Supabase Edge Function
      try {
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
        
        console.log('Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue with the process even if email fails
      }
      
      // Navigate to confirmation page
      navigate(`/confirmation/${bookingId}`, {
        state: {
          event,
          quantity,
          formData,
          booking: {
            ...booking,
            status: 'confirmed',
            payment_intent_id: paymentIntentId
          }
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment. Please try again.');
      setProcessing(false);
    }
  };

  if (!event || !booking) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Booking Information Not Found</h2>
          <p className="text-gray-600 mb-4">Please start the booking process again.</p>
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
        Secure Checkout
      </motion.h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Payment Form */}
        <div className="w-full lg:w-2/3">
          <div className="glass-card p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-dark">Payment Details</h2>
              <div className="flex items-center text-primary">
                <FiLock className="mr-2" />
                <span className="text-sm">Secure Payment</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={paymentData.cardName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="John Smith"
                />
                {errors.cardName && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                )}
              </div>
              
              <div className="flex gap-4 mb-6">
                <div className="w-1/2">
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="MM/YY"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                  )}
                </div>
                
                <div className="w-1/2">
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-6">
                <p>
                  By clicking "Complete Payment", you agree to our <button type="button" onClick={() => navigate('/terms')} className="text-primary hover:underline">Terms of Service</button> and <button type="button" onClick={() => navigate('/privacy')} className="text-primary hover:underline">Privacy Policy</button>.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={processing}
                  className={`btn-primary py-3 px-8 ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {processing ? 'Processing...' : `Complete Payment: $${booking.total_amount.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="glass-card p-6 sticky top-32">
            <h2 className="text-2xl font-semibold mb-4 text-dark">Order Summary</h2>
            
            <div className="mb-4">
              <h3 className="font-medium text-lg text-dark mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Time:</span> {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Location:</span> {event.venue || event.location}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Tickets:</span> {quantity}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Attendee:</span> {formData.fullName}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Booking Reference:</span> {booking.reference_number}
              </p>
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
                <span>Total</span>
                <span>${booking.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 