import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

type EmailPayload = {
  booking_id: string;
  email: string;
  name: string;
  event_title: string;
  event_date: string;
  event_location: string;
  quantity: number;
  reference_number: string;
  total_amount: number;
};

// This function handles sending confirmation emails for bookings
Deno.serve(async (req) => {
  try {
    // Check if request method is POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Get request body
    const payload = await req.json() as EmailPayload;
    
    // Validate required fields
    const requiredFields = [
      'booking_id', 'email', 'name', 'event_title', 
      'event_date', 'reference_number'
    ];
    
    for (const field of requiredFields) {
      if (!payload[field as keyof EmailPayload]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // Format date nicely
    const eventDate = new Date(payload.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #6a0dad;">Celestia Cinema</h1>
          <p style="font-size: 18px; color: #333;">Booking Confirmation</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Dear ${payload.name},</p>
          <p>Thank you for your booking! Your tickets for <strong>${payload.event_title}</strong> have been confirmed.</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #6a0dad; margin-top: 0;">Booking Details</h2>
          <p><strong>Reference Number:</strong> ${payload.reference_number}</p>
          <p><strong>Event:</strong> ${payload.event_title}</p>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Location:</strong> ${payload.event_location}</p>
          <p><strong>Number of Tickets:</strong> ${payload.quantity}</p>
          <p><strong>Total Amount:</strong> $${payload.total_amount.toFixed(2)}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Please arrive at least 15 minutes before the show starts. You can present this email or your booking reference number at the entrance.</p>
          <p>If you have any questions or need to make changes to your booking, please contact us at support@celestiacinema.com or call (123) 456-7890.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Celestia Cinema. All rights reserved.</p>
        </div>
      </div>
    `;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // In a real-world scenario, you would integrate with an email service provider like SendGrid, Mailgun, etc.
    // For this demo, we'll just log the email content and update the booking status
    console.log(`Email would be sent to ${payload.email} with content:`, emailContent);
    
    // Update booking record to mark email as sent
    const { error } = await supabase
      .from('bookings')
      .update({ email_sent: true })
      .eq('id', payload.booking_id);
    
    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Confirmation email sent to ${payload.email}` 
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: `Failed to send email: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}); 