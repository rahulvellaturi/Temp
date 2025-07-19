import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  title, 
  description, 
  onClick 
}) => {
  return (
    <div 
      className={cn(
        'card p-6',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-neutral-800">
            {title}
          </h3>
          {description && (
            <p className="text-neutral-600 text-sm mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;