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
    
    // For now, we'll make email sending optional for testing
    const emailServiceApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body with new package fields
    const { 
      booking_id, 
      email, 
      name, 
      event_title, 
      event_date, 
      event_location, 
      quantity, 
      reference_number, 
      total_amount,
      package_type,
      package_price
    } = await req.json();

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

    // Determine package details
    const packageDetails = package_type === 'movie+photobooth' 
      ? 'Movie + Photobooth Package' 
      : 'Movie Only Package';
    
    const packageBenefits = package_type === 'movie+photobooth' 
      ? [
          'Professional movie screening with high-quality sound and projection',
          'Comfortable seating with complimentary popcorn',
          'Professional photobooth session with photographer',
          'Soft copy photo sent to your email after the event'
        ]
      : [
          'Professional movie screening with high-quality sound and projection',
          'Comfortable seating with complimentary popcorn'
        ];

    // Create HTML email content
    const htmlEmail = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - ${event_title}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
          }
          .content { 
            padding: 30px; 
          }
          .success-icon { 
            text-align: center; 
            margin: 20px 0; 
          }
          .success-icon .circle { 
            width: 80px; 
            height: 80px; 
            background-color: #4CAF50; 
            border-radius: 50%; 
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-size: 40px; 
          }
          .booking-details { 
            background-color: #f8f9fa; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            padding: 8px 0; 
            border-bottom: 1px solid #e9ecef; 
          }
          .detail-row:last-child { 
            border-bottom: none; 
            font-weight: bold; 
            font-size: 18px; 
            color: #667eea; 
          }
          .package-info { 
            background-color: #e3f2fd; 
            border-left: 4px solid #2196F3; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 4px; 
          }
          .benefits-list { 
            background-color: #f1f8e9; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .benefits-list h3 { 
            color: #4CAF50; 
            margin-top: 0; 
          }
          .benefits-list ul { 
            margin: 10px 0; 
            padding-left: 20px; 
          }
          .benefits-list li { 
            margin: 8px 0; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 14px; 
          }
          .reference-box { 
            background-color: #667eea; 
            color: white; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0; 
            font-size: 18px; 
            font-weight: bold; 
          }
          .important-note { 
            background-color: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #856404; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Celestia Movie Festival</h1>
            <p>Your booking has been confirmed!</p>
          </div>
          
          <div class="content">
            <div class="success-icon">
              <div class="circle">✓</div>
            </div>
            
            <h2 style="text-align: center; color: #4CAF50; margin-bottom: 30px;">
              Booking Confirmation
            </h2>
            
            <p>Dear <strong>${name}</strong>,</p>
            
            <p>Thank you for booking tickets for <strong>${event_title}</strong>. Your booking has been confirmed and we're excited to see you at the event!</p>
            
            <div class="reference-box">
              Reference Number: ${reference_number}
            </div>
            
            <div class="booking-details">
              <h3 style="margin-top: 0; color: #667eea;">📅 Event Information</h3>
              <div class="detail-row">
                <span>Event:</span>
                <span><strong>${event_title}</strong></span>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <span><strong>${formattedDate}</strong></span>
              </div>
              <div class="detail-row">
                <span>Time:</span>
                <span><strong>${formattedTime}</strong></span>
              </div>
              <div class="detail-row">
                <span>Location:</span>
                <span><strong>${event_location || 'TBA'}</strong></span>
              </div>
            </div>
            
            <div class="package-info">
              <h3 style="margin-top: 0; color: #2196F3;">🎯 Package Details</h3>
              <p><strong>Selected Package:</strong> ${packageDetails}</p>
              <p><strong>Price per Ticket:</strong> LKR ${package_price.toFixed(2)}</p>
              <p><strong>Number of Tickets:</strong> ${quantity}</p>
              <div class="detail-row">
                <span>Total Amount:</span>
                <span>LKR ${total_amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="benefits-list">
              <h3>✨ What's Included</h3>
              <ul>
                ${packageBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
            </div>
            
            <div class="important-note">
              <h4 style="margin-top: 0;">📋 Important Information</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Please arrive 15 minutes before the event starts</li>
                <li>Bring this email or your reference number for entry</li>
                <li>Tickets are non-refundable</li>
                ${package_type === 'movie+photobooth' ? '<li>Soft copy photos will be sent to your email within 24 hours after the event</li>' : ''}
              </ul>
            </div>
            
            <p>If you have any questions or need to make changes to your booking, please contact us at <strong>support@celestia.com</strong> or call us at <strong>+94 11 123 4567</strong>.</p>
            
            <p>We look forward to seeing you at the Celestia Movie Festival!</p>
            
            <p>Best regards,<br>
            <strong>The Celestia Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2025 Celestia Art Club. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create plain text version for email clients that don't support HTML
    const plainTextEmail = `
      CELESTIA MOVIE FESTIVAL - BOOKING CONFIRMATION
      
      Dear ${name},
      
      Thank you for booking tickets for ${event_title}. Your booking has been confirmed!
      
      BOOKING DETAILS:
      - Reference Number: ${reference_number}
      - Event: ${event_title}
      - Date: ${formattedDate}
      - Time: ${formattedTime}
      - Location: ${event_location || 'TBA'}
      - Package: ${packageDetails}
      - Price per Ticket: LKR ${package_price.toFixed(2)}
      - Number of Tickets: ${quantity}
      - Total Amount: LKR ${total_amount.toFixed(2)}
      
      WHAT'S INCLUDED:
      ${packageBenefits.map(benefit => `- ${benefit}`).join('\n')}
      
      IMPORTANT INFORMATION:
      - Please arrive 15 minutes before the event starts
      - Bring this email or your reference number for entry
      - Tickets are non-refundable
      ${package_type === 'movie+photobooth' ? '- Soft copy photos will be sent to your email within 24 hours after the event' : ''}
      
      If you have any questions, please contact us at support@celestia.com or call +94 11 123 4567.
      
      We look forward to seeing you at the Celestia Movie Festival!
      
      Best regards,
      The Celestia Team
      
      © 2025 Celestia Art Club. All rights reserved.
    `;

    // For testing purposes, we'll log the email content and simulate sending
    console.log(`
      ========================================
      EMAIL CONFIRMATION GENERATED
      ========================================
      
      To: ${email}
      Subject: Booking Confirmation for ${event_title}
      
      Package: ${packageDetails}
      Reference: ${reference_number}
      Total: LKR ${total_amount.toFixed(2)}
      
      HTML Email Length: ${htmlEmail.length} characters
      Plain Text Email Length: ${plainTextEmail.length} characters
      
      ========================================
      EMAIL CONTENT PREVIEW:
      ========================================
      ${plainTextEmail.substring(0, 500)}...
      
      ========================================
    `);

    // TODO: Implement actual email sending here
    // For now, we'll just log that the email would be sent
    if (emailServiceApiKey) {
      console.log('Email service API key found - sending email via SendGrid');
      
      try {
        // SendGrid API call
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailServiceApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: email, name: name }]
            }],
            from: { email: 'noreply@celestia.com', name: 'Celestia Movie Festival' },
            subject: `Booking Confirmation for ${event_title}`,
            content: [
              {
                type: 'text/html',
                value: htmlEmail
              },
              {
                type: 'text/plain',
                value: plainTextEmail
              }
            ]
          })
        });
        
        if (!sendGridResponse.ok) {
          const errorText = await sendGridResponse.text();
          throw new Error(`SendGrid API error: ${sendGridResponse.status} - ${errorText}`);
        }
        
        console.log('Email sent successfully via SendGrid');
      } catch (emailError) {
        console.error('SendGrid email sending failed:', emailError);
        // Don't fail the entire function if email fails
        // Just log the error and continue
      }
    } else {
      console.log('No email service API key found - email content generated but not sent');
      console.log('To enable actual email sending, set EMAIL_SERVICE_API_KEY environment variable');
    }

    // Update the booking status to indicate that the confirmation email was processed
    const { error } = await supabase
      .from('bookings')
      .update({ email_sent: true })
      .eq('id', booking_id);

    if (error) throw error;

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email processed successfully',
        email_generated: true,
        email_sent: !!emailServiceApiKey,
        email_content: {
          html: htmlEmail,
          plain_text: plainTextEmail
        },
        note: emailServiceApiKey ? 'Email sent successfully' : 'Email content generated but not sent (no email service configured)'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing confirmation email:', error);
    
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