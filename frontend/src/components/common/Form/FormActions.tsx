import React from 'react';

export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'centered' | 'split' | 'stacked';
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  className = '',
  variant = 'default',
  align = 'right',
  sticky = false,
}) => {
  const baseClasses = [
    'flex gap-3',
    sticky ? 'sticky bottom-0 bg-white border-t border-neutral-200 p-4 -mx-4 -mb-4' : '',
  ];

  const variantClasses = {
    default: {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    },
    centered: {
      left: 'justify-center',
      center: 'justify-center', 
      right: 'justify-center',
    },
    split: {
      left: 'justify-between',
      center: 'justify-between',
      right: 'justify-between',
    },
    stacked: {
      left: 'flex-col items-start',
      center: 'flex-col items-center',
      right: 'flex-col items-end',
    },
  };

  const classes = [
    ...baseClasses,
    variantClasses[variant][align],
    variant === 'stacked' ? 'gap-2' : 'gap-3',
    className,
  ].join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default FormActions;