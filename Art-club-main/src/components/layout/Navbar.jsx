import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

const Navbar = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="glass-card sticky top-0 z-50 mb-8">
      <div className="celestia-container py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                Celestia
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-dark hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/events" className="text-dark hover:text-primary transition-colors">
              Events
            </Link>
            
            {session ? (
              <>
                <Link to="/profile" className="text-dark hover:text-primary transition-colors">
                  My Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center text-dark hover:text-secondary transition-colors"
                >
                  <FiLogOut className="mr-1" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center text-dark hover:text-primary transition-colors">
                  <FiLogIn className="mr-1" /> Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu} 
              className="text-dark hover:text-primary transition-colors"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-dark hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/events" 
                className="text-dark hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              
              {session ? (
                <>
                  <Link 
                    to="/profile" 
                    className="text-dark hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiUser className="inline mr-1" /> My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center text-dark hover:text-secondary transition-colors"
                  >
                    <FiLogOut className="mr-1" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center text-dark hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiLogIn className="mr-1" /> Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 