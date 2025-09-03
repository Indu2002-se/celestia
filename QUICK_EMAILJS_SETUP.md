# Quick EmailJS Setup Guide

## Why you're not receiving emails
The EmailJS service is not configured yet. The system is currently using placeholder values, so emails are not being sent.

## Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Add Email Service
1. In your EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose **Gmail** (easiest option)
4. Follow the Gmail setup instructions
5. **Copy your Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Set Template ID to: `template_booking_confirmation`
4. Copy this simple template:

```html
<h2>Booking Confirmation - Celestia Art Club</h2>
<p>Hello {{to_name}}!</p>
<p>Your booking has been confirmed!</p>

<h3>Booking Details:</h3>
<ul>
  <li><strong>Reference:</strong> {{reference_number}}</li>
  <li><strong>Event:</strong> {{event_title}}</li>
  <li><strong>Date:</strong> {{event_date}}</li>
  <li><strong>Location:</strong> {{event_location}}</li>
  <li><strong>Tickets:</strong> {{quantity}}</li>
  <li><strong>Total:</strong> LKR {{total_amount}}</li>
</ul>

<h3>Student Information:</h3>
<ul>
  <li><strong>Student ID:</strong> {{student_id}}</li>
  <li><strong>Section:</strong> {{section}}</li>
  <li><strong>Batch:</strong> {{batch_no}}</li>
</ul>

<p>Thank you for choosing Celestia Art Club!</p>
```

### Step 4: Get Your Public Key
1. Go to **"Account"** in your EmailJS dashboard
2. Find your **Public Key** (starts with `user_`)
3. Copy this key

### Step 5: Update Your Configuration
1. Open `src/config/emailjs.js`
2. Replace the placeholder values:

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abc123', // Your actual service ID
  TEMPLATE_ID: 'template_booking_confirmation',
  PUBLIC_KEY: 'user_xyz789', // Your actual public key
};
```

### Step 6: Test
1. Restart your React app
2. Go to admin booking management
3. Confirm a booking
4. Check if you receive the email!

## Troubleshooting

### Check Browser Console
Open browser developer tools (F12) and look for:
- ✅ `EmailJS initialized successfully` - Good!
- ⚠️ `EmailJS not configured` - Need to update config
- ❌ Any error messages

### Common Issues
1. **Wrong Service ID**: Make sure you copied the correct service ID
2. **Wrong Public Key**: Make sure you copied the correct public key
3. **Template ID**: Must be exactly `template_booking_confirmation`
4. **Gmail Setup**: Make sure Gmail service is properly configured

### Test Email
You can test if EmailJS is working by checking the browser console when confirming a booking. You should see:
- `📧 Sending booking confirmation email via EmailJS...`
- `✅ Email sent successfully via EmailJS:`

## Need Help?
If you're still having issues:
1. Check the browser console for error messages
2. Verify all three values in `src/config/emailjs.js` are correct
3. Make sure your EmailJS service is active
4. Try creating a simple test template first

## Free Limits
EmailJS free plan includes:
- 200 emails per month
- Perfect for testing and small projects
