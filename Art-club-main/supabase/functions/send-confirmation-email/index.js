// Supabase Edge Function to send confirmation emails
// Deploy this to your Supabase project

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.js';

export const handler = async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const emailServiceApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY'); // e.g., SendGrid, Mailgun, etc.

    if (!supabaseUrl || !supabaseServiceKey || !emailServiceApiKey) {
      throw new Error('Missing environment variables');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { booking_id, email, name, event_title, event_date, event_location, quantity, reference_number, total_amount } = await req.json();

    if (!booking_id || !email || !name || !event_title || !event_date || !reference_number) {
      throw new Error('Missing required fields');
    }

    // Format date and time for display
    const eventDate = new Date(event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
    // For demonstration purposes, we'll just log the email content and update the booking status
    
    console.log(`
      Sending email to: ${email}
      Subject: Booking Confirmation for ${event_title}
      
      Dear ${name},
      
      Thank you for booking tickets for ${event_title}.
      
      Booking Details:
      - Reference Number: ${reference_number}
      - Event: ${event_title}
      - Date: ${formattedDate}
      - Time: ${formattedTime}
      - Location: ${event_location || 'TBA'}
      - Number of Tickets: ${quantity}
      - Total Amount: $${total_amount.toFixed(2)}
      
      Please bring your reference number or this email to the event.
      
      If you have any questions, please contact us at support@celestia.com.
      
      Thank you for choosing Celestia!
      
      Best regards,
      The Celestia Team
    `);

    // Update the booking status to indicate that the confirmation email was sent
    const { error } = await supabase
      .from('bookings')
      .update({ email_sent: true })
      .eq('id', booking_id);

    if (error) throw error;

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation email sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}; 