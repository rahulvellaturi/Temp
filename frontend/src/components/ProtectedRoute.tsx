import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppDispatch';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'CLIENT' ? '/client' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;