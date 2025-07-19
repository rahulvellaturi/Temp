import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { useGenericForm } from '@/hooks/useGenericForm';
import { authSchemas } from '@/lib/validations';
import { ROUTES } from '@/lib/constants';
import { FormField, FormInput } from '@/components/common/Form';
import Button from '@/components/common/Button';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, mfaRequired, isAuthenticated } = useAppSelector((state) => state.auth);

  const form = useGenericForm({
    schema: authSchemas.login,
    defaultValues: {
      email: '',
      password: '',
      mfaToken: '',
      rememberMe: false,
    },
    showSuccessMessage: false,
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CLIENT.ROOT);
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: any) => {
    await dispatch(loginUser(data)).unwrap();
  };

  const handleTryAgain = () => {
    dispatch(clearError());
    reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-neutral-800">AssureMe</h1>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Or{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:text-primary/80">
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
            <FormField
              label="Email address"
              error={errors.email?.message}
              required
            >
              <FormInput
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                error={!!errors.email}
              />
            </FormField>

            <FormField
              label="Password"
              error={errors.password?.message}
              required
            >
              <FormInput
                {...register('password')}
                variant="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                error={!!errors.password}
              />
            </FormField>

            {mfaRequired && (
              <FormField
                label="MFA Code"
                error={errors.mfaToken?.message}
                description="Enter the 6-digit code from your authenticator app"
                required
              >
                <FormInput
                  {...register('mfaToken')}
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="Enter your MFA code"
                  error={!!errors.mfaToken}
                  maxLength={6}
                />
              </FormField>
            )}

            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                Remember me
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>

            <div className="text-center">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-600">
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
  );
};

export default LoginPage;