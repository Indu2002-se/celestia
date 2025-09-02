
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'resend';

const resend = new Resend('re_eeCvK8vr_ESWTqQUUCKhQCEAmhqzkAXMc');

serve(async (req) => {
  const { booking } = await req.json();

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: booking.customer_email,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Thank you for your booking!</p>
        <p><strong>Event:</strong> ${booking.event_title}</p>
        <p><strong>Tickets:</strong> ${booking.tickets_count}</p>
        <p><strong>Total Price:</strong> ${booking.total_price}</p>
        <p><strong>Reference Number:</strong> ${booking.reference_number}</p>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
})
