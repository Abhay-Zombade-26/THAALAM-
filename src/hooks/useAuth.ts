import { useState, useEffect } from 'react';
import { 
  type User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: auth.currentUser,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null
        });
      },
      (error) => {
        setAuthState({
          user: null,
          loading: false,
          error: error.message
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setAuthState({
        user: cred.user,
        loading: false,
        error: null
      });
      return { success: true, user: cred.user };
    } catch (err: unknown) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (err instanceof Error) {
        if (err.message.includes('user-not-found') || err.message.includes('wrong-password') || err.message.includes('invalid-credential')) {
          message = 'Invalid email or password.';
        } else if (err.message.includes('too-many-requests')) {
          message = 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later.';
        } else {
          message = err.message;
        }
      }
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message
      }));
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign out.';
      setAuthState((prev) => ({ ...prev, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    isAuthenticated: !!authState.user
  };
};
