import React, { useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { getDatabase, ref, set, remove } from "firebase/database";

// Using only the cosmos theme
const cosmosTheme = {
  button: "bg-gradient-to-r from-blue-500 to-blue-600 ",
  hover: "hover:from-blue-600 hover:to-blue-600",
  focus: "focus:ring-blue-500",
  border: "focus:border-blue-500",
};

const MessageInput = ({
  newMessage,
  setNewMessage,
  sendMessage,
  isSendingRef,
  chatId,
  currentUser
}) => {
  const textareaRef = useRef(null);
  const rtdb = getDatabase();

  const updateTypingStatus = useCallback((typing) => {
    if (chatId && currentUser?.uid) {
      const typingRef = ref(rtdb, `typing/${chatId}/${currentUser.uid}`);
      typing ? set(typingRef, true) : remove(typingRef);
    }
  }, [chatId, currentUser?.uid, rtdb]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        handleSubmit(e);
      }
    } else {
      updateTypingStatus(true);
    }
  };

  const handleBlur = () => {
    updateTypingStatus(false);
  };

  // Auto-resize behavior for the textarea
  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.max(40, Math.min(textareaRef.current.scrollHeight, 120));
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage(e);
    setNewMessage("");
    updateTypingStatus(false);
    
    if (textareaRef.current) {
      // Remove inline height so that the textarea returns to its CSS-based initial state
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="sticky bottom-0 w-full px-4 py-3 bg-white/95 border-t border-gray-100 backdrop-blur-md shadow-lg">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Type a message..."
            className={`w-full pr-16 min-h-[40px] resize-none rounded-2xl border 
              border-gray-200 p-3 max-h-[120px] text-gray-800 
              placeholder-gray-400 text-base shadow-sm transition-all 
              duration-200 ${cosmosTheme.border} focus:ring-2 
              focus:ring-opacity-50 ${cosmosTheme.focus} 
              hover:border-gray-300 focus:outline-none
              overflow-hidden`}
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            type="submit"
            disabled={isSendingRef.current || !newMessage.trim()}
            className={`absolute right-3 bottom-3 p-2 rounded-full transform transition-all duration-200 
              ${isSendingRef.current || !newMessage.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed scale-95'
                : `bg-gradient-to-r ${cosmosTheme.button} ${cosmosTheme.hover}
                   text-white shadow-lg hover:shadow-xl active:scale-95`
              }`}
            aria-label="Send message"
          >
            <Send 
              size={20} 
              className={`transform -rotate-45 transition-transform 
                ${isSendingRef.current ? 'rotate-45' : ''}`}
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(MessageInput);

