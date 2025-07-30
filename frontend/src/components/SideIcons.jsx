import React, { useState, useEffect } from 'react';
import { MessageCircle, Code, Menu, X, Sparkles, Monitor, Wrench } from 'lucide-react'; // Replace Terminal with Wrench
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from './Diagrams/pages/Loader';

const SideIcons = ({ activeTab, setActiveTab, showMenu, setShowMenu, userData, onLogout, isChatOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const currentPath = location.pathname;
  
  const isProfilePage = currentPath === '/profile';
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      navigate('/logout');
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
    setShowMenu(false);
    
    setLoading(true);
    
    if (tab === 'chat') {
      setLoadingType('chat');
      navigate('/chat');
    } else if (tab === 'code') {
      setLoadingType('diagrams');
      navigate('/diagrams');
    } else if (tab === 'project-kickstarter') {
      setLoadingType('ai-project');
      navigate('/project-ai');
    } else if (tab === 'remote-desktop') {
      setLoadingType('remote-desktop');
      navigate('/remote-desktop');
    } else if (tab === 'dev-tools') { // Replace code-playground with dev-tools
      setLoadingType('dev-tools');
      navigate('/dev-tools');
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const shouldShowMobileNav = !isChatOpen;
  const shouldShowProfile = !isChatOpen && currentPath !== '/project-ai' && !isProfilePage;
  
  return (
    <>
      {loading && <Loader type={loadingType} />}
      
      {/* Mobile Nav Bar (Bottom) */}
      {shouldShowMobileNav && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-40 shadow-md">
          <div className="flex justify-around items-center py-2 px-1">
            {/* Chat */}
            <button
              onClick={() => handleNavigation('chat')}
              className="flex flex-col items-center justify-center p-2 w-[64px] h-[64px]"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-md ${activeTab === 'chat' ? 'bg-blue-100' : ''}`}>
                <MessageCircle className={`w-5 h-5 ${activeTab === 'chat' ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs mt-1 ${activeTab === 'chat' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Chat</span>
            </button>
            
            {/* Diagrams */}
            <button
              onClick={() => handleNavigation('code')}
              className="flex flex-col items-center justify-center p-2 w-[64px] h-[64px]"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-md ${activeTab === 'code' ? 'bg-green-100' : ''}`}>
                <Code className={`w-5 h-5 ${activeTab === 'code' ? 'text-green-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs mt-1 ${activeTab === 'code' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>Diagrams</span>
            </button>
            
            {/* AI Studio */}
            <button
              onClick={() => handleNavigation('project-kickstarter')}
              className="flex flex-col items-center justify-center p-2 w-[64px] h-[64px]"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-md ${activeTab === 'project-kickstarter' ? 'bg-purple-100' : ''}`}>
                <Sparkles className={`w-5 h-5 ${activeTab === 'project-kickstarter' ? 'text-purple-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs mt-1 ${activeTab === 'project-kickstarter' ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>AI Studio</span>
            </button>
            
            {/* Dev Tools */}
            <button
              onClick={() => handleNavigation('dev-tools')}
              className="flex flex-col items-center justify-center p-2 w-[64px] h-[64px]"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-md ${activeTab === 'dev-tools' ? 'bg-indigo-100' : ''}`}>
                <Wrench className={`w-5 h-5 ${activeTab === 'dev-tools' ? 'text-indigo-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs mt-1 ${activeTab === 'dev-tools' ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Tools</span>
            </button>
            
            {/* Desktop */}
            <button
              onClick={() => handleNavigation('remote-desktop')}
              className="flex flex-col items-center justify-center p-2 w-[64px] h-[64px]"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-md ${activeTab === 'remote-desktop' ? 'bg-orange-100' : ''}`}>
                <Monitor className={`w-5 h-5 ${activeTab === 'remote-desktop' ? 'text-orange-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs mt-1 ${activeTab === 'remote-desktop' ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>Desktop</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Profile Button */}
      {shouldShowProfile && userData && (
        <button
          onClick={handleProfileClick}
          className={`fixed top-9 right-4 z-50 md:hidden bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 ${loading ? 'blur-sm opacity-70' : ''}`}
        >
          <img
            src={userData.profilePic}
            alt="Profile"
            className="w-12 h-12 object-cover"
          />
        </button>
      )}

      {/* Overlay for mobile */}
      {showMenu && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className={`fixed top-0 left-0 md:flex hidden flex-col items-center p-4 border-r border-gray-300 h-screen bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-300 ${showMenu ? 'w-64' : 'w-20'} rounded-r-lg z-[60]`}>
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
          <button
            onClick={() => handleNavigation('project-kickstarter')}
            className={`flex items-center p-3 rounded-lg transition-colors duration-300 w-full ${activeTab === 'project-kickstarter' ? 'bg-purple-100' : 'hover:bg-gray-100'}`}
          >
            <Sparkles className={`w-6 h-6 text-purple-600 ${!showMenu && 'mx-auto'}`} />
            {showMenu && <span className="ml-4 text-lg">AI Project Studio</span>}
          </button>
          <button
            onClick={() => handleNavigation('dev-tools')}
            className={`flex items-center p-3 rounded-lg transition-colors duration-300 w-full ${activeTab === 'dev-tools' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
          >
            <Wrench className={`w-6 h-6 text-indigo-600 ${!showMenu && 'mx-auto'}`} />
            {showMenu && <span className="ml-4 text-lg">Dev Tools</span>}
          </button>
          <button
            onClick={() => handleNavigation('remote-desktop')}
            className={`flex items-center p-3 rounded-lg transition-colors duration-300 w-full ${activeTab === 'remote-desktop' ? 'bg-orange-100' : 'hover:bg-gray-100'}`}
          >
            <Monitor className={`w-6 h-6 text-orange-600 ${!showMenu && 'mx-auto'}`} />
            {showMenu && <span className="ml-4 text-lg">Remote Desktop</span>}
          </button>
        </div>

        <div className="mt-auto w-full">
          {userData && !isProfilePage && (
            <button
              onClick={handleProfileClick}
              className={`flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 w-full ${!showMenu && 'justify-center'} ${loading ? 'blur-sm opacity-70' : ''}`}
            >
              <img
                src={userData.profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-md object-cover flex-shrink-0"
              />
              {showMenu && <span className="ml-4 text-lg">Profile</span>}
            </button>
          )}
        </div>
      </div>

      {/* Profile Menu */}
      {showProfileMenu && userData && (
        <div className={`bg-white shadow-md rounded-md p-4 profile-menu z-50 ${isMobile ? 'fixed top-16 right-4' : 'absolute bottom-16 left-4'}`} style={{ width: '300px' }}>
          <div className="flex items-center gap-4">
            <img
              src={userData.profilePic}
              alt="Profile"
              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{userData.name}</h3>
              <p className="text-sm text-gray-500">{userData.bio}</p>
              <button
                onClick={handleLogout}
                className="mt-2 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-300"
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
    </>
  );
};

export default SideIcons;