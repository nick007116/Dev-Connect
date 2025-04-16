const admin = require('firebase-admin');
const { handleChatMessage } = require('../controllers/chatController');
const { getFirebaseDatabase } = require('../services/firebaseService');

const activeUsers = new Map();
const userRooms = new Map();

const handleSocketConnection = (socket, io) => {
  console.log(`User connected: ${socket.id}`);
  const userId = socket.user.uid;
  activeUsers.set(socket.id, userId);
  setUserOnline(userId); // Set user online status on connection

  // Join room
  socket.on('join_chat', async (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  // Handle messages
  socket.on('send_message', (data) => handleChatMessage(data, socket, io));

  // Handle typing indicators
  socket.on('typing_status', ({ chatId, userId, isTyping }) => {
    io.to(chatId).emit('typing_status', { userId, isTyping });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      socket.leave(roomId);
      userRooms.delete(socket.id);
    }
    console.log(`User disconnected: ${socket.id}`);
    setUserOffline(userId); // Set user offline status on disconnection
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Helper functions to update user presence
  const setUserOnline = (userId) => {
    const db = getFirebaseDatabase();
    const userStatusRef = db.ref(`/status/${userId}`);

    userStatusRef.set({
      online: true,
    });
  };

  const setUserOffline = (userId) => {
    const db = getFirebaseDatabase();
    const userStatusRef = db.ref(`/status/${userId}`);

    userStatusRef.set({
      online: false,
      lastSeen: admin.database.ServerValue.TIMESTAMP,
    });
  };
};

module.exports = { handleSocketConnection };