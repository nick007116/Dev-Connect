import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MainLoader = ({ onLoadingComplete }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!showLoader) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 h-screen w-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-40 h-40">
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear" 
            }}
          >
            <div className="w-full h-full rounded-full border-t-4 border-blue-500 animate-spin"></div>
          </motion.div>
          <motion.div 
            className="absolute inset-4"
            animate={{ 
              rotate: -360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear" 
            }}
          >
            <div className="w-full h-full rounded-full border-t-4 border-purple-500 animate-spin-slow"></div>
          </motion.div>
          <motion.div 
            className="absolute inset-8"
            animate={{ 
              rotate: 360,
              scale: [1, 1.3, 1],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "linear" 
            }}
          >
            <div className="w-full h-full rounded-full border-t-4 border-rose-500"></div>
          </motion.div>

          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 
              bg-clip-text text-transparent">DC</div>
          </motion.div>
        </div>

        <motion.h2 
          className="mt-8 text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 
            bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          DevConnect
        </motion.h2>
        
        <motion.div 
          className="mt-4 flex space-x-1.5 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-150"></div>
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce delay-300"></div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MainLoader;