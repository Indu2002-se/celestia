import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// This component wraps admin routes to ensure only authenticated admins can access them
const AdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        // Check for admin session in localStorage
        const adminSession = localStorage.getItem('adminSession');
        
        if (adminSession) {
          const session = JSON.parse(adminSession);
          
          // Check if admin session is valid
          if (session.user && session.user.role === 'admin') {
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        }
        
        // Check for legacy admin token
        const adminToken = localStorage.getItem('adminToken');
        const lastLogin = localStorage.getItem('adminLastLogin');
        const userRole = localStorage.getItem('userRole');
        
        if (adminToken && lastLogin) {
          const loginTime = parseInt(lastLogin, 10);
          const currentTime = Date.now();
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          if (currentTime - loginTime < sessionDuration) {
            setIsAuthenticated(true);
            setLoading(false);
            return;
          } else {
            // Token expired, clear admin session
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminLastLogin');
          }
        }
        
        // Check if userRole is admin
        if (userRole === 'admin') {
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // No valid admin session found
        setIsAuthenticated(false);
        setLoading(false);
        
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    checkAdminAuth();
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="celestia-container my-10 text-center">
        <div className="glass-card p-8">
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default AdminRoute; 