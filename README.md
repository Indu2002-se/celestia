# Celestia

Celestia is a modern event booking platform built with React and Supabase. It allows users to browse events, book tickets, and manage their profile.

## Features

- 🔐 Authentication with Supabase Auth
- 🎫 Event browsing and ticket booking
- 🍿 Movie Show events with direct booking
- 📱 Responsive design with Tailwind CSS
- 🎞️ Image galleries for events
- 🔍 Search and filter events
- 📧 Email confirmations with booking details
- 🧾 Reference numbers for all bookings
- 👤 User profiles with booking history

## Tech Stack

- React (with hooks and context)
- React Router
- Tailwind CSS
- Framer Motion (for animations)
- Supabase (Authentication, Database, Storage)
- Supabase Edge Functions (for email notifications)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/celestia.git
cd celestia
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Run the database schema in the Supabase SQL editor (see below)
3. Deploy the Edge Functions for email notifications

## Database Schema

The application uses three main tables:

1. `profiles` - Store user profile information
2. `events` - Store event information
3. `bookings` - Store booking information

You can find the SQL to create these tables in the `supabase/schema.sql` file.

## Adding Movie Events

To add a new Movie Show event:

1. Make sure you have the correct schema deployed
2. Add the event to the `events` table with category "movie"
3. You can use the script provided in `src/scripts/seedMovieEvent.js` to add a sample movie event

```
node src/scripts/seedMovieEvent.js
```

## Booking Process

### Regular Events
1. User browses events
2. User selects event and quantity
3. User clicks "Book Tickets"
4. User enters personal details
5. User enters payment information
6. User receives confirmation with reference number

### Movie Events (Direct Booking)
1. User browses events
2. User selects a movie event and quantity
3. User clicks "Book Tickets"
4. User enters personal details directly on the event page
5. User completes booking and receives confirmation with reference number
6. Email is sent with booking details

## Edge Functions

The project uses Supabase Edge Functions for sending confirmation emails. You can find the Edge Function code in the `supabase/functions` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 