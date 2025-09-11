# 🎫 Guest Booking System

## Overview
The Celestia Events platform now supports **guest booking**, allowing users to book tickets without creating an account or signing in.

## Features

### ✅ What's Available for Guests
- **Browse Events**: View all published events
- **Book Tickets**: Complete the booking process without authentication
- **Receive Confirmation**: Get booking confirmation via email
- **Download PDF**: Download booking confirmation with payment details
- **Payment Processing**: Complete bank transfer payments

### 🔒 What Requires Authentication
- **Profile Management**: View/edit user profile
- **Booking History**: View past bookings (only for registered users)
- **Admin Functions**: Administrative features

## User Flow

### For Guest Users
1. **Browse Events** → Visit `/events` page
2. **Select Event** → Click on any event to view details
3. **Book Tickets** → Click "Book Tickets" button
4. **Fill Information** → Complete the booking form with:
   - Full Name
   - Email Address
   - Phone Number
   - Student ID
   - Section
   - Batch Number
   - Special Requirements (optional)
5. **Confirm Booking** → Review and confirm booking
6. **Payment** → Receive bank transfer details
7. **Download PDF** → Get confirmation document

### For Registered Users
- Same flow as guests, but with pre-filled information from their profile
- Additional access to booking history and profile management

## Technical Implementation

### Database Changes
- **Bookings Table**: `user_id` field allows `NULL` values for guest bookings
- **Policies Updated**: Database policies now allow guest users to create bookings

### Route Changes
- **Public Routes**: `/booking/:id`, `/checkout/:bookingId`, `/confirmation/:bookingId`
- **No Authentication Required**: These routes are now accessible to all users

### UI Updates
- **Guest Indicators**: Clear messaging that guest booking is available
- **Form Pre-filling**: Registered users get pre-filled forms
- **Responsive Design**: Works on all devices

## Security Considerations

### Data Protection
- Guest bookings are stored with `user_id = NULL`
- Email addresses are used for communication
- All bookings require payment verification

### Validation
- Form validation ensures required fields are completed
- Email format validation
- Phone number validation
- Student ID format validation

## Benefits

### For Users
- **Faster Booking**: No need to create an account
- **Reduced Friction**: Streamlined booking process
- **Same Features**: Access to all booking functionality

### For Business
- **Higher Conversion**: Reduced barriers to booking
- **Better UX**: Improved user experience
- **Data Collection**: Still capture customer information

## Testing

### Test Scenarios
1. **Guest Booking Flow**:
   - Visit events page without logging in
   - Select an event and book tickets
   - Complete the entire booking process
   - Verify email confirmation is sent

2. **Registered User Flow**:
   - Login and book tickets
   - Verify form pre-filling works
   - Check booking appears in profile

3. **Mixed Scenarios**:
   - Start as guest, then login during booking
   - Login after guest booking to view history

## Support

For any issues with guest booking:
- Check browser console for errors
- Verify database policies are correct
- Ensure email service is configured
- Test with different browsers/devices

---

*Last Updated: December 2024*
*Version: 1.0*
