import { io } from 'socket.io-client';

const socket = io('https://chatin-ln9h.onrender.com', {
  auth: {
    token: localStorage.getItem('token')
  }
});

export default socket;