import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { Search, MessageSquare, Users } from "lucide-react";
import UserSearch from "./chat/UserSearch";
import ChatWindow from "./chat/ChatWindow";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { rtdb, ref, onValue, remove, set } from "../lib/firebase";

const HomePage = ({ user, userData, isChatOpen, setIsChatOpen }) => {
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentChats, setRecentChats] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [userStatuses, setUserStatuses] = useState({});
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  const db = getFirestore();
  useOnlineStatus();

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 1000);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const fetchRecentChats = useCallback(async () => {
    if (!user) return;

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessage.timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      async (snapshot) => {
        const participantsDetails = [];

        for (const docSnapshot of snapshot.docs) {
          const chatData = docSnapshot.data();
          const otherUserId = chatData.participants.find(
            (id) => id !== user.uid
          );

          if (otherUserId) {
            try {
              const userDoc = await getDoc(doc(db, "users", otherUserId));
              if (userDoc.exists()) {
                const otherUserData = userDoc.data();

                const unreadCount = chatData.messages
                  ? chatData.messages.filter(
                      (msg) =>
                        msg.senderId === otherUserId &&
                        (!chatData.readBy ||
                          !chatData.readBy[user.uid] ||
                          chatData.readBy[user.uid].lastRead < msg.timestamp)
                    ).length
                  : 0;

                participantsDetails.push({
                  id: otherUserId,
                  name: otherUserData.name,
                  profilePic: otherUserData.profilePic,
                  online: userStatuses[otherUserId]?.online || false,
                  lastSeen: userStatuses[otherUserId]?.lastSeen || null,
                  lastMessage: chatData.lastMessage,
                  timestamp: chatData.lastMessage?.timestamp,
                  unreadCount: unreadCount,
                });
              }
            } catch (e) {
              console.error("Error fetching user:", e);
            }
          }
        }

        const sortedChats = participantsDetails.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp?.seconds || 0;
          const timeB = b.lastMessage?.timestamp?.seconds || 0;
          return timeB - timeA;
        });

        setRecentChats(sortedChats);
        setLoading(false);
      },
      (error) => {
        console.error("Error in chat subscription:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, user, userStatuses]);

  useEffect(() => {
    fetchRecentChats();
  }, [fetchRecentChats]);

  const handleSelectUser = useCallback(
    async (selectedUser) => {
      try {
        const chatId = [user.uid, selectedUser.id].sort().join("_");
        const chatRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
          await setDoc(chatRef, {
            participants: [user.uid, selectedUser.id],
            createdAt: serverTimestamp(),
            lastMessage: {
              text: "New chat started",
              timestamp: serverTimestamp(),
            },
            messages: [],
            readBy: {
              [user.uid]: {
                lastRead: serverTimestamp(),
              },
              [selectedUser.id]: {
                lastRead: null,
              },
            },
          });

          const unreadChatRef = ref(rtdb, `unreadChats/${user.uid}/${chatId}`);
          await set(unreadChatRef, true);
        }

        const unreadChatRef = ref(rtdb, `unreadChats/${user.uid}/${chatId}`);
        await remove(unreadChatRef);

        setChatUser(selectedUser);
        setSearchTerm("");
        setIsChatOpen(true); // Set chat open state to true
      } catch (e) {
        console.error("Error selecting user:", e);
      }
    },
    [db, user, setIsChatOpen]
  );

  const filteredChats = React.useMemo(() => {
    return recentChats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentChats, searchTerm]);

  const handleBack = useCallback(() => {
    setChatUser(null);
    setIsChatOpen(false); // Set chat open state to false
  }, [setIsChatOpen]);

  useEffect(() => {
    if (!user) return;
    const usersRef = ref(rtdb, "/status");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const statuses = snapshot.val() || {};
      setUserStatuses(statuses);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unreadChatsRef = ref(rtdb, `unreadChats/${user.uid}`);

    const unsubscribe = onValue(unreadChatsRef, (snapshot) => {
      const unreadChats = snapshot.val();
      const count = unreadChats ? Object.keys(unreadChats).length : 0;
      setUnreadChatsCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-red-100">
          <p className="text-red-600 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      {/* Enhanced Sidebar */}
      <div
        className={`bg-white/90 backdrop-blur-xl flex flex-col border-r border-indigo-100/50 
        ${(isChatOpen && isMobile) ? "hidden" : "flex"}
        w-full md:w-[380px] relative z-10`}
      >
        {/* Modern Header */}
        <div className="p-8 border-b border-indigo-100/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Messages
                  {unreadChatsCount > 0 && (
                    <span className="ml-2 px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                      {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
                    </span>
                  )}
                </h1>
                <p className="text-indigo-600/60 text-sm mt-1">Welcome back, {userData?.name}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="relative">
          <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-4" />
            <input
              type="text"
              placeholder="Search Users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all border border-indigo-100 placeholder-indigo-300 shadow-sm"
            />
          </div>
        </div>

        {/* Enhanced Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-indigo-600 font-medium">Loading conversations...</p>
            </div>
          ) : (
            <div className="space-y-4 p-4 flex flex-col ml-4">
              {searchTerm ? (
                <UserSearch
                  currentUser={user}
                  searchTerm={searchTerm}
                  onSelectUser={handleSelectUser}
                  recentChats={recentChats}
                />
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectUser(chat)}
                    className={`group flex items-center p-4 cursor-pointer transition-all rounded-2xl
                    ${
                      chatUser?.id === chat.id
                        ? "bg-gradient-to-r from-blue-200 via-blue-200 to-blue-100  shadow-md"
                        : "hover:bg-indigo-50/80"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={chat.profilePic}
                        alt={chat.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-md group-hover:shadow-lg transition-all"
                      />
                      {chat.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-lg ring-2 ring-white"></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {chat.name}
                        </h3>
                        <p
                          className={`text-sm mt-1 flex items-center gap-1.5 ${
                            chat.online
                              ? "text-emerald-600 font-medium"
                              : "text-indigo-400"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              chat.online ? "bg-emerald-500" : "bg-indigo-300"
                            }`}
                          ></span>
                          {chat.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Window */}
      <div
  className={`flex-1 bg-white/80 backdrop-blur-xl 
    ${chatUser ? "flex" : "hidden"} 
    md:flex md:pt-2 md:pr-1 
    shadow-2xl relative z-0 
    ${isChatOpen && isMobile ? "w-full" : ""}`}
>
        {chatUser ? (
          <ChatWindow
            currentUser={user}
            chatUser={chatUser}
            key={chatUser.id}
            onBack={handleBack}
            updateChatList={(chatId, messageData) => {
              setRecentChats((prevChats) => {
                const chatIndex = prevChats.findIndex((chat) => chat.id === chatUser.id);
                if (chatIndex !== -1) {
                  const updatedChats = [...prevChats];
                  updatedChats[chatIndex] = {
                    ...updatedChats[chatIndex],
                    lastMessage: {
                      text: messageData.text,
                      timestamp: messageData.timestamp,
                      sender: messageData.sender,
                    },
                  };
                  return updatedChats;
                } else {
                  return prevChats;
                }
              });
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full p-8 ">
            <div className="text-center w-full max-w-lg mx-auto p-8 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-indigo-100/50">
              <div className="mb-8">
                <div className="inline-flex p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                  <Users className="w-16 h-16 text-indigo-600" />
                </div>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Start Connecting
              </h2>

              <p className="text-gray-600 leading-relaxed mb-8">
                Select a conversation from the sidebar to begin chatting with your contacts. 
                Share ideas, collaborate on projects, and stay connected with your team.
              </p>

              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping absolute inset-0"></div>
                  <div className="w-3 h-3 rounded-full bg-indigo-500 relative"></div>
                </div>
                <span className="text-sm font-medium text-indigo-600">
                  End-to-end encrypted messaging
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;