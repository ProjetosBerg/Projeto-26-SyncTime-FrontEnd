import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000'; 

export const useSocket = (userId) => {
  const socketRef = useRef(null);
  const isAuthenticated = useRef(false);

  useEffect(() => {
    if (!userId) {
      console.warn('useSocket: userId não fornecido. Conexão não autenticada.');
      return;
    }

    socketRef.current = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'], 
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket.IO conectado:', socket.id);
      if (!isAuthenticated.current) {
        socket.emit('auth', { userId });
        isAuthenticated.current = true;
      }
    });

    socket.on('authSuccess', (data) => {
      console.log('Socket.IO autenticado:', data.message);
    });

    socket.on('authError', (data) => {
      console.error('Socket.IO auth falhou:', data.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO desconectado:', reason);
      isAuthenticated.current = false;
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