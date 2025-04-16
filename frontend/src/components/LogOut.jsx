import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const LogOut = ({ onLogoutComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLogoutComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLogoutComplete]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-32 h-32 mx-auto mb-8 relative"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-t-4 border-purple-500 animate-spin-slow"></div>
          <div className="absolute inset-6 rounded-full border-t-4 border-rose-500 animate-ping"></div>
          
          {/* Logout Icon */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <svg 
              className="w-12 h-12 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </motion.div>
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 bg-clip-text text-transparent"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Logging Out
        </motion.h1>
        
        <motion.p
          className="mt-4 text-gray-600"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Thank you for using DevConnect
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LogOut;