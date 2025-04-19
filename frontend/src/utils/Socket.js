import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    autoConnect: false
  });

  socket.connect();

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  return socket;
};

export const getSocket = () => socket;