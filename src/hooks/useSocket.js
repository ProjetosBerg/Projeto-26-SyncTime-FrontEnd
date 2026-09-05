import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000'; 

export const useSocket = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      return;
    }

    socketRef.current = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: (callback) => {
        callback({ token: localStorage.getItem('token') });
      }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket.IO conectado:', socket.id);
    });

    socket.on('authSuccess', (data) => {
      console.log('Socket.IO autenticado:', data.message);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO auth falhou:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO desconectado:', reason);
    });

    return () => {
      socket.disconnect();
      console.log('Socket.IO desconectado no cleanup');
    };
  }, [userId]);

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return { socket: socketRef.current, on, off };
};
