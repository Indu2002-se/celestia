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
 * @returns {Promise<Object>} - The response from Supabase
 */
export const sendConfirmationEmail = async (bookingData) => {
  // Validate required fields
  const requiredFields = ['booking_id', 'email', 'name', 'event_title', 'event_date', 'reference_number'];
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
      
      // Call the Supabase Edge Function to send the email
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: bookingData
      });
      
      if (error) throw error;
      
      // Update the booking to mark email as sent
      await supabase
        .from('bookings')
        .update({ email_sent: true })
        .eq('id', bookingData.booking_id);
      
      console.log(`Email sent successfully to ${bookingData.email} (Attempt: ${attempt})`);
      return data;
    } catch (error) {
      console.error(`Error sending confirmation email (Attempt: ${attempt}):`, error);
      lastError = error;
      
      // Wait a bit before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  // After all retries failed
  console.error(`Failed to send email after ${maxRetries} attempts`);
  throw lastError || new Error('Failed to send confirmation email');
}; 