import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import { 
  db, updateDoc, doc, getDoc, setDoc, collection, query, 
  where, onSnapshot, serverTimestamp
} from '../../../lib/firebase';
import WhiteboardTools from './WhiteboardTools';
import FloatingNavigation from './FloatingNavigation';

const WhiteboardEditor = ({ 
  projectTitle, projectId, initialCanvasData, 
  onSave, currentUser, onBack, isOnline, projectData
}) => {
  // Refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const lastPointRef = useRef(null);
  const navigatorRef = useRef(null);
  const miniMapCanvasRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  
  // Canvas states
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false);
  const [showNavigator, setShowNavigator] = useState(true);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });
  
  // User collaboration states
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [allowedUserDetails, setAllowedUserDetails] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeCollaborators, setActiveCollaborators] = useState({});
  const [lastBroadcastTime, setLastBroadcastTime] = useState(Date.now());
  const [isReceivingChanges, setIsReceivingChanges] = useState(false);

  // Fetch allowed users
  useEffect(() => {
    if (!projectId) return;
    const fetchAllowedUsers = async () => {
      try {
        const projectRef = doc(db, 'diagrams', projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          const allowedArr = projectSnap.data().allowedUsers || [];
          setAllowedUsers(allowedArr);
        }
      } catch (error) {}
    };
    fetchAllowedUsers();
  }, [projectId]);

  // Handle adding a user
  const handleAddUser = async (userId) => {
    try {
      const projectRef = doc(db, 'diagrams', projectId);
      const updatedAllowedUsers = [...new Set([...allowedUsers, userId, currentUser.uid])];
      await updateDoc(projectRef, { allowedUsers: updatedAllowedUsers });
      setAllowedUsers(updatedAllowedUsers);
    } catch (error) {}
  };

  // Canvas setup
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 3000;
    canvas.height = 2000;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (initialCanvasData) {
      let imageData = initialCanvasData;
      let dimensions = { width: 3000, height: 2000 };
      
      if (typeof initialCanvasData === 'object' && initialCanvasData.imageData) {
        imageData = initialCanvasData.imageData;
        dimensions = initialCanvasData.dimensions || dimensions;
      }
      
      const img = new Image();
      img.onload = () => {
        if (dimensions.width !== canvas.width || dimensions.height !== canvas.height) {
          const scaleX = canvas.width / dimensions.width;
          const scaleY = canvas.height / dimensions.height;
          const scale = Math.min(scaleX, scaleY);
          const centerX = (canvas.width - dimensions.width * scale) / 2;
          const centerY = (canvas.height - dimensions.height * scale) / 2;
          ctx.drawImage(img, centerX, centerY, dimensions.width * scale, dimensions.height * scale);
        } else {
          ctx.drawImage(img, 0, 0);
        }
        saveToHistory();
      };
      img.src = imageData;
    } else {
      saveToHistory();
    }
    
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current.scrollTo({
          left: canvas.width / 2 - containerRef.current.clientWidth / 2,
          top: canvas.height / 2 - containerRef.current.clientHeight / 2
        });
      }, 100);
    }
  }, [initialCanvasData]);

  // Save to history
  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const newHistory = historyIndex < history.length - 1 
      ? history.slice(0, historyIndex + 1) 
      : [...history];
    setHistory([...newHistory, dataURL]);
    setHistoryIndex(newHistory.length);
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave || !isOnline) return;
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const canvas = canvasRef.current;
      const canvasData = canvas.toDataURL('image/jpeg', 0.85);
      const saveData = {
        imageData: canvasData,
        dimensions: { width: canvas.width, height: canvas.height },
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser?.uid || 'unknown'
      };
      
      const diagramRef = doc(db, 'diagrams', projectId);
      await updateDoc(diagramRef, {
        canvasData: saveData,
        lastModified: serverTimestamp(),
        lastModifiedBy: currentUser?.uid
      });
      
      const success = await onSave(saveData);
      if (success) {
        setLastSaved(new Date());
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(prev => prev === 'error' ? 'error' : 'saved'), 2000);
    }
  };

  // Get canvas coordinates
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX || 0;
    const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY || 0;
    const container = containerRef.current;
    const x = (clientX - rect.left) + (container ? container.scrollLeft : 0);
    const y = (clientY - rect.top) + (container ? container.scrollTop : 0);
    return { x, y };
  };

  // Handle navigator click
  const handleNavigatorClick = (e) => {
    if (!navigatorRef.current || !containerRef.current) return;
    const navRect = navigatorRef.current.getBoundingClientRect();
    const clickX = e.clientX - navRect.left;
    const clickY = e.clientY - navRect.top;
    const xRatio = clickX / navRect.width;
    const yRatio = clickY / navRect.height;
    const scrollX = xRatio * 3000;
    const scrollY = yRatio * 2000;
    containerRef.current.scrollTo({
      left: Math.max(0, scrollX - (containerRef.current.clientWidth / 2)),
      top: Math.max(0, scrollY - (containerRef.current.clientHeight / 2)),
      behavior: 'smooth'
    });
  };

  // Mouse/Touch handlers
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    if (tool === 'move' || e.button === 1 || e.ctrlKey) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    startDrawing(e);
  }, [tool]);

  const handlePointerMove = useCallback((e) => {
    e.preventDefault();
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setCanvasOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    draw(e);
  }, [isPanning, lastPanPoint, isDrawing, tool, color, strokeWidth, canvasOffset]);

  const handlePointerUp = useCallback((e) => {
    e.preventDefault();
    setIsPanning(false);
    stopDrawing();
  }, [isDrawing]);

  // Start drawing
  const startDrawing = (e) => {
    if (tool === 'select' || isPanning) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(x, y);
    lastPointRef.current = { x, y };
  };

  // Update the draw function for smoother lines
  const draw = (e) => {
    if (!isDrawing || tool === 'select' || isPanning || isReceivingChanges) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e);
    
    if (lastPointRef.current) {
      // Configure drawing settings with optimized rendering
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      
      // Faster drawing with direct lines
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Save the current point for the next segment
      lastPointRef.current = { x, y };
      
      // Only update mini-map occasionally to improve performance
      if (Math.random() < 0.03 && miniMapCanvasRef.current) {
        updateMiniMap();
      }
    }
  };

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      
      // Save to history first
      saveToHistory();
      
      // Force immediate broadcast regardless of time since last broadcast
      // This ensures stroke completion is synced immediately
      const canvas = canvasRef.current;
      if (canvas && isOnline) {
        const canvasData = canvas.toDataURL('image/webp', 0.7);
        const diagramRef = doc(db, 'diagrams', projectId);
        
        updateDoc(diagramRef, {
          'canvasData.imageData': canvasData,
          'canvasData.dimensions': { width: canvas.width, height: canvas.height },
          'canvasData.tool': tool,
          lastModifiedBy: currentUser?.uid,
          lastModified: serverTimestamp()
        }).catch(() => {
          // Silent fail
        });
        
        // Update broadcast time to prevent quick subsequent broadcasts
        setLastBroadcastTime(Date.now());
      }
      
      // Update mini-map after stroke completion
      updateMiniMap();
    }
  };

  // Update the broadcastCanvasChanges function to be even more efficient
  const broadcastCanvasChanges = () => {
    const now = Date.now();
    // Further reduce broadcast interval for smoother collaboration
    if (now - lastBroadcastTime < 500) return; // Reduced from 700ms to 500ms
    
    setLastBroadcastTime(now);
    const canvas = canvasRef.current;
    if (!canvas || !isOnline) return;
    
    // Use a WebP format with optimized compression
    const canvasData = canvas.toDataURL('image/webp', 0.7);
    const diagramRef = doc(db, 'diagrams', projectId);
    
    // Use more efficient update with fewer fields
    updateDoc(diagramRef, {
      'canvasData.imageData': canvasData,
      'canvasData.dimensions': { width: canvas.width, height: canvas.height },
      'canvasData.tool': tool,
      lastModifiedBy: currentUser?.uid,
      lastModified: serverTimestamp()
    }).catch(() => {
      // Silent fail
    });
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  // Add the updateMiniMap function
  const updateMiniMap = () => {
    if (!miniMapCanvasRef.current || !canvasRef.current) return;
    
    const miniCtx = miniMapCanvasRef.current.getContext('2d');
    const mainCanvas = canvasRef.current;
    const miniCanvas = miniMapCanvasRef.current;
    
    // Clear mini-map
    miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
    
    // Draw the main canvas scaled down to mini-map
    miniCtx.drawImage(
      mainCanvas,
      0, 0, mainCanvas.width, mainCanvas.height,
      0, 0, miniCanvas.width, miniCanvas.height
    );
  };

  // Set viewport dimensions
  useEffect(() => {
    if (containerRef.current) {
      const updateViewportSize = () => {
        setViewportDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 80
        });
      };
      
      updateViewportSize();
      window.addEventListener('resize', updateViewportSize);
      return () => window.removeEventListener('resize', updateViewportSize);
    }
  }, []);

  // Ensure consistent event binding
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    
    const preventDefaultForDrawing = (e) => {
      if (tool !== 'select' && !e.ctrlKey) {
        e.preventDefault();
        if (e.touches && e.touches.length) {
          const touch = e.touches[0];
          const simulatedEvent = new PointerEvent('pointerdown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            pointerType: 'touch'
          });
          handlePointerDown(simulatedEvent);
        }
      }
    };
    
    canvas.addEventListener('touchstart', preventDefaultForDrawing, { passive: false });
    const handleTouchEnd = (e) => handlePointerUp(e);
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      canvas.removeEventListener('touchstart', preventDefaultForDrawing);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, tool]);

  // Collaborator presence setup
  useEffect(() => {
    if (!projectId || !currentUser?.uid) return;
    try {
      const userPresenceRef = doc(db, 'presence', `${projectId}_${currentUser.uid}`);
      updateDoc(userPresenceRef, {
        lastActive: new Date().toISOString(),
        status: 'online',
        userId: currentUser.uid,
        projectId: projectId
      }).catch(() => {
        setDoc(userPresenceRef, {
          lastActive: new Date().toISOString(),
          status: 'online',
          userId: currentUser.uid,
          projectId: projectId
        });
      });
      
      const presenceInterval = setInterval(() => {
        updateDoc(userPresenceRef, { lastActive: new Date().toISOString() });
      }, 60000);
      
      const presenceQuery = query(collection(db, 'presence'), where('projectId', '==', projectId));
      const unsubscribe = onSnapshot(presenceQuery, (snapshot) => {
        const activeUsers = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId !== currentUser.uid) {
            const lastActiveTime = new Date(data.lastActive);
            const fiveMinutesAgo = new Date();
            fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
            if (lastActiveTime > fiveMinutesAgo) {
              activeUsers[data.userId] = { ...data, lastActiveTime };
            }
          }
        });
        setActiveCollaborators(activeUsers);
      });
      
      return () => {
        clearInterval(presenceInterval);
        unsubscribe();
        updateDoc(userPresenceRef, {
          status: 'offline',
          lastActive: new Date().toISOString()
        });
      };
    } catch (error) {}
  }, [projectId, currentUser?.uid]);

  // Real-time canvas sync
  useEffect(() => {
    if (!projectId || !currentUser?.uid) return;
    const diagramDocRef = doc(db, 'diagrams', projectId);
    
    const unsubscribe = onSnapshot(diagramDocRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      const remoteCanvas = data.canvasData;
      const updatedBy = data.lastModifiedBy;
      
      if (remoteCanvas && updatedBy !== currentUser.uid && !isReceivingChanges) {
        setIsReceivingChanges(true);
        
        // Clear any existing timeout to prevent stuck states
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        
        // Set safety timeout - will reset receiving state after 4 seconds max
        syncTimeoutRef.current = setTimeout(() => setIsReceivingChanges(false), 3000); // Reduced from 4s to 3s
        
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          // Use faster image loading technique
          img.onload = () => {
            // Use faster rendering approach
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Optimize history management for performance
            const dataURL = canvas.toDataURL('image/webp', 0.9); // Use WebP
            setHistory(prev => [...prev, dataURL]);
            setHistoryIndex(prev => prev + 1);
            
            // Clear sync timeout and reset flag
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            setIsReceivingChanges(false);
          };
          
          img.onerror = () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            setIsReceivingChanges(false);
          };
          
          if (typeof remoteCanvas === 'object' && remoteCanvas.imageData) {
            // Prioritize loading by setting the source immediately
            img.src = remoteCanvas.imageData;
          } else if (remoteCanvas) {
            img.src = remoteCanvas;
          } else {
            setIsReceivingChanges(false);
          }
        } else {
          setIsReceivingChanges(false);
        }
      }
    },
    // Add error handling callback for snapshot
    (error) => {
      setIsReceivingChanges(false);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    });
    
    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      setIsReceivingChanges(false);
    };
  }, [projectId, currentUser?.uid]);

  // Add undo/redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = history[newIndex];
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = history[newIndex];
    }
  }, [history, historyIndex]);

  // Add a smart auto-sync that triggers when needed without showing UI
  useEffect(() => {
    if (!isOnline || !canvasRef.current) return;
    
    // Sync the canvas automatically when user switches tools
    // This ensures eraser strokes are properly synchronized
    const autoSyncInterval = setInterval(() => {
      if (!isDrawing && historyIndex > 0) {
        forceSyncCanvas(true); // Pass true to indicate silent sync (no UI)
      }
    }, 10000); // Every 10 seconds if idle
    
    return () => clearInterval(autoSyncInterval);
  }, [isDrawing, historyIndex, isOnline]);

  // Update the forceSyncCanvas function to optionally be silent (no UI indicators)
  const forceSyncCanvas = (silent = false) => {
    if (!canvasRef.current || !isOnline) return;
    
    if (!silent) {
      setIsSaving(true);
      setSaveStatus('saving');
    }
    
    const canvas = canvasRef.current;
    const canvasData = canvas.toDataURL('image/webp', 0.8); // Use WebP for better compression
    const diagramRef = doc(db, 'diagrams', projectId);
    
    updateDoc(diagramRef, {
      canvasData: {
        imageData: canvasData,
        dimensions: { width: canvas.width, height: canvas.height },
        forceSyncTimestamp: new Date().getTime()
      },
      lastModifiedBy: currentUser?.uid,
      lastModified: serverTimestamp(),
      forceSync: true
    })
      .then(() => {
        if (!silent) {
          setSaveStatus('saved');
          setIsSaving(false);
        }
      })
      .catch(() => {
        if (!silent) {
          setSaveStatus('error');
          setIsSaving(false);
        }
      });
  };

  // Add this useEffect to initialize and update the mini-map when needed
  useEffect(() => {
    if (!miniMapCanvasRef.current || !canvasRef.current) return;
    
    // Set the mini-map canvas dimensions
    const miniCanvas = miniMapCanvasRef.current;
    miniCanvas.width = 200;
    miniCanvas.height = 150;
    
    // Update mini-map whenever the main canvas changes
    const updateMiniMapFromHistory = () => {
      if (historyIndex >= 0 && history.length > 0) {
        const img = new Image();
        img.onload = () => {
          const miniCtx = miniMapCanvasRef.current.getContext('2d');
          miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
          miniCtx.drawImage(
            img,
            0, 0, img.width, img.height,
            0, 0, miniCanvas.width, miniCanvas.height
          );
        };
        img.src = history[historyIndex];
      }
    };
    
    updateMiniMapFromHistory();
    
    // Also update when history changes
    return () => {
      // Cleanup if needed
    };
  }, [history, historyIndex, canvasRef.current, miniMapCanvasRef.current]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50" ref={containerRef}>
      <FloatingNavigation
        projectTitle={projectTitle}
        projectId={projectId}
        onBack={onBack}
        onSave={handleSave}
        isSaving={isSaving}
        isOnline={isOnline}
        lastSaved={lastSaved}
        saveStatus={saveStatus}
        allowedUserDetails={allowedUserDetails}
        userList={userList}
        currentUser={currentUser}
        onAddUser={handleAddUser}
        onFetchUserList={() => {}}
      />

      <div className="relative z-40">
        <WhiteboardTools
          tool={tool} setTool={setTool}
          color={color} setColor={setColor}
          strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
          onUndo={undo} onRedo={redo} onClear={clearCanvas}
          historyIndex={historyIndex} historyLength={history.length}
          isCollapsed={isToolsCollapsed} setIsCollapsed={setIsToolsCollapsed}
          showNavigator={showNavigator} setShowNavigator={setShowNavigator}
        />
      </div>

      <div className="absolute inset-0 overflow-auto bg-white"
        onScroll={(e) => {
          if (navigatorRef.current) {
            const container = e.currentTarget;
            setViewportDimensions({
              width: container.clientWidth,
              height: container.clientHeight,
              scrollLeft: container.scrollLeft,
              scrollTop: container.scrollTop
            });
          }
        }} ref={containerRef}>
        <div className="relative" style={{ width: '3000px', height: '2000px' }}>
          <canvas 
            ref={canvasRef} width={3000} height={2000}
            className={`${
              tool === 'pen' ? 'cursor-crosshair' :
              tool === 'eraser' ? 'cursor-pointer' :
              tool === 'move' || isPanning ? 'cursor-move' : 'cursor-default'
            }`}
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>

      {showNavigator && (
        <div className="fixed bottom-6 right-6 border-2 border-blue-500 shadow-lg bg-white z-40 overflow-hidden"
          style={{ width: '200px', height: '150px' }}
          ref={navigatorRef} onClick={handleNavigatorClick}>
          <canvas className="w-full h-full" ref={miniMapCanvasRef} />
          <div className="absolute border-2 border-blue-500 pointer-events-none"
            style={{
              top: Math.max(0, (viewportDimensions.scrollTop / 2000 * 150)) + 'px',
              left: Math.max(0, (viewportDimensions.scrollLeft / 3000 * 200)) + 'px',
              width: Math.max(30, Math.min(200, (viewportDimensions.width / 3000 * 200))) + 'px',
              height: Math.max(30, Math.min(150, (viewportDimensions.height / 2000 * 150))) + 'px',
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.8) inset',
              border: '2px solid rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {isReceivingChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Syncing changes...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-20 right-6 z-40 space-y-2">
        {Object.values(activeCollaborators).map((user) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-blue-200 flex items-center justify-center"
            title={user.displayName || user.email?.split('@')[0] || "Collaborator"}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "Collaborator"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {(user.displayName?.[0] || user.email?.[0] || "C").toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhiteboardEditor;