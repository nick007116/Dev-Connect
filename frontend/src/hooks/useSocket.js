import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../lib/firebase';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        
        const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
          auth: { token },
          transports: ['websocket']
        });

        newSocket.on('connect', () => {
          console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from server');
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    };

    initSocket();
  }, []);

  return socket;
};