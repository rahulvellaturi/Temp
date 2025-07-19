import React from 'react';
import { Control, FieldValues, Path, PathValue } from 'react-hook-form';
import FormField from './FormField';
import FormLabel from './FormLabel';
import FormError from './FormError';

export interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  helpText?: string;
  multiple?: boolean;
  searchable?: boolean;
}

const FormSelect = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select an option...',
  options = [],
  disabled = false,
  required = false,
  className = '',
  size = 'md',
  variant = 'default',
  helpText,
  multiple = false,
  searchable = false,
  ...props
}: FormSelectProps<T>) => {
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
            ? 'border-red-300 bg-red-50 text-red-900'
            : 'border-neutral-300 bg-neutral-50 text-neutral-900',
          outline: fieldState.error
            ? 'border-red-300 bg-transparent text-red-900'
            : 'border-neutral-300 bg-transparent text-neutral-900',
        };

        const selectClasses = [
          ...baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          'appearance-none bg-no-repeat bg-right',
          'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")]',
          'pr-10',
          className,
        ].join(' ');

        return (
          <div className="space-y-1">
            {label && (
              <FormLabel htmlFor={name} required={required}>
                {label}
              </FormLabel>
            )}
            
            <div className="relative">
              <select
                {...field}
                id={name}
                disabled={disabled}
                multiple={multiple}
                className={selectClasses}
                value={field.value || (multiple ? [] : '')}
                onChange={(e) => {
                  if (multiple) {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    field.onChange(values as PathValue<T, Path<T>>);
                  } else {
                    field.onChange(e.target.value as PathValue<T, Path<T>>);
                  }
                }}
                {...props}
              >
                {!multiple && placeholder && (
                  <option value="" disabled>
                    {placeholder}
                  </option>
                )}
                {options.map((option, index) => (
                  <option
                    key={`${option.value}-${index}`}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
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

export default FormSelect;