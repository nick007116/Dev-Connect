import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import WhiteboardEditor from '../Diagram/WhiteboardEditor';
import { ArrowLeft, AlertCircle, Loader2, Grid, Users, Clock, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <div className="h-screen w-screen relative overflow-hidden bg-gray-50">
    {/* Loading content */}
    <div className="relative z-10 h-full flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
            />
            <div className="absolute inset-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <Grid className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Loading Whiteboard
            </h2>
            <p className="text-gray-500 mt-2">Preparing your creative space...</p>
          </div>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            style={{ width: "200px" }}
          />
        </div>
      </motion.div>
    </div>
  </div>
);

const ErrorScreen = ({ error, onBack }) => (
  <div className="h-screen w-screen relative overflow-hidden bg-gray-50">
    {/* Error content */}
    <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-red-100 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertCircle className="w-10 h-10 text-red-500" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>
      </motion.div>
    </div>
  </div>
);

const WhiteboardPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Get title from URL params if available
  const urlTitle = searchParams.get('title');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'diagrams', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = docSnap.data();
          
          // Check if user has access
          if (projectData.allowedUsers && projectData.allowedUsers.includes(user.uid)) {
            setProject({
              id: docSnap.id,
              ...projectData
            });
          } else {
            setError('You do not have permission to access this whiteboard. Please contact the owner for access.');
          }
        } else {
          setError('This whiteboard could not be found. It may have been deleted or moved.');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        if (!isOnline) {
          setError('You are currently offline. Please check your internet connection and try again.');
        } else {
          setError('Failed to load the whiteboard. Please try refreshing the page.');
        }
      } finally {
        // Add minimum loading time for better UX
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchProject();
  }, [id, user, isOnline]);

  // Improve the save handler to ensure canvas data is properly persisted
  const handleSave = async (canvasData) => {
    if (!project || !user) return false;

    try {
      // Make sure we're sending valid canvas data
      if (!canvasData || typeof canvasData !== 'string' || !canvasData.startsWith('data:image')) {
        console.error('Invalid canvas data format for saving');
        return false;
      }
      
      const docRef = doc(db, 'diagrams', project.id);
      await updateDoc(docRef, {
        canvasData,
        updatedAt: new Date(),
        lastEditedBy: user.uid
      });
      return true; // Success
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      return false; // Failure
    }
  };

  const handleBack = () => {
    navigate('/diagrams');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onBack={handleBack} />;
  }

  if (!project) {
    return <ErrorScreen error="Whiteboard not found" onBack={handleBack} />;
  }

  // Update the main return component for full-screen optimization
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      {/* Status Bar */}
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 z-[200] bg-orange-500 text-white text-center py-2 text-sm font-medium"
        >
          You are currently offline. Changes will be saved when you reconnect.
        </motion.div>
      )}
      
      {/* Whiteboard Editor - now takes full screen */}
      <WhiteboardEditor
        projectTitle={project?.title || urlTitle || 'Untitled Whiteboard'}
        projectId={project?.id}
        initialCanvasData={project?.canvasData || null}
        onSave={handleSave}
        currentUser={user}
        onBack={handleBack}
        isOnline={isOnline}
        projectData={project}
        key={project?.id || 'new-whiteboard'}
      />
    </div>
  );
};

export default WhiteboardPage;