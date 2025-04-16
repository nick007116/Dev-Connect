import React from "react";
import MessageList from "./MessageList";
import { ChevronDown } from "lucide-react";

const MessagesContainer = ({ messages, currentUser, scrollToBottom, showScrollButton }) => {
  return (
    <div
      className="flex-1 overflow-y-auto relative"
      style={{ backgroundColor: "#eceff1" }}
    >
      <MessageList messages={messages} currentUser={currentUser} />
      {showScrollButton && (
        <button
          className="absolute bottom-24 right-6 p-2.5 bg-white dark:bg-[#37474f] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-[#455a64] dark:text-[#cfd8dc] border border-gray-100 dark:border-[#455a64] hover:bg-[#ccecfc] dark:hover:bg-[#4f5b62] transform hover:-translate-y-0.5 group"
          onClick={scrollToBottom}
        >
          <ChevronDown
            size={20}
            className="transition-transform group-hover:animate-bounce"
          />
        </button>
      )}
    </div>
  );
};

export default MessagesContainer;