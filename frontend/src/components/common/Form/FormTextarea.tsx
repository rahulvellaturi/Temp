import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import FormField from './FormField';
import FormLabel from './FormLabel';
import FormError from './FormError';

export interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  helpText?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoGrow?: boolean;
}

const FormTextarea = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  size = 'md',
  variant = 'default',
  helpText,
  rows = 4,
  cols,
  maxLength,
  minLength,
  resize = 'vertical',
  autoGrow = false,
  ...props
}: FormTextareaProps<T>) => {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const baseClasses = [
          'block w-full rounded-lg border transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
        ];

        // Size classes
        const sizeClasses = {
          sm: 'px-3 py-2 text-sm',
          md: 'px-4 py-2.5 text-base',
          lg: 'px-4 py-3 text-lg',
        };

        // Variant classes
        const variantClasses = {
          default: fieldState.error
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400'
            : 'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400',
          filled: fieldState.error
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400'
            : 'border-neutral-300 bg-neutral-50 text-neutral-900 placeholder-neutral-400',
          outline: fieldState.error
            ? 'border-red-300 bg-transparent text-red-900 placeholder-red-400'
            : 'border-neutral-300 bg-transparent text-neutral-900 placeholder-neutral-400',
        };

        // Resize classes
        const resizeClasses = {
          none: 'resize-none',
          both: 'resize',
          horizontal: 'resize-x',
          vertical: 'resize-y',
        };

        const textareaClasses = [
          ...baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          resizeClasses[resize],
          autoGrow ? 'min-h-[2.5rem]' : '',
          className,
        ].join(' ');

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          field.onChange(e);
          
          // Auto-grow functionality
          if (autoGrow) {
            const target = e.target;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }
        };

        const characterCount = field.value ? String(field.value).length : 0;
        const showCharacterCount = maxLength && maxLength > 0;

        return (
          <div className="space-y-1">
            {label && (
              <FormLabel htmlFor={name} required={required}>
                {label}
              </FormLabel>
            )}
            
            <div className="relative">
              <textarea
                {...field}
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                rows={autoGrow ? 1 : rows}
                cols={cols}
                maxLength={maxLength}
                minLength={minLength}
                className={textareaClasses}
                onChange={handleChange}
                {...props}
              />
              
              {showCharacterCount && (
                <div className="absolute bottom-2 right-2 text-xs text-neutral-500 bg-white px-1 rounded">
                  {characterCount}/{maxLength}
                </div>
              )}
            </div>

            {helpText && !fieldState.error && (
              <p className="text-sm text-neutral-600">{helpText}</p>
            )}

            {showCharacterCount && !helpText && !fieldState.error && (
              <p className="text-sm text-neutral-500">
                {characterCount} / {maxLength} characters
              </p>
            )}

            <FormError name={name} />
          </div>
        );
      }}
    />
  );
};

export default FormTextarea;