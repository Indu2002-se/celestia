import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Components
import Home from './components/pages/Home';
import Events from './components/pages/Events';
import EventDetails from './components/pages/EventDetails';
import Booking from './components/pages/Booking';
import Checkout from './components/pages/Checkout';
import Confirmation from './components/pages/Confirmation';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import EmailConfirmation from './components/pages/EmailConfirmation';
import Profile from './components/pages/Profile';
import NotFound from './components/pages/NotFound';

// Admin Components
import AdminLogin from './components/pages/AdminLogin';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import ManageEvents from './components/pages/admin/ManageEvents';
import ViewBookings from './components/pages/admin/ViewBookings';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar session={session} />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/auth/callback" element={<EmailConfirmation />} />
            
            {/* Booking Routes - Now accessible to guests */}
            <Route 
              path="/booking/:id" 
              element={<Booking />} 
            />
            <Route 
              path="/checkout/:bookingId" 
              element={<Checkout />} 
            />
            <Route 
              path="/confirmation/:bookingId" 
              element={<Confirmation />} 
            />
            <Route 
              path="/profile" 
              element={session ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!session ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!session ? <Register /> : <Navigate to="/" />} 
            />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Admin Dashboard with nested routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                <AdminRoute>
                  <ManageEvents />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/bookings" 
              element={
                <AdminRoute>
                  <ViewBookings />
                </AdminRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 