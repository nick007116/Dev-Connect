import React, { useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ChatHeader = ({ onBack, chatUser, onlineStatus, lastSeen, isTyping, onToggleSearch }) => {
  return (
    <div className="flex items-center px-5 py-3 border-b sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-lg">
      <div className="flex items-center w-full">
        {/* Back Button for Mobile */}
        <button
          onClick={onBack}
          className="hidden max-[1000px]:block p-2 mr-4 hover:bg-white/10 rounded-full transition-colors duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        {/* Profile Picture with Status */}
        <div className="relative mr-4">
          <img
            src={chatUser.profilePic}
            alt={chatUser.name}
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/50 shadow-md"
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              onlineStatus ? "bg-emerald-400" : "bg-gray-400"
            } border-2 border-white shadow-sm`}
          ></div>
        </div>

        {/* Name and Status */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">{chatUser.name}</h3>
          <div className="h-5">
            <span className="text-sm text-blue-100 transition-colors duration-200">
              {isTyping ? (
                <span className="text-white/90 flex items-center gap-1">
                  typing
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:.1s]" />
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:.3s]" />
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:.5s]" />
                </span>
              ) : onlineStatus ? (
                "online"
              ) : lastSeen && !isNaN(lastSeen.getTime()) ? (
                `last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`
              ) : (
                "offline"
              )}
            </span>
          </div>
        </div>

        {/* Activate Search */}
        <button
          onClick={onToggleSearch}
          className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 transform hover:scale-105"
        >
          <Search size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;