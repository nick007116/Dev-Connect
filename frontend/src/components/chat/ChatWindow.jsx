import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  db,
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  updateDoc,
  doc,
  limit,
  rtdb,
  ref,
  onValue,
} from "../../lib/firebase.js";
import io from "socket.io-client";
import MessageInput from "./MessageInput";
import CryptoJS from "crypto-js";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import { ChevronDown } from "lucide-react";
import SearchBar from './SearchBar';

const MESSAGES_PAGE_SIZE = 20;
const createPeerConnection = () => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  return pc;
};

const ChatWindow = ({ currentUser, chatUser, onBack, updateChatList }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchMatches, setSearchMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(-1);
  const virtuosoRef = useRef(null);

  const messagesContainerRef = useRef(null);
  const isSendingRef = useRef(false);
  const chatId = useMemo(
    () => [currentUser.uid, chatUser.id].sort().join("_"),
    [currentUser.uid, chatUser.id]
  );
  const handleSearchHighlight = useCallback((matches, currentIndex) => {
    setSearchMatches(matches);
    setActiveMatch(currentIndex);
    
    if (matches.length > 0 && currentIndex >= 0) {
      const targetMatch = matches[currentIndex];
      virtuosoRef.current?.scrollToIndex({
        index: targetMatch.messageIndex,
        align: 'center',
        behavior: 'smooth'
      });
    }
  }, []);
  const peerConnectionRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollButton(false);
    }
  }, []);

  useEffect(() => {
    peerConnectionRef.current = createPeerConnection();
    return () => {
      peerConnectionRef.current && peerConnectionRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!chatUser?.id) return;
    const userStatusRef = ref(rtdb, `/status/${chatUser.id}`);
    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const status = snapshot.val() || { online: false, lastSeen: null };
      setOnlineStatus(status.online);
      setLastSeen(status.lastSeen ? new Date(status.lastSeen) : null);
    });
    return () => unsubscribe();
  }, [chatUser?.id]);

  useEffect(() => {
    const typingRef = ref(rtdb, `typing/${chatId}/${chatUser.id}`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      setIsTyping(snapshot.val() === true);
    });
    return () => unsubscribe();
  }, [chatId, chatUser.id]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: { token: currentUser.uid },
    });

    newSocket.on("connect", () => {
      newSocket.emit("join_chat", chatId);
    });

    newSocket.on("new_message", (message) => {
      if (message.chatId === chatId) {
        const decryptedText = CryptoJS.AES.decrypt(
          message.text,
          "secret-key"
        ).toString(CryptoJS.enc.Utf8);
        message.text = decryptedText;
        setMessages((prev) => {
          if (!prev.find((msg) => msg.id === message.id)) {
            return [...prev, message];
          }
          return prev;
        });
        scrollToBottom();
        updateChatList(chatId, message);
      }
    });

    newSocket.on("typing_status", ({ userId, isTyping }) => {
      if (userId === chatUser.id) {
        setIsTyping(isTyping);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.uid, chatUser.id, chatId, scrollToBottom, updateChatList]);

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "desc"),
      limit(MESSAGES_PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const decryptedText = CryptoJS.AES.decrypt(
          data.text,
          "secret-key"
        ).toString(CryptoJS.enc.Utf8);
        return {
          id: docSnap.id,
          ...data,
          text: decryptedText,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });
      setMessages(newMessages.reverse());
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatUser, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop > clientHeight);
    }
  }, []);

  const handleTyping = useCallback(
    (typingStatus) => {
      if (socket) {
        socket.emit("typing_status", {
          chatId,
          userId: currentUser.uid,
          isTyping: typingStatus,
        });
      }
    },
    [socket, chatId, currentUser.uid]
  );

  const updateLastMessage = useCallback(
    async (message) => {
      try {
        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: {
            text: message.text,
            timestamp: message.timestamp,
            sender: message.sender,
          },
        });
      } catch (error) {
        console.error("Error updating last message:", error);
      }
    },
    [chatId]
  );

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingRef.current) return;
    isSendingRef.current = true;

    const messageText = newMessage.trim();
    const encryptedText = CryptoJS.AES.encrypt(messageText, "secret-key").toString();
    const messageData = {
      chatId,
      sender: currentUser.uid,
      text: encryptedText,
      timestamp: new Date(),
      status: "sent",
    };

    setNewMessage("");
    try {
      const docRef = await addDoc(
        collection(db, "chats", chatId, "messages"),
        messageData
      );
      socket.emit("new_message", { ...messageData, id: docRef.id });
      await updateLastMessage({ ...messageData, id: docRef.id });
      updateChatList(chatId, messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      isSendingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 max-[1000px]:rounded-none rounded-t-[20px] overflow-hidden shadow-xl relative">
      <ChatHeader
        onBack={onBack}
        chatUser={chatUser}
        onlineStatus={onlineStatus}
        lastSeen={lastSeen}
        isTyping={isTyping}
        onToggleSearch={() => setIsSearchActive(prev => !prev)}
      />
      <SearchBar
        isActive={isSearchActive}
        onClose={() => setIsSearchActive(false)}
        messages={messages}
        onHighlight={handleSearchHighlight}
      />
      <div
        className="flex-1 relative overflow-y-auto"
        style={{ backgroundColor: "#eceff1" }}
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        <MessageList messages={messages} currentUser={currentUser} searchMatches={searchMatches} activeMatch={activeMatch}  virtuosoRef={virtuosoRef}/>
        {showScrollButton && (
          <button
            className="absolute bottom-24 right-6 p-2.5 bg-white dark:bg-[#37474f] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-[#455a64] dark:text-[#cfd8dc] border border-gray-100 dark:border-[#455a64] hover:bg-[#ccecfc] dark:hover:bg-[#4f5b62] transform hover:-translate-y-0.5 group"
            onClick={scrollToBottom}
          >
            <ChevronDown size={20} className="transition-transform group-hover:animate-bounce" />
          </button>
        )}
      </div>
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        handleTyping={handleTyping}
        isSendingRef={isSendingRef}
        chatId={chatId}
        currentUser={currentUser}
      />
    </div>
  );
};

export default React.memo(ChatWindow);