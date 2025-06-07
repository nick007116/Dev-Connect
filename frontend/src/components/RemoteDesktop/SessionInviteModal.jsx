import React, { useState } from 'react';
import { X, Send, Copy, Users } from 'lucide-react';

const SessionInviteModal = ({ isOpen, onClose, sessionId, friends, socket }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('Join my remote desktop session!');
  const [isSending, setIsSending] = useState(false);

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const sendInvites = async () => {
    if (selectedFriends.length === 0) return;
    
    setIsSending(true);
    try {
      // Send invites via socket
      socket.emit('send_session_invites', {
        sessionId,
        friendIds: selectedFriends,
        message: inviteMessage
      });
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error sending invites:', error);
    } finally {
      setIsSending(false);
    }
  };

  const copySessionLink = () => {
    const link = `${window.location.origin}/remote-desktop?join=${sessionId}`;
    navigator.clipboard.writeText(link);
    alert('Session link copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Invite Friends</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Session ID */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Session ID</p>
                <p className="text-xs text-gray-500">{sessionId}</p>
              </div>
              <button
                onClick={copySessionLink}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invite Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Message
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Friends List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Friends ({selectedFriends.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {friends.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No friends available
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => toggleFriendSelection(friend.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFriends.includes(friend.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {friend.name?.[0] || 'F'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{friend.name}</p>
                      <p className="text-xs text-gray-500">{friend.email}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 ${
                      selectedFriends.includes(friend.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedFriends.includes(friend.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={sendInvites}
            disabled={selectedFriends.length === 0 || isSending}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Invites'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionInviteModal;