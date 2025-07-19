import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Check } from 'lucide-react';
import FormField from './FormField';
import FormError from './FormError';

export interface FormCheckboxProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'switch';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
}

const FormCheckbox = <T extends FieldValues>({
  name,
  control,
  label,
  description,
  disabled = false,
  required = false,
  className = '',
  size = 'md',
  variant = 'default',
  color = 'primary',
  indeterminate = false,
  ...props
}: FormCheckboxProps<T>) => {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const isChecked = !!field.value;

        // Size classes
        const sizeClasses = {
          sm: {
            checkbox: 'w-4 h-4',
            label: 'text-sm',
            description: 'text-xs',
          },
          md: {
            checkbox: 'w-5 h-5',
            label: 'text-base',
            description: 'text-sm',
          },
          lg: {
            checkbox: 'w-6 h-6',
            label: 'text-lg',
            description: 'text-base',
          },
        };

        // Color classes
        const colorClasses = {
          primary: {
            checked: 'bg-primary border-primary text-white',
            unchecked: 'bg-white border-neutral-300',
            focus: 'focus:ring-primary focus:ring-offset-0',
          },
          success: {
            checked: 'bg-green-600 border-green-600 text-white',
            unchecked: 'bg-white border-neutral-300',
            focus: 'focus:ring-green-500 focus:ring-offset-0',
          },
          warning: {
            checked: 'bg-yellow-500 border-yellow-500 text-white',
            unchecked: 'bg-white border-neutral-300',
            focus: 'focus:ring-yellow-400 focus:ring-offset-0',
          },
          danger: {
            checked: 'bg-red-600 border-red-600 text-white',
            unchecked: 'bg-white border-neutral-300',
            focus: 'focus:ring-red-500 focus:ring-offset-0',
          },
        };

        const baseCheckboxClasses = [
          'rounded border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer',
        ];

        const checkboxClasses = [
          ...baseCheckboxClasses,
          sizeClasses[size].checkbox,
          colorClasses[color].focus,
          isChecked || indeterminate 
            ? colorClasses[color].checked 
            : colorClasses[color].unchecked,
          fieldState.error ? 'border-red-300' : '',
          className,
        ].join(' ');

        if (variant === 'switch') {
          const switchClasses = [
            'relative inline-flex items-center cursor-pointer',
            'transition-colors duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            colorClasses[color].focus,
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ');

          const switchBgClasses = [
            'block w-11 h-6 rounded-full transition-colors duration-200',
            isChecked ? colorClasses[color].checked.split(' ')[0] : 'bg-neutral-300',
          ].join(' ');

          const switchToggleClasses = [
            'absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200',
            'shadow-sm',
            isChecked ? 'transform translate-x-5' : '',
          ].join(' ');

          return (
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  disabled={disabled}
                  className={switchClasses}
                  onClick={() => field.onChange(!isChecked)}
                >
                  <span className={switchBgClasses}>
                    <span className={switchToggleClasses} />
                  </span>
                </button>
                
                {label && (
                  <label 
                    className={`${sizeClasses[size].label} font-medium text-neutral-700 cursor-pointer`}
                    onClick={() => !disabled && field.onChange(!isChecked)}
                  >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
              </div>
              
              {description && (
                <p className={`${sizeClasses[size].description} text-neutral-600 ml-14`}>
                  {description}
                </p>
              )}

              <FormError name={name} />
            </div>
          );
        }

        return (
          <div className="space-y-1">
            <div className="flex items-start space-x-3">
              <div className="relative flex items-center">
                <input
                  {...field}
                  type="checkbox"
                  id={name}
                  disabled={disabled}
                  checked={isChecked}
                  ref={(el) => {
                    field.ref(el);
                    if (el && indeterminate) {
                      el.indeterminate = true;
                    }
                  }}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="sr-only"
                  {...props}
                />
                
                <div 
                  className={checkboxClasses}
                  onClick={() => !disabled && field.onChange(!isChecked)}
                >
                  {(isChecked || indeterminate) && (
                    <Check 
                      className={`${sizeClasses[size].checkbox.replace('w-', 'w-').replace('h-', 'h-')} text-current`}
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>

              {label && (
                <label 
                  htmlFor={name}
                  className={`${sizeClasses[size].label} font-medium text-neutral-700 cursor-pointer flex-1`}
                >
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
            </div>

            {description && (
              <p className={`${sizeClasses[size].description} text-neutral-600 ml-8`}>
                {description}
              </p>
            )}

            <FormError name={name} />
          </div>
        );
      }}
    />
  );
};

export default FormCheckbox;