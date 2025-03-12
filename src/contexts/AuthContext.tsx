import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  session: Session | null;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add a utility for consistent logging
const logWithTime = (message: string, data?: any) => {
  console.log(`[${new Date().toISOString()}] ${message}`, data ? data : '');
};

// Add session attempt tracking
let refreshAttemptId = 0;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    session: null
  });

  // Add ref to track ongoing profile fetches
  const profileFetchRef = useRef<{[key: string]: boolean}>({});

  async function updateAuthState(user: User | null, session: Session | null) {
    const updateId = Date.now().toString();
    
    try {
      if (!user) {
        logWithTime(`[Auth State Update ${updateId}] No user, clearing state`);
        setState({ user: null, profile: null, loading: false, session: null });
        return;
      }

      // Mark this user's fetch as ongoing
      profileFetchRef.current[user.id] = true;

      const profilePromise = supabase
        .from('profiles')
        .select('*')  // Select all profile fields
        .eq('user_id', user.id)
        .single();

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        )
      ]) as any;

      // Clear the ongoing fetch marker
      delete profileFetchRef.current[user.id];

      if (profileError) {
        logWithTime(`[Auth State Update ${updateId}] Profile error`, {
          error: profileError.message,
          userId: user.id
        });
        
        setState(prev => ({
          ...prev,
          user,
          session,
          loading: false
        }));
        return;
      }

      logWithTime(`[Auth State Update ${updateId}] Complete`, {
        userId: user.id,
        role: profile?.role,
        hasSession: !!session
      });

      setState({
        user,
        profile,
        loading: false,
        session
      });
    } catch (error) {
      // Clear the ongoing fetch marker on error
      if (user) delete profileFetchRef.current[user.id];
      
      logWithTime(`[Auth State Update ${updateId}] Error`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user?.id
      });
      
      // Preserve existing state on error
      setState(prev => ({
        ...prev,
        user,
        session,
        loading: false
      }));
    }
  }

  const refreshSession = async () => {
    const currentAttemptId = ++refreshAttemptId;
    
    // Don't refresh if there's an ongoing profile fetch
    if (Object.keys(profileFetchRef.current).length > 0) {
      logWithTime(`[Session Refresh ${currentAttemptId}] Skipping - ongoing profile fetch`);
      return;
    }

    logWithTime(`[Session Refresh ${currentAttemptId}] Starting`, {
      currentState: {
        userId: state.user?.id,
        role: state.profile?.role,
        hasSession: !!state.session
      }
    });

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logWithTime(`[Session Refresh ${currentAttemptId}] Error`, { error: error.message });
        throw error;
      }
      
      if (session?.user) {
        logWithTime(`[Session Refresh ${currentAttemptId}] Session found`, {
          userId: session.user.id,
          expiresAt: session.expires_at
        });
        await updateAuthState(session.user, session);
      } else {
        logWithTime(`[Session Refresh ${currentAttemptId}] No session found`);
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      logWithTime(`[Session Refresh ${currentAttemptId}] Error`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    let mounted = true;
    let refreshInterval: number;

    const initializeAuth = async () => {
      logWithTime('[Auth Initialize] Starting');
      
      if (!mounted) {
        logWithTime('[Auth Initialize] Not mounted, skipping');
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          logWithTime('[Auth Initialize] Error', { error: error.message });
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        if (session?.user) {
          logWithTime('[Auth Initialize] Session found', {
            userId: session.user.id,
            expiresAt: session.expires_at
          });
          await updateAuthState(session.user, session);
        } else {
          logWithTime('[Auth Initialize] No session');
          setState(prev => ({ ...prev, loading: false }));
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            logWithTime('[Auth State Change]', {
              event,
              userId: session?.user?.id,
              expiresAt: session?.expires_at
            });

            if (event === 'SIGNED_OUT') {
              setState({ user: null, profile: null, loading: false, session: null });
              return;
            }

            if (session?.user) {
              await updateAuthState(session.user, session);
            }
          }
        );

        // Hourly refresh interval
        refreshInterval = window.setInterval(refreshSession, 60 * 60 * 1000);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        logWithTime('[Auth Initialize] Error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initializeAuth();

    return () => {
      logWithTime('[Auth Cleanup] Unmounting');
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const contextValue: AuthContextType = {
    user: state.user,
    profile: state.profile,
    isLoading: state.loading,
    signIn: async (email: string, password: string) => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Update auth state with the new session
        if (data.user && data.session) {
          await updateAuthState(data.user, data.session);
        }
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }));
        console.error('Error signing in:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setState({ user: null, profile: null, loading: false, session: null });
        logWithTime('[Sign Out] Successful');
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    refreshSession
  };

  if (state.loading) {
    logWithTime('[Auth Provider] Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}