import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { addNotification } from '@/store/slices/uiSlice';

export interface UseGenericFormOptions<T extends FieldValues> extends UseFormProps<T> {
  schema?: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
  resetOnSuccess?: boolean;
  validateOnChange?: boolean;
}

export interface UseGenericFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  isSubmitting: boolean;
  submitError: string | null;
  handleSubmit: (onValid: (data: T) => Promise<void> | void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  resetForm: () => void;
  setFieldError: (field: Path<T>, message: string) => void;
  clearFieldError: (field: Path<T>) => void;
  clearAllErrors: () => void;
  isDirty: boolean;
  isValid: boolean;
}

export const useGenericForm = <T extends FieldValues>(
  options: UseGenericFormOptions<T> = {}
): UseGenericFormReturn<T> => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    schema,
    onSubmit,
    onSuccess,
    onError,
    showSuccessMessage = true,
    showErrorMessage = true,
    successMessage = 'Form submitted successfully',
    resetOnSuccess = false,
    validateOnChange = false,
    ...formOptions
  } = options;

  // Initialize form with schema resolver if provided
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: validateOnChange ? 'onChange' : 'onSubmit',
    ...formOptions,
  });

  const {
    handleSubmit: rhfHandleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isDirty, isValid },
  } = form;

  // Enhanced submit handler with error handling and notifications
  const handleSubmit = useCallback(
    (onValid: (data: T) => Promise<void> | void) => {
      return rhfHandleSubmit(async (data: T) => {
        setIsSubmitting(true);
        setSubmitError(null);
        clearErrors();

        try {
          // Call the provided onValid function or the default onSubmit
          await (onValid || onSubmit)?.(data);

          // Show success notification
          if (showSuccessMessage) {
            dispatch(addNotification({
              type: 'success',
              title: 'Success',
              message: successMessage,
              duration: 5000,
            }));
          }

          // Reset form if requested
          if (resetOnSuccess) {
            reset();
          }

          // Call success callback
          onSuccess?.(data);
        } catch (error: any) {
          const errorMessage = error.message || error.error || 'An error occurred';
          setSubmitError(errorMessage);

          // Handle validation errors
          if (error.details && Array.isArray(error.details)) {
            error.details.forEach((detail: { field: string; message: string }) => {
              setError(detail.field as Path<T>, {
                type: 'server',
                message: detail.message,
              });
            });
          }

          // Show error notification
          if (showErrorMessage) {
            dispatch(addNotification({
              type: 'error',
              title: 'Error',
              message: errorMessage,
              duration: 7000,
            }));
          }

          // Call error callback
          onError?.(error);
        } finally {
          setIsSubmitting(false);
        }
      });
    },
    [
      rhfHandleSubmit,
      onSubmit,
      onSuccess,
      onError,
      showSuccessMessage,
      showErrorMessage,
      successMessage,
      resetOnSuccess,
      reset,
      clearErrors,
      setError,
      dispatch,
    ]
  );

  // Helper functions
  const resetForm = useCallback(() => {
    reset();
    setSubmitError(null);
    clearErrors();
  }, [reset, clearErrors]);

  const setFieldError = useCallback((field: Path<T>, message: string) => {
    setError(field, { type: 'manual', message });
  }, [setError]);

  const clearFieldError = useCallback((field: Path<T>) => {
    clearErrors(field);
  }, [clearErrors]);

  const clearAllErrors = useCallback(() => {
    clearErrors();
    setSubmitError(null);
  }, [clearErrors]);

  return {
    ...form,
    isSubmitting,
    submitError,
    handleSubmit,
    resetForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    isDirty,
    isValid,
  };
};

// Specialized hooks for common form patterns
export const useLoginForm = () => {
  return useGenericForm({
    defaultValues: {
      email: '',
      password: '',
      mfaToken: '',
      rememberMe: false,
    } as any,
    showSuccessMessage: false, // Login success is handled by redirect
    successMessage: 'Login successful',
  });
};

export const useRegistrationForm = () => {
  return useGenericForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      acceptTerms: false,
    } as any,
    successMessage: 'Registration successful! Please check your email for verification.',
    resetOnSuccess: true,
  });
};

export const useProfileForm = (initialData?: any) => {
  return useGenericForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      ...initialData,
    } as any,
    successMessage: 'Profile updated successfully',
  });
};

export const useChangePasswordForm = () => {
  return useGenericForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    } as any,
    successMessage: 'Password changed successfully',
    resetOnSuccess: true,
  });
};

// Hook for dynamic forms with field arrays
export const useDynamicForm = <T extends FieldValues>(
  schema?: z.ZodSchema<T>,
  initialFields: Array<keyof T> = []
) => {
  const [visibleFields, setVisibleFields] = useState<Array<keyof T>>(initialFields);

  const form = useGenericForm<T>({
    schema,
    validateOnChange: true,
  });

  const showField = useCallback((field: keyof T) => {
    setVisibleFields(prev => [...new Set([...prev, field])]);
  }, []);

  const hideField = useCallback((field: keyof T) => {
    setVisibleFields(prev => prev.filter(f => f !== field));
    form.unregister(field as Path<T>);
  }, [form]);

  const toggleField = useCallback((field: keyof T) => {
    if (visibleFields.includes(field)) {
      hideField(field);
    } else {
      showField(field);
    }
  }, [visibleFields, showField, hideField]);

  return {
    ...form,
    visibleFields,
    showField,
    hideField,
    toggleField,
  };
};

// Hook for multi-step forms
export const useMultiStepForm = <T extends FieldValues>(
  steps: Array<{
    name: string;
    fields: Array<keyof T>;
    schema?: z.ZodSchema<Partial<T>>;
  }>,
  options?: UseGenericFormOptions<T>
) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useGenericForm<T>(options);

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const validateCurrentStep = useCallback(async () => {
    if (currentStepConfig.schema) {
      const stepData = currentStepConfig.fields.reduce((acc, field) => {
        acc[field] = form.getValues(field as Path<T>);
        return acc;
      }, {} as Partial<T>);

      const result = currentStepConfig.schema.safeParse(stepData);
      
      if (!result.success) {
        result.error.errors.forEach(error => {
          form.setError(error.path[0] as Path<T>, {
            type: 'validation',
            message: error.message,
          });
        });
        return false;
      }
    }
    return true;
  }, [currentStepConfig, form]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && !isLastStep) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => prev + 1);
    }
    return isValid;
  }, [validateCurrentStep, isLastStep, currentStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  return {
    ...form,
    currentStep,
    currentStepConfig,
    totalSteps: steps.length,
    completedSteps,
    isLastStep,
    isFirstStep,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
  };
};