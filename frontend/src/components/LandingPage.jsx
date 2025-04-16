import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Code2, Users, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "Connect with developers instantly through our real-time messaging system"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "UML Diagrams",
      description: "Create and share UML diagrams with AI-powered generation"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaboration",
      description: "Work together with team members on diagrams in real-time"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Updates",
      description: "See changes instantly with live updates and notifications"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
            DevConnect
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A powerful platform for developers to collaborate, communicate, and create UML diagrams together.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600">
        <p>© 2024 DevConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;