import { useState, useRef, useEffect, useCallback } from 'react';
import Peer from 'peerjs';

export const useWebRTC = (socket, sessionId, userId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentQuality, setCurrentQuality] = useState('AUTO');
  const [networkStats, setNetworkStats] = useState({
    bitrate: 0,
    latency: 0,
    frameRate: 30,
    packetLoss: 0
  });
  
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const connectionsRef = useRef(new Map());

  // Adaptive quality constraints based on network
  const getOptimalConstraints = useCallback(async () => {
    // Test network speed
    const startTime = Date.now();
    try {
      await fetch('/api/health', { method: 'HEAD' });
      const latency = Date.now() - startTime;
      
      if (latency < 50) {
        return {
          video: {
            cursor: 'always',
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 60, max: 60 },
            displaySurface: 'monitor'
          },
          audio: false
        };
      } else if (latency < 150) {
        return {
          video: {
            cursor: 'always',
            width: { ideal: 1280, max: 1280 },
            height: { ideal: 720, max: 720 },
            frameRate: { ideal: 30, max: 30 },
            displaySurface: 'monitor'
          },
          audio: false
        };
      } else {
        return {
          video: {
            cursor: 'always',
            width: { ideal: 854, max: 854 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 24, max: 24 },
            displaySurface: 'monitor'
          },
          audio: false
        };
      }
    } catch {
      return {
        video: {
          cursor: 'always',
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 30, max: 30 },
          displaySurface: 'monitor'
        },
        audio: false
      };
    }
  }, []);

  // Initialize peer connection
  useEffect(() => {
    if (!userId || !sessionId) {
      return;
    }
    
    const initializePeer = () => {
      try {
        if (peerRef.current && !peerRef.current.destroyed) {
          peerRef.current.destroy();
        }

        const peerId = `rds-${userId}-${Date.now()}`;
        
        const peer = new Peer(peerId, {
          host: '0.peerjs.com',
          port: 443,
          secure: true,
          debug: 0,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
              }
            ],
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
          }
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          setConnectionStatus('connected');
          
          if (socket && sessionId) {
            socket.emit('peer_connection', {
              sessionId,
              peerId: id,
              action: 'join',
              userId: userId,
              isHost: isHost
            });
          }
        });

        peer.on('call', (call) => {
          call.answer();
          
          call.on('stream', (remoteStream) => {
            setRemoteStreams(prev => {
              const newMap = new Map(prev);
              newMap.set(call.peer, remoteStream);
              return newMap;
            });

            if (!isHost) {
              setConnectionStatus('viewing');
              setIsConnected(true);
            }
          });

          call.on('close', () => {
            setRemoteStreams(prev => {
              const newMap = new Map(prev);
              newMap.delete(call.peer);
              return newMap;
            });
          });

          connectionsRef.current.set(call.peer, call);
        });

        peer.on('error', (error) => {
          setConnectionStatus('error');
        });

      } catch (error) {
        setConnectionStatus('error');
      }
    };

    initializePeer();

    return () => {
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.destroy();
      }
    };
  }, [userId, sessionId, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !sessionId) return;

    const handlePeerJoined = (data) => {
      if (isHost && localStream && peerRef.current && data.peerId !== peerRef.current.id) {
        try {
          const call = peerRef.current.call(data.peerId, localStream);
          
          if (call) {
            connectionsRef.current.set(data.peerId, call);
          }
        } catch (error) {
          console.error('Error calling peer:', error);
        }
      }
    };

    const handlePeerLeft = (data) => {
      const connection = connectionsRef.current.get(data.peerId);
      if (connection) {
        connection.close();
        connectionsRef.current.delete(data.peerId);
      }
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.peerId);
        return newMap;
      });
    };

    const handleExistingPeers = (data) => {
      if (!isHost && data.peers && data.peers.length > 0) {
        const hostPeer = data.peers.find(peer => peer.isHost);
        if (hostPeer && peerRef.current) {
          socket.emit('request_stream', {
            sessionId: sessionId,
            fromPeerId: peerRef.current.id,
            toPeerId: hostPeer.peerId
          });
        }
      }
    };

    const handleStreamRequest = (data) => {
      if (isHost && localStream && peerRef.current) {
        try {
          const call = peerRef.current.call(data.fromPeerId, localStream);
          
          if (call) {
            connectionsRef.current.set(data.fromPeerId, call);
          }
        } catch (error) {
          console.error('Error responding to stream request:', error);
        }
      }
    };

    socket.on('peer_joined', handlePeerJoined);
    socket.on('peer_left', handlePeerLeft);
    socket.on('existing_peers', handleExistingPeers);
    socket.on('stream_request', handleStreamRequest);

    return () => {
      socket.off('peer_joined', handlePeerJoined);
      socket.off('peer_left', handlePeerLeft);
      socket.off('existing_peers', handleExistingPeers);
      socket.off('stream_request', handleStreamRequest);
    };
  }, [socket, isHost, localStream, sessionId]);

  // Local video handling
  useEffect(() => {
    if (localStream && localVideoRef.current && isHost) {
      const videoElement = localVideoRef.current;
      
      videoElement.srcObject = localStream;
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.playsInline = true;
      
      videoElement.play().catch(console.error);
    }
  }, [localStream, isHost]);

  // Start screen share
  const startScreenShare = useCallback(async () => {
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      setConnectionStatus('connecting');

      const constraints = await getOptimalConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      setLocalStream(stream);
      setIsHost(true);
      setIsConnected(true);
      setConnectionStatus('sharing');

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Update peer connection
      if (peerRef.current && socket && sessionId) {
        socket.emit('peer_connection', {
          sessionId: sessionId,
          peerId: peerRef.current.id,
          action: 'update',
          userId: userId,
          isHost: true
        });
      }

      return stream;
    } catch (error) {
      setConnectionStatus('error');
      throw error;
    }
  }, [userId, socket, sessionId, getOptimalConstraints]);

  // Join as viewer
  const joinAsViewer = useCallback(async () => {
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      setConnectionStatus('connecting');
      setIsHost(false);
      setIsConnected(true);
      
      if (peerRef.current && socket && sessionId) {
        socket.emit('peer_connection', {
          sessionId: sessionId,
          peerId: peerRef.current.id,
          action: 'update',
          userId: userId,
          isHost: false
        });
      }
      
      return true;
    } catch (error) {
      setConnectionStatus('error');
      throw error;
    }
  }, [userId, socket, sessionId]);

  const stopScreenShare = useCallback(() => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      connectionsRef.current.forEach((connection) => {
        if (connection && typeof connection.close === 'function') {
          connection.close();
        }
      });
      connectionsRef.current.clear();

      if (peerRef.current && socket && sessionId) {
        socket.emit('peer_connection', {
          sessionId,
          peerId: peerRef.current.id,
          action: 'leave'
        });
      }

      setLocalStream(null);
      setRemoteStreams(new Map());
      setIsConnected(false);
      setIsHost(false);
      setConnectionStatus('disconnected');

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, [localStream, socket, sessionId]);

  const getConnectionQuality = useCallback(() => {
    if (!isConnected) return 'disconnected';
    
    // Network quality detection logic
    const latency = networkStats.latency;
    if (latency < 50) return 'excellent';
    if (latency < 150) return 'good';
    if (latency < 300) return 'fair';
    return 'poor';
  }, [isConnected, networkStats.latency]);

  return {
    localStream,
    remoteStreams,
    isConnected,
    isHost,
    connectionStatus,
    connectionQuality: getConnectionQuality(),
    currentQuality,
    networkStats,
    startScreenShare,
    joinAsViewer,
    stopScreenShare,
    cleanup: stopScreenShare,
    localVideoRef,
    peerId: peerRef.current?.id
  };
};