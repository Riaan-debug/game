import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextValue {
  configured: boolean;
  sessionReady: boolean;
  user: User | null;
  email: string | null;
  authLoading: boolean;
  authError: string | null;
  authMessage: string | null;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthFeedback: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [sessionReady, setSessionReady] = useState(!configured);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) {
      setSessionReady(true);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setSessionReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setSessionReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionReady(true);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithEmail = useCallback(async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      setAuthError('Enter your email address.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setAuthError('Cloud sync is not configured on this build.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin },
    });

    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthMessage('Check your email for a sign-in link.');
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    }
  }, []);

  const clearAuthFeedback = useCallback(() => {
    setAuthError(null);
    setAuthMessage(null);
  }, []);

  const value = useMemo(
    () => ({
      configured,
      sessionReady,
      user,
      email: user?.email ?? null,
      authLoading,
      authError,
      authMessage,
      signInWithEmail,
      signOut,
      clearAuthFeedback,
    }),
    [
      configured,
      sessionReady,
      user,
      authLoading,
      authError,
      authMessage,
      signInWithEmail,
      signOut,
      clearAuthFeedback,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
