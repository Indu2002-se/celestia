import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, getBookingConfirmationParams } from '../config/emailjs';

/**
 * Initialize EmailJS with the public key
 */
export const initializeEmailJS = () => {
  try {
    // Check if EmailJS is properly configured
    if (!EMAILJS_CONFIG.PUBLIC_KEY || EMAILJS_CONFIG.PUBLIC_KEY === 'your_public_key_here') {
      console.warn('⚠️ EmailJS not configured! Please set up your EmailJS credentials in src/config/emailjs.js');
      console.warn('📧 Emails will not be sent until EmailJS is properly configured.');
      return false;
    }
    
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('✅ EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize EmailJS:', error);
    return false;
  }
};

/**
 * Send booking confirmation email using EmailJS
 * 
 * @param {Object} bookingData - The booking details
 * @param {string} bookingData.booking_id - The booking ID
 * @param {string} bookingData.email - The user's email
 * @param {string} bookingData.name - The user's name
 * @param {string} bookingData.event_title - The event title
 * @param {string} bookingData.event_date - The event date
 * @param {string} bookingData.event_location - The event location
 * @param {number} bookingData.quantity - The number of tickets
 * @param {string} bookingData.reference_number - The booking reference number
 * @param {number} bookingData.total_amount - The total amount paid
 * @param {string} bookingData.package_type - The selected package (movie or movie+photobooth)
 * @param {number} bookingData.package_price - The price per ticket for the selected package
 * @param {string} bookingData.student_id - The student ID
 * @param {string} bookingData.section - The student section
 * @param {string} bookingData.batch_no - The student batch number
 * @param {string} bookingData.phone - The user's phone number
 * @param {string} bookingData.special_requirements - Special requirements
 * @returns {Promise<Object>} - The response from EmailJS
 */
export const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    // Check if EmailJS is configured
    if (!EMAILJS_CONFIG.PUBLIC_KEY || EMAILJS_CONFIG.PUBLIC_KEY === 'your_public_key_here') {
      console.warn('⚠️ EmailJS not configured - skipping email send');
      console.log('📧 Email would have been sent to:', bookingData.email);
      console.log('📋 Booking details:', {
        name: bookingData.name,
        event: bookingData.event_title,
        reference: bookingData.reference_number,
        total: bookingData.total_amount
      });
      
      // Return a mock success response for development
      return {
        success: false,
        message: 'EmailJS not configured - email not sent',
        configured: false
      };
    }

    // Validate required fields
    const requiredFields = [
      'booking_id', 
      'email', 
      'name', 
      'event_title', 
      'event_date', 
      'reference_number',
      'package_type',
      'package_price'
    ];
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      throw new Error('Invalid email address');
    }

    console.log('📧 Sending booking confirmation email via EmailJS...');
    console.log('📋 Email data:', {
      to: bookingData.email,
      event: bookingData.event_title,
      package: bookingData.package_type,
      total: bookingData.total_amount
    });

    // Get template parameters
    const templateParams = getBookingConfirmationParams(bookingData);
    console.log('📝 Template parameters:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email sent successfully via EmailJS:', response);
    return {
      success: true,
      messageId: response.text,
      status: response.status,
      configured: true
    };

  } catch (error) {
    console.error('❌ Error sending email via EmailJS:', error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
};

/**
 * Send a simple test email to verify EmailJS setup
 * 
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<Object>} - The response from EmailJS
 */
export const sendTestEmail = async (testEmail) => {
  try {
    const templateParams = {
      to_email: testEmail,
      to_name: 'Test User',
      event_title: 'Test Event',
      event_date: new Date().toLocaleDateString(),
      event_location: 'Test Location',
      quantity: 1,
      reference_number: 'TEST-001',
      total_amount: 300,
      package_type: 'movie',
      package_price: 300,
      student_id: 'TEST/001',
      section: 'A',
      batch_no: '2024',
      phone: '123-456-7890',
      special_requirements: 'Test requirements',
      booking_date: new Date().toLocaleDateString()
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Test email sent successfully:', response);
    return {
      success: true,
      messageId: response.text,
      status: response.status
    };

  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
};
