import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiShield, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const CheckoutForm = ({ event, quantity, formData, booking, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: booking.total_price,
          currency: 'usd',
          customer_email: formData.email,
          customer_name: formData.fullName,
          event_title: event.title,
          metadata: {
            event_id: event.id,
            quantity: quantity,
            reference_number: booking.reference_number
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.client_secret);
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.fullName,
            email: formData.email,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment with our backend
        await confirmPayment(paymentIntent.id);
        onSuccess(paymentIntent);
      } else if (paymentIntent.status === 'requires_action') {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
        
        if (confirmError) {
          setError(confirmError.message);
          onError(confirmError.message);
        } else {
          await confirmPayment(paymentIntent.id);
          onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const confirmPayment = async (paymentIntentId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          booking_id: booking.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm payment');
      }

      return data;
    } catch (err) {
      console.error('Payment confirmation error:', err);
      throw err;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FiShield className="text-green-500" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className={`w-full btn-primary py-3 px-6 ${(!stripe || processing || !clientSecret) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {processing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          `Complete Payment: $${booking.total_price.toFixed(2)}`
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        By completing this payment, you agree to our Terms of Service and Privacy Policy.
      </div>
    </form>
  );
};

const Checkout = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from location state
  const { event, quantity, formData, booking } = location.state || {};
  
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setPaymentSuccess(true);

      // Send booking confirmation email
      try {
        const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-booking-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            booking: {
              ...booking,
              event_title: event.title,
              customer_email: formData.email,
            }
          }),
        });

        if (!response.ok) {
          console.error('Failed to send confirmation email');
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
      
      // Navigate to confirmation page after a short delay
      setTimeout(() => {
        navigate(`/confirmation/${bookingId}`, {
          state: {
            event,
            quantity,
            formData,
            booking: {
              ...booking,
              status: 'confirmed',
              payment_intent_id: paymentIntent.id
            },
            paymentIntent
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  const handlePaymentError = (error) => {
    setPaymentError(error);
    console.error('Payment error:', error);
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

  if (paymentSuccess) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your booking has been confirmed. Redirecting to confirmation page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
            
            <Elements stripe={stripePromise}>
              <CheckoutForm
                event={event}
                quantity={quantity}
                formData={formData}
                booking={booking}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
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
                <span className="font-semibold">${((booking.total_price / 1.05) * (1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Booking Fee</span>
                <span className="font-semibold">${((booking.total_price / 1.05) * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 font-bold mt-2">
                <span>Total</span>
                <span>${booking.total_price.toFixed(2)}</span>
              </div>
            </div>

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{paymentError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 