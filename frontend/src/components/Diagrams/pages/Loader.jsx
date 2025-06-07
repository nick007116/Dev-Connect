import React from 'react';
import { Monitor, Code, Sparkles } from 'lucide-react';

const Loader = ({ type = 'default' }) => {
  // Choose icon and colors based on type
  const getLoaderConfig = () => {
    switch (type) {
      case 'remote-desktop':
        return {
          icon: <Monitor className="w-8 h-8 text-white" />,
          gradient: 'from-emerald-500 to-teal-500',
          dots: 'bg-emerald-600'
        };
      case 'ai-project':
        return {
          icon: <Sparkles className="w-8 h-8 text-white" />,
          gradient: 'from-purple-500 to-pink-500',
          dots: 'bg-purple-600'
        };
      case 'diagrams':
        return {
          icon: <Code className="w-8 h-8 text-white" />,
          gradient: 'from-indigo-500 to-blue-500',
          dots: 'bg-indigo-600'
        };
      case 'chat':
        return {
          icon: <Code className="w-8 h-8 text-white" />,
          gradient: 'from-blue-500 to-indigo-500',
          dots: 'bg-blue-600'
        };
      default:
        return {
          icon: <Code className="w-8 h-8 text-white" />,
          gradient: 'from-indigo-500 to-purple-500',
          dots: 'bg-indigo-600'
        };
    }
  };

  const config = getLoaderConfig();
  
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-lg`}>
            {config.icon}
          </div>
          <div className={`absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} animate-ping opacity-50`}></div>
        </div>
        <div className="flex space-x-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${config.dots}`}></div>
          <div className={`w-3 h-3 rounded-full animate-pulse ${config.dots} animation-delay-200`}></div>
          <div className={`w-3 h-3 rounded-full animate-pulse ${config.dots} animation-delay-500`}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;