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

  // Check role-based access if required.
  // The backend exposes several admin-type roles (ADMIN, SUPER_ADMIN,
  // CLAIMS_ADJUSTER, BILLING_SPECIALIST); any of them may access ADMIN routes.
  const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CLAIMS_ADJUSTER', 'BILLING_SPECIALIST'];
  const isAdminRole = ADMIN_ROLES.includes(user.role);

  const hasAccess = (() => {
    if (!requiredRole) return true;
    if (requiredRole === 'ADMIN') return isAdminRole;
    if (requiredRole === 'CLIENT') return user.role === 'CLIENT';
    return user.role === requiredRole;
  })();

  if (!hasAccess) {
    // Redirect to the dashboard that matches the user's role. Using the
    // role (not the failed requiredRole) prevents an infinite redirect loop.
    const redirectPath = user.role === 'CLIENT' ? '/client' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;