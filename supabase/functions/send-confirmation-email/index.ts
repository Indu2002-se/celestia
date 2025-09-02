
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

serve(async (req) => {
  try {
    const { record: booking } = await req.json();

    // Connect to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", booking.event_id)
      .single();

    if (eventError) {
      throw new Error(`Error fetching event details: ${eventError.message}`);
    }

    // Create the email content
    const emailHtml = `
      <html>
        <body>
          <h1>Booking Confirmation</h1>
          <p>Thank you for your booking!</p>
          <h2>Booking Details:</h2>
          <ul>
            <li><strong>Reference Number:</strong> ${booking.reference_number}</li>
            <li><strong>Event:</strong> ${event.title}</li>
            <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${new Date(event.date).toLocaleTimeString()}</li>
            <li><strong>Venue:</strong> ${event.venue}</li>
            <li><strong>Tickets:</strong> ${booking.tickets_count}</li>
            <li><strong>Total Price:</strong> ${booking.total_price}</li>
          </ul>
          <p>We look forward to seeing you at the event!</p>
        </body>
      </html>
    `;

    // Send the email using Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // Replace with your "from" email address
        to: booking.customer_email,
        subject: "Your Booking Confirmation",
        html: emailHtml,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
