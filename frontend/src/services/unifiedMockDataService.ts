/**
 * Unified Mock Data Service
 * Centralizes all mock data in one place and provides typed access methods
 * Replaces all scattered mock data across components
 */

import unifiedMockData from '@/data/unifiedMockData.json';

// Type definitions
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  dateJoined: string;
  lastLogin: string;
  policiesCount?: number;
  totalPremiums?: number;
  totalClaims?: number;
  avatar?: string;
  clientsCount?: number;
  totalSales?: number;
}

export interface Policy {
  id: string;
  policyNumber: string;
  type: 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  clientId: string;
  clientName: string;
  clientEmail: string;
  agentId?: string;
  agentName?: string;
  premium: number;
  coverage: number;
  deductible: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  nextPayment?: string;
  expiryDate: string;
  description: string;
  terms: any;
  createdDate: string;
  lastModified: string;
  claimsCount: number;
  totalClaimsAmount: number;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyType: 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH';
  policyNumber: string;
  clientId: string;
  clientName: string;
  type: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'INVESTIGATING' | 'APPROVED' | 'DENIED' | 'PAID' | 'CLOSED';
  amount: number;
  estimatedAmount?: number;
  payoutAmount?: number;
  submittedDate: string;
  submittedAt: string;
  updatedAt: string;
  incidentDate: string;
  description: string;
  location?: string;
  adjusterName?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: number;
  }>;
  timeline: Array<{
    id: string;
    date: string;
    event: string;
    description: string;
    status: string;
  }>;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  policyId: string;
  policyNumber: string;
  policyType: string;
  clientId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'OVERDUE';
  paymentMethod: string;
  description: string;
  invoiceNumber: string;
  lastFourDigits?: string;
  transactionId?: string;
  failureReason?: string;
  isAutoPayEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'CREDIT_CARD' | 'BANK_ACCOUNT';
  cardType?: string;
  bankName?: string;
  accountType?: string;
  lastFour: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  nickname: string;
  isExpired?: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  lastModified: string;
  policyId?: string;
  policyNumber?: string;
  claimId?: string;
  claimNumber?: string;
  userId: string;
  isConfidential: boolean;
  isFavorite: boolean;
  description: string;
  tags: string[];
  downloadUrl: string;
  thumbnailUrl?: string;
  status: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  pendingClaims: number;
  totalRevenue: number;
  monthlyRevenue: number;
  avgPolicyValue: number;
  claimApprovalRate: number;
  customerSatisfaction: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  claimId?: string;
  paymentId?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  amount?: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  url: string;
}

export interface DashboardStats {
  totalPolicies: number;
  activeClaims: number;
  upcomingPayments: number;
  totalCoverage: number;
  nextPaymentAmount: number;
  nextPaymentDate: string;
  recentClaimsCount: number;
  documentsCount: number;
}

export interface AvailablePolicy {
  id: string;
  number: string;
  type: string;
  description: string;
  balance: number;
}

export interface ClaimTypes {
  AUTO: string[];
  HOME: string[];
  LIFE: string[];
  HEALTH: string[];
}

/**
 * Unified Mock Data Service Class
 */
class UnifiedMockDataService {
  private data = unifiedMockData;

