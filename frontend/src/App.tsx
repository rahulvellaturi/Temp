import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store/authStore';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Client pages
import ClientDashboard from '@/pages/client/Dashboard';
import ClientPolicies from '@/pages/client/Policies';
import ClientClaims from '@/pages/client/Claims';
import ClientPayments from '@/pages/client/Payments';
import ClientDocuments from '@/pages/client/Documents';
import ClientProfile from '@/pages/client/Profile';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminPolicies from '@/pages/admin/Policies';
import AdminClaims from '@/pages/admin/Claims';

// Layout components
import ClientLayout from '@/components/layout/ClientLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Protected Route component
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Client routes */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboard />} />
            <Route path="policies" element={<ClientPolicies />} />
            <Route path="claims" element={<ClientClaims />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'CLAIMS_ADJUSTER', 'BILLING_SPECIALIST']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="policies" element={<AdminPolicies />} />
            <Route path="claims" element={<AdminClaims />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={
            user ? (
              user.role === 'CLIENT' ? <Navigate to="/client" replace /> : <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;