import React from "react";
import { motion } from "framer-motion";
import { FcGoogle } from 'react-icons/fc';
import { Sparkles } from 'lucide-react';

const Login = ({ onGoogleLogin, onDemoLogin, isLoading, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to continue to DevConnect</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md disabled:opacity-60"
        >
          <FcGoogle className="w-6 h-6" />
          <span className="font-medium">Continue with Google</span>
        </motion.button>

        <div className="flex items-center gap-3 my-5 text-sm text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDemoLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-60"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Explore demo</span>
        </motion.button>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          Demo mode uses sample data only. Nothing is saved or sent.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;