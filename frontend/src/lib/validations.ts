import { z } from 'zod';
import { VALIDATION, USER_ROLES } from './constants';

// Base schemas for reusability
export const baseSchemas = {
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`)
    .max(VALIDATION.PASSWORD.MAX_LENGTH, `Password must be less than ${VALIDATION.PASSWORD.MAX_LENGTH} characters`)
    .regex(
      VALIDATION.PASSWORD.PATTERN,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || VALIDATION.PHONE.PATTERN.test(val),
      'Please enter a valid phone number'
    ),

  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  id: z.string().uuid('Invalid ID format'),

  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  search: z
    .string()
    .optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, 'Search term must be at least 2 characters'),

  file: z
    .instanceof(File)
    .refine((file) => file.size <= VALIDATION.FILE.MAX_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => VALIDATION.FILE.ALLOWED_TYPES.includes(file.type),
      'File type not supported'
    ),
};

// Authentication schemas
export const authSchemas = {
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, 'Password is required'),
    mfaToken: z.string().optional(),
    rememberMe: z.boolean().default(false),
  }),

  register: z
    .object({
      email: baseSchemas.email,
      password: baseSchemas.password,
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      firstName: baseSchemas.name,
      lastName: baseSchemas.name,
      phone: baseSchemas.phone,
      dateOfBirth: z.string().optional(),
      address: z.string().max(200).optional(),
      city: z.string().max(50).optional(),
      state: z.string().max(50).optional(),
      zipCode: z.string().max(10).optional(),
      role: z.nativeEnum(USER_ROLES).default(USER_ROLES.CLIENT),
      acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: baseSchemas.password,
      confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'New passwords do not match',
      path: ['confirmNewPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword'],
    }),

  forgotPassword: z.object({
    email: baseSchemas.email,
  }),

  resetPassword: z
    .object({
      token: z.string().min(1, 'Reset token is required'),
      password: baseSchemas.password,
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),

  mfaSetup: z.object({
    token: z.string().length(6, 'MFA token must be 6 digits').regex(/^\d+$/, 'MFA token must contain only numbers'),
  }),
};

// User management schemas
export const userSchemas = {
  profile: z.object({
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
    phone: baseSchemas.phone,
    dateOfBirth: z.string().optional(),
    address: z.string().max(200, 'Address must be less than 200 characters').optional(),
    city: z.string().max(50, 'City must be less than 50 characters').optional(),
    state: z.string().max(50, 'State must be less than 50 characters').optional(),
    zipCode: z.string().max(10, 'ZIP code must be less than 10 characters').optional(),
  }),

  adminUserCreate: z.object({
    email: baseSchemas.email,
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
    role: z.nativeEnum(USER_ROLES),
    phone: baseSchemas.phone,
    isActive: z.boolean().default(true),
  }),

  userSearch: z.object({
    search: baseSchemas.search,
    role: z.nativeEnum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
    ...baseSchemas.pagination.shape,
  }),
};

// Business entity schemas
export const businessSchemas = {
  policy: z.object({
    type: z.enum(['AUTO', 'HOME', 'LIFE', 'HEALTH', 'BUSINESS']),
    coverageAmount: z.number().positive('Coverage amount must be positive'),
    premium: z.number().positive('Premium must be positive'),
    deductible: z.number().min(0, 'Deductible cannot be negative'),
    startDate: z.string().refine((date) => new Date(date) > new Date(), 'Start date must be in the future'),
    endDate: z.string(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  }).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  }),

  claim: z.object({
    policyId: baseSchemas.id,
    type: z.enum(['ACCIDENT', 'THEFT', 'DAMAGE', 'MEDICAL', 'OTHER']),
    amount: z.number().positive('Claim amount must be positive'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
    incidentDate: z.string().refine((date) => new Date(date) <= new Date(), 'Incident date cannot be in the future'),
    documents: z.array(baseSchemas.file).max(10, 'Maximum 10 files allowed').optional(),
  }),

  payment: z.object({
    amount: z.number().positive('Payment amount must be positive'),
    method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CHECK', 'CASH']),
    reference: z.string().optional(),
    notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
  }),

  message: z.object({
    subject: z.string().min(1, 'Subject is required').max(100, 'Subject must be less than 100 characters'),
    content: z.string().min(1, 'Message content is required').max(2000, 'Message must be less than 2000 characters'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    attachments: z.array(baseSchemas.file).max(5, 'Maximum 5 attachments allowed').optional(),
  }),
};

// API response schemas for type safety
export const apiSchemas = {
  success: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.any().optional(),
  }),

  error: z.object({
    success: z.boolean(),
    error: z.string(),
    details: z.any().optional(),
  }),

  paginated: z.object({
    success: z.boolean(),
    data: z.array(z.any()),
    totalCount: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }),
};

// Utility functions for validation
export const validationUtils = {
  // Create conditional schema based on conditions
  conditional: <T>(condition: boolean, schema: z.ZodSchema<T>, fallback: z.ZodSchema<T>) =>
    condition ? schema : fallback,

  // Merge multiple schemas
  merge: <T, U>(schema1: z.ZodSchema<T>, schema2: z.ZodSchema<U>) =>
    schema1.merge(schema2),

  // Create optional version of schema
  optional: <T>(schema: z.ZodSchema<T>) => schema.optional(),

  // Create array version of schema with validation
  array: <T>(schema: z.ZodSchema<T>, min = 0, max?: number) => {
    let arraySchema = z.array(schema).min(min);
    if (max !== undefined) {
      arraySchema = arraySchema.max(max);
    }
    return arraySchema;
  },

  // Parse with better error handling
  safeParse: <T>(schema: z.ZodSchema<T>, data: unknown) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { success: false, errors };
    }
    return { success: true, data: result.data };
  },

  // Transform validation errors to user-friendly format
  formatErrors: (error: z.ZodError) => {
    return error.errors.reduce((acc, curr) => {
      const field = curr.path.join('.');
      acc[field] = curr.message;
      return acc;
    }, {} as Record<string, string>);
  },
};

// Export commonly used schemas
export const commonSchemas = {
  ...baseSchemas,
  ...authSchemas,
  ...userSchemas,
  ...businessSchemas,
  ...apiSchemas,
};

// Type exports for better TypeScript integration
export type LoginSchema = z.infer<typeof authSchemas.login>;
export type RegisterSchema = z.infer<typeof authSchemas.register>;
export type ProfileSchema = z.infer<typeof userSchemas.profile>;
export type PolicySchema = z.infer<typeof businessSchemas.policy>;
export type ClaimSchema = z.infer<typeof businessSchemas.claim>;
export type PaymentSchema = z.infer<typeof businessSchemas.payment>;
export type MessageSchema = z.infer<typeof businessSchemas.message>;