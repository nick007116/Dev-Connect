import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Monitor, Users, Share, Eye, Wifi, AlertCircle, Maximize, Minimize, X, UserX, Check, Settings, Shield, Info } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';

const RemoteDesktopShare = ({ user }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    frameRate: 0
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCopied, setShowCopied] = useState(false);
  const [networkQuality, setNetworkQuality] = useState('checking');
  const [showRemovalSuccess, setShowRemovalSuccess] = useState(false);
  const [removedUserName, setRemovedUserName] = useState('');

  const videoContainerRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socket = useSocket();
  
  const currentSessionId = activeSession?.id || sessionId;
  
  const {
    localStream,
    remoteStreams,
    isConnected,
    isHost,
    connectionStatus,
    connectionQuality,
    startScreenShare,
    joinAsViewer,
    stopScreenShare,
    localVideoRef
  } = useWebRTC(socket, currentSessionId, user?.uid);

  const statsIntervalRef = useRef(null);

  // Network quality detection
  useEffect(() => {
    const checkNetworkQuality = async () => {
      try {
        const startTime = Date.now();
        await fetch('/api/health', { method: 'HEAD' });
        const latency = Date.now() - startTime;
        
        if (latency < 50) setNetworkQuality('excellent');
        else if (latency < 150) setNetworkQuality('good');
        else if (latency < 300) setNetworkQuality('fair');
        else setNetworkQuality('poor');
      } catch {
        setNetworkQuality('unknown');
      }
    };
    
    checkNetworkQuality();
    const interval = setInterval(checkNetworkQuality, 30000);
    return () => clearInterval(interval);
  }, []);

  // Session persistence
  useEffect(() => {
    const savedSessionId = localStorage.getItem('activeSessionId');
    const savedRole = localStorage.getItem('sessionRole');
    
    if (savedSessionId && user?.uid && socket) {
      socket.emit('get_session_info', { sessionId: savedSessionId });
      
      const handleSessionInfo = (data) => {
        if (data.success) {
          setJoinSessionId(savedSessionId);
          if (savedRole === 'host') {
            handleStartScreenShare();
          } else {
            handleJoinSession();
          }
        } else {
          localStorage.removeItem('activeSessionId');
          localStorage.removeItem('sessionRole');
        }
        socket.off('session_info', handleSessionInfo);
      };
      
      socket.on('session_info', handleSessionInfo);
    }
  }, [user?.uid, socket]);

  // Save session info
  useEffect(() => {
    if (activeSession?.id) {
      localStorage.setItem('activeSessionId', activeSession.id);
      localStorage.setItem('sessionRole', isHost ? 'host' : 'viewer');
    }
  }, [activeSession?.id, isHost]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Remote stream handling with quality optimization
  useEffect(() => {
    if (!isHost && remoteStreams && remoteStreams.size > 0 && remoteVideoRef.current) {
      const firstStreamEntry = Array.from(remoteStreams.entries())[0];
      const [streamId, stream] = firstStreamEntry;
      
      if (stream && stream.active && stream.getTracks().length > 0) {
        const videoElement = remoteVideoRef.current;
        
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = false;
        videoElement.controls = false;
        
        // Optimize for network quality
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const constraints = getQualityConstraints();
          videoTrack.applyConstraints(constraints).catch(() => {});
        }
        
        videoElement.play().catch(() => {});
        
        // Maintain smooth playback
        const maintainPlayback = () => {
          if (videoElement.buffered && videoElement.buffered.length > 0) {
            const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
            const currentTime = videoElement.currentTime;
            
            if (bufferedEnd - currentTime > 0.1) {
              videoElement.currentTime = bufferedEnd - 0.05;
            }
          }
          
          if (!videoElement.paused) {
            requestAnimationFrame(maintainPlayback);
          }
        };
        
        requestAnimationFrame(maintainPlayback);
      }
    } else if (!isHost && remoteVideoRef.current && (!remoteStreams || remoteStreams.size === 0)) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [isHost, remoteStreams, isConnected, currentSessionId, networkQuality]);

  // Quality constraints based on network
  const getQualityConstraints = useCallback(() => {
    switch (networkQuality) {
      case 'excellent':
        return { width: 1920, height: 1080, frameRate: 60 };
      case 'good':
        return { width: 1280, height: 720, frameRate: 30 };
      case 'fair':
        return { width: 854, height: 480, frameRate: 24 };
      case 'poor':
        return { width: 640, height: 360, frameRate: 15 };
      default:
        return { width: 1280, height: 720, frameRate: 30 };
    }
  }, [networkQuality]);

  // Copy session ID
  const handleCopySessionId = useCallback(async () => {
    if (activeSession?.id) {
      try {
        await navigator.clipboard.writeText(activeSession.id);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 3000);
      } catch (error) {
        console.error('Failed to copy session ID');
      }
    }
  }, [activeSession?.id]);

  // Handle session events
  const handleSessionCreated = useCallback((data) => {
    if (data.success) {
      setActiveSession(data.sessionData);
      setError(null);
      socket.emit('join_room', `session-${data.sessionData.id}`);
      
      setTimeout(async () => {
        try {
          await startScreenShare();
        } catch (error) {
          setError('Failed to start screen sharing: ' + error.message);
        }
        setIsLoading(false);
      }, 100);
    } else {
      setError(data.error || 'Failed to create session');
      setIsLoading(false);
    }
  }, [startScreenShare, socket]);

  const handleSessionJoined = useCallback((data) => {
    if (data.success) {
      setActiveSession(data.sessionData);
      setError(null);
      socket.emit('join_room', `session-${data.sessionData.id}`);
      
      setTimeout(async () => {
        try {
          await joinAsViewer();
        } catch (error) {
          setError('Failed to join session: ' + error.message);
        }
        setIsLoading(false);
      }, 100);
    } else {
      setError(data.error || 'Failed to join session');
      setIsLoading(false);
    }
  }, [joinAsViewer, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (data) => {
      setConnectedUsers(prev => {
        // Check if user already exists
        if (prev.find(user => user.id === data.userId)) {
          return prev;
        }
        
        return [...prev, {
          id: data.userId,
          name: data.userName || `User ${data.userId.slice(-4)}`,
          email: data.userEmail || '',
          profilePic: data.profilePic || null,
          role: data.role || 'viewer',
          joinedAt: Date.now()
        }];
      });
    };

    const handleUserLeft = (data) => {
      if (data.isHost && !isHost) {
        setError('Host has ended the session');
        handleEndSession();
      } else if (!data.temporary) {
        setConnectedUsers(prev => prev.filter(user => user.id !== data.userId));
      }
    };

    const handleUserRemoved = (data) => {
      setError('You have been removed from the session by the host');
      handleEndSession();
    };

    const handleUserRemoveSuccess = (data) => {
      // Remove user from local state immediately
      setConnectedUsers(prev => prev.filter(user => user.id !== data.userId));
      
      // Show user removal success message (NOT copied message)
      setRemovedUserName(data.userName || 'User');
      setShowRemovalSuccess(true);
      setTimeout(() => setShowRemovalSuccess(false), 3000);
    };

    const handleSessionEnded = (data) => {
      setError(data.reason || 'Session has ended');
      handleEndSession();
    };

    const handleSessionError = (data) => {
      setError(data.error);
      setIsLoading(false);
    };

    socket.on('session_created', handleSessionCreated);
    socket.on('session_joined', handleSessionJoined);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('user_removed', handleUserRemoved);
    socket.on('user_remove_success', handleUserRemoveSuccess);
    socket.on('session_ended', handleSessionEnded);
    socket.on('session_error', handleSessionError);

    return () => {
      socket.off('session_created', handleSessionCreated);
      socket.off('session_joined', handleSessionJoined);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('user_removed', handleUserRemoved);
      socket.off('user_remove_success', handleUserRemoveSuccess);
      socket.off('session_ended', handleSessionEnded);
      socket.off('session_error', handleSessionError);
    };
  }, [socket, handleSessionCreated, handleSessionJoined, isHost]);

  const handleStartScreenShare = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const newSessionId = `RDS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (!socket || !user?.uid) {
        throw new Error('Authentication required');
      }

      setSessionId(newSessionId);

      socket.emit('create_remote_session', {
        userId: user.uid,
        sessionId: newSessionId,
        quality: getQualityConstraints()
      });

    } catch (error) {
      setError('Failed to start screen sharing: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    const sessionToJoin = joinSessionId.trim();
    if (!sessionToJoin || !socket) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      setSessionId(sessionToJoin);
      
      socket.emit('join_remote_session', {
        sessionId: sessionToJoin,
        userId: user.uid
      });
      
    } catch (error) {
      setError('Failed to join session: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleEndSession = useCallback(() => {
    try {
      if (activeSession) {
        if (isHost) {
          socket?.emit('end_remote_session', { sessionId: activeSession.id });
        }
      }

      stopScreenShare();
      setActiveSession(null);
      setConnectedUsers([]);
      setError(null);
      
      localStorage.removeItem('activeSessionId');
      localStorage.removeItem('sessionRole');
      
      if (isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [activeSession, socket, stopScreenShare, isFullscreen, isHost]);

  const handleRemoveUser = (userIdToRemove) => {
    if (isHost && socket && activeSession) {
      const userToRemove = connectedUsers.find(u => u.id === userIdToRemove);
      
      if (userToRemove) {
        socket.emit('remove_user', {
          sessionId: activeSession.id,
          userIdToRemove: userIdToRemove
        });
      }
    }
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        if (videoContainerRef.current?.requestFullscreen) {
          await videoContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isFullscreen]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQualityLabel = () => {
    switch (networkQuality) {
      case 'excellent': return 'HD 1080p';
      case 'good': return 'HD 720p';
      case 'fair': return 'SD 480p';
      case 'poor': return 'SD 360p';
      default: return 'Auto';
    }
  };

  // Session statistics
  useEffect(() => {
    if (isConnected && activeSession) {
      statsIntervalRef.current = setInterval(() => {
        setSessionStats(prev => ({
          duration: prev.duration + 1,
          frameRate: getQualityConstraints().frameRate
        }));
      }, 1000);
    } else {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [isConnected, activeSession, getQualityConstraints]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access screen sharing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Header - Similar to Diagrams page */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-blue-100">
          <div className="flex items-center justify-between p-4 pt-8 px-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Remote Desktop
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session ID Copied notification */}
      {showCopied && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right-5 fade-in-0 duration-300">
          <Check className="w-5 h-5" />
          <span className="font-medium">Session ID copied!</span>
        </div>
      )}

      {/* User Removal Success notification */}
      {showRemovalSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right-5 fade-in-0 duration-300">
          <UserX className="w-5 h-5" />
          <span className="font-medium">{removedUserName} removed successfully!</span>
        </div>
      )}

      <div className={`relative z-10 p-3 sm:p-6 lg:p-8 ${isMobile ? 'pt-24 pb-24' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header - only show on non-mobile */}
          {!isMobile && (
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <Monitor className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Remote Desktop Sharing
                    </h1>
                    <p className="text-slate-600 text-sm lg:text-base mt-1">
                      High-quality collaborative screen sharing
                    </p>
                  </div>
                </div>
                
                {isConnected && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg">
                      <div className="relative">
                        <Wifi className={`w-5 h-5 ${
                          networkQuality === 'excellent' ? 'text-emerald-500' :
                          networkQuality === 'good' ? 'text-blue-500' :
                          networkQuality === 'fair' ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                          networkQuality === 'excellent' ? 'bg-emerald-500' :
                          networkQuality === 'good' ? 'bg-blue-500' :
                          networkQuality === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-slate-700 capitalize">{connectionQuality}</div>
                        <div className="text-xs text-slate-500">{getQualityLabel()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-lg border border-red-200/50 rounded-2xl flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main content */}
          <div className={`grid gap-6 ${isMobile && isConnected ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-12'}`}>
            {/* Video area */}
            <div className={`${isMobile && isConnected ? 'order-1' : 'xl:col-span-8 order-2 xl:order-1'}`}>
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/20">
                <div 
                  ref={videoContainerRef}
                  className={`bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative overflow-hidden ${
                    isFullscreen ? 'fixed inset-0 z-50' : isMobile ? 'aspect-[16/10]' : 'aspect-video'
                  }`}
                >
                  {!isConnected ? (
                    <div className="text-center text-white/80 p-8">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-white/10 backdrop-blur-lg flex items-center justify-center">
                          <Monitor className="w-12 h-12 text-white/60" />
                        </div>
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Ready for Screen Sharing</h3>
                      <p className="text-white/60 max-w-md mx-auto">
                        Start sharing your screen or join an existing session for collaboration
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      {/* Host video */}
                      {isHost && localStream && (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-contain bg-black"
                        />
                      )}
                      
                      {/* Viewer video */}
                      {!isHost && (
                        <div className="w-full h-full">
                          {remoteStreams && remoteStreams.size > 0 ? (
                            <video
                              ref={remoteVideoRef}
                              autoPlay
                              playsInline
                              muted={false}
                              controls={false}
                              className="w-full h-full object-contain bg-black"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-white">
                              <div className="text-center p-8">
                                <div className="relative mb-6">
                                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-lg flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                                  </div>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Connecting to Session</h3>
                                <p className="text-white/70 text-sm mb-4">Establishing secure connection...</p>
                                <div className="text-xs text-white/50 space-y-1 bg-black/20 rounded-xl p-3">
                                  <div>Status: {connectionStatus}</div>
                                  <div>Streams: {remoteStreams ? remoteStreams.size : 0}</div>
                                  <div>Quality: {getQualityLabel()}</div>
                                  <div>Network: {networkQuality}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Controls overlay */}
                      {isConnected && (
                        <div className={`absolute inset-0 pointer-events-none ${showMobileControls || !isMobile ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                          {/* Mobile controls toggle */}
                          {isMobile && (
                            <button 
                              onClick={() => setShowMobileControls(!showMobileControls)}
                              className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-lg rounded-2xl text-white pointer-events-auto transition-all hover:bg-black/70"
                            >
                              <Users className="w-5 h-5" />
                            </button>
                          )}
                          
                          {/* Fullscreen toggle */}
                          <div className={`absolute bottom-4 right-4 flex gap-2 pointer-events-auto ${isMobile && !showMobileControls ? 'hidden' : ''}`}>
                            <button 
                              onClick={toggleFullscreen}
                              className="p-3 bg-black/50 backdrop-blur-lg hover:bg-black/70 rounded-2xl text-white transition-all shadow-lg"
                              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                            >
                              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Session info bar */}
                {isConnected && (
                  <div className="p-4 lg:p-6 bg-white/50 backdrop-blur-lg border-t border-white/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-slate-700">
                            {isHost ? "Sharing your screen" : "Viewing shared screen"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 font-mono">
                          {formatDuration(sessionStats.duration)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Monitor className="w-4 h-4" />
                          <span>{getQualityLabel()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleEndSession}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          {isHost ? 'End Session' : 'Leave Session'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className={`${isMobile && isConnected ? 'order-2' : 'xl:col-span-4 order-1 xl:order-2'}`}>
              {!isConnected ? (
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 lg:p-8 border border-white/20">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                      <Share className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">Get Started</h2>
                    <p className="text-slate-600">Share your screen or join a session by ID</p>
                  </div>

                  <div className="space-y-6">
                    {/* Start sharing button */}
                    <button
                      onClick={handleStartScreenShare}
                      disabled={isLoading}
                      className="w-full group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            <span className="font-semibold">Starting Session...</span>
                          </>
                        ) : (
                          <>
                            <Share className="w-5 h-5" />
                            <span className="font-semibold">Share Your Screen</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white/70 text-slate-500 font-medium">or</span>
                      </div>
                    </div>
                    
                    {/* Join session */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        Join Session by ID
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter Session ID"
                            value={joinSessionId}
                            onChange={(e) => setJoinSessionId(e.target.value)}
                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all shadow-sm"
                          />
                          <div className="absolute right-3 top-3">
                            <Shield className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                        
                        <button
                          onClick={handleJoinSession}
                          disabled={!joinSessionId.trim() || isLoading}
                          className="w-full px-4 py-3 bg-white/80 hover:bg-white/90 text-slate-700 rounded-2xl font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-600"></div>
                              <span>Joining...</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>Join Session</span>
                            </>
                          )}
                        </button>
                      </div>

    
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 ${isMobile ? 'p-4' : 'p-6'}`}>
                  {/* Session info */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        Active Session
                      </h3>
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        {getQualityLabel()}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-white/20">
                      <div className="mb-3">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Session ID</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-mono font-semibold text-slate-700 truncate flex-1 bg-white/50 px-3 py-2 rounded-xl">
                            {activeSession?.id}
                          </div>
                          <button 
                            onClick={handleCopySessionId}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-xl transition-all group"
                            title="Copy session ID"
                          >
                            <Share className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Participants ({connectedUsers.length + 1})
                    </h3>
                    
                    <div className={`space-y-3 ${isMobile ? 'max-h-48' : 'max-h-64'} overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent`}>
                      {/* Current user */}
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {user?.email?.[0]?.toUpperCase() || 'Y'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 truncate">You</div>
                          <div className="text-sm text-blue-600 font-medium">{isHost ? 'Host' : 'Participant'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                            {isHost ? 'Host' : 'Viewer'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Other participants */}
                      {connectedUsers.map((connectedUser) => (
                        <div key={connectedUser.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-2xl border border-white/30 hover:bg-white/70 transition-colors">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {connectedUser.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 truncate">{connectedUser.name}</div>
                            <div className="text-sm text-slate-500">Participant</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                              Viewer
                            </div>
                            {isHost && (
                              <button
                                onClick={() => handleRemoveUser(connectedUser.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Remove participant"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteDesktopShare;