const admin = require('firebase-admin');
const { getFirestore } = require('../services/firebaseService');

class RemoteDesktopController {
  constructor() {
    this.activeSessions = new Map();
    this.userConnections = new Map();
    this.sessionMetrics = new Map();
    this.performanceStats = new Map();
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

  async createSession(data, socket, io) {
    try {
      const { userId, sessionId, quality } = data;
      
      // Get real user profile
      const userProfile = await this.getUserProfile(userId);
      
      const sessionData = {
        id: sessionId,
        hostId: userId,
        hostSocketId: socket.id,
        hostProfile: userProfile,
        participants: [{ 
          userId, 
          socketId: socket.id, 
          role: 'host', 
          joinedAt: Date.now(),
          profile: userProfile,
          connectionQuality: 'HD',
          frameRate: 30,
          resolution: '1280x720'
        }],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        status: 'active',
        quality: {
          mode: quality?.mode || 'AUTO',
          targetFps: quality?.frameRate || 30,
          resolution: quality?.width ? `${quality.width}x${quality.height}` : '1280x720',
          adaptiveBitrate: true,
          lowLatencyMode: true
        },
        settings: {
          allowScreenControl: false,
          maxParticipants: 20,
          prioritizeLatency: true,
          hardwareAcceleration: true
        },
        performance: {
          avgLatency: 0,
          avgFps: 30,
          totalDataTransferred: 0,
          connectionDrops: 0
        }
      };

      this.activeSessions.set(sessionId, sessionData);
      this.userConnections.set(socket.id, { 
        userId, 
        sessionId, 
        role: 'host',
        joinedAt: Date.now(),
        profile: userProfile
      });

      this.sessionMetrics.set(sessionId, {
        startTime: Date.now(),
        peakParticipants: 1,
        totalJoins: 1,
        avgSessionDuration: 0,
        qualityMetrics: {
          avgFps: 30,
          avgLatency: 0,
          stabilityScore: 100
        }
      });

      this.storeSessionInFirebase(sessionId, sessionData).catch(() => {});

      socket.emit('session_created', {
        success: true,
        sessionData: {
          id: sessionId,
          role: 'host',
          participants: 1,
          settings: sessionData.settings,
          quality: sessionData.quality,
          performance: sessionData.performance,
          hostProfile: userProfile
        },
        timestamp: Date.now()
      });

    } catch (error) {
      socket.emit('session_error', { 
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  async joinSession(data, socket, io) {
    try {
      const { sessionId, userId } = data;
      
      let session = this.activeSessions.get(sessionId);
      
      if (!session) {
        session = await this.restoreSessionFromFirebase(sessionId);
        if (!session) {
          socket.emit('session_error', { 
            error: 'Session not found',
            sessionId,
            timestamp: Date.now()
          });
          return;
        }
      }

      if (session.participants.length >= session.settings.maxParticipants) {
        socket.emit('session_error', { 
          error: 'Session is full',
          maxParticipants: session.settings.maxParticipants,
          timestamp: Date.now()
        });
        return;
      }

      // Get real user profile
      const userProfile = await this.getUserProfile(userId);

      const existingParticipant = session.participants.find(p => p.userId === userId);
      
      if (existingParticipant) {
        existingParticipant.socketId = socket.id;
        existingParticipant.reconnectedAt = Date.now();
        existingParticipant.profile = userProfile;
      } else {
        session.participants.push({
          userId,
          socketId: socket.id,
          role: 'viewer',
          joinedAt: Date.now(),
          profile: userProfile,
          connectionQuality: 'HD',
          frameRate: 30,
          resolution: '1280x720',
          latency: 0
        });

        const metrics = this.sessionMetrics.get(sessionId);
        if (metrics) {
          metrics.totalJoins++;
          metrics.peakParticipants = Math.max(metrics.peakParticipants, session.participants.length);
        }
      }

      this.userConnections.set(socket.id, { 
        userId, 
        sessionId, 
        role: existingParticipant?.role || 'viewer',
        joinedAt: Date.now(),
        profile: userProfile
      });

      session.lastActivity = Date.now();

      this.storeSessionInFirebase(sessionId, session).catch(() => {});

      socket.emit('session_joined', {
        success: true,
        sessionData: {
          id: sessionId,
          role: existingParticipant?.role || 'viewer',
          participants: session.participants.length,
          settings: session.settings,
          quality: session.quality,
          hostId: session.hostId,
          hostProfile: session.hostProfile,
          performance: session.performance
        },
        timestamp: Date.now()
      });

      socket.to(`session-${sessionId}`).emit('user_joined', {
        userId,
        userName: userProfile.name,
        userEmail: userProfile.email,
        profilePic: userProfile.profilePic,
        role: 'viewer',
        participants: session.participants.length,
        connectionQuality: 'HD',
        timestamp: Date.now()
      });

    } catch (error) {
      socket.emit('session_error', { 
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  async removeUser(data, socket, io) {
    try {
      const { sessionId, userIdToRemove } = data;
      const userConnection = this.userConnections.get(socket.id);
      
      if (!userConnection || userConnection.role !== 'host') {
        socket.emit('session_error', { 
          error: 'Only host can remove users',
          timestamp: Date.now()
        });
        return;
      }

      const session = this.activeSessions.get(sessionId);
      if (!session) {
        socket.emit('session_error', { 
          error: 'Session not found',
          timestamp: Date.now()
        });
        return;
      }

      const userToRemove = session.participants.find(p => p.userId === userIdToRemove);
      if (!userToRemove) {
        socket.emit('session_error', { 
          error: 'User not found in session',
          timestamp: Date.now()
        });
        return;
      }

      // Remove user from session
      session.participants = session.participants.filter(p => p.userId !== userIdToRemove);
      session.lastActivity = Date.now();

      // Find user's socket connection to remove them
      const userSocketConnection = Array.from(this.userConnections.entries())
        .find(([socketId, conn]) => conn.userId === userIdToRemove && conn.sessionId === sessionId);

      if (userSocketConnection) {
        const [userSocketId] = userSocketConnection;
        this.userConnections.delete(userSocketId);
      }

      this.storeSessionInFirebase(sessionId, session).catch(() => {});

      // Notify removed user
      if (userToRemove.socketId) {
        io.to(userToRemove.socketId).emit('user_removed', {
          reason: 'Removed by host',
          sessionId,
          timestamp: Date.now()
        });
      }

      // Notify other participants
      socket.to(`session-${sessionId}`).emit('user_left', {
        userId: userIdToRemove,
        userName: userToRemove.profile?.name || 'Unknown User',
        participants: session.participants.length,
        isHost: false,
        removed: true,
        timestamp: Date.now()
      });

      socket.emit('user_remove_success', { 
        userId: userIdToRemove,
        userName: userToRemove.profile?.name || 'Unknown User',
        timestamp: Date.now()
      });

    } catch (error) {
      socket.emit('session_error', { 
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  async endSession(data, socket, io) {
    try {
      const { sessionId } = data;
      const userConnection = this.userConnections.get(socket.id);
      
      if (userConnection && userConnection.role !== 'host' && userConnection.sessionId === sessionId) {
        socket.emit('session_error', { 
          error: 'Only host can end session',
          timestamp: Date.now()
        });
        return;
      }

      const session = this.activeSessions.get(sessionId);
      if (session) {
        const metrics = this.sessionMetrics.get(sessionId);
        const sessionDuration = Date.now() - session.createdAt;
        
        io.to(`session-${sessionId}`).emit('session_ended', {
          reason: 'Session ended by host',
          endedAt: Date.now(),
          sessionDuration,
          finalStats: {
            participants: session.participants.length,
            duration: sessionDuration,
            performance: session.performance
          }
        });

        // Clean up all user connections for this session
        for (const [socketId, conn] of this.userConnections.entries()) {
          if (conn.sessionId === sessionId) {
            this.userConnections.delete(socketId);
          }
        }

        this.activeSessions.delete(sessionId);
        this.sessionMetrics.delete(sessionId);
        this.performanceStats.delete(sessionId);

        this.finalizeSessionInFirebase(sessionId, {
          ...session,
          status: 'ended',
          endedAt: Date.now(),
          duration: sessionDuration,
          finalMetrics: metrics
        }).catch(() => {});
      }

    } catch (error) {
      socket.emit('session_error', { 
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  async handleDisconnect(socket) {
    try {
      const userConnection = this.userConnections.get(socket.id);
      if (!userConnection) return;

      const { userId, sessionId, role } = userConnection;
      const session = this.activeSessions.get(sessionId);
      
      if (session) {
        if (role === 'host') {
          await this.endSession({ sessionId }, socket, socket.broadcast);
        } else {
          const participant = session.participants.find(p => p.userId === userId);
          if (participant) {
            participant.status = 'offline';
            participant.disconnectedAt = Date.now();
          }

          session.lastActivity = Date.now();

          socket.to(`session-${sessionId}`).emit('user_left', {
            userId,
            userName: participant?.profile?.name || 'Unknown User',
            temporary: true,
            participants: session.participants.filter(p => p.status !== 'offline').length,
            isHost: false,
            timestamp: Date.now()
          });
        }
      }

      this.userConnections.delete(socket.id);

    } catch (error) {
    }
  }

  async getSessionInfo(data, socket) {
    try {
      const { sessionId } = data;
      
      let session = this.activeSessions.get(sessionId);
      
      if (!session) {
        session = await this.restoreSessionFromFirebase(sessionId);
      }

      if (session && session.status === 'active') {
        const metrics = this.sessionMetrics.get(sessionId);
        
        socket.emit('session_info', {
          success: true,
          sessionData: {
            id: sessionId,
            participants: session.participants.length,
            participantsList: session.participants.map(p => ({
              userId: p.userId,
              name: p.profile?.name || 'Unknown User',
              email: p.profile?.email || '',
              role: p.role,
              joinedAt: p.joinedAt
            })),
            settings: session.settings,
            quality: session.quality,
            createdAt: session.createdAt,
            hostId: session.hostId,
            hostProfile: session.hostProfile,
            performance: session.performance,
            metrics: metrics || {}
          },
          timestamp: Date.now()
        });
      } else {
        socket.emit('session_info', {
          success: false,
          error: 'Session not found or inactive',
          timestamp: Date.now()
        });
      }

    } catch (error) {
      socket.emit('session_error', { 
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  async getActiveSessions(socket) {
    try {
      const sessions = Array.from(this.activeSessions.values()).map(session => {
        const metrics = this.sessionMetrics.get(session.id);
        return {
          id: session.id,
          participants: session.participants.length,
          createdAt: session.createdAt,
          hostId: session.hostId,
          hostProfile: session.hostProfile,
          quality: session.quality.mode,
          performance: session.performance,
          uptime: Date.now() - session.createdAt,
          metrics: metrics || {}
        };
      });

      socket.emit('active_sessions', { 
        sessions,
        total: sessions.length,
        timestamp: Date.now()
      });

    } catch (error) {
      socket.emit('session_error', { 
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  updatePerformanceStats(sessionId, stats) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      const currentStats = this.performanceStats.get(sessionId) || {
        samples: [],
        avgLatency: 0,
        avgFps: 30,
        lastUpdate: Date.now()
      };

      currentStats.samples.push({
        timestamp: Date.now(),
        latency: stats.latency || 0,
        fps: stats.fps || 30,
        bitrate: stats.bitrate || 0,
        packetLoss: stats.packetLoss || 0
      });

      if (currentStats.samples.length > 50) {
        currentStats.samples = currentStats.samples.slice(-50);
      }

      const recent = currentStats.samples.slice(-10);
      currentStats.avgLatency = recent.reduce((sum, s) => sum + s.latency, 0) / recent.length;
      currentStats.avgFps = recent.reduce((sum, s) => sum + s.fps, 0) / recent.length;
      currentStats.lastUpdate = Date.now();

      this.performanceStats.set(sessionId, currentStats);

      session.performance.avgLatency = currentStats.avgLatency;
      session.performance.avgFps = currentStats.avgFps;

    } catch (error) {
    }
  }

  async storeSessionInFirebase(sessionId, sessionData) {
    try {
      const db = getFirestore();
      await db.collection('remote_sessions').doc(sessionId).set(sessionData, { merge: true });
    } catch (error) {
    }
  }

  async restoreSessionFromFirebase(sessionId) {
    try {
      const db = getFirestore();
      const sessionDoc = await db.collection('remote_sessions').doc(sessionId).get();
      
      if (sessionDoc.exists) {
        const session = sessionDoc.data();
        this.activeSessions.set(sessionId, session);
        return session;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async finalizeSessionInFirebase(sessionId, finalSessionData) {
    try {
      const db = getFirestore();
      await db.collection('remote_sessions').doc(sessionId).set(finalSessionData);
      await db.collection('session_history').doc(sessionId).set({
        ...finalSessionData,
        archivedAt: Date.now()
      });
    } catch (error) {
    }
  }

  getControllerHealth() {
    return {
      activeSessions: this.activeSessions.size,
      activeConnections: this.userConnections.size,
      performanceTracking: this.performanceStats.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }
}

module.exports = new RemoteDesktopController();