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
        <div className="relative h-64 sm:h-72 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 
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
      <div className="relative h-64 sm:h-72 bg-white/70 backdrop-blur-lg rounded-3xl border-2 border-gray-200/80 shadow-lg overflow-hidden 
        transition-all duration-300 group-hover:shadow-xl group-hover:shadow-indigo-100/30 group-hover:border-indigo-300/60">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
        
        {/* Card Content */}
        <div className="relative p-4 sm:p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full
              shadow-sm shadow-indigo-100/50 border border-indigo-100">
              {type} Diagram
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 
            transition-colors duration-300 line-clamp-2 leading-tight">{title}</h3>
          
          {/* Center Edit Icon with new UI */}
          <div className="flex-grow flex items-center justify-center my-2">
            <motion.div 
              whileHover={{ scale: 1.1}}
              className="relative"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 
                flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300
                border-2 border-white">
                <Edit className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500 group-hover:text-indigo-600" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur opacity-0 
                group-hover:opacity-20 transition-opacity duration-300"></div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                <span className="truncate">{updatedAt ? format(updatedAt?.toDate?.() || updatedAt || new Date(), 'MMM d') : 'Just now'}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1 text-gray-400" />
                <span>{(teamMembers?.length || 0)} members</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Delete Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 bg-red-500/95 backdrop-blur-sm text-white rounded-xl
          hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/25 border border-red-400/50"
      >
        <Trash className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">Delete</span>
      </motion.button>
    </motion.div>
  );
};

export default ProjectCard;