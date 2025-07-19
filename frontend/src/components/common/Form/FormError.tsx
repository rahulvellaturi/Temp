import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface FormErrorProps {
  message: string;
  className?: string;
  showIcon?: boolean;
}

const FormError: React.FC<FormErrorProps> = ({
  message,
  className,
  showIcon = true,
}) => {
  if (!message) return null;

  return (
    <div className={cn('flex items-center space-x-1 text-sm text-red-600', className)}>
      {showIcon && <AlertCircle className="h-4 w-4 flex-shrink-0" />}
      <span>{message}</span>
    </div>
  );
};

export default FormError;