  // User methods
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(user => user.id === id);
  }

  getUsersByRole(role: string): User[] {
    return this.data.users.filter(user => user.role === role);
  }

  // Policy methods
  getPolicies(): Policy[] {
    return this.data.policies;
  }

  getPolicyById(id: string): Policy | undefined {
    return this.data.policies.find(policy => policy.id === id);
  }

  getPoliciesByUserId(userId: string): Policy[] {
    return this.data.policies.filter(policy => policy.clientId === userId);
  }

  getPoliciesByType(type: string): Policy[] {
    return this.data.policies.filter(policy => policy.type === type);
  }

  getPoliciesByStatus(status: string): Policy[] {
    return this.data.policies.filter(policy => policy.status === status);
  }

  getAvailablePolicies(): AvailablePolicy[] {
    return this.data.availablePolicies;
  }

  // Claim methods
  getClaims(): Claim[] {
    return this.data.claims;
  }

  getClaimById(id: string): Claim | undefined {
    return this.data.claims.find(claim => claim.id === id);
  }

  getClaimsByUserId(userId: string): Claim[] {
    return this.data.claims.filter(claim => claim.clientId === userId);
  }

  getClaimsByPolicyId(policyId: string): Claim[] {
    return this.data.claims.filter(claim => claim.policyId === policyId);
  }

  getClaimsByStatus(status: string): Claim[] {
    return this.data.claims.filter(claim => claim.status === status);
  }

  getClaimTypes(): ClaimTypes {
    return this.data.claimTypes;
  }

  // Payment methods
  getPayments(): Payment[] {
    return this.data.payments;
  }

  getPaymentById(id: string): Payment | undefined {
    return this.data.payments.find(payment => payment.id === id);
  }

  getPaymentsByUserId(userId: string): Payment[] {
    return this.data.payments.filter(payment => payment.clientId === userId);
  }

  getPaymentsByPolicyId(policyId: string): Payment[] {
    return this.data.payments.filter(payment => payment.policyId === policyId);
  }

  getPaymentsByStatus(status: string): Payment[] {
    return this.data.payments.filter(payment => payment.status === status);
  }

  getPaymentMethods(): PaymentMethod[] {
    return this.data.paymentMethods;
  }

  getPaymentMethodsByUserId(userId: string): PaymentMethod[] {
    return this.data.paymentMethods.filter(method => method.userId === userId);
  }

  // Document methods
  getDocuments(): Document[] {
    return this.data.documents;
  }

  getDocumentById(id: string): Document | undefined {
    return this.data.documents.find(doc => doc.id === id);
  }

  getDocumentsByUserId(userId: string): Document[] {
    return this.data.documents.filter(doc => doc.userId === userId);
  }

  getDocumentsByPolicyId(policyId: string): Document[] {
    return this.data.documents.filter(doc => doc.policyId === policyId);
  }

  getDocumentsByClaimId(claimId: string): Document[] {
    return this.data.documents.filter(doc => doc.claimId === claimId);
  }

  getDocumentsByCategory(category: string): Document[] {
    return this.data.documents.filter(doc => doc.category === category);
  }

  // Admin methods
  getAdminStats(): AdminStats {
    return this.data.adminStats;
  }

  getRecentActivity(): RecentActivity[] {
    return this.data.recentActivity;
  }

  getQuickActions(): QuickAction[] {
    return this.data.quickActions;
  }

  // Dashboard methods
  getDashboardStats(): DashboardStats {
    return this.data.dashboardStats;
  }

  getDashboardData(userId: string) {
    const userPolicies = this.getPoliciesByUserId(userId);
    const userClaims = this.getClaimsByUserId(userId);
    const userPayments = this.getPaymentsByUserId(userId);
    const userDocuments = this.getDocumentsByUserId(userId);

    return {
      stats: {
        totalPolicies: userPolicies.length,
        activeClaims: userClaims.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING'].includes(c.status)).length,
        upcomingPayments: userPayments.filter(p => p.status === 'PENDING').length,
        totalCoverage: userPolicies.reduce((sum, p) => sum + p.coverage, 0),
        nextPaymentAmount: userPayments.find(p => p.status === 'PENDING')?.amount || 0,
        nextPaymentDate: userPayments.find(p => p.status === 'PENDING')?.dueDate || '',
        recentClaimsCount: userClaims.length,
        documentsCount: userDocuments.length
      },
      policies: userPolicies.slice(0, 4),
      claims: userClaims.slice(0, 3),
      payments: userPayments.slice(0, 5),
      documents: userDocuments.slice(0, 6)
    };
  }

  // Search and filter methods
  searchUsers(query: string): User[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.users.filter(user => 
      user.firstName.toLowerCase().includes(lowercaseQuery) ||
      user.lastName.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchPolicies(query: string): Policy[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.policies.filter(policy =>
      policy.policyNumber.toLowerCase().includes(lowercaseQuery) ||
      policy.clientName.toLowerCase().includes(lowercaseQuery) ||
      policy.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchClaims(query: string): Claim[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.claims.filter(claim =>
      claim.claimNumber.toLowerCase().includes(lowercaseQuery) ||
      claim.clientName.toLowerCase().includes(lowercaseQuery) ||
      claim.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchDocuments(query: string): Document[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.documents.filter(doc =>
      doc.name.toLowerCase().includes(lowercaseQuery) ||
      doc.description.toLowerCase().includes(lowercaseQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Utility methods
  getTotalRevenue(): number {
    return this.data.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getRevenueByMonth(year: number, month: number): number {
    return this.data.payments
      .filter(payment => {
        if (payment.status !== 'COMPLETED' || !payment.paidDate) return false;
        const paymentDate = new Date(payment.paidDate);
        return paymentDate.getFullYear() === year && paymentDate.getMonth() === month - 1;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPendingClaimsCount(): number {
    return this.data.claims.filter(claim => 
      ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING'].includes(claim.status)
    ).length;
  }

  getOverduePaymentsCount(): number {
    const today = new Date();
    return this.data.payments.filter(payment => {
      if (payment.status !== 'PENDING') return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate < today;
    }).length;
  }

  // Mock API simulation methods
  async simulateApiCall<T>(data: T, delay: number = 500): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }

  async fetchUsersAsync(): Promise<User[]> {
    return this.simulateApiCall(this.getUsers());
  }

  async fetchPoliciesAsync(): Promise<Policy[]> {
    return this.simulateApiCall(this.getPolicies());
  }

  async fetchClaimsAsync(): Promise<Claim[]> {
    return this.simulateApiCall(this.getClaims());
  }

  async fetchPaymentsAsync(): Promise<Payment[]> {
    return this.simulateApiCall(this.getPayments());
  }

  async fetchDocumentsAsync(): Promise<Document[]> {
    return this.simulateApiCall(this.getDocuments());
  }

  async fetchDashboardDataAsync(userId: string) {
    return this.simulateApiCall(this.getDashboardData(userId));
  }
}

// Export singleton instance
export const unifiedMockDataService = new UnifiedMockDataService();
export default unifiedMockDataService;