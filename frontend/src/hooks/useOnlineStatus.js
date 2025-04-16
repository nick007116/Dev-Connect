import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { rtdb, ref, set, onDisconnect, serverTimestamp } from '../lib/firebase'; // Import Realtime Database functions

export const useOnlineStatus = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const userStatusRef = ref(rtdb, `/status/${user.uid}`);

    // Set online status when the component mounts (user comes online)
    set(userStatusRef, {
      online: true,
      lastSeen: null, // Remove lastSeen when online
    });

    // Set offline status when the user disconnects (closes the app, loses connection)
    onDisconnect(userStatusRef)
      .set({
        online: false,
        lastSeen: serverTimestamp(),
      })
      .then(() => {
        // Ensure the offline status is set immediately if the connection is lost
        set(userStatusRef, {
          online: true,
          lastSeen: null,
        });
      });

    return () => {
      // Clean up the listener when the component unmounts
      set(userStatusRef, { 
        online: false,
        lastSeen: serverTimestamp(),
      });
    };
  }, [user]);
};