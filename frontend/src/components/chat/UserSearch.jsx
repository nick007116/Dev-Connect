import React, { useState, useEffect } from "react";
import { db, collection, query, where, getDocs } from "../../lib/firebase.js";
import { UserPlus, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const UserSearch = ({ currentUser, searchTerm, onSelectUser, recentChats }) => {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff")
      );

      try {
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((docSnap) => {
          if (docSnap.id !== currentUser.uid) {
            const userData = docSnap.data();
            users.push({
              id: docSnap.id,
              ...userData,
              lastSeen: userData.lastSeen?.toDate() || new Date(),
            });
          }
        });
        setResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearching(false);
      }
    };

    handleSearch();
  }, [currentUser, searchTerm]);

  return (
    <>
      {searching && !results.length && (
        <div className="p-4 text-center text-indigo-500">Searching users...</div>
      )}
      {results.map((user) => {
        const isChatting = recentChats.some((chat) => chat.id === user.id);

        return (
          <div
            key={user.id}
            className="flex items-center px-6 py-4 cursor-pointer transition-all hover:bg-indigo-50/50 border-l-4 border-transparent"
            onClick={() => onSelectUser(user)}
          >
            <div className="relative">
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
              />
              {user.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white shadow-sm"></div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <p className={`text-sm mt-0.5 flex items-center gap-1.5 ${user.online ? 'text-emerald-600 font-medium' : 'text-indigo-400'}`}>
                <span className={`w-2 h-2 rounded-full ${user.online ? 'bg-emerald-500' : 'bg-indigo-300'}`}></span>
                {user.online ? 'Online' : 'Offline'}
                {!user.online && (
                  <span className="text-gray-500">
                    Last seen {formatDistanceToNow(user.lastSeen, { addSuffix: true })}
                  </span>
                )}
              </p>
            </div>
            <button className="p-2 rounded-xl hover:bg-indigo-100 text-indigo-500 transition-colors">
              {isChatting ? <MessageSquare className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </button>
          </div>
        );
      })}
    </>
  );
};

export default UserSearch;