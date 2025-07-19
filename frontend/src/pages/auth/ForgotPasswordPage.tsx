import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGenericForm } from '@/hooks/useGenericForm';
import { authSchemas } from '@/lib/validations';
import { ROUTES } from '@/lib/constants';
import { api } from '@/lib/api';
import { FormField, FormInput } from '@/components/common/Form';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useGenericForm({
    schema: authSchemas.forgotPassword,
    defaultValues: {
      email: '',
    },
    showSuccessMessage: false,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = form;

  const onSubmit = async (data: any) => {
    try {
      await api.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the form hook
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              We've sent a password reset link to <strong>{getValues('email')}</strong>
            </p>
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
                  Reset link sent!
                </h3>
                <p className="text-sm text-neutral-600 mb-6">
                  Please check your email and click the reset link to create a new password.
                  If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="space-y-4">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="primary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
                
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full text-sm text-primary hover:text-primary/80"
                >
                  Try a different email address
                </button>
              </div>
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="Email address"
              error={errors.email?.message}
              required
            >
              <FormInput
                {...register('email')}
                type="email"
                placeholder="Enter your email address"
                error={!!errors.email}
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
                Send Reset Link
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

export default ForgotPasswordPage;