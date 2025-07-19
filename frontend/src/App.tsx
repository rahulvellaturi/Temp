import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { initializeAuth, getCurrentUser } from '@/store/slices/authSlice';

// Layout Components
import ClientLayout from '@/components/layout/ClientLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/client" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? <Navigate to="/client" replace /> : <RegisterPage />
            } 
          />
          
          {/* Client Portal Routes */}
          <Route 
            path="/client" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="policies" element={<ClientPolicies />} />
            <Route path="claims" element={<ClientClaims />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="policies" element={<AdminPolicies />} />
            <Route path="claims" element={<AdminClaims />} />
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
      </div>
    </Router>
  );
}

export default App;