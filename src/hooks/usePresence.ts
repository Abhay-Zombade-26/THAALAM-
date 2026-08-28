import { useState, useEffect, useRef } from 'react';
import { 
  ref, 
  push, 
  set, 
  onDisconnect, 
  onValue,
  remove
} from 'firebase/database';
import { rtdb } from '../lib/firebase';

export const usePresence = () => {
  const [listenerCount, setListenerCount] = useState<number>(1);
  const myPresenceRef = useRef<any>(null);
  const isConnected = useRef(false);

  useEffect(() => {
    // Skip if already connected
    if (isConnected.current) return;
    
    let connectedUnsubscribe: (() => void) | null = null;
    let presenceUnsubscribe: (() => void) | null = null;

    try {
      const connectedRef = ref(rtdb, '.info/connected');
      const presenceListRef = ref(rtdb, 'presence');

      console.log('🟢 Setting up presence connection...');

      // Listen for connection status
      connectedUnsubscribe = onValue(connectedRef, (snapshot) => {
        const isConnectedNow = snapshot.val();

        if (isConnectedNow && !myPresenceRef.current) {
          // Create a single presence node
          const newPresenceRef = push(presenceListRef);
          myPresenceRef.current = newPresenceRef;
          isConnected.current = true;

          console.log(`🟢 Visitor connected (ID: ${newPresenceRef.key})`);

          // Set the presence data
          set(newPresenceRef, {
            joinedAt: Date.now(),
            lastActive: Date.now()
          }).catch(() => {});

          // Remove on disconnect
          onDisconnect(newPresenceRef)
            .remove()
            .catch(() => {});
        }
      });

      // Listen for presence count
      presenceUnsubscribe = onValue(
        presenceListRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const keys = Object.keys(data);
            const count = Math.max(1, keys.length);
            setListenerCount(count);
            console.log(`📊 Current listeners: ${count}`);
          } else {
            setListenerCount(1);
          }
        },
        (error) => {
          console.warn('Presence listener error:', error);
          setListenerCount(1);
        }
      );

      return () => {
        console.log('🔴 Cleaning up presence...');
        isConnected.current = false;
        
        if (connectedUnsubscribe) connectedUnsubscribe();
        if (presenceUnsubscribe) presenceUnsubscribe();
        
        if (myPresenceRef.current) {
          remove(myPresenceRef.current).catch(() => {});
          myPresenceRef.current = null;
        }
      };
    } catch (err) {
      console.warn('Presence setup error:', err);
      return () => {};
    }
  }, []);

  return listenerCount;
};