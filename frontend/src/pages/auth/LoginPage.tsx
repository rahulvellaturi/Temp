import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'CLIENT' ? '/client' : '/admin';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-neutral-800">
            AssureMe
          </h1>
          <p className="mt-2 text-neutral-600">Sign in to your account</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input-field mt-1"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field mt-1"
              placeholder="Enter your password"
            />
          </div>
          
          <button className="w-full btn-primary py-2 px-4 rounded-md font-medium">
            Sign In
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;