/**
 * Status utilities for consistent status handling across components
 * Eliminates duplicate status color and icon functions
 */

import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  User, 
  Shield,
  CreditCard,
  Home,
  Car,
  Heart,
  Activity
} from 'lucide-react';

// Status color mappings for different entity types
export const statusColors = {
  policy: {
    ACTIVE: 'success',
    INACTIVE: 'warning', 
    PENDING: 'warning',
    EXPIRED: 'error',
    CANCELLED: 'error',
    SUSPENDED: 'warning'
  },
  claim: {
    SUBMITTED: 'info',
    UNDER_REVIEW: 'warning',
    INVESTIGATING: 'warning', 
    APPROVED: 'success',
    DENIED: 'error',
    PAID: 'success',
    CLOSED: 'neutral'
  },
  payment: {
    PENDING: 'warning',
    COMPLETED: 'success', 
    PAID: 'success',
    FAILED: 'error',
    CANCELLED: 'error',
    REFUNDED: 'info',
    OVERDUE: 'error'
  },
  user: {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    SUSPENDED: 'error', 
    PENDING: 'warning',
    BLOCKED: 'error'
  },
  document: {
    UPLOADED: 'success',
    PROCESSING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    EXPIRED: 'error'
  }
} as const;

// Generic status colors for simple cases
export const genericStatusColors = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  PENDING: 'warning', 
  APPROVED: 'success',
  DENIED: 'error',
  CANCELLED: 'error',
  COMPLETED: 'success',
  FAILED: 'error',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

/**
 * Get status color for a specific entity type
 */
export const getStatusColor = (
  status: string, 
  type: keyof typeof statusColors = 'claim'
): string => {
  const statusMap = statusColors[type];
  return statusMap?.[status as keyof typeof statusMap] || 'neutral';
};

/**
 * Get generic status color (for backward compatibility)
 */
export const getGenericStatusColor = (status: string): string => {
  return genericStatusColors[status as keyof typeof genericStatusColors] || 'neutral';
};

/**
 * Get status icon component based on status
 */
export const getStatusIcon = (status: string, size: string = 'h-4 w-4') => {
  const iconClass = size;
  
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'COMPLETED':
    case 'PAID':
    case 'SUCCESS':
      return <CheckCircle className={iconClass} />;
      
    case 'PENDING':
    case 'UNDER_REVIEW':
    case 'INVESTIGATING':
    case 'PROCESSING':
      return <Clock className={iconClass} />;
      
    case 'DENIED':
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
    case 'BLOCKED':
    case 'REJECTED':
    case 'ERROR':
      return <XCircle className={iconClass} />;
      
    case 'INACTIVE':
    case 'SUSPENDED':
    case 'WARNING':
    case 'OVERDUE':
      return <AlertTriangle className={iconClass} />;
      
    default:
      return <FileText className={iconClass} />;
  }
};

/**
 * Get policy type icon
 */
export const getPolicyIcon = (type: string, size: string = 'h-4 w-4') => {
  const iconClass = size;
  
  switch (type.toUpperCase()) {
    case 'AUTO':
      return <Car className={iconClass} />;
    case 'HOME':
      return <Home className={iconClass} />;
    case 'LIFE':
      return <Heart className={iconClass} />;
    case 'HEALTH':
      return <Activity className={iconClass} />;
    default:
      return <Shield className={iconClass} />;
  }
};

/**
 * Get user role icon
 */
export const getUserRoleIcon = (role: string, size: string = 'h-4 w-4') => {
  const iconClass = size;
  
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return <Shield className={iconClass} />;
    case 'AGENT':
      return <User className={iconClass} />;
    case 'CLIENT':
    case 'CUSTOMER':
      return <User className={iconClass} />;
    default:
      return <User className={iconClass} />;
  }
};

/**
 * Get payment method icon
 */
export const getPaymentIcon = (method: string, size: string = 'h-4 w-4') => {
  const iconClass = size;
  
  switch (method.toUpperCase()) {
    case 'CREDIT_CARD':
    case 'DEBIT_CARD':
    case 'CARD':
      return <CreditCard className={iconClass} />;
    default:
      return <CreditCard className={iconClass} />;
  }
};

/**
 * Get status display text with proper formatting
 */
export const getStatusText = (status: string): string => {
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Check if status is considered "active" or "positive"
 */
export const isPositiveStatus = (status: string): boolean => {
  const positiveStatuses = [
    'ACTIVE', 'APPROVED', 'COMPLETED', 'PAID', 'SUCCESS'
  ];
  return positiveStatuses.includes(status.toUpperCase());
};

/**
 * Check if status is considered "negative" or "error"
 */
export const isNegativeStatus = (status: string): boolean => {
  const negativeStatuses = [
    'DENIED', 'FAILED', 'CANCELLED', 'EXPIRED', 'BLOCKED', 'REJECTED', 'ERROR'
  ];
  return negativeStatuses.includes(status.toUpperCase());
};

/**
 * Check if status is considered "pending" or "in progress"
 */
export const isPendingStatus = (status: string): boolean => {
  const pendingStatuses = [
    'PENDING', 'UNDER_REVIEW', 'INVESTIGATING', 'PROCESSING'
  ];
  return pendingStatuses.includes(status.toUpperCase());
};

/**
 * Get status priority for sorting (lower number = higher priority)
 */
export const getStatusPriority = (status: string): number => {
  const priorities: Record<string, number> = {
    'ERROR': 1,
    'FAILED': 1,
    'DENIED': 1,
    'EXPIRED': 1,
    'OVERDUE': 2,
    'PENDING': 3,
    'UNDER_REVIEW': 3,
    'INVESTIGATING': 3,
    'PROCESSING': 3,
    'WARNING': 4,
    'INACTIVE': 4,
    'SUSPENDED': 4,
    'ACTIVE': 5,
    'APPROVED': 5,
    'COMPLETED': 5,
    'PAID': 5,
    'SUCCESS': 5
  };
  
  return priorities[status.toUpperCase()] || 10;
};

/**
 * Status badge variant mapping
 */
export const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  if (isPositiveStatus(status)) return 'success';
  if (isNegativeStatus(status)) return 'error';
  if (isPendingStatus(status)) return 'warning';
  return 'neutral';
};