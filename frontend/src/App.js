import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AuthHandler from "./components/Auth/AuthHandler";
import HomePage from "./components/HomePage";
import Home from "./components/Diagrams/pages/Home";
import SideIcons from "./components/SideIcons";
import DiagramEditor from "./components/Diagrams/Diagram/MermaidDiagram";
import LogOut from "./components/LogOut";
import LandingPage from "./components/LandingPage";
import MainLoader from "./components/MainLoader";
import { useNavigate } from 'react-router-dom';
import { auth, onAuthStateChanged, doc, getDoc, db } from './lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser(currentUser);
            setUserData(userDoc.data());
            if (location.pathname === '/') {
              navigate('/chat');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setTimeout(() => setLoading(false), 1000);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleUserAuthenticated = (user, userData) => {
    setUser(user);
    setUserData(userData);
  };

  const isEditorRoute = location.pathname.startsWith('/editor');
  const isLogoutRoute = location.pathname === '/logout';

  const determineActiveTab = (pathname) => {
    if (pathname === '/chat') return 'chat';
    if (pathname === '/diagrams') return 'code';
    return 'chat';
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const shouldShowSideIcons = user && !isEditorRoute && !isLogoutRoute && !(isMobile && isChatOpen);

  if (loading) {
    return <MainLoader onLoadingComplete={() => setLoading(false)} />;
  }

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {shouldShowSideIcons && (
        <motion.div 
          className="fixed left-0 top-0 h-full z-20 bg-white shadow-lg"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <SideIcons
            activeTab={determineActiveTab(location.pathname)}
            setActiveTab={() => {}}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            userData={userData}
            onLogout={handleLogout}
          />
        </motion.div>
      )}

      <motion.div 
        className="flex-1 h-full"
        style={{ marginLeft: shouldShowSideIcons ? '64px' : '0' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="sync">
          {!user ? (
            <Routes location={location} key="unauthenticated">
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthHandler onUserAuthenticated={handleUserAuthenticated} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <Routes location={location} key="authenticated">
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<HomePage user={user} userData={userData} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />} />
              <Route path="/diagrams" element={<Home />} />
              <Route path="/editor/:id" element={<DiagramEditor currentUser={user} />} />
              <Route path="/logout" element={
                <LogOut 
                  onLogoutComplete={() => {
                    setUser(null);
                    setUserData(null);
                    navigate('/login', { replace: true });
                  }} 
                />
              } />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default App;