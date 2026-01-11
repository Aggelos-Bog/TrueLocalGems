import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Backend URL

let socket = null;
const isConnected = ref(false);
const currentRoom = ref(null);

/**
 * Vue composable for real-time messaging via WebSocket
 */
export function useChat() {
  /**
   * Initialize Socket.IO connection with JWT authentication
   * @param {string} token - JWT authentication token
   */
  const connect = (token) => {
    if (socket && socket.connected) {
      return; // Already connected
    }

    socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      isConnected.value = true;
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      isConnected.value = false;
      currentRoom.value = null;
    });

    socket.on('error', (data) => {
      console.error('WebSocket error:', data.message);
    });
  };

  /**
   * Join a chat room for a specific request and guide
   * @param {number} requestId - Request ID
   * @param {number} guideId - Guide ID (optional for guides, required for travelers)
   */
  const joinRoom = (requestId, guideId) => {
    if (!socket || !socket.connected) {
      console.error('Socket not connected');
      return;
    }

    socket.emit('join_room', { request_id: requestId, guide_id: guideId });

    socket.once('room_joined', (data) => {
      console.log('Joined room:', data.room);
      currentRoom.value = requestId;
    });
  };

  /**
   * Send a message in the current room
   * @param {number} requestId - Request ID
   * @param {number} guideId - Guide ID
   * @param {string} content - Message content
   */
  const sendMessage = (requestId, guideId, content) => {
    if (!socket || !socket.connected) {
      console.error('Socket not connected');
      return;
    }

    socket.emit('send_message', {
      request_id: requestId,
      guide_id: guideId,
      content: content,
    });
  };

  /**
   * Listen for new incoming messages
   * @param {Function} callback - Callback function to handle new messages
   */
  const onNewMessage = (callback) => {
    if (!socket) {
      console.error('Socket not initialized');
      return;
    }

    socket.on('new_message', callback);
  };

  /**
   * Load chat history via REST API
   * @param {number} requestId - Request ID
   * @param {number} guideId - Guide ID (optional for guides, required for travelers)
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} - Chat history data
   */
  const loadChatHistory = async (requestId, guideId, token) => {
    try {
      let url = `http://localhost:3000/api/messages/${requestId}`;
      if (guideId) {
        url += `?guide_id=${guideId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading chat history:', error);
      throw error;
    }
  };

  /**
   * Disconnect WebSocket
   */
  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      isConnected.value = false;
      currentRoom.value = null;
    }
  };

  // Clean up on component unmount
  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    joinRoom,
    sendMessage,
    onNewMessage,
    loadChatHistory,
    disconnect,
    isConnected,
    currentRoom,
  };
}
