import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle, FiArrowRight, FiClock, FiUserCheck } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  
  const email = searchParams.get('email') || 'your email';
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Check if this is a Supabase email confirmation callback
    if (location.pathname === '/auth/callback' || token) {
      handleEmailConfirmation();
    } else {
      setIsProcessing(false);
    }
  }, [location.pathname, token]);

  const handleEmailConfirmation = async () => {
    try {
      setIsProcessing(true);
      
      // Handle Supabase email confirmation
      if (token && type === 'signup') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });
        
        if (!error) {
          setIsConfirmed(true);
          // Wait a bit before redirecting
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Start countdown to redirect only if not processing confirmation
    if (!isProcessing && !isConfirmed) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [navigate, isProcessing, isConfirmed]);

  const handleManualRedirect = () => {
    navigate('/login');
  };

  // Show loading state while processing confirmation
  if (isProcessing) {
    return (
      <div className="celestia-container my-10">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUserCheck className="text-6xl text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              Verifying Your Email...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your email address.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show confirmation success
  if (isConfirmed) {
    return (
      <div className="celestia-container my-10">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-6xl text-green-500" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-4">
              🎉 Email Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your email has been successfully verified!
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <p className="text-green-700">
                Redirecting you to the login page in a few seconds...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show the regular confirmation page
  return (
    <div className="celestia-container my-10">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="text-6xl text-green-500" />
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-4">
              🎉 Welcome to Celestia!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your account has been created successfully!
            </p>
          </motion.div>

          {/* Email Confirmation Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <FiMail className="text-2xl text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-blue-800">
                Check Your Email
              </h2>
            </div>
            
            <p className="text-blue-700 mb-4">
              We've sent a confirmation email to:
            </p>
            
            <div className="bg-white border border-blue-200 rounded-lg p-3 mb-4">
              <span className="font-medium text-blue-800">{email}</span>
            </div>
            
            <p className="text-sm text-blue-600">
              Please check your inbox and click the confirmation link to verify your account.
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              ✨ What's Next?
            </h3>
            <div className="text-left text-green-700 space-y-2">
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                <span>Click the confirmation link in your email</span>
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                <span>Verify your email address</span>
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                <span>Sign in to your account</span>
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                <span>Start booking amazing events!</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="space-y-4"
          >
            <button
              onClick={handleManualRedirect}
              className="btn-primary px-8 py-3 text-lg flex items-center justify-center mx-auto"
            >
              <FiArrowRight className="mr-2" />
              Go to Login
            </button>
            
            <div className="text-sm text-gray-500 flex items-center justify-center">
              <FiClock className="mr-2" />
              Redirecting automatically in {countdown} seconds...
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-primary hover:underline"
              >
                try registering again
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
