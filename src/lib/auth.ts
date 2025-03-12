import { supabase } from './supabase';

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

// Rate limiting for login attempts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<string, { count: number; timestamp: number }>();

export const checkLoginAttempts = (email: string): { allowed: boolean; waitTime?: number } => {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (attempts) {
    // Check if still in lockout period
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const timeSinceLockout = now - attempts.timestamp;
      if (timeSinceLockout < LOCKOUT_DURATION) {
        const waitTime = Math.ceil((LOCKOUT_DURATION - timeSinceLockout) / 1000 / 60);
        return { allowed: false, waitTime };
      }
      // Reset after lockout period
      loginAttempts.delete(email);
    }
  }

  return { allowed: true };
};

export const recordLoginAttempt = (email: string, success: boolean) => {
  if (success) {
    loginAttempts.delete(email);
    return;
  }

  const attempts = loginAttempts.get(email) || { count: 0, timestamp: Date.now() };
  attempts.count += 1;
  attempts.timestamp = Date.now();
  loginAttempts.set(email, attempts);
};

// Sign up with email
export const signUp = async (email: string, password: string) => {
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return { error: emailValidation.error };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { error: passwordValidation.error };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role: 'Client'
        }
      }
    });

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An error occurred during sign up'
    };
  }
};

// Sign in with email
export const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
  console.log('[Auth] Starting sign in process for:', email);
  
  // Check rate limiting
  const { allowed, waitTime } = checkLoginAttempts(email);
  if (!allowed) {
    console.log('[Auth] Rate limit exceeded. Wait time:', waitTime);
    return { 
      error: `Too many login attempts. Please try again in ${waitTime} minutes.`
    };
  }

  try {
    console.log('[Auth] Attempting Supabase authentication...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Supabase auth error:', error);
      recordLoginAttempt(email, false);
      throw error;
    }

    console.log('[Auth] Authentication successful:', {
      user: data.user?.id,
      role: data.user?.user_metadata?.role,
      session: !!data.session
    });

    recordLoginAttempt(email, true);

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      console.log('[Auth] Remember me enabled');
    } else {
      localStorage.removeItem('rememberMe');
      console.log('[Auth] Remember me disabled');
    }

    return { data, success: true };
  } catch (error) {
    console.error('[Auth] Sign in error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An error occurred during sign in'
    };
  }
};