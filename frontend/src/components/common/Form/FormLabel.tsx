import React from 'react';
import { cn } from '@/lib/utils';

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
}

const FormLabel: React.FC<FormLabelProps> = ({
  className,
  required,
  disabled,
  children,
  ...props
}) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none',
        {
          'text-neutral-700': !disabled,
          'text-neutral-400': disabled,
        },
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
};

export default FormLabel;