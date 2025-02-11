import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        console.log('Auth callback - Raw hash:', hash);

        if (hash) {
          // Parse the hash (remove the leading #)
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const type = params.get('type');
          const refreshToken = params.get('refresh_token');

          console.log('Auth callback - Parsed params:', {
            type,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          });

          if (type === 'recovery' && accessToken) {
            // For password reset flow
            console.log('Auth callback - Valid recovery flow detected');

            // Navigate to reset password with the full hash
            // This preserves all the token information
            navigate(`/reset-password${hash}`, { replace: true });
            return;
          }
        }

        // Handle error cases
        const params = new URLSearchParams(location.search);
        const errorMessage = params.get('error_description');
        
        if (errorMessage) {
          console.log('Auth callback - Error detected:', errorMessage);
          navigate('/login', {
            state: { message: decodeURIComponent(errorMessage) },
            replace: true
          });
        } else {
          console.log('Auth callback - No valid flow detected');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback - Error:', error);
        navigate('/login', {
          state: { message: 'An error occurred during authentication' },
          replace: true
        });
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}