// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    MFA: {
      SETUP: '/auth/mfa/setup',
      VERIFY: '/auth/mfa/verify',
      DISABLE: '/auth/mfa/disable',
    },
  },
  USERS: '/users',
  POLICIES: '/policies',
  CLAIMS: '/claims',
  PAYMENTS: '/payments',
  DOCUMENTS: '/documents',
  MESSAGES: '/messages',
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CLIENT: {
    ROOT: '/client',
    DASHBOARD: '/client',
    POLICIES: '/client/policies',
    CLAIMS: '/client/claims',
    PAYMENTS: '/client/payments',
    DOCUMENTS: '/client/documents',
    PROFILE: '/client/profile',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    POLICIES: '/admin/policies',
    CLAIMS: '/admin/claims',
    REPORTS: '/admin/reports',
  },
} as const;

// User Roles
export const USER_ROLES = {
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLAIMS_ADJUSTER: 'CLAIMS_ADJUSTER',
  BILLING_SPECIALIST: 'BILLING_SPECIALIST',
} as const;

// Status Constants
export const STATUS = {
  POLICY: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
  },
  CLAIM: {
    SUBMITTED: 'SUBMITTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    APPROVED: 'APPROVED',
    DENIED: 'DENIED',
    PAID: 'PAID',
  },
  PAYMENT: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  },
} as const;

// UI Constants
export const UI = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      EASE_IN: 'ease-in',
      EASE_OUT: 'ease-out',
      EASE_IN_OUT: 'ease-in-out',
    },
  },
  NOTIFICATION: {
    DURATION: {
      SHORT: 3000,
      MEDIUM: 5000,
      LONG: 7000,
    },
    MAX_VISIBLE: 5,
  },
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^\+?[\d\s-()]+$/,
  },
  FILE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
  },
} as const;

// Environment Variables
export const ENV = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  NODE_ENV: process.env.NODE_ENV || 'development',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
} as const;

// Feature Flags
export const FEATURES = {
  MFA_ENABLED: true,
  DARK_MODE: true,
  FILE_UPLOAD: true,
  NOTIFICATIONS: true,
  ANALYTICS: process.env.NODE_ENV === 'production',
  DEBUG: process.env.NODE_ENV === 'development',
} as const;

// Default Values
export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
  },
  DEBOUNCE_DELAY: 300,
  RETRY_ATTEMPTS: 3,
  TIMEOUT: 30000,
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
export type Routes = typeof ROUTES;
export type UserRole = keyof typeof USER_ROLES;
export type PolicyStatus = keyof typeof STATUS.POLICY;
export type ClaimStatus = keyof typeof STATUS.CLAIM;
export type PaymentStatus = keyof typeof STATUS.PAYMENT;