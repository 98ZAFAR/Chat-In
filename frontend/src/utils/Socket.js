import { io } from 'socket.io-client';
import { showError, showWarning, showInfo } from './toast';

let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeSocket = (token, user) => {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Connected to socket server');
    reconnectAttempts = 0;
    // showInfo('Connected to chat server');
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from socket server:', reason);
    if (reason === 'io server disconnect') {
      showError('Disconnected from server');
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    reconnectAttempts++;
    
    if (error.message === 'Invalid token') {
      showError('Authentication failed. Please login again.');
      return;
    }
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      showError('Failed to connect to chat server. Please refresh the page.');
    } else {
      showWarning(`Connection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    showInfo('Reconnected to chat server');
  });

  socket.on('reconnect_failed', () => {
    console.log('Failed to reconnect to socket server');
    showError('Failed to reconnect. Please refresh the page.');
  });

  // Error event handlers
  socket.on('message_error', (data) => {
    showError(data.error || 'Failed to send message');
  });

  socket.connect();
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (to, content, messageType = 'text') => {
  if (!socket || !socket.connected) {
    showError('Not connected to chat server');
    return false;
  }

  if (!to || !content || content.trim().length === 0) {
    showError('Message cannot be empty');
    return false;
  }

  if (content.length > 1000) {
    showError('Message is too long (max 1000 characters)');
    return false;
  }

  socket.emit('send_message', {
    to,
    content: content.trim(),
    messageType
  });

  return true;
};

export const startTyping = (to) => {
  if (socket && socket.connected && to) {
    socket.emit('typing_start', { to });
  }
};

export const stopTyping = (to) => {
  if (socket && socket.connected && to) {
    socket.emit('typing_stop', { to });
  }
};

export const markMessageAsRead = (messageId) => {
  if (socket && socket.connected && messageId) {
    socket.emit('mark_message_read', { messageId });
  }
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};

export const onMessage = (callback) => {
  if (socket) {
    socket.on('receive_message', callback);
  }
};

export const onMessageSent = (callback) => {
  if (socket) {
    socket.on('message_sent', callback);
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user_typing', callback);
  }
};

export const onUserOnline = (callback) => {
  if (socket) {
    socket.on('user_online', callback);
  }
};

export const onOnlineUsersList = (callback) => {
  if (socket) {
    socket.on('online_users_list', callback);
  }
};

export const onMessageRead = (callback) => {
  if (socket) {
    socket.on('message_read', callback);
  }
};

export const offMessage = (callback) => {
  if (socket) {
    socket.off('receive_message', callback);
  }
};

export const offMessageSent = (callback) => {
  if (socket) {
    socket.off('message_sent', callback);
  }
};

export const offUserTyping = (callback) => {
  if (socket) {
    socket.off('user_typing', callback);
  }
};

export const offUserOnline = (callback) => {
  if (socket) {
    socket.off('user_online', callback);
  }
};

export const offOnlineUsersList = (callback) => {
  if (socket) {
    socket.off('online_users_list', callback);
  }
};

export const offMessageRead = (callback) => {
  if (socket) {
    socket.off('message_read', callback);
  }
};