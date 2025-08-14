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

// Movie event data
const movieEvent = {
  title: "Interstellar: IMAX Re-Release",
  description: "Experience Christopher Nolan's epic sci-fi masterpiece on the IMAX screen! Join us for a special screening of Interstellar with enhanced picture and sound quality.",
  full_description: `Experience Christopher Nolan's epic sci-fi masterpiece on the IMAX screen!

Join us for a special screening of Interstellar with enhanced picture and sound quality. This science fiction adventure follows a group of astronauts who travel through a wormhole near Saturn in search of a new home for humanity.

Featuring breathtaking visuals, a mind-bending plot, and an emotional core, Interstellar is a must-see on the big screen. This special IMAX re-release enhances the already spectacular visuals and Hans Zimmer's iconic score.

Don't miss this opportunity to experience one of the greatest sci-fi films of our time as it was meant to be seen!

Runtime: 169 minutes
Rating: PG-13
Director: Christopher Nolan
Cast: Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine`,
  date: eventDate.toISOString(),
  end_time: new Date(eventDate.getTime() + (3 * 60 * 60 * 1000)).toISOString(), // Event lasts 3 hours
  venue: "Celestia IMAX Theater",
  address: "123 Stargazer Avenue, Cosmic City",
  price: 15.99,
  capacity: 150,
  image_url: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  featured_image_1: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  featured_image_2: "https://images.unsplash.com/photo-1506003094589-53954a26283f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  category: "movie",
  organizer: "Celestia Cinema",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Function to seed the database
async function seedMovieEvent() {
  try {
    console.log('Adding movie event to Supabase...');
    
    // Insert the event into the database
    const { data, error } = await supabase
      .from('events')
      .insert([movieEvent])
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('Movie event added successfully!');
    console.log('Event ID:', data[0].id);
    console.log('Title:', data[0].title);
    console.log('Date:', new Date(data[0].date).toLocaleString());
    
  } catch (error) {
    console.error('Error adding movie event:', error.message);
  }
}

// Run the seed function
seedMovieEvent(); 