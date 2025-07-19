import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { initializeAuth, getCurrentUser } from '@/store/slices/authSlice';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Layout Components
import ClientLayout from '@/components/layout/ClientLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Client Pages
import ClientDashboard from '@/pages/client/Dashboard';
import ClientPolicies from '@/pages/client/Policies';
import ClientClaims from '@/pages/client/Claims';
import ClientPayments from '@/pages/client/Payments';
import ClientDocuments from '@/pages/client/Documents';
import ClientProfile from '@/pages/client/Profile';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminPolicies from '@/pages/admin/Policies';
import AdminClaims from '@/pages/admin/Claims';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import NotificationProvider from '@/components/ui/NotificationProvider';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
    
    // If token exists, get current user
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg font-medium text-neutral-700">Loading AssureMe...</div>
          <div className="text-sm text-neutral-500 mt-1">Please wait while we set up your account</div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary level="critical">
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/client" replace /> : (
                  <ErrorBoundary level="page">
                    <LoginPage />
                  </ErrorBoundary>
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? <Navigate to="/client" replace /> : (
                  <ErrorBoundary level="page">
                    <RegisterPage />
                  </ErrorBoundary>
                )
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                isAuthenticated ? <Navigate to="/client" replace /> : (
                  <ErrorBoundary level="page">
                    <ForgotPasswordPage />
                  </ErrorBoundary>
                )
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                isAuthenticated ? <Navigate to="/client" replace /> : (
                  <ErrorBoundary level="page">
                    <ResetPasswordPage />
                  </ErrorBoundary>
                )
              } 
            />
            
            {/* Client Portal Routes */}
            <Route 
              path="/client" 
              element={
                <ErrorBoundary level="page">
                  <ProtectedRoute requiredRole="CLIENT">
                    <ClientLayout />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            >
              <Route index element={
                <ErrorBoundary level="component">
                  <ClientDashboard />
                </ErrorBoundary>
              } />
              <Route path="policies" element={
                <ErrorBoundary level="component">
                  <ClientPolicies />
                </ErrorBoundary>
              } />
              <Route path="claims" element={
                <ErrorBoundary level="component">
                  <ClientClaims />
                </ErrorBoundary>
              } />
              <Route path="payments" element={
                <ErrorBoundary level="component">
                  <ClientPayments />
                </ErrorBoundary>
              } />
              <Route path="documents" element={
                <ErrorBoundary level="component">
                  <ClientDocuments />
                </ErrorBoundary>
              } />
              <Route path="profile" element={
                <ErrorBoundary level="component">
                  <ClientProfile />
                </ErrorBoundary>
              } />
            </Route>

            {/* Admin Portal Routes */}
            <Route 
              path="/admin" 
              element={
                <ErrorBoundary level="page">
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminLayout />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            >
              <Route index element={
                <ErrorBoundary level="component">
                  <AdminDashboard />
                </ErrorBoundary>
              } />
              <Route path="users" element={
                <ErrorBoundary level="component">
                  <AdminUsers />
                </ErrorBoundary>
              } />
              <Route path="policies" element={
                <ErrorBoundary level="component">
                  <AdminPolicies />
                </ErrorBoundary>
              } />
              <Route path="claims" element={
                <ErrorBoundary level="component">
                  <AdminClaims />
                </ErrorBoundary>
              } />
            </Route>

            {/* Default Redirect */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/client" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          <NotificationProvider />
          <Toaster />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;