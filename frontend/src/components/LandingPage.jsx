import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Code2, Users, Monitor, Sparkles, BookOpen } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "Connect with developers instantly through our real-time messaging system with voice & video calls"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "UML Diagrams",
      description: "Create and share UML diagrams with AI-powered generation and collaborative editing"
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Remote Desktop Share",
      description: "Share your entire development environment instantly with team members. Zero setup required!"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Project Kickstarter",
      description: "Generate complete project setups with tech stack recommendations, folder structure, configs, and deployment scripts in seconds"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Smart Learning Hub",
      description: "AI-powered personalized learning paths with interactive coding challenges, real-world projects, and skill assessments"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "DevMentorship Network",
      description: "Connect with industry mentors, get code reviews, career guidance, and participate in coding competitions"
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
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
            The ultimate AI-powered platform for developers to collaborate, learn, and build projects together. From instant project setup to mentorship - everything you need in one place.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Building Today
          </motion.button>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600">Projects Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">15K+</div>
              <div className="text-gray-600">Active Developers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600">99%</div>
              <div className="text-gray-600">Setup Success Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Key Features Highlight */}
        <div className="mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Developers Choose DevConnect
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary features that transform how you code, learn, and collaborate
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Project Kickstarter Highlight */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl border border-emerald-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">⚡ Instant Project Setup</h3>
              <p className="text-gray-600 mb-6">
                AI analyzes your requirements and generates complete project structure with best practices, configs, and deployment scripts in under 30 seconds.
              </p>
              <div className="bg-white/60 p-4 rounded-lg font-mono text-sm">
                <div className="text-emerald-600"># Example output:</div>
                <div>✓ React + TypeScript setup</div>
                <div>✓ ESLint + Prettier configs</div>
                <div>✓ Docker containerization</div>
                <div>✓ CI/CD pipeline ready</div>
              </div>
            </motion.div>

            {/* Remote Desktop Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl border border-purple-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-6">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🖥️ Live Collaboration</h3>
              <p className="text-gray-600 mb-6">
                Share your entire development environment instantly. Debug together, pair program, and solve issues in real-time with HD screen sharing.
              </p>
              <div className="bg-white/60 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live Session Active</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  3 developers connected • 45ms latency
                </div>
              </div>
            </motion.div>

            {/* Learning Hub Highlight */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.4 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📚 Smart Learning</h3>
              <p className="text-gray-600 mb-6">
                AI-powered personalized learning paths with real coding challenges, mentorship matching, and skill progression tracking.
              </p>
              <div className="bg-white/60 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-600 mb-2">Your Progress</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>React Mastery</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}
          className="mt-32 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Development Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are building faster, learning smarter, and collaborating better with DevConnect.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Journey - It's Free!
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-600 border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-lg mb-4">© 2024 DevConnect. Empowering developers worldwide.</p>
          <div className="flex justify-center space-x-8 text-sm">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;