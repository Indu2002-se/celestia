import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        
        // This is a placeholder. In production, you'll fetch real data from Supabase
        // const { data, error } = await supabase
        //   .from('events')
        //   .select('*')
        //   .limit(3)
        //   .order('date', { ascending: true });
        
        // if (error) throw error;

        // Placeholder data
        const placeholderEvents = [
          {
            id: 1,
            title: 'Modern Art Exhibition',
            description: 'Explore the fascinating world of modern art through the eyes of our talented students.',
            image_url: 'https://images.unsplash.com/photo-1594536717222-b4ef7ff2ff7a?auto=format&fit=crop&q=80&w=800&h=500',
            date: '2025-08-15T18:00:00',
            location: 'University Gallery',
            price: 10.00,
            available_tickets: 75
          },
          {
            id: 2,
            title: 'Sculpting Workshop',
            description: 'Learn the art of sculpting with award-winning artist Sarah Johnson.',
            image_url: 'https://images.unsplash.com/photo-1576769267415-9f2d1703f6c2?auto=format&fit=crop&q=80&w=800&h=500',
            date: '2025-08-22T15:30:00',
            location: 'Art Studio B',
            price: 25.00,
            available_tickets: 15
          },
          {
            id: 3,
            title: 'Photography Night',
            description: 'A night dedicated to the art of photography featuring work from both students and faculty.',
            image_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80&w=800&h=500',
            date: '2025-09-01T19:00:00',
            location: 'Media Center',
            price: 5.00,
            available_tickets: 40
          }
        ];

        setFeaturedEvents(placeholderEvents);
      } catch (error) {
        console.error('Error fetching featured events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="celestia-container mb-20">
        <div className="glass-card overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text"
              >
                Celestia Art Club
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-700 mb-8 text-lg"
              >
                Discover the beauty of art through our immersive events, exhibitions, and workshops. Join us in celebrating creativity and artistic expression at the university's premier art club.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/events" className="btn-primary">
                  Browse Events
                </Link>
                <Link to="/register" className="px-6 py-2 bg-transparent border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-all">
                  Join Celestia
                </Link>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img 
                src="https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=800&h=600" 
                alt="Art Gallery" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="celestia-container mb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-dark">Featured Events</h2>
          <Link to="/events" className="flex items-center text-primary hover:text-primary/80 transition-colors">
            View All <FiArrowRight className="ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card overflow-hidden"
              >
                <div className="relative h-48">
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-dark">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center text-gray-600 mb-4">
                    <FiCalendar className="mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-dark">${event.price.toFixed(2)}</span>
                    <Link to={`/events/${event.id}`} className="btn-primary text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="celestia-container mb-20">
        <div className="glass-card overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-dark mb-4">About Celestia Art Club</h2>
            <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
              Celestia Art Club was founded in 2010 with the mission to nurture artistic talent and provide a platform for creative expression within the university community. Over the years, we've grown into a vibrant community of artists, art enthusiasts, and creative minds.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="p-6 glass-card">
                <h3 className="text-xl font-semibold mb-2 text-primary">Exhibitions</h3>
                <p className="text-gray-600">Regular art exhibitions showcasing student and faculty work throughout the academic year.</p>
              </div>
              <div className="p-6 glass-card">
                <h3 className="text-xl font-semibold mb-2 text-primary">Workshops</h3>
                <p className="text-gray-600">Hands-on workshops led by professionals to help members develop their skills.</p>
              </div>
              <div className="p-6 glass-card">
                <h3 className="text-xl font-semibold mb-2 text-primary">Community</h3>
                <p className="text-gray-600">A supportive community where artists can connect, collaborate, and grow together.</p>
              </div>
            </div>
            <Link to="/register" className="btn-primary inline-block">
              Become a Member
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="celestia-container mb-20">
        <div className="glass-card bg-gradient-to-r from-primary/10 to-secondary/10 overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-dark mb-4">Stay Updated</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive updates about upcoming events, exhibitions, and opportunities.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="btn-primary whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 