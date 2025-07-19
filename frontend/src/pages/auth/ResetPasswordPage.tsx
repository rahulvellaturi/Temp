import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGenericForm } from '@/hooks/useGenericForm';
import { authSchemas } from '@/lib/validations';
import { ROUTES } from '@/lib/constants';
import { api } from '@/lib/api';
import { FormField, FormInput } from '@/components/common/Form';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const form = useGenericForm({
    schema: authSchemas.resetPassword,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    showSuccessMessage: false,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: any) => {
    if (!token) return;
    
    try {
      await api.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the form hook
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
              Invalid Reset Link
            </h2>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Reset Link Invalid
                </h3>
                <p className="text-sm text-neutral-600 mb-6">
                  {tokenError}
                </p>
              </div>

              <div className="space-y-4">
                <Link to={ROUTES.FORGOT_PASSWORD}>
                  <Button variant="primary" className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link to={ROUTES.LOGIN} className="block text-center">
                  <button className="w-full text-sm text-primary hover:text-primary/80">
                    Back to Login
                  </button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
              Password Reset Successful
            </h2>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Password Updated!
                </h3>
                <p className="text-sm text-neutral-600 mb-6">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Go to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Enter your new password below
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="New Password"
              error={errors.password?.message}
              required
            >
              <FormInput
                {...register('password')}
                type="password"
                placeholder="Enter your new password"
                error={!!errors.password}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Confirm New Password"
              error={errors.confirmPassword?.message}
              required
            >
              <FormInput
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirm your new password"
                error={!!errors.confirmPassword}
                disabled={isSubmitting}
              />
            </FormField>

            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Reset Password
              </Button>

              <div className="text-center">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;