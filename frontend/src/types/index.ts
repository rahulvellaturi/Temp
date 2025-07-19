// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  mfa?: MFA;
}

export interface MFA {
  id: string;
  method: MfaMethod;
  isEnabled: boolean;
}

export type UserRole = 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN' | 'CLAIMS_ADJUSTER' | 'BILLING_SPECIALIST';
export type MfaMethod = 'SMS' | 'AUTHENTICATOR';

// Policy types
export interface Policy {
  id: string;
  policyNumber: string;
  userId: string;
  policyType: PolicyType;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
  premiumAmount: number;
  deductible: number;
  coverageDetails: Record<string, any>;
  insuredAssets?: Record<string, any>;
  renewalDate: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
  documents?: Document[];
  claims?: Claim[];
  payments?: Payment[];
  changeRequests?: PolicyChangeRequest[];
}

export type PolicyType = 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH' | 'OTHER';
export type PolicyStatus = 'ACTIVE' | 'PENDING_RENEWAL' | 'EXPIRED' | 'CANCELLED';

export interface PolicyChangeRequest {
  id: string;
  policyId: string;
  userId: string;
  requestType: string;
  requestDetails: Record<string, any>;
  status: ChangeRequestStatus;
  adminNotes?: string;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  policy?: Pick<Policy, 'policyNumber' | 'policyType'>;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
}

export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// Claim types
export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  userId: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  status: ClaimStatus;
  assignedAdjusterId?: string;
  payoutAmount?: number;
  submittedAt: string;
  updatedAt: string;
  policy?: Pick<Policy, 'policyNumber' | 'policyType'>;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
  assignedAdjuster?: Pick<User, 'firstName' | 'lastName' | 'email'>;
  documents?: Document[];
  messages?: Message[];
  involvedParties?: InvolvedParty[];
}

export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ADJUSTER_ASSIGNED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CLOSED';

export interface InvolvedParty {
  id: string;
  claimId: string;
  name: string;
  contact?: string;
  role?: string;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  policyId?: string;
  amount: number;
  paymentDate: string;
  status: PaymentStatus;
  method?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  policy?: Pick<Policy, 'policyNumber' | 'policyType'>;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface BillingStatement {
  id: string;
  userId: string;
  policyId?: string;
  statementDate: string;
  dueDate: string;
  amountDue: number;
  isPaid: boolean;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
  policy?: Pick<Policy, 'policyNumber' | 'policyType'>;
}

// Document types
export interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  userId: string;
  policyId?: string;
  claimId?: string;
  documentType: DocumentType;
  uploadedAt: string;
  uploadedBy: string;
  policy?: Pick<Policy, 'policyNumber' | 'policyType'>;
  claim?: Pick<Claim, 'claimNumber'>;
}

export type DocumentType = 'POLICY_CONTRACT' | 'DECLARATION_PAGE' | 'ENDORSEMENT' | 'BILLING_STATEMENT' | 'CLAIM_SUPPORT' | 'ID_CARD' | 'OTHER';

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  claimId?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isInternal: boolean;
  sender?: Pick<User, 'firstName' | 'lastName' | 'role'>;
  receiver?: Pick<User, 'firstName' | 'lastName' | 'role'>;
  claim?: Pick<Claim, 'claimNumber'>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  mfaToken?: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ClaimForm {
  policyId: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  involvedParties?: {
    name: string;
    contact?: string;
    role?: string;
  }[];
}

export interface PaymentForm {
  policyId?: string;
  amount: number;
  paymentMethodToken: string;
}

// Dashboard types
export interface DashboardStats {
  totalPolicies: number;
  activeClaims: number;
  pendingPayments: number;
  upcomingRenewals: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalPolicies: number;
  pendingClaims: number;
  pendingRequests: number;
}