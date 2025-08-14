import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// This component wraps admin routes to ensure only authenticated admins can access them
const AdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const lastLogin = localStorage.getItem('adminLastLogin');
      const userRole = localStorage.getItem('userRole');
      
      // Check if token exists and not expired (24 hour session)
      if ((adminToken && lastLogin) || userRole === 'admin') {
      if (adminToken && lastLogin) {
        const loginTime = parseInt(lastLogin, 10);
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (currentTime - loginTime < sessionDuration) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clear admin session
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminLastLogin');
            
            // But if userRole is still admin, keep authenticated
            if (userRole === 'admin') {
              setIsAuthenticated(true);
            } else {
          setIsAuthenticated(false);
            }
          }
        } else {
          // No token but userRole is admin
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
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