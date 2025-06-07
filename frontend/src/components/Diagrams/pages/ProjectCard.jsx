import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Users, Trash, Edit } from 'lucide-react';
import { format } from 'date-fns';

const ProjectCard = ({ isNew, title, type, onClick, onDelete, updatedAt, teamMembers }) => {
  if (isNew) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative h-56 sm:h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 
          rounded-3xl border-2 border-dashed border-indigo-200 shadow-sm overflow-hidden transition-all 
          duration-300 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-100/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 
                flex items-center justify-center transform group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-br from-indigo-600 to-purple-600 
                bg-clip-text text-transparent">Create New Project</h3>
              <p className="mt-2 text-sm text-gray-500">Start designing your next diagram</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer relative"
      onClick={onClick}
    >
      <div className="relative h-56 sm:h-64 bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden 
        transition-all duration-300 group-hover:shadow-xl group-hover:shadow-indigo-100/30">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
        
        {/* Card Content */}
        <div className="relative p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full
              shadow-sm shadow-indigo-100/50 border border-indigo-100">
              {type} Diagram
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 
            transition-colors duration-300 line-clamp-2">{title}</h3>
          
          {/* Center Edit Icon */}
          <div className="flex-grow flex items-center justify-center my-2">
            <div className="transform transition-all duration-300 group-hover:scale-110">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center
                group-hover:bg-indigo-100 transition-colors">
                <Edit className="w-7 h-7 text-indigo-500 group-hover:text-indigo-600" />
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center group-hover:text-indigo-600">
                Edit
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <span>{updatedAt ? format(updatedAt?.toDate?.() || updatedAt || new Date(), 'MMM d') : 'Just now'}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <span>{(teamMembers?.length || 0)} members</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 p-1.5 bg-red-500/90 backdrop-blur-sm text-white rounded-full
          hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
      >
        <Trash className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
};

export default ProjectCard;