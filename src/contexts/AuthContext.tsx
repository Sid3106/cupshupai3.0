import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../types/database';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  session: Session | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    session: null
  });

  console.log('AuthProvider: Current state:', state);

  const refreshSession = async () => {
    console.log('refreshSession: Starting refresh');
    let retryCount = 0;
    const maxRetries = 3;

    const attemptRefresh = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          await updateAuthState(session.user, session);
        } else {
          console.log('refreshSession: No session found, setting loading false');
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error(`Error refreshing session (attempt ${retryCount + 1}):`, error);
        if (retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          return attemptRefresh();
        }
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    };

    return attemptRefresh();
  };

  const isSessionExpired = (session: Session | null) => {
    if (!session) return true;
    
    // Check if session expires in less than 5 minutes
    const expiresAt = session.expires_at;
    if (!expiresAt) return false;
    
    const expiryTime = new Date(expiresAt * 1000);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expiryTime.getTime() - now.getTime() < fiveMinutes;
  };

  async function updateAuthState(user: User | null, session: Session | null) {
    if (isSessionExpired(session)) {
      console.log('Session is expiring soon, refreshing...');
      await refreshSession();
      return;
    }
    console.log('updateAuthState: Starting with user:', user?.id);
    try {
      if (!user) {
        console.log('updateAuthState: No user, clearing state');
        setState({ user: null, role: null, loading: false, session: null });
        return;
      }

      console.log('updateAuthState: Fetching user profile');
      const profilePromise = supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Add timeout to prevent infinite waiting
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      console.log('updateAuthState: Profile fetch complete', { profile, error: profileError });

      if (profileError) {
        console.error('updateAuthState: Profile fetch error:', profileError);
        // Don't throw error, just set state with available data
        setState({
          user,
          role: null,
          loading: false,
          session
        });
        return;
      }

      console.log('updateAuthState: Got profile:', profile);
      setState({
        user,
        role: profile?.role ?? null,
        loading: false,
        session
      });
    } catch (error) {
      console.error('Error in updateAuthState:', error);
      // Set state even if there's an error to prevent infinite loading
      setState({
        user,
        role: null,
        loading: false,
        session
      });
    }
  }

  useEffect(() => {
    let mounted = true;
    console.log('AuthProvider: Effect starting');

    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial getSession:', { session: session?.user?.id, error });
      
      if (!mounted) {
        console.log('Effect: Component unmounted, skipping update');
        return;
      }
      
      if (error) {
        console.error('Session fetch error:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      if (session?.user) {
        updateAuthState(session.user, session);
      } else {
        console.log('No initial session found');
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setState({ user: null, role: null, loading: false, session: null });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await updateAuthState(session?.user ?? null, session);
      }
    });

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refreshing session');
        refreshSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up periodic session refresh (every 2 minutes)
    const refreshInterval = setInterval(refreshSession, 2 * 60 * 1000);

    return () => {
      console.log('AuthProvider: Cleanup');
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setState({ user: null, role: null, loading: false, session: null });
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  if (state.loading) {
    console.log('AuthProvider: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshSession }}>
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