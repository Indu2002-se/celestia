// Script to seed the database with a Movie Show event
// Run this script with: node src/scripts/seedMovieEvent.js

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables or use hardcoded values for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cuwdnpshdgniocjqrniz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a future date for the event (2 weeks from now)
const eventDate = new Date();
eventDate.setDate(eventDate.getDate() + 14);
eventDate.setHours(19, 30, 0, 0); // 7:30 PM

// Movie events data - Barbie, Head of State, and Damsel
const movieEvents = [
  {
    title: "Barbie - Morning Show",
    description: "Join us for the spectacular Barbie movie experience! A magical journey through Barbie Land.",
    full_description: `Experience the magical world of Barbie in this spectacular cinematic adventure! Follow Barbie as she embarks on an extraordinary journey from her perfect Barbie Land to the real world. This visually stunning film features incredible performances, dazzling costumes, and a heartwarming story about self-discovery and empowerment. Perfect for audiences of all ages!`,
    date: new Date('2025-09-15T10:00:00Z').toISOString(),
    end_time: new Date('2025-09-15T12:00:00Z').toISOString(),
    venue: "Celestia Cinema",
    address: "123 Stargazer Avenue, Cosmic City",
    price: 300.00,
    capacity: 100,
    image_url: "/Poster - BARBIE.jpg",
    category: "movie",
    organizer: "Celestia Cinema",
    is_published: true
  },
  {
    title: "Barbie - Afternoon Show",
    description: "Join us for the spectacular Barbie movie experience! A magical journey through Barbie Land.",
    full_description: `Experience the magical world of Barbie in this spectacular cinematic adventure! Follow Barbie as she embarks on an extraordinary journey from her perfect Barbie Land to the real world. This visually stunning film features incredible performances, dazzling costumes, and a heartwarming story about self-discovery and empowerment. Perfect for audiences of all ages!`,
    date: new Date('2025-09-15T14:00:00Z').toISOString(),
    end_time: new Date('2025-09-15T16:00:00Z').toISOString(),
    venue: "Celestia Cinema",
    address: "123 Stargazer Avenue, Cosmic City",
    price: 300.00,
    capacity: 100,
    image_url: "/Poster - BARBIE.jpg",
    category: "movie",
    organizer: "Celestia Cinema",
    is_published: true
  },
  {
    title: "Head of State - Morning Show",
    description: "A hilarious political comedy starring Chris Rock!",
    full_description: `Get ready for laughs with this hilarious political comedy! Chris Rock stars as Mays Gilliam, a Washington D.C. alderman who becomes an unlikely presidential candidate. This satirical take on American politics delivers sharp wit, memorable characters, and plenty of laughs. A perfect blend of comedy and social commentary that will keep you entertained from start to finish!`,
    date: new Date('2025-09-16T10:00:00Z').toISOString(),
    end_time: new Date('2025-09-16T12:00:00Z').toISOString(),
    venue: "Celestia Cinema",
    address: "123 Stargazer Avenue, Cosmic City",
    price: 300.00,
    capacity: 100,
    image_url: "/Heads of State.jpg",
    category: "movie",
    organizer: "Celestia Cinema",
    is_published: true
  },
  {
    title: "Head of State - Afternoon Show",
    description: "A hilarious political comedy starring Chris Rock!",
    full_description: `Get ready for laughs with this hilarious political comedy! Chris Rock stars as Mays Gilliam, a Washington D.C. alderman who becomes an unlikely presidential candidate. This satirical take on American politics delivers sharp wit, memorable characters, and plenty of laughs. A perfect blend of comedy and social commentary that will keep you entertained from start to finish!`,
    date: new Date('2025-09-16T14:00:00Z').toISOString(),
    end_time: new Date('2025-09-16T16:00:00Z').toISOString(),
    venue: "Celestia Cinema",
    address: "123 Stargazer Avenue, Cosmic City",
    price: 300.00,
    capacity: 100,
    image_url: "/Heads of State.jpg",
    category: "movie",
    organizer: "Celestia Cinema",
    is_published: true
  },
  {
    title: "Damsel - Morning Show",
    description: "A thrilling fantasy adventure starring Millie Bobby Brown!",
    full_description: `Embark on an epic fantasy adventure with Damsel! Millie Bobby Brown delivers a powerful performance as a young woman who must fight for her survival in a dark fairy tale world. This gripping film combines stunning visuals, intense action sequences, and a compelling story about courage and resilience. A must-see for fantasy and adventure fans!`,
    date: new Date('2025-09-17T10:00:00Z').toISOString(),
    end_time: new Date('2025-09-17T12:00:00Z').toISOString(),
    venue: "Celestia Cinema",
    address: "123 Stargazer Avenue, Cosmic City",
    price: 300.00,
    capacity: 100,
    image_url: "/Damsel Poster.jpg",
    category: "movie",
    organizer: "Celestia Cinema",
    is_published: true
  },
  {
    title: "Damsel - Afternoon Show",
    description: "A thrilling fantasy adventure starring Millie Bobby Brown!",
    full_description: `Embark on an epic fantasy adventure with Damsel! Millie Bobby Brown delivers a powerful performance as a young woman who must fight for her survival in a dark fairy tale world. This gripping film combines stunning visuals, intense action sequences, and a compelling story about courage and resilience. A must-see for fantasy and adventure fans!`,
    date: new Date('2025-09-17T14:00:00Z').toISOString(),
    end_time: new Date('2025-09-17T16:00:00Z').toISOString(),
    venue: "Celestia Cinema",
  address: "123 Stargazer Avenue, Cosmic City",
    price: 300.00,
    capacity: 100,
    image_url: "/Damsel Poster.jpg",
  category: "movie",
  organizer: "Celestia Cinema",
    is_published: true
  }
];

// Function to seed the database
async function seedMovieEvent() {
  try {
    console.log('Adding movie events to Supabase...');
    
    // Insert all events into the database
    const { data, error } = await supabase
      .from('events')
      .insert(movieEvents)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('Movie events added successfully!');
    console.log(`Added ${data.length} events:`);
    data.forEach(event => {
      console.log(`- ${event.title} (${new Date(event.date).toLocaleString()})`);
    });
    
  } catch (error) {
    console.error('Error adding movie events:', error.message);
  }
}

// Run the seed function
seedMovieEvent(); 