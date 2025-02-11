import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RoleBasedRoute() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  switch (role) {
    case 'CupShup':
      return <Navigate to="/cupshup" replace />;
    case 'Vendor':
      return <Navigate to="/vendor" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}