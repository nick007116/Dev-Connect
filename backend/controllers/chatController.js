const admin = require('firebase-admin');

const handleChatMessage = async (data, socket, io) => {
  try {
    const messageData = {
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save message to Firestore
    const messageRef = await admin.firestore()
      .collection('chats')
      .doc(data.chatId)
      .collection('messages')
      .add(messageData);

    // Get the saved message with the ID
    const savedMessage = {
      ...messageData,
      id: messageRef.id,
      timestamp: new Date()
    };

    // Broadcast to the room
    io.to(data.chatId).emit('receive_message', savedMessage);

    console.log('Message sent to room:', data.chatId);
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('message_error', { error: 'Failed to send message' });
  }
};

const handleTypingStatus = (roomId, userId, isTyping, socket) => {
  socket.to(roomId).emit('typing_status', { userId, isTyping });
};

module.exports = { handleChatMessage, handleTypingStatus };