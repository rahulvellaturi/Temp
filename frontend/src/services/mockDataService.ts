import mockData from '../data/mockData.json';
import { User, Policy, Claim, Payment, Document } from '../types';

// Type definitions for mock data structure
interface MockData {
  users: User[];
  policies: Policy[];
  claims: Claim[];
  payments: Payment[];
  documents: Document[];
  paymentMethods: PaymentMethod[];
  adminStats: AdminStats;
  recentActivity: RecentActivity[];
  quickActions: QuickAction[];
}

interface PaymentMethod {
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
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  pendingClaims: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  claimId?: string;
  paymentId?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  count: number;
  action: string;
}

// Mock data service class
class MockDataService {
  private data: MockData;

  constructor() {
    this.data = mockData as MockData;
  }

  // User data methods
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(user => user.id === id);
  }

  getUsersByRole(role: string): User[] {
    return this.data.users.filter(user => user.role === role);
  }

  getActiveUsers(): User[] {
    return this.data.users.filter(user => user.isActive);
  }

  // Policy data methods
  getPolicies(): Policy[] {
    return this.data.policies;
  }

  getPolicyById(id: string): Policy | undefined {
    return this.data.policies.find(policy => policy.id === id);
  }

  getPoliciesByUserId(userId: string): Policy[] {
    return this.data.policies.filter(policy => policy.userId === userId);
  }

  getPoliciesByStatus(status: string): Policy[] {
    return this.data.policies.filter(policy => policy.status === status);
  }

  getPoliciesByType(type: string): Policy[] {
    return this.data.policies.filter(policy => policy.policyType === type);
  }

  // Claim data methods
  getClaims(): Claim[] {
    return this.data.claims;
  }

  getClaimById(id: string): Claim | undefined {
    return this.data.claims.find(claim => claim.id === id);
  }

  getClaimsByUserId(userId: string): Claim[] {
    return this.data.claims.filter(claim => claim.userId === userId);
  }

  getClaimsByStatus(status: string): Claim[] {
    return this.data.claims.filter(claim => claim.status === status);
  }

  getClaimsByPolicyId(policyId: string): Claim[] {
    return this.data.claims.filter(claim => claim.policyId === policyId);
  }

  // Payment data methods
  getPayments(): Payment[] {
    return this.data.payments;
  }

  getPaymentById(id: string): Payment | undefined {
    return this.data.payments.find(payment => payment.id === id);
  }

  getPaymentsByUserId(userId: string): Payment[] {
    return this.data.payments.filter(payment => payment.userId === userId);
  }

  getPaymentsByStatus(status: string): Payment[] {
    return this.data.payments.filter(payment => payment.status === status);
  }

  getPaymentsByPolicyId(policyId: string): Payment[] {
    return this.data.payments.filter(payment => payment.policyId === policyId);
  }

  // Document data methods
  getDocuments(): Document[] {
    return this.data.documents;
  }

  getDocumentById(id: string): Document | undefined {
    return this.data.documents.find(document => document.id === id);
  }

  getDocumentsByUserId(userId: string): Document[] {
    return this.data.documents.filter(document => document.userId === userId);
  }

  getDocumentsByType(type: string): Document[] {
    return this.data.documents.filter(document => document.type === type);
  }

  getDocumentsByCategory(category: string): Document[] {
    return this.data.documents.filter(document => document.category === category);
  }

  getDocumentsByPolicyId(policyId: string): Document[] {
    return this.data.documents.filter(document => document.policyId === policyId);
  }

  getDocumentsByClaimId(claimId: string): Document[] {
    return this.data.documents.filter(document => document.claimId === claimId);
  }

  // Payment method data methods
  getPaymentMethods(): PaymentMethod[] {
    return this.data.paymentMethods;
  }

  getPaymentMethodsByUserId(userId: string): PaymentMethod[] {
    return this.data.paymentMethods.filter(method => method.userId === userId);
  }

  getDefaultPaymentMethod(userId: string): PaymentMethod | undefined {
    return this.data.paymentMethods.find(method => method.userId === userId && method.isDefault);
  }

  // Admin data methods
  getAdminStats(): AdminStats {
    return this.data.adminStats;
  }

  getRecentActivity(): RecentActivity[] {
    return this.data.recentActivity;
  }

  getQuickActions(): QuickAction[] {
    return this.data.quickActions;
  }

  // Dashboard data methods
  getDashboardData(userId: string) {
    const userPolicies = this.getPoliciesByUserId(userId);
    const userClaims = this.getClaimsByUserId(userId);
    const userPayments = this.getPaymentsByUserId(userId);
    const userDocuments = this.getDocumentsByUserId(userId);

    return {
      policies: userPolicies,
      claims: userClaims,
      payments: userPayments,
      documents: userDocuments,
      stats: {
        totalPolicies: userPolicies.length,
        activeClaims: userClaims.filter(c => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)).length,
        pendingPayments: userPayments.filter(p => p.status === 'PENDING').length,
        totalCoverage: userPolicies.reduce((sum, p) => sum + (p.coverage || 0), 0),
      }
    };
  }

  // Search methods
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
      policy.policyType.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchClaims(query: string): Claim[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.claims.filter(claim => 
      claim.claimNumber.toLowerCase().includes(lowercaseQuery) ||
      claim.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchDocuments(query: string): Document[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.documents.filter(document => 
      document.name.toLowerCase().includes(lowercaseQuery) ||
      document.description?.toLowerCase().includes(lowercaseQuery) ||
      document.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Utility methods
  getTotalRevenue(): number {
    return this.data.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPendingClaimsCount(): number {
    return this.data.claims.filter(claim => claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW').length;
  }

  getUpcomingPayments(): Payment[] {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return this.data.payments.filter(payment => {
      if (!payment.dueDate) return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate <= thirtyDaysFromNow && payment.status === 'PENDING';
    });
  }

  getExpiringPolicies(): Policy[] {
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    
    return this.data.policies.filter(policy => {
      const endDate = new Date(policy.endDate);
      return endDate <= sixtyDaysFromNow && policy.status === 'ACTIVE';
    });
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
export default mockDataService;