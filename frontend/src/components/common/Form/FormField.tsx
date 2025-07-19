import React from 'react';
import { cn } from '@/lib/utils';
import FormLabel from './FormLabel';
import FormError from './FormError';

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
  htmlFor?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  required,
  description,
  className,
  labelClassName,
  errorClassName,
  disabled,
  htmlFor,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <FormLabel
          htmlFor={htmlFor}
          required={required}
          disabled={disabled}
          className={labelClassName}
        >
          {label}
        </FormLabel>
      )}
      
      {description && (
        <p className="text-sm text-neutral-600 -mt-1">
          {description}
        </p>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <FormError
          message={error}
          className={errorClassName}
        />
      )}
    </div>
  );
};

export default FormField;