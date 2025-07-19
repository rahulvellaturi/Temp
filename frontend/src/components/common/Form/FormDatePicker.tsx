import React, { useState } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Calendar, ChevronDown } from 'lucide-react';
import FormField from './FormField';
import FormLabel from './FormLabel';
import FormError from './FormError';

export interface FormDatePickerProps<T extends FieldValues> {
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
  minDate?: string;
  maxDate?: string;
  includeTime?: boolean;
  format?: 'date' | 'datetime-local' | 'time';
}

const FormDatePicker = <T extends FieldValues>({
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
  minDate,
  maxDate,
  includeTime = false,
  format = 'date',
  ...props
}: FormDatePickerProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

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

        const inputClasses = [
          ...baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          'pr-10',
          className,
        ].join(' ');

        const formatValue = (value: string) => {
          if (!value) return '';
          
          const date = new Date(value);
          if (isNaN(date.getTime())) return value;

          switch (format) {
            case 'date':
              return date.toISOString().split('T')[0];
            case 'datetime-local':
              return date.toISOString().slice(0, 16);
            case 'time':
              return date.toTimeString().slice(0, 5);
            default:
              return value;
          }
        };

        const displayValue = (value: string) => {
          if (!value) return '';
          
          const date = new Date(value);
          if (isNaN(date.getTime())) return value;

          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          };

          if (includeTime || format === 'datetime-local') {
            options.hour = '2-digit';
            options.minute = '2-digit';
          }

          if (format === 'time') {
            return date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });
          }

          return date.toLocaleDateString('en-US', options);
        };

        const inputType = format === 'time' ? 'time' : 
                         format === 'datetime-local' ? 'datetime-local' : 
                         'date';

        return (
          <div className="space-y-1">
            {label && (
              <FormLabel htmlFor={name} required={required}>
                {label}
              </FormLabel>
            )}
            
            <div className="relative">
              <input
                {...field}
                type={inputType}
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                min={minDate}
                max={maxDate}
                className={inputClasses}
                value={formatValue(field.value || '')}
                onChange={(e) => field.onChange(e.target.value)}
                {...props}
              />
              
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Calendar className="w-5 h-5 text-neutral-400" />
              </div>
            </div>

            {helpText && !fieldState.error && (
              <p className="text-sm text-neutral-600">{helpText}</p>
            )}

            <FormError name={name} />
          </div>
        );
      }}
    />
  );
};

export default FormDatePicker;