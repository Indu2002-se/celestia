import { supabase } from '../supabaseClient';

/**
 * Send a confirmation email to the user after booking
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
 * @returns {Promise<Object>} - The response from Supabase
 */
export const sendConfirmationEmail = async (bookingData) => {
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
  
  // Max retries for resiliency
  const maxRetries = 3;
  let attempt = 0;
  let lastError;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      
      console.log(`Attempting to send confirmation email (Attempt: ${attempt})`);
      console.log('Email data:', {
        to: bookingData.email,
        event: bookingData.event_title,
        package: bookingData.package_type,
        total: bookingData.total_amount
      });
      
      // Call the Supabase Edge Function to send the email
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          booking_id: bookingData.booking_id,
          email: bookingData.email,
          name: bookingData.name,
          event_title: bookingData.event_title,
          event_date: bookingData.event_date,
          event_location: bookingData.event_location,
          quantity: bookingData.quantity,
          reference_number: bookingData.reference_number,
          total_amount: bookingData.total_amount,
          package_type: bookingData.package_type,
          package_price: bookingData.package_price
        }
      });
      
      if (error) throw error;
      
      // Update the booking to mark email as sent
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ email_sent: true })
        .eq('id', bookingData.booking_id);
      
      if (updateError) {
        console.warn('Failed to update email_sent status:', updateError);
      }
      
      console.log(`Email sent successfully to ${bookingData.email} (Attempt: ${attempt})`);
      console.log('Email response:', data);
      
      return data;
    } catch (error) {
      console.error(`Error sending confirmation email (Attempt: ${attempt}):`, error);
      lastError = error;
      
      // Wait a bit before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        console.log(`Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  // After all retries failed
  console.error(`Failed to send email after ${maxRetries} attempts`);
  throw lastError || new Error('Failed to send confirmation email');
}; 