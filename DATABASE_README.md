# Celestia Art Club - Database Documentation

## 🎯 Overview

This document describes the complete database structure for the Celestia Art Club application, built with Supabase. The database handles user registration, event management, and booking systems.

## 🏗️ Database Structure

### Core Tables

#### 1. **profiles** - User Profile Information
```sql
- id (uuid, PK) - References auth.users
- full_name (text) - User's full name
- phone (text) - Contact phone number
- avatar_url (text) - Profile picture URL
- created_at (timestamptz) - Account creation date
- updated_at (timestamptz) - Last update timestamp
```

#### 2. **events** - Event Management
```sql
- id (uuid, PK) - Unique event identifier
- title (text) - Event title
- description (text) - Short description
- full_description (text) - Detailed description
- date (timestamptz) - Event start date/time
- end_time (timestamptz) - Event end date/time
- venue (text) - Event location name
- address (text) - Physical address
- price (numeric) - Ticket price
- capacity (integer) - Maximum attendees
- image_url (text) - Main event image
- featured_image_1 (text) - Additional image 1
- featured_image_2 (text) - Additional image 2
- category (text) - Event type (movie, exhibition, workshop, lecture)
- organizer (text) - Event organizer name
- is_published (boolean) - Publication status
- created_at (timestamptz) - Creation timestamp
- updated_at (timestamptz) - Last update timestamp
```

#### 3. **bookings** - Booking Management
```sql
- id (uuid, PK) - Unique booking identifier
- user_id (uuid) - References auth.users (nullable for guest bookings)
- event_id (uuid) - References events
- reference_number (text) - Unique booking reference
- tickets_count (integer) - Number of tickets
- total_price (numeric) - Total booking amount
- status (text) - Booking status (pending, confirmed, cancelled)
- customer_name (text) - Customer's full name
- customer_email (text) - Customer's email
- customer_phone (text) - Customer's phone
- special_requirements (text) - Special needs/requests
- event_title (text) - Cached event title
- event_date (timestamptz) - Cached event date
- event_location (text) - Cached event location
- payment_intent_id (text) - Payment processor reference
- email_sent (boolean) - Confirmation email status
- created_at (timestamptz) - Booking creation time
- updated_at (timestamptz) - Last update timestamp
```

### Database Functions

#### 1. **get_user_profile()**
Returns complete user profile information including email from auth.users.

#### 2. **get_user_bookings()**
Returns all bookings for the authenticated user with event details.

#### 3. **check_event_availability(event_uuid)**
Returns available tickets, total capacity, and booked tickets for an event.

#### 4. **generate_reference_number()**
Generates unique booking reference numbers.

#### 5. **update_timestamp()**
Automatically updates the `updated_at` timestamp on record modifications.

### Database Views

#### 1. **event_management_view**
Comprehensive view for event management including:
- Event details
- Booking counts
- Ticket availability
- Occupancy percentages

#### 2. **booking_summary_view**
Complete booking information with event details for easy querying.

### Security & Policies

#### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

**Profiles:**
- Users can only view/update their own profile
- Users can create their own profile

**Events:**
- Anyone can view published events
- Admins can manage all events

**Bookings:**
- Users can view their own bookings
- Users can create new bookings
- Admins can view and update all bookings

### Performance Indexes

```sql
- bookings_reference_number_idx - Fast booking lookups
- events_date_category_idx - Event filtering by date/category
- events_published_idx - Published event queries
- bookings_user_status_idx - User booking queries
- bookings_event_idx - Event booking queries
- profiles_name_idx - Profile name search
- events_search_idx - Full-text event search
```

## 🚀 Getting Started

### 1. Environment Variables
Set these environment variables in your `.env` file:

```bash
REACT_APP_SUPABASE_URL=https://mocdyrlqznqaulkwfkgi.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Database Connection
The application automatically connects to the Supabase database using the configuration in `src/supabaseClient.js`.

### 3. Authentication
- User registration creates entries in both `auth.users` and `public.profiles`
- Login uses Supabase Auth
- Profile data is stored in the `profiles` table

## 📊 Sample Data

The database comes pre-populated with 5 sample events:

1. **Celestia Movie Night: The Grand Budapest Hotel** - $15.00
2. **Art Exhibition: Modern Perspectives** - $25.00
3. **Photography Workshop: Capturing Light** - $45.00
4. **Art History Lecture: Renaissance Masters** - $20.00
5. **Celestia Movie Night: La La Land** - $18.00

## 🔧 Database Operations

### Creating Events
```javascript
const { data, error } = await supabase
  .from('events')
  .insert({
    title: 'Event Title',
    description: 'Event Description',
    date: '2025-01-15T19:00:00Z',
    venue: 'Venue Name',
    price: 25.00,
    capacity: 100,
    category: 'workshop'
  });
```

### Creating Bookings
```javascript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    event_id: eventId,
    user_id: userId,
    tickets_count: 2,
    total_price: 50.00,
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '+1234567890'
  });
```

### Querying Events
```javascript
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('is_published', true)
  .order('date', { ascending: true });
```

### Getting User Profile
```javascript
const { data, error } = await supabase
  .rpc('get_user_profile');
```

## 🛡️ Security Features

1. **Row Level Security** - Users can only access their own data
2. **Authentication Required** - Protected routes require valid sessions
3. **Input Validation** - All user inputs are validated before database operations
4. **SQL Injection Protection** - Uses parameterized queries via Supabase client

## 📈 Monitoring & Maintenance

### Database Health
- Check project status in Supabase dashboard
- Monitor query performance
- Review RLS policies regularly

### Backup & Recovery
- Supabase automatically handles backups
- Point-in-time recovery available
- Database logs accessible via dashboard

## 🔗 Related Files

- `src/supabaseClient.js` - Database connection configuration
- `supabase/schema.sql` - Complete database schema
- `src/components/pages/` - UI components that interact with the database
- `src/components/admin/` - Admin panels for database management

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check if user is logged in
   - Verify RLS policies are correct
   - Ensure user has proper permissions

2. **Data Not Loading**
   - Check network connectivity
   - Verify Supabase URL and keys
   - Check browser console for errors

3. **Permission Denied**
   - Verify user authentication
   - Check RLS policies
   - Ensure proper table access

### Support
For database-related issues, check:
1. Supabase dashboard logs
2. Browser console errors
3. Network tab for failed requests
4. RLS policy configuration

---

**Last Updated:** January 2025  
**Database Version:** 1.0.0  
**Supabase Project:** Celestia (mocdyrlqznqaulkwfkgi)
