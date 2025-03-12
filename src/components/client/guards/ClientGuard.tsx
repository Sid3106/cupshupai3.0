import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ClientGuardProps {
  children: React.ReactNode;
}

export const ClientGuard: React.FC<ClientGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || profile?.role !== 'Client')) {
      navigate('/login');
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading || !user || profile?.role !== 'Client') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}; 