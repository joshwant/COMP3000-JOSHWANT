import React from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import app from '@/config/firebase';

const auth = getAuth(app);

export function useAuthentication() {
  const [user, setUser] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    const unsubscribeFromAuthStateChanged = onAuthStateChanged(auth, (user) => {
      setUser(user || undefined); // Set user or undefined if signed out
    });

    return unsubscribeFromAuthStateChanged;
  }, []);

  return { user };
}
