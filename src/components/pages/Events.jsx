import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiSearch, FiMapPin, FiFilter, FiX } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    dateRange: '',
    category: 'all',
  });
  const [authState, setAuthState] = useState('checking');

  useEffect(() => {
    // Check authentication state first
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState(session ? 'authenticated' : 'unauthenticated');
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState('error');
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
        
        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setError(error.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch events if auth state is determined
    if (authState !== 'checking') {
      fetchEvents();
    }
  }, [authState]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      // Handle the date string properly
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      // Extract time from the date string and display as intended
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // Get the time components
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      
      // Format as 12-hour time
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const minutesStr = minutes.toString().padStart(2, '0');
      
      return `${hour12}:${minutesStr} ${ampm}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    const index = name === 'minPrice' ? 0 : 1;
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = Number(value);
    setFilters({
      ...filters,
      priceRange: newPriceRange,
    });
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 100],
      dateRange: '',
      category: 'all',
    });
    setSearchTerm('');
  };

  const filteredEvents = events.filter((event) => {
    // Search term filter
    const matchesSearchTerm = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Price range filter
    const matchesPriceRange = 
      parseFloat(event.price) >= filters.priceRange[0] && 
      parseFloat(event.price) <= filters.priceRange[1];
    
    // Category filter
    const matchesCategory = 
      filters.category === 'all' || 
      event.category === filters.category;
    
    // Date range filter
    let matchesDateRange = true;
    if (filters.dateRange) {
      const eventDate = new Date(event.date);
      const today = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          matchesDateRange = eventDate.toDateString() === today.toDateString();
          break;
        case 'this-week':
          const weekLater = new Date(today);
          weekLater.setDate(today.getDate() + 7);
          matchesDateRange = eventDate >= today && eventDate <= weekLater;
          break;
        case 'this-month':
          matchesDateRange = eventDate.getMonth() === today.getMonth() && 
                            eventDate.getFullYear() === today.getFullYear();
          break;
        default:
          matchesDateRange = true;
      }
    }
    
    return matchesSearchTerm && matchesPriceRange && matchesCategory && matchesDateRange;
  });

  return (
    <div className="celestia-container my-10">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text text-center"
      >
        Upcoming Events
      </motion.h1>
      
      {/* Search and Filter Bar */}
      <div className="glass-card mb-8 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 hover:bg-light transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters {showFilters ? <FiX className="ml-2" /> : null}
          </button>
        </div>
        
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.priceRange[0]}
                    onChange={handlePriceRangeChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.priceRange[1]}
                    onChange={handlePriceRangeChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="workshop">Workshop</option>
                  <option value="lecture">Lecture</option>
                  <option value="movie">Movie Show</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={resetFilters}
                className="px-4 py-2 text-primary hover:underline"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">
            {authState === 'checking' ? 'Checking authentication...' : 'Loading events...'}
          </p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="text-red-600 mb-2">Error loading events</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            Auth State: {authState}
          </div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              // Retry fetching events
              const fetchEvents = async () => {
                try {
                  const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .order('date', { ascending: true });
                  
                  if (error) throw error;
                  setEvents(data || []);
                } catch (error) {
                  setError(error.message || 'Failed to load events');
                } finally {
                  setLoading(false);
                }
              };
              fetchEvents();
            }}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Events Found */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-20">
          <div className="text-xl mb-2">No events found</div>
          <p className="text-gray-600">Try adjusting your search criteria</p>
          {(searchTerm || filters.category !== 'all' || filters.dateRange) && (
            <button 
              onClick={resetFilters}
              className="btn-secondary mt-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Event Grid */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-card overflow-hidden flex flex-col h-full"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title} 
                  className="w-full h-auto max-h-64 object-contain transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent w-full p-4">
                  <div className="text-white font-semibold flex items-center">
                    <FiCalendar className="mr-1" /> {formatDate(event.date)} at {formatTime(event.date)}
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-3">{event.description}</p>
                
                <div className="mt-auto">
                  <div className="flex items-center text-gray-600 mb-2">
                    <FiMapPin className="mr-1" /> {event.venue}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      {event.category === 'movie' ? (
                        <div className="text-sm">
                          <div className="font-bold text-lg text-primary">LKR 300.00</div>
                          <div className="text-xs text-gray-500">Movie Only</div>
                          <div className="text-xs text-gray-500">+ LKR 50.00 for Photobooth</div>
                        </div>
                      ) : (
                        <span className="font-bold text-lg">LKR {parseFloat(event.price).toFixed(2)}</span>
                      )}
                    </div>
                    <Link 
                      to={`/events/${event.id}`} 
                      className="btn-primary text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events; 