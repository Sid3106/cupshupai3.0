import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../types/database';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role as UserRole)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<UserRole, string> = {
      CupShup: '/cupshup',
      Vendor: '/vendor',
      Client: '/client',
      Admin: '/cupshup' // Admin defaults to CupShup dashboard
    };
    
    const redirectPath = profile?.role ? roleRedirects[profile.role] : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}