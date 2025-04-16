import React, { useState, useEffect } from 'react';
import { MessageCircle, Code, Menu, X } from 'lucide-react';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const SideIcons = ({ activeTab, setActiveTab, showMenu, setShowMenu, userData, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const auth = getAuth();
    
    try {
      await signOut(auth);
      // First navigate to logout page to show animation
      navigate('/logout');
      // Then trigger the app-level logout after a delay
      setTimeout(() => {
        onLogout();
      }, 3000);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      navigate('/chat');
    } else if (tab === 'code') {
      navigate('/diagrams');
    }
  };

  return (
    <div className={`fixed top-0 left-0 flex flex-col items-center p-4 border-r border-gray-300 h-screen bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-300 ${showMenu ? 'w-64' : 'w-20'} rounded-r-lg`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg transition-colors duration-300 hover:bg-gray-200 mb-8 self-start"
      >
        {showMenu ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>
      
      <div className="flex flex-col items-center space-y-6 mt-4 w-full">
        <button
          onClick={() => handleNavigation('chat')}
          className={`flex items-center p-3 rounded-lg transition-colors duration-300 w-full ${activeTab === 'chat' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        >
          <MessageCircle className={`w-6 h-6 text-blue-600 ${!showMenu && 'mx-auto'}`} />
          {showMenu && <span className="ml-4 text-lg">Chat</span>}
        </button>
        <button
          onClick={() => handleNavigation('code')}
          className={`flex items-center p-3 rounded-lg transition-colors duration-300 w-full ${activeTab === 'code' ? 'bg-green-100' : 'hover:bg-gray-100'}`}
        >
          <Code className={`w-6 h-6 text-green-600 ${!showMenu && 'mx-auto'}`} />
          {showMenu && <span className="ml-4 text-lg">Diagrams</span>}
        </button>
      </div>

      <div className="mt-auto w-full">
        {userData && (
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100 w-full ${!showMenu && 'justify-center'}`}
          >
            <img
              src={userData.profilePic}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            {showMenu && <span className="ml-4 text-lg">Profile</span>}
          </button>
        )}
      </div>

      {showProfileMenu && userData && (
        <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-4 profile-menu z-50" style={{ width: '300px' }}>
          <div className="flex items-center gap-4">
            <img
              src={userData.profilePic}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{userData.name}</h3>
              <p className="text-sm text-gray-500">{userData.bio}</p>
              <button
                onClick={handleLogout}
                className="mt-2 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideIcons;