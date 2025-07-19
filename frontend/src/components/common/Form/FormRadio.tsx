import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import FormField from './FormField';
import FormLabel from './FormLabel';
import FormError from './FormError';

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FormRadioProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: RadioOption[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'inline';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  helpText?: string;
}

const FormRadio = <T extends FieldValues>({
  name,
  control,
  label,
  options = [],
  disabled = false,
  required = false,
  className = '',
  size = 'md',
  variant = 'default',
  color = 'primary',
  helpText,
  ...props
}: FormRadioProps<T>) => {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Size classes
        const sizeClasses = {
          sm: {
            radio: 'w-4 h-4',
            label: 'text-sm',
            description: 'text-xs',
          },
          md: {
            radio: 'w-5 h-5',
            label: 'text-base',
            description: 'text-sm',
          },
          lg: {
            radio: 'w-6 h-6',
            label: 'text-lg',
            description: 'text-base',
          },
        };

        // Color classes
        const colorClasses = {
          primary: {
            checked: 'border-primary bg-primary',
            unchecked: 'border-neutral-300 bg-white',
            focus: 'focus:ring-primary',
            dot: 'bg-white',
          },
          success: {
            checked: 'border-green-600 bg-green-600',
            unchecked: 'border-neutral-300 bg-white',
            focus: 'focus:ring-green-500',
            dot: 'bg-white',
          },
          warning: {
            checked: 'border-yellow-500 bg-yellow-500',
            unchecked: 'border-neutral-300 bg-white',
            focus: 'focus:ring-yellow-400',
            dot: 'bg-white',
          },
          danger: {
            checked: 'border-red-600 bg-red-600',
            unchecked: 'border-neutral-300 bg-white',
            focus: 'focus:ring-red-500',
            dot: 'bg-white',
          },
        };

        const baseRadioClasses = [
          'rounded-full border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer relative',
        ];

        const containerClasses = {
          default: 'space-y-3',
          card: 'space-y-2',
          inline: 'flex flex-wrap gap-4',
        };

        const optionClasses = {
          default: 'flex items-start space-x-3',
          card: 'flex items-start space-x-3 p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors',
          inline: 'flex items-center space-x-2',
        };

        return (
          <div className="space-y-2">
            {label && (
              <FormLabel required={required}>
                {label}
              </FormLabel>
            )}

            <div className={`${containerClasses[variant]} ${className}`}>
              {options.map((option, index) => {
                const isSelected = field.value === option.value;
                const isDisabled = disabled || option.disabled;
                const optionId = `${name}-${index}`;

                const radioClasses = [
                  ...baseRadioClasses,
                  sizeClasses[size].radio,
                  colorClasses[color].focus,
                  isSelected 
                    ? colorClasses[color].checked 
                    : colorClasses[color].unchecked,
                  fieldState.error ? 'border-red-300' : '',
                ].join(' ');

                const cardClasses = variant === 'card' ? [
                  optionClasses[variant],
                  isSelected ? 'border-primary bg-primary/5' : '',
                  fieldState.error ? 'border-red-300' : '',
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ') : optionClasses[variant];

                return (
                  <div
                    key={option.value}
                    className={cardClasses}
                    onClick={() => {
                      if (!isDisabled) {
                        field.onChange(option.value);
                      }
                    }}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        id={optionId}
                        name={name}
                        value={option.value}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => field.onChange(option.value)}
                        className="sr-only"
                        {...props}
                      />
                      
                      <div className={radioClasses}>
                        {isSelected && (
                          <div 
                            className={`absolute inset-1 rounded-full ${colorClasses[color].dot}`}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <label 
                        htmlFor={optionId}
                        className={`${sizeClasses[size].label} font-medium text-neutral-700 cursor-pointer block`}
                      >
                        {option.label}
                      </label>
                      
                      {option.description && (
                        <p className={`${sizeClasses[size].description} text-neutral-600 mt-1`}>
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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

export default FormRadio;