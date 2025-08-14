import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiCalendar } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const emptyFormData = {
    title: '',
    description: '',
    full_description: '',
    date: '',
    end_time: '',
    venue: '',
    address: '',
    price: '',
    capacity: '',
    image_url: '',
    featured_image_1: '',
    featured_image_2: '',
    category: 'movie',
    organizer: 'Celestia Cinema'
  };
  
  const [formData, setFormData] = useState(emptyFormData);
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch events from Supabase
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Ensure all events have default values for required fields
      const eventsWithDefaults = (data || []).map(event => ({
        ...event,
        image_url: event.image_url || '',
        price: event.price || 0,
        capacity: event.capacity || 0
      }));
      
      setEvents(eventsWithDefaults);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for price - ensure it's a valid number
    if (name === 'price' || name === 'capacity') {
      const numberValue = value === '' ? '' : parseFloat(value);
      setFormData({
        ...formData,
        [name]: numberValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.venue) errors.venue = 'Venue is required';
    if (!formData.image_url) errors.image_url = 'Image URL is required';
    
    // Validate price and capacity
    if (formData.price === '') {
      errors.price = 'Price is required';
    } else if (isNaN(formData.price) || formData.price < 0) {
      errors.price = 'Price must be a valid number';
    }
    
    if (formData.capacity === '') {
      errors.capacity = 'Capacity is required';
    } else if (isNaN(formData.capacity) || formData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Format data for submission
      const eventData = {
        ...formData,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity, 10),
        is_published: true
      };
      
      let result;
      
      if (editingEvent) {
        // Update existing event
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)
          .select();
        
        if (error) throw error;
        result = data;
        
        // Update the event in the local state
        setEvents(events.map(event => 
          event.id === editingEvent.id ? data[0] : event
        ));
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('events')
          .insert(eventData)
          .select();
        
        if (error) throw error;
        result = data;
        
        // Add the new event to the local state
        setEvents([...events, data[0]]);
      }
      
      // Reset form and state
      setFormData(emptyFormData);
      setEditingEvent(null);
      setShowForm(false);
      
      // Show success message
      alert(`Event ${editingEvent ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (event) => {
    // Format dates for the form
    const formattedEvent = {
      ...event,
      date: new Date(event.date).toISOString().slice(0, 16),
      end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : ''
    };
    
    setEditingEvent(event);
    setFormData(formattedEvent);
    setShowForm(true);
  };
  
  const handleDelete = async (eventId) => {
    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    
    if (!confirmed) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      // Remove the event from the local state
      setEvents(events.filter(event => event.id !== eventId));
      
      alert('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Events</h2>
        <button 
          onClick={() => {
            setEditingEvent(null);
            setFormData(emptyFormData);
            setShowForm(!showForm);
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            showForm 
              ? 'bg-gray-200 hover:bg-gray-300' 
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {showForm ? (
            <><FiX /> Cancel</>
          ) : (
            <><FiPlus /> Add New Event</>
          )}
        </button>
      </div>
      
      {error && (
        <div className="glass-card p-4 mb-6 bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEvents} 
            className="text-primary hover:underline mt-2"
          >
            Try again
          </button>
        </div>
      )}
      
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Event Title"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="movie">Movie Show</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="workshop">Workshop</option>
                  <option value="lecture">Lecture</option>
                </select>
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Brief description of the event"
                ></textarea>
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>
              
              {/* Full Description */}
              <div className="md:col-span-2">
                <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  id="full_description"
                  name="full_description"
                  value={formData.full_description}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Detailed description of the event"
                ></textarea>
              </div>
              
              {/* Date and Time */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time*
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.date ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {formErrors.date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                )}
              </div>
              
              {/* End Time */}
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Venue */}
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
                  Venue*
                </label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.venue ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Event Venue"
                />
                {formErrors.venue && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.venue}</p>
                )}
              </div>
              
              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Event Address"
                />
              </div>
              
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price* ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Ticket Price"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                )}
              </div>
              
              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity*
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.capacity ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Maximum Capacity"
                />
                {formErrors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.capacity}</p>
                )}
              </div>
              
              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Main Image URL*
                </label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.image_url ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.image_url && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.image_url}</p>
                )}
              </div>
              
              {/* Organizer */}
              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                  Organizer
                </label>
                <input
                  type="text"
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Event Organizer"
                />
              </div>
              
              {/* Featured Images */}
              <div>
                <label htmlFor="featured_image_1" className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image 1 URL
                </label>
                <input
                  type="text"
                  id="featured_image_1"
                  name="featured_image_1"
                  value={formData.featured_image_1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/featured1.jpg"
                />
              </div>
              
              <div>
                <label htmlFor="featured_image_2" className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image 2 URL
                </label>
                <input
                  type="text"
                  id="featured_image_2"
                  name="featured_image_2"
                  value={formData.featured_image_2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/featured2.jpg"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark flex items-center gap-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <FiSave /> {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {loading && !showForm ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600">Loading events...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="glass-card">
              <tr>
                <th className="p-4">Event</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Price</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Category</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    No events found. Create your first event!
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id} className="glass-card hover:shadow-md">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {event.image_url && (
                          <img 
                            src={event.image_url} 
                            alt={event.title || 'Event'} 
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x100?text=No+Image';
                            }}
                          />
                        )}
                        <div>
                          <div className="font-medium">{event.title || 'Untitled Event'}</div>
                          <div className="text-sm text-gray-600 truncate" style={{ maxWidth: '200px' }}>
                            {event.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 text-primary" />
                        {formatDateTime(event.date)}
                      </div>
                    </td>
                    <td className="p-4">{event.venue || 'N/A'}</td>
                    <td className="p-4">${parseFloat(event.price || 0).toFixed(2)}</td>
                    <td className="p-4">{event.capacity || 0}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {(event.category || 'other').charAt(0).toUpperCase() + (event.category || 'other').slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(event)}
                          className="p-2 rounded-full hover:bg-gray-100"
                          title="Edit Event"
                        >
                          <FiEdit2 className="text-primary" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="p-2 rounded-full hover:bg-gray-100"
                          title="Delete Event"
                        >
                          <FiTrash2 className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageEvents; 