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
import ProjectKickstarter from "./components/AIProjectKickstarter/ProjectKickstarter";
import RemoteDesktopShare from "./components/RemoteDesktop/RemoteDesktopShare";
import SmartLearningHub from "./components/LearningHub/SmartLearningHub";
import DevTools from "./components/DevTools/DevTools"; // Replace CodePlayground with DevTools
import { useNavigate } from 'react-router-dom';
import { auth, onAuthStateChanged, doc, getDoc, db, signOut } from './lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import Profile from "./components/Profile";
import WhiteboardPage from './components/Diagrams/pages/WhiteboardPage';
import DemoWorkspace from './components/DemoWorkspace';

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isDemoMode = location.pathname === '/demo' || location.pathname.startsWith('/demo/');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return undefined;
    }

    if (!auth) {
      setLoading(false);
      return undefined;
    }

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
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setTimeout(() => setLoading(false), 1000);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname, isDemoMode]);

  const handleUserAuthenticated = (user, userData) => {
    setUser(user);
    setUserData(userData);
  };

  const isEditorRoute = location.pathname.startsWith('/editor');
  const isWhiteboardRoute = location.pathname.startsWith('/whiteboard');
  const isLogoutRoute = location.pathname === '/logout' || location.pathname === '/demo/logout';

  const determineActiveTab = (pathname) => {
    const appPath = pathname.startsWith('/demo/') ? pathname.slice('/demo'.length) : pathname;
    if (appPath === '/chat') return 'chat';
    if (appPath === '/diagrams') return 'code';
    if (appPath === '/project-ai') return 'project-kickstarter';
    if (appPath === '/remote-desktop') return 'remote-desktop';
    if (appPath === '/learning-hub') return 'learning-hub';
    if (appPath === '/dev-tools') return 'dev-tools';
    return 'chat';
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const completeLogout = async () => {
    try {
      if (auth) await signOut(auth);
      setUser(null);
      setUserData(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const demoUserData = {
    name: 'Demo Developer',
    bio: 'Exploring DevConnect',
    profilePic: 'https://ui-avatars.com/api/?name=Demo+Developer&background=6366f1&color=ffffff&size=128'
  };
  const activeUserData = isDemoMode ? demoUserData : userData;
  const shouldShowSideIcons = (user || isDemoMode) && !isEditorRoute && !isWhiteboardRoute && !isLogoutRoute;

  if (loading) {
    return <MainLoader onLoadingComplete={() => setLoading(false)} />;
  }

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {shouldShowSideIcons && (
        <SideIcons
          activeTab={determineActiveTab(location.pathname)}
          setActiveTab={() => {}}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          userData={activeUserData}
          onLogout={isDemoMode ? () => navigate('/demo/logout') : handleLogout}
          isChatOpen={isChatOpen}
          isDemo={isDemoMode}
        />
      )}

      <motion.div 
        className="flex-1 h-full pb-16 md:pb-0"
        style={{ marginLeft: shouldShowSideIcons && !isMobile ? '80px' : '0' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="sync">
          {isDemoMode ? (
            <DemoWorkspace onExit={() => navigate('/', { replace: true })} />
          ) : !user ? (
            <Routes location={location} key="unauthenticated">
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthHandler onUserAuthenticated={handleUserAuthenticated} onDemoLogin={() => navigate('/demo/chat')} />} />
              <Route path="/demo/*" element={<DemoWorkspace onExit={() => navigate('/', { replace: true })} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <Routes location={location} key="authenticated">
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<HomePage user={user} userData={userData} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />} />
              <Route path="/diagrams" element={<Home />} />
              <Route path="/whiteboard/:id" element={<WhiteboardPage />} />
              <Route path="/project-ai" element={<ProjectKickstarter user={user} setShowMenu={setShowMenu} />} />
              <Route path="/remote-desktop" element={<RemoteDesktopShare user={user} />} />
              <Route path="/learning-hub" element={<SmartLearningHub user={user} />} />
              <Route path="/dev-tools" element={<DevTools user={user} userData={userData} />} /> {/* Add DevTools route */}
              <Route path="/editor/:id" element={<DiagramEditor currentUser={user} />} />
              <Route path="/logout" element={
                <LogOut 
                  onLogoutComplete={completeLogout}
                />
              } />
              <Route path="/profile" element={<Profile userData={userData} onLogout={handleLogout} />} />
              <Route path="/demo/*" element={<DemoWorkspace onExit={() => navigate('/', { replace: true })} />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default App;