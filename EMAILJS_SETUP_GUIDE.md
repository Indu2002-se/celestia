# EmailJS Setup Guide for Celestia Art Club

## Overview
This guide will help you set up EmailJS to automatically send booking confirmation emails when admins confirm bookings.

## Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID** (e.g., `service_celestia`)

## Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use the template ID: `template_booking_confirmation`
4. Copy the following HTML template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation - Celestia Art Club</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎬 Celestia Art Club</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Booking Confirmation</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #667eea; margin-top: 0;">Hello {{to_name}}!</h2>
        
        <p>Your booking has been confirmed! We're excited to see you at our event.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #333;">📋 Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 40%;">Reference Number:</td>
                    <td style="padding: 8px 0; color: #667eea; font-weight: bold;">{{reference_number}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Event:</td>
                    <td style="padding: 8px 0;">{{event_title}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Date & Time:</td>
                    <td style="padding: 8px 0;">{{event_date}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                    <td style="padding: 8px 0;">{{event_location}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Package:</td>
                    <td style="padding: 8px 0;">{{package_type}} (LKR {{package_price}})</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Tickets:</td>
                    <td style="padding: 8px 0;">{{quantity}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #28a745; font-weight: bold; font-size: 18px;">LKR {{total_amount}}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #333;">👨‍🎓 Student Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 40%;">Student ID:</td>
                    <td style="padding: 8px 0;">{{student_id}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Section:</td>
                    <td style="padding: 8px 0;">{{section}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Batch:</td>
                    <td style="padding: 8px 0;">{{batch_no}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px 0;">{{phone}}</td>
                </tr>
            </table>
        </div>
        
        {% if special_requirements != "None" %}
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0; color: #856404;">📝 Special Requirements</h4>
            <p style="margin: 0; color: #856404;">{{special_requirements}}</p>
        </div>
        {% endif %}
        
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h4 style="margin-top: 0; color: #0c5460;">📅 Important Reminders</h4>
            <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
                <li>Please arrive 15 minutes before the event starts</li>
                <li>Bring a valid student ID for verification</li>
                <li>Keep this confirmation email as proof of booking</li>
                <li>Contact us if you need to make any changes</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">
                Booking confirmed on {{booking_date}}
            </p>
            <p style="color: #666; font-size: 14px;">
                Thank you for choosing Celestia Art Club! 🎨
            </p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e9ecef;">
        <p>Celestia Art Club | University Art Society</p>
        <p>This is an automated email. Please do not reply to this message.</p>
    </div>
</body>
</html>
```

## Step 4: Get Your Public Key
1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (starts with `user_`)
3. Copy this key

## Step 5: Update Configuration
1. Open `src/config/emailjs.js`
2. Replace the placeholder values:
   ```javascript
   export const EMAILJS_CONFIG = {
     SERVICE_ID: 'your_service_id_here', // Replace with your service ID
     TEMPLATE_ID: 'template_booking_confirmation', // Your template ID
     PUBLIC_KEY: 'your_public_key_here', // Replace with your public key
   };
   ```

## Step 6: Test the Setup
1. Start your React application
2. Go to the admin booking management page
3. Try confirming a booking
4. Check if the email is sent successfully

## Template Variables
The email template uses these variables that are automatically populated:
- `{{to_name}}` - Customer name
- `{{to_email}}` - Customer email
- `{{event_title}}` - Event title
- `{{event_date}}` - Formatted event date
- `{{event_location}}` - Event venue
- `{{quantity}}` - Number of tickets
- `{{reference_number}}` - Booking reference
- `{{total_amount}}` - Total amount paid
- `{{package_type}}` - Package type (movie/movie+photobooth)
- `{{package_price}}` - Price per ticket
- `{{student_id}}` - Student ID
- `{{section}}` - Student section
- `{{batch_no}}` - Student batch number
- `{{phone}}` - Customer phone
- `{{special_requirements}}` - Special requirements
- `{{booking_date}}` - Date when booking was confirmed

## Troubleshooting
- Make sure your EmailJS service is properly configured
- Check that your email provider allows sending emails
- Verify that all template variables are correctly named
- Check the browser console for any error messages
- Ensure your public key is correct and active

## Features
✅ Automatic email sending when booking is confirmed
✅ Professional email template with all booking details
✅ Student information included in email
✅ Email status tracking in admin interface
✅ Error handling and user feedback
✅ Responsive email design
