const remoteDesktopController = require('../controllers/remoteDesktopController');
const webrtcService = require('./webrtcService');

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {

    // CORE Remote Desktop Events (Ultra-optimized)
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

    // ULTRA-FAST WebRTC Events
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

    // Performance Monitoring (Non-blocking)
    socket.on('performance_stats', (data) => {
      if (data.sessionId) {
        remoteDesktopController.updatePerformanceStats(data.sessionId, data.stats);
      }
    });

    // ULTRA-FAST Room Management
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    // Health Check
    socket.on('health_check', () => {
      socket.emit('health_response', {
        status: 'healthy',
        webrtc: webrtcService.getServiceHealth(),
        controller: remoteDesktopController.getControllerHealth(),
        timestamp: Date.now()
      });
    });

    // ULTRA-FAST Disconnect Handling
    socket.on('disconnect', (reason) => {
      remoteDesktopController.handleDisconnect(socket);
      webrtcService.cleanup(socket.user?.uid || socket.id);
    });

    // Error Handling
    socket.on('error', (error) => {
      socket.emit('error_response', {
        error: error.message,
        timestamp: Date.now()
      });
    });
  });
};

module.exports = { handleSocketConnection };
