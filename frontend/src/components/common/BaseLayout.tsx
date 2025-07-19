import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';

interface BaseLayoutProps {
  title: string;
  subtitle: string;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ 
  title, 
  subtitle, 
  navigation, 
  actions 
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-heading font-bold text-neutral-800">
                AssureMe
              </h1>
              {navigation}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-600">
                {subtitle}
              </div>
              {user && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Logout
                  </button>
                </div>
              )}
              {actions}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default BaseLayout;