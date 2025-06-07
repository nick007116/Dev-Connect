const admin = require('firebase-admin');
const remoteDesktopController = require('../controllers/remoteDesktopController');
const webrtcService = require('../services/webrtcService');
const { getFirestore } = require('../services/firebaseService');

const activeUsers = new Map();
const userRooms = new Map();

const setUserOnline = async (userId) => {
  try {
    const db = getFirestore();
    db.collection('userStatus').doc(userId).set({
      online: true,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      connectionType: 'ULTRA_FAST'
    }, { merge: true }).catch();
    
  } catch (error) {
  }
};

const setUserOffline = async (userId) => {
  try {
    const db = getFirestore();
    db.collection('userStatus').doc(userId).set({
      online: false,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch();
    
  } catch (error) {
  }
};

const handleSocketConnection = (socket, io) => {
  const userId = socket.user?.uid || socket.id;
  activeUsers.set(socket.id, userId);
  setUserOnline(userId);

  socket.on('create_remote_session', (data) => {
    remoteDesktopController.createSession(data, socket, io);
  });

  socket.on('join_remote_session', (data) => {
    remoteDesktopController.joinSession(data, socket, io);
  });

  socket.on('end_remote_session', (data) => {
    remoteDesktopController.endSession(data, socket, io);
  });

  socket.on('remove_user', (data) => {
    remoteDesktopController.removeUser(data, socket, io);
  });

  socket.on('get_session_info', (data) => {
    remoteDesktopController.getSessionInfo(data, socket);
  });

  socket.on('get_active_sessions', () => {
    remoteDesktopController.getActiveSessions(socket);
  });

  socket.on('peer_connection', (data) => {
    webrtcService.handlePeerConnection(data, socket, io);
  });

  socket.on('request_stream', (data) => {
    webrtcService.handleStreamRequest(data, socket, io);
  });

  socket.on('webrtc_offer', (data) => {
    webrtcService.handleOffer(data, socket, io);
  });

  socket.on('webrtc_answer', (data) => {
    webrtcService.handleAnswer(data, socket, io);
  });

  socket.on('webrtc_ice_candidate', (data) => {
    webrtcService.handleIceCandidate(data, socket, io);
  });

  socket.on('performance_update', (data) => {
    if (data.sessionId && data.stats) {
      remoteDesktopController.updatePerformanceStats(data.sessionId, data.stats);
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    userRooms.delete(socket.id);
  });

  socket.on('system_health', () => {
    socket.emit('system_health_response', {
      status: 'ULTRA_HEALTHY',
      services: {
        webrtc: webrtcService.getServiceHealth(),
        controller: remoteDesktopController.getControllerHealth(),
        activeUsers: activeUsers.size,
        activeRooms: userRooms.size
      },
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', (reason) => {
    activeUsers.delete(socket.id);
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      socket.leave(roomId);
      userRooms.delete(socket.id);
    }
    
    setUserOffline(userId);
    
    remoteDesktopController.handleDisconnect(socket);
    
    webrtcService.cleanup(userId);
  });

  socket.on('error', (error) => {
    socket.emit('error_response', {
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: Date.now()
    });
  });
};

module.exports = { handleSocketConnection };