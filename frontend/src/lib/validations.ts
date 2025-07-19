import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
const zipCodeRegex = /^\d{5}(-\d{4})?$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Auth Schemas
export const authSchemas = {
  login: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  register: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(strongPasswordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().regex(zipCodeRegex, 'Please enter a valid ZIP code').optional().or(z.literal('')),
    role: z.enum(['CLIENT', 'AGENT', 'ADMIN']).default('CLIENT'),
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
    acceptMarketing: z.boolean().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(strongPasswordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  forgotPassword: z.object({
    email: z.string().email('Please enter a valid email address'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(strongPasswordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  mfaSetup: z.object({
    code: z.string().length(6, 'Verification code must be 6 digits'),
  }),
};

// User Profile Schemas
export const userSchemas = {
  updateProfile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().regex(zipCodeRegex, 'Please enter a valid ZIP code').optional().or(z.literal('')),
  }),

  updatePreferences: z.object({
    language: z.enum(['en', 'es', 'fr']).default('en'),
    timezone: z.string().default('America/New_York'),
    currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
    notifications: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true),
    }),
  }),
};

// Claim Schemas
export const claimSchemas = {
  newClaim: z.object({
    policyId: z.string().min(1, 'Please select a policy'),
    type: z.string().min(1, 'Please select a claim type'),
    incidentDate: z.string().min(1, 'Incident date is required'),
    location: z.string().optional(),
    description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
    estimatedAmount: z.number().min(0, 'Amount must be positive').optional(),
    policeReportNumber: z.string().optional(),
    witnesses: z.string().optional(),
  }),

  updateClaim: z.object({
    description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)').optional(),
    estimatedAmount: z.number().min(0, 'Amount must be positive').optional(),
    additionalInfo: z.string().optional(),
  }),

  claimComment: z.object({
    claimId: z.string().min(1, 'Claim ID is required'),
    comment: z.string().min(1, 'Comment cannot be empty'),
  }),
};

// Payment Schemas
export const paymentSchemas = {
  makePayment: z.object({
    policyId: z.string().min(1, 'Please select a policy'),
    amount: z.number().min(0.01, 'Amount must be greater than $0.01'),
    paymentMethodId: z.string().min(1, 'Please select a payment method'),
    saveCard: z.boolean().optional(),
  }),

  addPaymentMethod: z.object({
    cardNumber: z.string()
      .min(13, 'Card number must be at least 13 digits')
      .max(19, 'Card number must be at most 19 digits')
      .regex(/^\d+$/, 'Card number must contain only digits'),
    expiryMonth: z.number().min(1).max(12),
    expiryYear: z.number().min(new Date().getFullYear()),
    cvv: z.string().min(3, 'CVV must be at least 3 digits').max(4, 'CVV must be at most 4 digits'),
    cardholderName: z.string().min(1, 'Cardholder name is required'),
    nickname: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),

  updatePaymentMethod: z.object({
    nickname: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
};

// Policy Schemas
export const policySchemas = {
  requestQuote: z.object({
    type: z.enum(['AUTO', 'HOME', 'LIFE', 'HEALTH', 'BUSINESS']),
    coverage: z.number().min(1000, 'Coverage amount must be at least $1,000'),
    deductible: z.number().min(0, 'Deductible must be positive'),
    personalInfo: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Please enter a valid email address'),
      phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
      dateOfBirth: z.string().min(1, 'Date of birth is required'),
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().regex(zipCodeRegex, 'Please enter a valid ZIP code'),
    }),
    additionalInfo: z.record(z.any()).optional(),
  }),

  updatePolicy: z.object({
    coverage: z.number().min(1000, 'Coverage amount must be at least $1,000').optional(),
    deductible: z.number().min(0, 'Deductible must be positive').optional(),
    beneficiaries: z.array(z.string()).optional(),
    additionalInfo: z.record(z.any()).optional(),
  }),
};

// Document Schemas
export const documentSchemas = {
  uploadDocument: z.object({
    name: z.string().min(1, 'Document name is required'),
    type: z.enum(['POLICY', 'CLAIM', 'PAYMENT', 'ID_CARD', 'CERTIFICATE', 'OTHER']),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isConfidential: z.boolean().default(false),
    policyId: z.string().optional(),
    claimId: z.string().optional(),
  }),

  updateDocument: z.object({
    name: z.string().min(1, 'Document name is required').optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isConfidential: z.boolean().optional(),
  }),
};

// Business Entity Schemas
export const businessSchemas = {
  createPolicy: z.object({
    policyNumber: z.string().min(1, 'Policy number is required'),
    type: z.enum(['AUTO', 'HOME', 'LIFE', 'HEALTH', 'BUSINESS']),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']).default('PENDING'),
    premium: z.number().min(0, 'Premium must be positive'),
    coverage: z.number().min(1000, 'Coverage amount must be at least $1,000'),
    deductible: z.number().min(0, 'Deductible must be positive'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    clientId: z.string().min(1, 'Client ID is required'),
    agentId: z.string().optional(),
    terms: z.record(z.any()).optional(),
  }),

  updatePolicyStatus: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']),
    reason: z.string().optional(),
    effectiveDate: z.string().optional(),
  }),
};

// API Response Schemas
export const apiSchemas = {
  errorResponse: z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    }),
    timestamp: z.string(),
  }),

  successResponse: z.object({
    success: z.literal(true),
    data: z.any(),
    message: z.string().optional(),
    timestamp: z.string(),
  }),

  paginatedResponse: z.object({
    success: z.literal(true),
    data: z.array(z.any()),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
    timestamp: z.string(),
  }),
};

// Contact & Support Schemas
export const contactSchemas = {
  contactForm: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional(),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    category: z.enum(['GENERAL', 'BILLING', 'CLAIMS', 'TECHNICAL', 'COMPLAINT']).default('GENERAL'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  }),

  supportTicket: z.object({
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.enum(['GENERAL', 'BILLING', 'CLAIMS', 'TECHNICAL', 'COMPLAINT']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    attachments: z.array(z.string()).optional(),
  }),
};

// Export all schemas
export const validationSchemas = {
  auth: authSchemas,
  user: userSchemas,
  claim: claimSchemas,
  payment: paymentSchemas,
  policy: policySchemas,
  document: documentSchemas,
  business: businessSchemas,
  api: apiSchemas,
  contact: contactSchemas,
};

export default validationSchemas;