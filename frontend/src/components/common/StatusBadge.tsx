import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span className={cn(
      'status-badge',
      getStatusColor(status),
      className
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;