const admin = require('firebase-admin');
const { getFirestore } = require('./firebaseService');

class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.sessionPeers = new Map();
    this.activeStreams = new Map();
    this.streamQuality = new Map();
  }

  async getUserProfile(userId) {
    try {
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        return {
          name: userData.name || userData.displayName || 'Unknown User',
          email: userData.email || '',
          profilePic: userData.profilePic || null
        };
      }
      
      // Fallback to Firebase Auth
      try {
        const userRecord = await admin.auth().getUser(userId);
        return {
          name: userRecord.displayName || userRecord.email?.split('@')[0] || 'Unknown User',
          email: userRecord.email || '',
          profilePic: userRecord.photoURL || null
        };
      } catch (authError) {
        return {
          name: `User ${userId.slice(-4)}`,
          email: '',
          profilePic: null
        };
      }
    } catch (error) {
      return {
        name: `User ${userId.slice(-4)}`,
        email: '',
        profilePic: null
      };
    }
  }

  async handlePeerConnection(data, socket, io) {
    try {
      const { sessionId, peerId, action, userId, isHost, quality } = data;
      
      if (action === 'join' || action === 'update') {
        // Get real user profile
        const userProfile = await this.getUserProfile(userId || socket.user?.uid || socket.id);
        
        const peerData = {
          userId: userId || socket.user?.uid || socket.id,
          sessionId,
          socketId: socket.id,
          userName: userProfile.name,
          userEmail: userProfile.email,
          profilePic: userProfile.profilePic,
          isHost: isHost || false,
          quality: quality || 'HD',
          joinedAt: Date.now(),
          lastActivity: Date.now(),
          connectionState: 'connecting'
        };

        this.activeStreams.set(peerId, peerData);

        if (!this.sessionPeers.has(sessionId)) {
          this.sessionPeers.set(sessionId, new Set());
        }
        this.sessionPeers.get(sessionId).add(peerId);

        if (action === 'join') {
          const existingPeers = this.getActiveConnections(sessionId)
            .filter(peer => peer.peerId !== peerId)
            .map(peer => ({
              peerId: peer.peerId,
              userId: peer.userId,
              userName: peer.userName,
              userEmail: peer.userEmail,
              profilePic: peer.profilePic,
              isHost: peer.isHost,
              quality: peer.quality
            }));

          socket.emit('existing_peers', { 
            peers: existingPeers,
            sessionId,
            timestamp: Date.now()
          });

          socket.to(`session-${sessionId}`).emit('peer_joined', {
            peerId,
            userId: peerData.userId,
            userName: peerData.userName,
            userEmail: peerData.userEmail,
            profilePic: peerData.profilePic,
            sessionId,
            isHost: peerData.isHost,
            quality: peerData.quality,
            timestamp: Date.now()
          });
        }
        
        peerData.connectionState = 'connected';
        
      } else if (action === 'leave') {
        this.cleanupPeer(peerId, sessionId);
        
        socket.to(`session-${sessionId}`).emit('peer_left', {
          peerId,
          userId: socket.user?.uid || socket.id,
          sessionId,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      socket.emit('webrtc_error', { error: error.message });
    }
  }

  async handleStreamRequest(data, socket, io) {
    try {
      const { sessionId, fromPeerId, toPeerId } = data;
      
      const connections = this.getActiveConnections(sessionId);
      const host = connections.find(conn => conn.isHost);
      
      if (host) {
        io.to(`session-${sessionId}`).emit('stream_request', {
          sessionId,
          fromPeerId,
          toPeerId: host.peerId,
          requesterId: socket.user?.uid || socket.id,
          priority: 'HIGH',
          timestamp: Date.now()
        });

        this.streamQuality.set(`${sessionId}-${fromPeerId}`, {
          quality: 'HD',
          frameRate: 30,
          bitrate: 'ADAPTIVE',
          latency: 'LOW'
        });
        
      } else {
        socket.emit('session_error', {
          error: 'No active host found in session',
          sessionId
        });
      }
      
    } catch (error) {
      socket.emit('webrtc_error', { error: error.message });
    }
  }

  async handleOffer(data, socket, io) {
    try {
      const { sessionId, offer, targetUserId, peerId, quality } = data;
      
      const connectionId = `${socket.user?.uid || socket.id}-${targetUserId}`;
      
      this.peerConnections.set(connectionId, {
        initiator: socket.user?.uid || socket.id,
        target: targetUserId,
        sessionId,
        peerId,
        offer,
        quality: quality || 'HD',
        timestamp: Date.now(),
        state: 'offering'
      });

      io.to(`session-${sessionId}`).emit('webrtc_offer', {
        offer,
        fromUserId: socket.user?.uid || socket.id,
        fromUserName: socket.user?.email || 'Anonymous',
        connectionId,
        peerId,
        sessionId,
        quality: quality || 'HD',
        timestamp: Date.now()
      });

    } catch (error) {
      socket.emit('webrtc_error', { error: error.message });
    }
  }

  async handleAnswer(data, socket, io) {
    try {
      const { sessionId, answer, connectionId, peerId, quality } = data;
      
      const connection = this.peerConnections.get(connectionId);
      if (connection) {
        connection.state = 'answered';
        connection.answer = answer;
        connection.answeredAt = Date.now();
      }
      
      io.to(`session-${sessionId}`).emit('webrtc_answer', {
        answer,
        fromUserId: socket.user?.uid || socket.id,
        connectionId,
        peerId,
        sessionId,
        quality: quality || 'HD',
        timestamp: Date.now()
      });

    } catch (error) {
      socket.emit('webrtc_error', { error: error.message });
    }
  }

  async handleIceCandidate(data, socket, io) {
    try {
      const { sessionId, candidate, connectionId, peerId } = data;
      
      io.to(`session-${sessionId}`).emit('webrtc_ice_candidate', {
        candidate,
        fromUserId: socket.user?.uid || socket.id,
        connectionId,
        peerId,
        sessionId,
        timestamp: Date.now()
      });
      
    } catch (error) {
    }
  }

  cleanupPeer(peerId, sessionId) {
    try {
      this.activeStreams.delete(peerId);
      
      if (this.sessionPeers.has(sessionId)) {
        this.sessionPeers.get(sessionId).delete(peerId);
        
        if (this.sessionPeers.get(sessionId).size === 0) {
          this.sessionPeers.delete(sessionId);
        }
      }
      
      for (const [connectionId, connection] of this.peerConnections.entries()) {
        if (connection.sessionId === sessionId && 
            (connection.initiator === peerId || connection.target === peerId)) {
          this.peerConnections.delete(connectionId);
        }
      }
      
      this.streamQuality.delete(`${sessionId}-${peerId}`);
      
    } catch (error) {
    }
  }

  cleanup(userId) {
    try {
      for (const [connectionId, connection] of this.peerConnections.entries()) {
        if (connection.initiator === userId || connection.target === userId) {
          this.peerConnections.delete(connectionId);
        }
      }

      const peersToCleanup = [];
      for (const [peerId, stream] of this.activeStreams.entries()) {
        if (stream.userId === userId) {
          peersToCleanup.push({ peerId, sessionId: stream.sessionId });
        }
      }
      
      peersToCleanup.forEach(({ peerId, sessionId }) => {
        this.cleanupPeer(peerId, sessionId);
      });
      
    } catch (error) {
    }
  }

  getActiveConnections(sessionId) {
    const connections = [];
    
    if (this.sessionPeers.has(sessionId)) {
      for (const peerId of this.sessionPeers.get(sessionId)) {
        const stream = this.activeStreams.get(peerId);
        if (stream) {
          connections.push({
            peerId,
            userId: stream.userId,
            userName: stream.userName,
            userEmail: stream.userEmail,
            profilePic: stream.profilePic,
            isHost: stream.isHost || false,
            quality: stream.quality || 'HD',
            connectionState: stream.connectionState,
            joinedAt: stream.joinedAt
          });
        }
      }
    }
    
    return connections;
  }

  getSessionStats(sessionId) {
    const connections = this.getActiveConnections(sessionId);
    const qualityStats = Array.from(this.streamQuality.entries())
      .filter(([key]) => key.startsWith(`${sessionId}-`))
      .map(([, stats]) => stats);
    
    return {
      sessionId,
      totalPeers: connections.length,
      activeConnections: this.peerConnections.size,
      hosts: connections.filter(c => c.isHost).length,
      viewers: connections.filter(c => !c.isHost).length,
      avgQuality: qualityStats.length > 0 ? 'HD' : 'UNKNOWN',
      streamCount: qualityStats.length,
      lastActivity: Date.now()
    };
  }

  getServiceHealth() {
    return {
      totalSessions: this.sessionPeers.size,
      totalPeers: this.activeStreams.size,
      totalConnections: this.peerConnections.size,
      activeStreams: this.streamQuality.size,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: Date.now()
    };
  }
}

module.exports = new WebRTCService();