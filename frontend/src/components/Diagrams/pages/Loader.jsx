import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 backdrop-blur-sm z-50">
      <div className="flex space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-600"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-purple-600"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-600"></div>
      </div>
    </div>
  );
};

export default Loader;