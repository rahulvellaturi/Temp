import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { loginUser, clearError } from '@/store/slices/authSlice';
import Button from '@/components/common/Button';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  mfaToken: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, mfaRequired, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showMfaInput, setShowMfaInput] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Show MFA input if required
    if (mfaRequired) {
      setShowMfaInput(true);
    }
  }, [mfaRequired]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/client');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error handling is done in the Redux slice
      console.error('Login failed:', error);
    }
  };

  const handleTryAgain = () => {
    setShowMfaInput(false);
    dispatch(clearError());
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-heading font-bold text-neutral-800">
            AssureMe
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-neutral-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
              {mfaRequired && (
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try again without MFA
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {(showMfaInput || mfaRequired) && (
              <div>
                <label htmlFor="mfaToken" className="block text-sm font-medium text-neutral-700">
                  MFA Code
                </label>
                <input
                  {...register('mfaToken')}
                  type="text"
                  autoComplete="one-time-code"
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your MFA code"
                />
                {errors.mfaToken && (
                  <p className="mt-1 text-sm text-red-600">{errors.mfaToken.message}</p>
                )}
                <p className="mt-1 text-sm text-neutral-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        <div className="mt-6">
          <div className="text-center text-sm text-neutral-600">
            <p>Demo Accounts:</p>
            <p className="mt-1">
              <strong>Client:</strong> john.doe@email.com / password123
            </p>
            <p>
              <strong>Admin:</strong> admin@assureme.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;