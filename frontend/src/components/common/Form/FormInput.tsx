import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'search' | 'password';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      type = 'text',
      error,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      loading,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalType, setInternalType] = useState(type);

    // Handle password visibility toggle
    React.useEffect(() => {
      if (variant === 'password') {
        setInternalType(showPassword ? 'text' : 'password');
      } else {
        setInternalType(type);
      }
    }, [variant, showPassword, type]);

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-4 text-base',
    };

    const baseClasses = cn(
      'flex w-full rounded-md border bg-white transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-neutral-500',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      sizeClasses[size],
      {
        'border-neutral-300 focus-visible:ring-primary': !error,
        'border-red-500 focus-visible:ring-red-500': error,
        'pl-10': leftIcon || variant === 'search',
        'pr-10': rightIcon || clearable || variant === 'password' || loading,
      },
      className
    );

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        {/* Left Icon */}
        {(leftIcon || variant === 'search') && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {leftIcon || (variant === 'search' && <Search className="h-4 w-4" />)}
          </div>
        )}

        {/* Input */}
        <input
          type={internalType}
          className={baseClasses}
          ref={ref}
          disabled={disabled || loading}
          value={value}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {/* Loading Spinner */}
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-primary" />
          )}

          {/* Clear Button */}
          {clearable && value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
              tabIndex={-1}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Password Toggle */}
          {variant === 'password' && !loading && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {/* Custom Right Icon */}
          {rightIcon && !loading && !clearable && variant !== 'password' && (
            <div className="text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;