import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { useGenericForm } from '@/hooks/useGenericForm';
import { authSchemas } from '@/lib/validations';
import { ROUTES, USER_ROLES } from '@/lib/constants';
import { FormField, FormInput } from '@/components/common/Form';
import Button from '@/components/common/Button';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useGenericForm({
    schema: authSchemas.register,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      role: USER_ROLES.CLIENT,
      acceptTerms: false,
      acceptMarketing: false,
    },
    showSuccessMessage: true,
    successMessage: 'Registration successful! Welcome to AssureMe!',
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const watchPassword = watch('password');
  const watchEmail = watch('email');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CLIENT.ROOT);
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength
  useEffect(() => {
    if (watchPassword) {
      let strength = 0;
      if (watchPassword.length >= 8) strength += 1;
      if (/[A-Z]/.test(watchPassword)) strength += 1;
      if (/[a-z]/.test(watchPassword)) strength += 1;
      if (/\d/.test(watchPassword)) strength += 1;
      if (/[@$!%*?&]/.test(watchPassword)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchPassword]);

  const onSubmit = async (data: any) => {
    try {
      await dispatch(registerUser(data)).unwrap();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-800">AssureMe</h1>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">Create your account</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:text-primary/80">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4 pb-2 border-b">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  error={errors.firstName?.message}
                  required
                >
                  <FormInput
                    {...register('firstName')}
                    placeholder="Enter your first name"
                    error={!!errors.firstName}
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  error={errors.lastName?.message}
                  required
                >
                  <FormInput
                    {...register('lastName')}
                    placeholder="Enter your last name"
                    error={!!errors.lastName}
                  />
                </FormField>

                <FormField
                  label="Date of Birth"
                  error={errors.dateOfBirth?.message}
                  className="md:col-span-1"
                >
                  <FormInput
                    {...register('dateOfBirth')}
                    type="date"
                    error={!!errors.dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </FormField>

                <FormField
                  label="Phone Number"
                  error={errors.phone?.message}
                >
                  <FormInput
                    {...register('phone')}
                    type="tel"
                    placeholder="(555) 123-4567"
                    error={!!errors.phone}
                  />
                </FormField>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4 pb-2 border-b">
                Contact Information
              </h3>
              <div className="space-y-4">
                <FormField
                  label="Email Address"
                  error={errors.email?.message}
                  required
                >
                  <FormInput
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email address"
                    error={!!errors.email}
                  />
                </FormField>

                <FormField
                  label="Street Address"
                  error={errors.address?.message}
                >
                  <FormInput
                    {...register('address')}
                    placeholder="Enter your street address"
                    error={!!errors.address}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="City"
                    error={errors.city?.message}
                  >
                    <FormInput
                      {...register('city')}
                      placeholder="City"
                      error={!!errors.city}
                    />
                  </FormField>

                  <FormField
                    label="State"
                    error={errors.state?.message}
                  >
                    <select
                      {...register('state')}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                        errors.state ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="ZIP Code"
                    error={errors.zipCode?.message}
                  >
                    <FormInput
                      {...register('zipCode')}
                      placeholder="12345"
                      error={!!errors.zipCode}
                      maxLength={10}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4 pb-2 border-b">
                Account Security
              </h3>
              <div className="space-y-4">
                <FormField
                  label="Password"
                  error={errors.password?.message}
                  required
                  description="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                >
                  <div className="relative">
                    <FormInput
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      error={!!errors.password}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {watchPassword && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Password Strength:</span>
                        <span className={`font-medium ${
                          passwordStrength <= 1 ? 'text-red-600' :
                          passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </FormField>

                <FormField
                  label="Confirm Password"
                  error={errors.confirmPassword?.message}
                  required
                >
                  <div className="relative">
                    <FormInput
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      error={!!errors.confirmPassword}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormField>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  {...register('acceptTerms')}
                  id="accept-terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded mt-1"
                />
                <label htmlFor="accept-terms" className="ml-3 block text-sm text-neutral-900">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </Link>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600 ml-7">{errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start">
                <input
                  {...register('acceptMarketing')}
                  id="accept-marketing"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded mt-1"
                />
                <label htmlFor="accept-marketing" className="ml-3 block text-sm text-neutral-900">
                  I would like to receive marketing communications and updates about AssureMe products and services
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                size="lg"
                disabled={!watch('acceptTerms')}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>

            {/* Additional Information */}
            <div className="text-center text-sm text-neutral-600 pt-4 border-t">
              <p>
                By creating an account, you'll be able to:
              </p>
              <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Manage your insurance policies
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  File and track claims
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Make payments online
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Access important documents
                </li>
              </ul>
            </div>
          </form>
        </div>

        {/* Demo Information */}
        <div className="mt-8 text-center text-sm text-neutral-600">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Demo Information</h4>
            <p className="text-blue-700">
              This is a demonstration platform. You can create a test account to explore all features.
              All data is for demonstration purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;