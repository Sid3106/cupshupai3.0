import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { signIn } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] Starting sign in process...');
    setLoading(true);
    setError(null);

    const result = await signIn(email, password, rememberMe);
    
    if (result.error) {
      console.error('[Login] Sign in error:', result.error);
      setError(result.error);
      setLoading(false);
      return;
    }

    console.log('[Login] Sign in successful, navigating to home...');
    try {
      navigate('/');
      console.log('[Login] Navigation complete');
    } catch (navError) {
      console.error('[Login] Navigation error:', navError);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczODIzOTE0NiwiZXhwIjoxNzY5Nzc1MTQ2fQ.sW8QP195xXThQeE5yvBkLdyxtEH-Bwq2LVw0nERMb10" 
            alt="CupShup" 
            className="h-16 mb-4"
          />
          <h2 className="text-2xl font-bold text-primary">Let's Brew Innovation!</h2>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Welcome to CupShup. Enter your Email and Password to brew magic
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}