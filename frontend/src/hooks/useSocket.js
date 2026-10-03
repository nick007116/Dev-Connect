import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../lib/firebase';
import { getBackendUrl } from '../lib/backendUrl';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let activeSocket;
    const backendUrl = getBackendUrl();

    if (!backendUrl) {
      console.warn('Backend is not configured. Set REACT_APP_BACKEND_URL in the Vercel project settings.');
      return undefined;
    }

    const initSocket = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const token = await currentUser.getIdToken();
        if (cancelled) return;

        activeSocket = io(backendUrl, {
          auth: { token },
          transports: ['websocket']
        });
        activeSocket.on('connect', () => console.log('Connected to server'));
        activeSocket.on('disconnect', () => console.log('Disconnected from server'));
        activeSocket.on('connect_error', (error) => {
          console.error('Backend socket connection failed:', error.message);
        });
        setSocket(activeSocket);
      } catch (error) {
        console.error('Failed to initialize backend socket:', error);
      }
    };

    initSocket();
    return () => {
      cancelled = true;
      activeSocket?.close();
      setSocket(null);
    };
  }, []);

  return socket;
};