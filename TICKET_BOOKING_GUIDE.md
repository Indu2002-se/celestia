# 🎫 Ticket Booking & PDF Download Guide

## Quick User Flow (After Login)

### 1. **Browse Events** 📅

- View available events
- Click on any event to see details

### 2. **Select Event** 🎯
- Click "Book Tickets" on event details page
- Choose ticket quantity
- Fill in personal details:
  - Full Name
  - Email
  - Phone
  - Student ID (if applicable)
  - Section & Batch (if applicable)
  - Special Requirements (optional)

### 3. **Create Booking** ✅
- System creates booking with status "pending"
- Generates unique reference number (e.g., `CEL-ABC123`)


### 4. **Payment Process** 💳
- **Checkout Page**: Shows booking confirmation
- **Confirmation Page**: Displays payment details
- **Bank Transfer Required**:
  - Account: `108852549699`
  - Holder: `B D S Mendis`
  - Bank: `Sampath Bank`
  - Branch: `Negombo 2`

### 5. **Download PDF** 📄
- Click "Download Confirmation" button
- PDF includes:
  - Event details (title, date, time, location)
  - Booking reference number
  - Customer information
  - Payment instructions
  - Bank account details

## Technical Flow

```
Login → Events → Event Details → Booking Form → Checkout → Confirmation → PDF Download
```

## Key Features

- ✅ **Authentication Required**: Must be logged in to book
- ✅ **Reference Numbers**: Auto-generated unique IDs
- ✅ **Bank Transfer**: Manual payment verification
- ✅ **PDF Generation**: Uses jsPDF + html2canvas
- ✅ **Email Notifications**: Confirmation emails sent
- ✅ **Responsive Design**: Works on all devices

## File Structure

- `Login.jsx` - User authentication
- `Events.jsx` - Event listing
- `EventDetails.jsx` - Event details & booking form
- `Booking.jsx` - Booking creation
- `Checkout.jsx` - Payment processing
- `Confirmation.jsx` - Final confirmation & PDF download

## Status Flow

```
pending → (payment verification) → confirmed
```

---

*Note: All bookings start as "pending" and require manual payment verification before confirmation.*
