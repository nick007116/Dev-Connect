import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import MessageStatus from "./MessageStatus";

const MAX_VISIBLE_LINES = 8;

const MessageList = ({ messages, currentUser, searchMatches, activeMatch, virtuosoRef }) => {
  const [expandedMessages, setExpandedMessages] = useState({});
  const [expandedTexts, setExpandedTexts] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const messageRefs = useRef({});

  const countTextLines = (key) => {
    const el = messageRefs.current[key];
    if (!el) return 0;
    return Math.ceil(el.scrollHeight / 24);
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessages((prev) => ({ ...prev, [messageId]: true }));
      setTimeout(() => {
        setCopiedMessages((prev) => ({ ...prev, [messageId]: false }));
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const toggleExpandMessage = (messageId) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const renderCodeMessage = (message, isOwnMessage) => {
    const formattedCode = message.text.replace("@code", "").trim();
    const lines = formattedCode.split("\n");
    const isLongCode = lines.length > MAX_VISIBLE_LINES;
    const shouldShowExpand = !expandedMessages[message.id] && isLongCode;

    return (
      <div className="relative group">
        <div
          className={`relative bg-gray-900 rounded-lg overflow-hidden ${
            shouldShowExpand ? "max-h-[20vh]" : ""
          }`}
          style={{ maxWidth: "40vw" }}
        >
          <div className="relative">
            <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words text-gray-100">
              <code>{formattedCode}</code>
            </pre>
            {shouldShowExpand && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black-900 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          {isLongCode && (
            <button
              onClick={() => toggleExpandMessage(message.id)}
              className="text-sm font-medium flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {expandedMessages[message.id] ? (
                <>
                  <ChevronUp size={16} />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="text-white" />
                  <span className="text-white">Show more</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => copyToClipboard(formattedCode, message.id)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              copiedMessages[message.id]
                ? "bg-green-500/10 text-green-400"
                : "bg-gray-800/40 hover:bg-gray-800/80 text-gray-300 hover:text-white"
            } backdrop-blur-sm`}
            title="Copy code"
          >
            {copiedMessages[message.id] ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderTextMessage = (message, isOwnMessage, messageIndex) => {
    const messageKey = `${message.id}-text`;
    const lines = countTextLines(messageKey);
    const isLongText = lines > MAX_VISIBLE_LINES;

    // Handle search highlighting
    let content = message.text;
    if (searchMatches?.length > 0) {
      let parts = [];
      let lastIndex = 0;
      // Get matches specific to this message
      const matchesForMessage = searchMatches.filter(
        (match) => match.messageIndex === messageIndex
      );
      matchesForMessage.forEach((match) => {
        // Determine the global index of this match
        const globalIndex = searchMatches.indexOf(match);
        const isActiveMatch = globalIndex === activeMatch;

        parts.push(content.slice(lastIndex, match.matchIndex));
        parts.push(
          <span
            key={`${message.id}-${match.matchIndex}`}
            className={`px-0.5 rounded ${
              isActiveMatch ? "bg-yellow-300" : "bg-yellow-100"
            } ${isOwnMessage ? "text-blue-900" : "text-gray-900"}`}
          >
            {content.slice(match.matchIndex, match.matchIndex + match.text.length)}
          </span>
        );
        lastIndex = match.matchIndex + match.text.length;
      });
      parts.push(content.slice(lastIndex));
      content = <>{parts}</>;
    }

    return (
      <div className="relative" style={{ maxWidth: "40vw" }}>
        <p
          ref={(el) => (messageRefs.current[messageKey] = el)}
          className={`whitespace-pre-wrap break-words ${
            !expandedTexts[message.id] ? "max-h-[192px] overflow-hidden" : ""
          }`}
        >
          {content}
        </p>
        {isLongText && (
          <button
            onClick={() =>
              setExpandedTexts((prev) => ({
                ...prev,
                [message.id]: !prev[message.id],
              }))
            }
            className={`mt-1 text-sm font-medium flex items-center gap-1 ${
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            } hover:opacity-80 transition-opacity`}
          >
            {expandedTexts[message.id] ? (
              <>
                <ChevronUp size={16} />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Show more</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderMessage = (index) => {
    const message = messages[index];
    const isOwnMessage = message.sender === currentUser.uid;
    return (
      <div
        key={`${message.id}-${message.timestamp?.getTime()}`}
        data-message-index={index}
        className={`flex w-full mb-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`relative max-w-[85%] group ${
            isOwnMessage
              ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white rounded-2xl rounded-br-sm shadow-md hover:shadow-lg"
              : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm hover:shadow-md"
          } transition-shadow duration-200`}
          style={{ padding: "2%" }}
        >
          {message.text.startsWith("@code")
            ? renderCodeMessage(message, isOwnMessage)
            : renderTextMessage(message, isOwnMessage, index)}
          <div
            className={`flex items-center gap-1.5 mt-1 text-xs ${
              isOwnMessage ? "text-white/80" : "text-gray-400"
            }`}
          >
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            {isOwnMessage && <MessageStatus status={message.status} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="absolute inset-0"
      style={{
        padding: "1%",
      }}
    >
      <Virtuoso
        ref={virtuosoRef}
        totalCount={messages.length}
        itemContent={renderMessage}
        followOutput="smooth"
        initialTopMostItemIndex={messages.length - 1}
        alignToBottom
        className="scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent"
      />
    </div>
  );
};

export default MessageList;