import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../types/database';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true
  });

  useEffect(() => {
    let mounted = true;
    let initializing = true;
    console.log('AuthProvider: Starting initialization');

    async function updateAuthState(user: User | null) {
      if (!mounted) return;

      try {
        if (!user) {
          setState({ user: null, role: null, loading: false });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        if (mounted) {
          setState({
            user,
            role: profile?.role ?? null,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error in updateAuthState:', error);
        if (mounted) {
          setState({
            user,
            role: null,
            loading: false
          });
        }
      }
    }

    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session fetch error:', error);
        if (mounted) setState({ user: null, role: null, loading: false });
        return;
      }

      updateAuthState(session?.user ?? null).finally(() => {
        initializing = false;
      });
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip if we're still initializing to prevent double processing
      if (initializing) return;

      if (event === 'SIGNED_OUT') {
        if (mounted) setState({ user: null, role: null, loading: false });
        return;
      }

      await updateAuthState(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setState({ user: null, role: null, loading: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
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