import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters';

interface StatsCardProps {
  title: string;
  value: string | number;
  format?: 'currency' | 'number' | 'percentage' | 'custom';
  icon?: LucideIcon;
  iconColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink' | 'gray';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  description?: string;
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  format = 'custom',
  icon: Icon,
  iconColor = 'blue',
  change,
  description,
  loading = false,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'number':
        return formatNumber(val);
      case 'percentage':
        return formatPercentage(val);
      default:
        return String(val);
    }
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500',
    pink: 'text-pink-500',
    gray: 'text-gray-500'
  };

  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'h-6 w-6',
      title: 'text-xs',
      value: 'text-lg',
      change: 'text-xs',
      description: 'text-xs'
    },
    md: {
      container: 'p-6',
      icon: 'h-8 w-8',
      title: 'text-sm',
      value: 'text-2xl',
      change: 'text-sm',
      description: 'text-sm'
    },
    lg: {
      container: 'p-8',
      icon: 'h-10 w-10',
      title: 'text-base',
      value: 'text-3xl',
      change: 'text-base',
      description: 'text-base'
    }
  };

  const variantClasses = {
    default: 'bg-white border border-neutral-200 shadow-sm',
    outlined: 'bg-white border-2 border-neutral-300',
    filled: 'bg-neutral-50 border border-neutral-200'
  };

  const classes = sizeClasses[size];

  if (loading) {
    return (
      <div className={`${variantClasses[variant]} rounded-lg ${classes.container} ${className} animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 rounded mb-2"></div>
            <div className="h-8 bg-neutral-200 rounded mb-2"></div>
            {change && <div className="h-3 bg-neutral-200 rounded w-20"></div>}
          </div>
          {Icon && (
            <div className={`${classes.icon} bg-neutral-200 rounded`}></div>
          )}
        </div>
        {description && (
          <div className="mt-3 h-3 bg-neutral-200 rounded"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`${variantClasses[variant]} rounded-lg ${classes.container} ${className} transition-shadow hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`font-medium text-neutral-600 ${classes.title}`}>
            {title}
          </p>
          <p className={`font-bold text-neutral-900 ${classes.value} mt-1`}>
            {formatValue(value)}
          </p>
          {change && (
            <div className={`flex items-center mt-2 ${classes.change}`}>
              <span className={`font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? '↗' : '↘'} {formatPercentage(Math.abs(change.value))}
              </span>
              {change.period && (
                <span className="text-neutral-500 ml-1">
                  {change.period}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <Icon className={`${classes.icon} ${iconColorClasses[iconColor]} flex-shrink-0`} />
        )}
      </div>
      {description && (
        <p className={`text-neutral-500 mt-3 ${classes.description}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default StatsCard;

// Grid wrapper for multiple stats cards
export const StatsGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  cols = 4, 
  gap = 'md',
  className = '' 
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Specialized stats card variants
export const MetricCard: React.FC<{
  title: string;
  value: number;
  target?: number;
  unit?: string;
  icon?: LucideIcon;
  iconColor?: StatsCardProps['iconColor'];
  className?: string;
}> = ({ title, value, target, unit, icon, iconColor, className }) => {
  const percentage = target ? (value / target) * 100 : 0;
  const isOnTarget = percentage >= 100;

  return (
    <StatsCard
      title={title}
      value={unit ? `${formatNumber(value)} ${unit}` : formatNumber(value)}
      icon={icon}
      iconColor={iconColor}
      description={target ? `${formatPercentage(percentage)} of target (${formatNumber(target)}${unit ? ` ${unit}` : ''})` : undefined}
      className={className}
      change={target ? {
        value: percentage - 100,
        type: isOnTarget ? 'increase' : 'decrease'
      } : undefined}
    />
  );
};

export const ProgressCard: React.FC<{
  title: string;
  value: number;
  max: number;
  icon?: LucideIcon;
  iconColor?: StatsCardProps['iconColor'];
  showPercentage?: boolean;
  className?: string;
}> = ({ title, value, max, icon, iconColor, showPercentage = true, className }) => {
  const percentage = (value / max) * 100;

  return (
    <div className={`bg-white border border-neutral-200 shadow-sm rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">
            {formatNumber(value)}{showPercentage && ` / ${formatNumber(max)}`}
          </p>
        </div>
        {icon && (
          <icon className={`h-8 w-8 ${iconColor ? `text-${iconColor}-500` : 'text-blue-500'} flex-shrink-0`} />
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {showPercentage && (
        <p className="text-sm text-neutral-500 mt-2">
          {formatPercentage(percentage)} complete
        </p>
      )}
    </div>
  );
};