import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Check, AlertCircle, Users, Clock,
  Plus, ChevronDown, Download, X, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  db, 
  doc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs
} from '../../../lib/firebase';

const FloatingNavigation = ({
  projectTitle,
  projectId,
  onBack,
  onSave,
  isSaving,
  isOnline,
  lastSaved,
  saveStatus,
  allowedUserDetails,
  userList,
  currentUser,
  onAddUser,
  onFetchUserList
}) => {
  const [showUserList, setShowUserList] = useState(false);
  const [showContributors, setShowContributors] = useState(false);
  const [localUserList, setLocalUserList] = useState([]);
  const [localAllowedUsers, setLocalAllowedUsers] = useState([]);
  const [localAllowedUserDetails, setLocalAllowedUserDetails] = useState(allowedUserDetails || []);

  // Fetch allowed users on mount and when projectId changes
  useEffect(() => {
    const fetchAllowedUsers = async () => {
      if (!projectId) return;
      
      try {
        const projectRef = doc(db, 'diagrams', projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          const allowedArr = projectData.allowedUsers || [];
          const hostId = projectData.createdBy || projectData.userId || null; // Get the host ID
          
          setLocalAllowedUsers(allowedArr);
          
          // Only fetch user details if we don't already have them
          if (localAllowedUserDetails.length === 0 || localAllowedUserDetails.length !== allowedArr.length) {
            // Fetch user details for allowed users
            const userPromises = allowedArr.map((userId) => getDoc(doc(db, "users", userId)));
            const userDocs = await Promise.all(userPromises);
            
            const userDetails = userDocs
              .filter(uDoc => uDoc.exists())
              .map((uDoc) => {
                const userData = uDoc.data();
                return {
                  id: uDoc.id,
                  name: userData.displayName || userData.name || userData.email?.split('@')[0] || "Unknown User",
                  photoURL: userData.photoURL || null,
                  isHost: uDoc.id === hostId, // Mark if this user is the host
                  ...userData
                };
              });
            
            setLocalAllowedUserDetails(userDetails);
          }
        }
      } catch (error) {
        console.error("Error fetching allowed users:", error);
      }
    };

    fetchAllowedUsers();
  }, [projectId]);

  // Update local state when allowedUserDetails prop changes
  useEffect(() => {
    if (allowedUserDetails && allowedUserDetails.length > 0) {
      setLocalAllowedUserDetails(allowedUserDetails);
    }
  }, [allowedUserDetails]);

  const currentUserDetail = localAllowedUserDetails.find((u) => u.id === currentUser?.uid) || {};

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="w-4 h-4 border border-gray-400 border-t-blue-500 rounded-full animate-spin" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Helper to get user display name consistently
  const getUserDisplayName = (user) => {
    if (!user) return "Unknown User";
    
    // Try all possible name fields in order of preference
    return user.displayName || user.name || user.email?.split('@')[0] || "Unknown User";
  };

  const handleAddUser = async (userId) => {
    try {
      const projectRef = doc(db, 'diagrams', projectId);
      const updatedAllowedUsers = [...new Set([...localAllowedUsers, userId, currentUser?.uid])];
      await updateDoc(projectRef, { allowedUsers: updatedAllowedUsers });
      setLocalAllowedUsers(updatedAllowedUsers);
      
      // Fetch & update user details for the newly added user
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const newUser = { id: userDoc.id, ...userDoc.data() };
        setLocalAllowedUserDetails(prev => [...prev, newUser]);
      }
      
      setShowUserList(false);
      
      // Call the parent component's onAddUser if available
      if (onAddUser) {
        onAddUser(userId);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const fetchUserList = async () => {
    if (!currentUser?.uid) {
      console.error("Current user is not defined");
      return;
    }

    // Set loading state
    setLocalUserList([]);

    // Use parent's fetch function if available
    if (onFetchUserList) {
      try {
        const result = await onFetchUserList();
        if (result && result.length > 0) {
          setLocalUserList(result);
          return;
        }
      } catch (error) {
        console.error("Error fetching from parent:", error);
      }
    }

    try {
      // First try to get users from connections (chats)
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      const foundUsers = [];
      querySnapshot.forEach((docSnap) => {
        const chatData = docSnap.data();
        if (chatData.participants) {
          const otherUserIds = chatData.participants.filter(
            (id) => id !== currentUser.uid
          );
          foundUsers.push(...otherUserIds);
        }
      });

      // Always get some recent users regardless of chats
      const usersRef = collection(db, "users");
      // Remove the problematic query
      const usersQuery = query(usersRef);
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.forEach((userDoc) => {
        // Filter in JavaScript instead
        if (userDoc.id !== currentUser.uid) {
          foundUsers.push(userDoc.id);
        }
      });

      const uniqueUsers = [...new Set(foundUsers)];
      
      if (uniqueUsers.length === 0) {
        // If still no users, fallback to getting all users
        const allUsersQuery = query(collection(db, "users"));
        const allUsersSnapshot = await getDocs(allUsersQuery);
        allUsersSnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            uniqueUsers.push(doc.id);
          }
        });
      }

      // Get user details
      const userDocs = await Promise.all(
        uniqueUsers.map((id) => getDoc(doc(db, "users", id)))
      );
      const userListData = userDocs
        .filter(uDoc => uDoc.exists())
        .map((uDoc) => ({
          id: uDoc.id,
          ...uDoc.data(),
        }));

      // Filter out users already in allowedUsers
      const filteredUserList = userListData.filter(
        (user) => !localAllowedUsers.includes(user.id)
      );
      
      console.log("Found users:", filteredUserList);
      setLocalUserList(filteredUserList);
      
      if (filteredUserList.length === 0) {
        console.log("No users available to add, all users are already collaborators");
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  return (
    <>
      {/* Project Info Box - Left */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-3 z-[100] flex items-center space-x-3 max-w-[calc(100vw-120px)] sm:max-w-md"
      >
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>
        
        <div className="h-8 w-px bg-gray-300 hidden sm:block" />
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded-sm relative">
              <div className="absolute inset-1 bg-white rounded-sm opacity-80"></div>
            </div>
          </div>
          <div className="overflow-hidden">
            <h1 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{projectTitle}</h1>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="truncate">Live Whiteboard</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Status and Actions Box - Center for desktop, hidden on mobile */}
      <div className="fixed top-4 left-0 right-0 flex justify-center items-center z-[100] pointer-events-none hidden md:flex">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-3 flex items-center space-x-3 pointer-events-auto"
        >
          {/* Save Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
            {getSaveStatusIcon()}
            <span className="text-sm font-medium text-gray-600">
              {saveStatus === 'saving' ? 'Saving...' : 
              saveStatus === 'error' ? 'Save Failed' : 
              'Saved'}
            </span>
            {lastSaved && (
              <span className="text-xs text-gray-500">
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="h-8 w-px bg-gray-300" />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>

            <button
              onClick={onSave}
              disabled={isSaving || !isOnline}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isSaving || !isOnline
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Save Button - positioned beside preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 left-6 z-[100] md:hidden"
      >
        <button
          onClick={onSave}
          disabled={isSaving || !isOnline}
          className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg ${
            isSaving || !isOnline
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl'
          }`}
        >
          <Save className="w-5 h-5" />
          <span className="text-sm">{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </motion.div>

      {/* Mobile Save Status Indicator */}
      <AnimatePresence>
        {(saveStatus === 'saved' || saveStatus === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-20 left-6 z-[100] md:hidden rounded-xl px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
              saveStatus === 'error' 
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {saveStatus === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>
              {saveStatus === 'error' ? 'Failed to save' : 'Saved'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collaborators Box - Right */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="fixed top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-3 z-[100] flex items-center space-x-3"
      >
        <div 
          onClick={() => setShowContributors(!showContributors)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 cursor-pointer relative group"
          title="Show collaborators"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center overflow-hidden">
            {currentUserDetail.photoURL ? (
              <img
                src={currentUserDetail.photoURL}
                alt={getUserDisplayName(currentUserDetail)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {getUserDisplayName(currentUserDetail)[0] || "?"}
              </span>
            )}
          </div>
          
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-gray-700">
              {getUserDisplayName(currentUserDetail)}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
        </div>
        
        <button
          onClick={() => {
            setShowUserList(!showUserList);
            fetchUserList();
          }}
          className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all duration-200 group"
          title="Add collaborator"
        >
          <UserPlus className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
        </button>
      </motion.div>
      
      {/* Contributors Dropdown */}
      <AnimatePresence>
        {showContributors && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-24 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[101] p-1.5"
          >
            <div className="flex items-center justify-between p-3">
              <h3 className="font-semibold text-gray-900">Collaborators</h3>
              <button
                onClick={() => setShowContributors(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
              {/* Show current user with host tag if they are the host */}
              <div className="flex items-center space-x-3 p-2.5 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center ring-2 ring-white overflow-hidden">
                  {currentUserDetail.photoURL ? (
                    <img
                      src={currentUserDetail.photoURL}
                      alt={getUserDisplayName(currentUserDetail)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {getUserDisplayName(currentUserDetail)[0] || "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    {getUserDisplayName(currentUserDetail)}
                    {currentUserDetail.isHost && (
                      <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        [Host]
                      </span>
                    )}
                  </span>
                  <div className="text-xs text-gray-500">You</div>
                </div>
              </div>
              
              {localAllowedUserDetails && localAllowedUserDetails.length > 0 ? (
                // Only show other users (not the current user)
                localAllowedUserDetails
                  .filter((u) => u && u.id !== currentUser?.uid)
                  .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center ring-2 ring-white overflow-hidden">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={getUserDisplayName(user)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {getUserDisplayName(user)[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        {getUserDisplayName(user)}
                        {user.isHost && (
                          <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            [Host]
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-gray-500 text-center">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No other collaborators
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Dropdown */}
      <AnimatePresence>
        {showUserList && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-24 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[101] p-1.5"
          >
            <div className="flex items-center justify-between p-3">
              <h3 className="font-semibold text-gray-900">Add Collaborators</h3>
              <button
                onClick={() => setShowUserList(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
              {localUserList.length > 0 ? (
                localUserList.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAddUser(user.id)}
                    className="w-full p-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={getUserDisplayName(user)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {getUserDisplayName(user)[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {getUserDisplayName(user)}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm text-gray-500 text-center">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  {localUserList === null ? "Loading users..." : "No users available to add"}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNavigation;