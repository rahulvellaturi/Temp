import unifiedMockDataService from '../unifiedMockDataService';
import { User, Policy, Claim, Payment, PaymentMethod, Document } from '../unifiedMockDataService';

// Mock the JSON data import
jest.mock('../../data/unifiedMockData.json', () => ({
  users: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      role: 'CLIENT',
      avatar: '/avatars/john-doe.jpg'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543',
      role: 'CLIENT',
      avatar: '/avatars/jane-smith.jpg'
    },
    {
      id: '3',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@assureme.com',
      phone: '(555) 555-5555',
      role: 'ADMIN',
      avatar: '/avatars/admin.jpg'
    }
  ],
  policies: [
    {
      id: '1',
      policyNumber: 'AUTO-2024-001',
      clientId: '1',
      clientName: 'John Doe',
      type: 'AUTO',
      status: 'ACTIVE',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      premium: 1200,
      deductible: 500,
      coverageAmount: 100000,
      description: 'Comprehensive auto insurance coverage'
    },
    {
      id: '2',
      policyNumber: 'HOME-2024-002',
      clientId: '1',
      clientName: 'John Doe',
      type: 'HOME',
      status: 'ACTIVE',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      premium: 800,
      deductible: 1000,
      coverageAmount: 500000,
      description: 'Home insurance coverage'
    }
  ],
  claims: [
    {
      id: '1',
      claimNumber: 'CLM-2024-001',
      policyId: '1',
      policyType: 'AUTO',
      policyNumber: 'AUTO-2024-001',
      clientId: '1',
      clientName: 'John Doe',
      type: 'Collision',
      status: 'SUBMITTED',
      amount: 5000,
      estimatedAmount: 5500,
      payoutAmount: 0,
      submittedDate: '2024-01-15',
      incidentDate: '2024-01-10',
      description: 'Rear-end collision on Highway 101',
      location: 'Highway 101, San Francisco, CA',
      adjusterName: 'Sarah Johnson',
      documents: [],
      timeline: []
    },
    {
      id: '2',
      claimNumber: 'CLM-2024-002',
      policyId: '2',
      policyType: 'HOME',
      policyNumber: 'HOME-2024-002',
      clientId: '1',
      clientName: 'John Doe',
      type: 'Water Damage',
      status: 'APPROVED',
      amount: 12000,
      estimatedAmount: 12500,
      payoutAmount: 12000,
      submittedDate: '2024-01-10',
      incidentDate: '2024-01-08',
      description: 'Water damage from burst pipe',
      location: '123 Main St',
      adjusterName: 'Mike Chen',
      documents: [],
      timeline: []
    }
  ],
  payments: [
    {
      id: '1',
      policyId: '1',
      clientId: '1',
      amount: 1200,
      dueDate: '2024-02-01',
      paidDate: '2024-01-28',
      status: 'COMPLETED',
      method: 'Credit Card',
      description: 'Monthly premium payment'
    }
  ],
  paymentMethods: [
    {
      id: '1',
      userId: '1',
      type: 'CREDIT_CARD',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      brand: 'Visa',
      isDefault: true
    }
  ],
  documents: [
    {
      id: '1',
      name: 'policy-document.pdf',
      type: 'POLICY',
      category: 'Auto Insurance',
      uploadDate: '2024-01-15',
      size: 1024000,
      userId: '1'
    }
  ],
  availablePolicies: [
    { id: '1', name: 'Auto Insurance', type: 'AUTO', description: 'Comprehensive auto coverage' }
  ],
  claimTypes: {
    AUTO: ['Collision', 'Comprehensive', 'Liability'],
    HOME: ['Fire Damage', 'Water Damage', 'Theft'],
    LIFE: ['Death Benefit', 'Terminal Illness'],
    HEALTH: ['Medical Treatment', 'Emergency Care']
  },
  adminStats: {
    totalUsers: 1000,
    totalPolicies: 2500,
    totalClaims: 150,
    totalRevenue: 2500000,
    pendingClaims: 25,
    approvedClaims: 100,
    deniedClaims: 25,
    monthlyGrowth: 12.5
  },
  recentActivity: [
    {
      id: '1',
      type: 'claim_submitted',
      description: 'New claim submitted by John Doe',
      timestamp: '2024-01-15T10:30:00Z',
      userId: '1'
    }
  ],
  quickActions: [
    {
      id: '1',
      title: 'Review Claims',
      description: 'Review pending claims',
      icon: 'FileText',
      action: '/admin/claims',
      count: 25
    }
  ],
  dashboardStats: {
    totalPolicies: 4,
    activeClaims: 2,
    totalCoverage: 600000,
    nextPayment: {
      amount: 1200,
      dueDate: '2024-02-01'
    }
  }
}));

describe('UnifiedMockDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Methods', () => {
    test('getUsers returns all users', () => {
      const users = unifiedMockDataService.getUsers();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(3);
      expect(users[0].firstName).toBe('John');
      expect(users[1].firstName).toBe('Jane');
      expect(users[2].firstName).toBe('Admin');
    });

    test('getUserById returns correct user when user exists', () => {
      const user = unifiedMockDataService.getUserById('1');
      expect(user).toBeDefined();
      expect(user?.id).toBe('1');
      expect(user?.firstName).toBe('John');
      expect(user?.lastName).toBe('Doe');
      expect(user?.email).toBe('john.doe@example.com');
    });

    test('getUserById returns undefined for non-existent user', () => {
      const user = unifiedMockDataService.getUserById('999');
      expect(user).toBeUndefined();
    });

    test('getUserById returns undefined for empty string', () => {
      const user = unifiedMockDataService.getUserById('');
      expect(user).toBeUndefined();
    });

    test('getUsersByRole returns users with specific role', () => {
      const clients = unifiedMockDataService.getUsersByRole('CLIENT');
      expect(clients).toBeDefined();
      expect(Array.isArray(clients)).toBe(true);
      expect(clients.length).toBe(2);
      clients.forEach(user => {
        expect(user.role).toBe('CLIENT');
      });
    });

    test('getUsersByRole returns empty array for non-existent role', () => {
      const agents = unifiedMockDataService.getUsersByRole('AGENT');
      expect(agents).toBeDefined();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBe(0);
    });

    test('searchUsers finds users by name', () => {
      const results = unifiedMockDataService.searchUsers('john');
      expect(results.length).toBe(1);
      expect(results[0].firstName.toLowerCase()).toContain('john');
    });

    test('searchUsers finds users by email', () => {
      const results = unifiedMockDataService.searchUsers('jane.smith');
      expect(results.length).toBe(1);
      expect(results[0].email).toContain('jane.smith');
    });

    test('searchUsers returns empty array for no matches', () => {
      const results = unifiedMockDataService.searchUsers('nonexistent');
      expect(results).toEqual([]);
    });

    test('searchUsers handles empty search term', () => {
      const results = unifiedMockDataService.searchUsers('');
      expect(results).toEqual([]);
    });

    test('searchUsers is case insensitive', () => {
      const results = unifiedMockDataService.searchUsers('JOHN');
      expect(results.length).toBe(1);
      expect(results[0].firstName.toLowerCase()).toBe('john');
    });
  });

  describe('Policy Methods', () => {
    test('getPolicies returns all policies', () => {
      const policies = unifiedMockDataService.getPolicies();
      expect(policies).toBeDefined();
      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBe(2);
    });

    test('getPolicyById returns correct policy', () => {
      const policy = unifiedMockDataService.getPolicyById('1');
      expect(policy).toBeDefined();
      expect(policy?.id).toBe('1');
      expect(policy?.policyNumber).toBe('AUTO-2024-001');
    });

    test('getPolicyById returns undefined for non-existent policy', () => {
      const policy = unifiedMockDataService.getPolicyById('999');
      expect(policy).toBeUndefined();
    });

    test('getPoliciesByUserId returns user policies', () => {
      const policies = unifiedMockDataService.getPoliciesByUserId('1');
      expect(policies).toBeDefined();
      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBe(2);
      policies.forEach(policy => {
        expect(policy.clientId).toBe('1');
      });
    });

    test('getPoliciesByUserId returns empty array for non-existent user', () => {
      const policies = unifiedMockDataService.getPoliciesByUserId('999');
      expect(policies).toEqual([]);
    });

    test('getPoliciesByType returns policies of specific type', () => {
      const autoPolicies = unifiedMockDataService.getPoliciesByType('AUTO');
      expect(autoPolicies).toBeDefined();
      expect(autoPolicies.length).toBe(1);
      autoPolicies.forEach(policy => {
        expect(policy.type).toBe('AUTO');
      });
    });

    test('getPoliciesByType returns empty array for non-existent type', () => {
      const lifePolicies = unifiedMockDataService.getPoliciesByType('LIFE');
      expect(lifePolicies).toEqual([]);
    });

    test('getPoliciesByStatus returns policies with specific status', () => {
      const activePolicies = unifiedMockDataService.getPoliciesByStatus('ACTIVE');
      expect(activePolicies).toBeDefined();
      expect(activePolicies.length).toBe(2);
      activePolicies.forEach(policy => {
        expect(policy.status).toBe('ACTIVE');
      });
    });

    test('getPoliciesByStatus returns empty array for non-existent status', () => {
      const inactivePolicies = unifiedMockDataService.getPoliciesByStatus('INACTIVE');
      expect(inactivePolicies).toEqual([]);
    });

    test('getAvailablePolicies returns available policies', () => {
      const availablePolicies = unifiedMockDataService.getAvailablePolicies();
      expect(availablePolicies).toBeDefined();
      expect(Array.isArray(availablePolicies)).toBe(true);
      expect(availablePolicies.length).toBe(1);
    });

    test('searchPolicies finds policies by policy number', () => {
      const results = unifiedMockDataService.searchPolicies('AUTO-2024');
      expect(results.length).toBe(1);
      expect(results[0].policyNumber).toContain('AUTO-2024');
    });

    test('searchPolicies finds policies by description', () => {
      const results = unifiedMockDataService.searchPolicies('auto insurance');
      expect(results.length).toBe(1);
      expect(results[0].description.toLowerCase()).toContain('auto insurance');
    });

    test('searchPolicies returns empty array for no matches', () => {
      const results = unifiedMockDataService.searchPolicies('nonexistent');
      expect(results).toEqual([]);
    });

    test('searchPolicies handles empty search term', () => {
      const results = unifiedMockDataService.searchPolicies('');
      expect(results).toEqual([]);
    });
  });

  describe('Claim Methods', () => {
    test('getClaims returns all claims', () => {
      const claims = unifiedMockDataService.getClaims();
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
      expect(claims.length).toBe(2);
    });

    test('getClaimById returns correct claim', () => {
      const claim = unifiedMockDataService.getClaimById('1');
      expect(claim).toBeDefined();
      expect(claim?.id).toBe('1');
      expect(claim?.claimNumber).toBe('CLM-2024-001');
    });

    test('getClaimById returns undefined for non-existent claim', () => {
      const claim = unifiedMockDataService.getClaimById('999');
      expect(claim).toBeUndefined();
    });

    test('getClaimsByUserId returns user claims', () => {
      const claims = unifiedMockDataService.getClaimsByUserId('1');
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
      expect(claims.length).toBe(2);
      claims.forEach(claim => {
        expect(claim.clientId).toBe('1');
      });
    });

    test('getClaimsByUserId returns empty array for non-existent user', () => {
      const claims = unifiedMockDataService.getClaimsByUserId('999');
      expect(claims).toEqual([]);
    });

    test('getClaimsByPolicyId returns policy claims', () => {
      const claims = unifiedMockDataService.getClaimsByPolicyId('1');
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
      expect(claims.length).toBe(1);
      claims.forEach(claim => {
        expect(claim.policyId).toBe('1');
      });
    });

    test('getClaimsByPolicyId returns empty array for non-existent policy', () => {
      const claims = unifiedMockDataService.getClaimsByPolicyId('999');
      expect(claims).toEqual([]);
    });

    test('getClaimsByStatus returns claims with specific status', () => {
      const submittedClaims = unifiedMockDataService.getClaimsByStatus('SUBMITTED');
      expect(submittedClaims).toBeDefined();
      expect(submittedClaims.length).toBe(1);
      submittedClaims.forEach(claim => {
        expect(claim.status).toBe('SUBMITTED');
      });
    });

    test('getClaimsByStatus returns empty array for non-existent status', () => {
      const deniedClaims = unifiedMockDataService.getClaimsByStatus('DENIED');
      expect(deniedClaims).toEqual([]);
    });

    test('getClaimTypes returns claim types by policy type', () => {
      const claimTypes = unifiedMockDataService.getClaimTypes();
      expect(claimTypes).toBeDefined();
      expect(claimTypes.AUTO).toBeDefined();
      expect(claimTypes.HOME).toBeDefined();
      expect(claimTypes.LIFE).toBeDefined();
      expect(claimTypes.HEALTH).toBeDefined();
      expect(Array.isArray(claimTypes.AUTO)).toBe(true);
      expect(claimTypes.AUTO).toContain('Collision');
    });

    test('searchClaims finds claims by claim number', () => {
      const results = unifiedMockDataService.searchClaims('CLM-2024-001');
      expect(results.length).toBe(1);
      expect(results[0].claimNumber).toBe('CLM-2024-001');
    });

    test('searchClaims finds claims by description', () => {
      const results = unifiedMockDataService.searchClaims('collision');
      expect(results.length).toBe(1);
      expect(results[0].description.toLowerCase()).toContain('collision');
    });

    test('searchClaims returns empty array for no matches', () => {
      const results = unifiedMockDataService.searchClaims('nonexistent');
      expect(results).toEqual([]);
    });

    test('searchClaims handles empty search term', () => {
      const results = unifiedMockDataService.searchClaims('');
      expect(results).toEqual([]);
    });
  });

  describe('Payment Methods', () => {
    test('getPayments returns all payments', () => {
      const payments = unifiedMockDataService.getPayments();
      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBe(1);
    });

    test('getPaymentById returns correct payment', () => {
      const payment = unifiedMockDataService.getPaymentById('1');
      expect(payment).toBeDefined();
      expect(payment?.id).toBe('1');
      expect(payment?.amount).toBe(1200);
    });

    test('getPaymentById returns undefined for non-existent payment', () => {
      const payment = unifiedMockDataService.getPaymentById('999');
      expect(payment).toBeUndefined();
    });

    test('getPaymentsByUserId returns user payments', () => {
      const payments = unifiedMockDataService.getPaymentsByUserId('1');
      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBe(1);
      payments.forEach(payment => {
        expect(payment.clientId).toBe('1');
      });
    });

    test('getPaymentsByUserId returns empty array for non-existent user', () => {
      const payments = unifiedMockDataService.getPaymentsByUserId('999');
      expect(payments).toEqual([]);
    });

    test('getPaymentsByStatus returns payments with specific status', () => {
      const completedPayments = unifiedMockDataService.getPaymentsByStatus('COMPLETED');
      expect(completedPayments).toBeDefined();
      expect(completedPayments.length).toBe(1);
      completedPayments.forEach(payment => {
        expect(payment.status).toBe('COMPLETED');
      });
    });

    test('getPaymentsByStatus returns empty array for non-existent status', () => {
      const pendingPayments = unifiedMockDataService.getPaymentsByStatus('PENDING');
      expect(pendingPayments).toEqual([]);
    });

    test('getPaymentMethods returns all payment methods', () => {
      const paymentMethods = unifiedMockDataService.getPaymentMethods();
      expect(paymentMethods).toBeDefined();
      expect(Array.isArray(paymentMethods)).toBe(true);
      expect(paymentMethods.length).toBe(1);
    });

    test('getPaymentMethodsByUserId returns user payment methods', () => {
      const paymentMethods = unifiedMockDataService.getPaymentMethodsByUserId('1');
      expect(paymentMethods).toBeDefined();
      expect(Array.isArray(paymentMethods)).toBe(true);
      expect(paymentMethods.length).toBe(1);
      paymentMethods.forEach(method => {
        expect(method.userId).toBe('1');
      });
    });

    test('getPaymentMethodsByUserId returns empty array for non-existent user', () => {
      const paymentMethods = unifiedMockDataService.getPaymentMethodsByUserId('999');
      expect(paymentMethods).toEqual([]);
    });
  });

  describe('Document Methods', () => {
    test('getDocuments returns all documents', () => {
      const documents = unifiedMockDataService.getDocuments();
      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBe(1);
    });

    test('getDocumentById returns correct document', () => {
      const document = unifiedMockDataService.getDocumentById('1');
      expect(document).toBeDefined();
      expect(document?.id).toBe('1');
      expect(document?.name).toBe('policy-document.pdf');
    });

    test('getDocumentById returns undefined for non-existent document', () => {
      const document = unifiedMockDataService.getDocumentById('999');
      expect(document).toBeUndefined();
    });

    test('getDocumentsByUserId returns user documents', () => {
      const documents = unifiedMockDataService.getDocumentsByUserId('1');
      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBe(1);
      documents.forEach(doc => {
        expect(doc.userId).toBe('1');
      });
    });

    test('getDocumentsByUserId returns empty array for non-existent user', () => {
      const documents = unifiedMockDataService.getDocumentsByUserId('999');
      expect(documents).toEqual([]);
    });

    test('getDocumentsByCategory returns documents by category', () => {
      const autoDocuments = unifiedMockDataService.getDocumentsByCategory('Auto Insurance');
      expect(autoDocuments).toBeDefined();
      expect(Array.isArray(autoDocuments)).toBe(true);
      expect(autoDocuments.length).toBe(1);
      autoDocuments.forEach(doc => {
        expect(doc.category).toBe('Auto Insurance');
      });
    });

    test('getDocumentsByCategory returns empty array for non-existent category', () => {
      const homeDocuments = unifiedMockDataService.getDocumentsByCategory('Home Insurance');
      expect(homeDocuments).toEqual([]);
    });

    test('searchDocuments finds documents by name', () => {
      const results = unifiedMockDataService.searchDocuments('policy');
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('policy');
    });

    test('searchDocuments returns empty array for no matches', () => {
      const results = unifiedMockDataService.searchDocuments('nonexistent');
      expect(results).toEqual([]);
    });

    test('searchDocuments handles empty search term', () => {
      const results = unifiedMockDataService.searchDocuments('');
      expect(results).toEqual([]);
    });
  });

  describe('Admin Methods', () => {
    test('getAdminStats returns admin statistics', () => {
      const adminStats = unifiedMockDataService.getAdminStats();
      expect(adminStats).toBeDefined();
      expect(typeof adminStats.totalUsers).toBe('number');
      expect(typeof adminStats.totalPolicies).toBe('number');
      expect(typeof adminStats.totalClaims).toBe('number');
      expect(typeof adminStats.totalRevenue).toBe('number');
      expect(adminStats.totalUsers).toBe(1000);
      expect(adminStats.totalPolicies).toBe(2500);
    });

    test('getRecentActivity returns recent activities', () => {
      const activities = unifiedMockDataService.getRecentActivity();
      expect(activities).toBeDefined();
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBe(1);
      expect(activities[0].type).toBe('claim_submitted');
    });

    test('getQuickActions returns quick actions', () => {
      const quickActions = unifiedMockDataService.getQuickActions();
      expect(quickActions).toBeDefined();
      expect(Array.isArray(quickActions)).toBe(true);
      expect(quickActions.length).toBe(1);
      expect(quickActions[0].title).toBe('Review Claims');
    });
  });

  describe('Dashboard Methods', () => {
    test('getDashboardStats returns dashboard statistics', () => {
      const dashboardStats = unifiedMockDataService.getDashboardStats();
      expect(dashboardStats).toBeDefined();
      expect(typeof dashboardStats.totalPolicies).toBe('number');
      expect(typeof dashboardStats.activeClaims).toBe('number');
      expect(typeof dashboardStats.totalCoverage).toBe('number');
      expect(dashboardStats.totalPolicies).toBe(4);
      expect(dashboardStats.activeClaims).toBe(2);
    });

    test('getDashboardData returns comprehensive dashboard data', () => {
      const dashboardData = unifiedMockDataService.getDashboardData('1');
      expect(dashboardData).toBeDefined();
      expect(dashboardData.stats).toBeDefined();
      expect(dashboardData.policies).toBeDefined();
      expect(dashboardData.claims).toBeDefined();
      expect(dashboardData.payments).toBeDefined();
      expect(dashboardData.documents).toBeDefined();
      expect(Array.isArray(dashboardData.policies)).toBe(true);
      expect(Array.isArray(dashboardData.claims)).toBe(true);
    });

    test('getDashboardData handles non-existent user', () => {
      const dashboardData = unifiedMockDataService.getDashboardData('999');
      expect(dashboardData).toBeDefined();
      expect(dashboardData.policies).toEqual([]);
      expect(dashboardData.claims).toEqual([]);
      expect(dashboardData.payments).toEqual([]);
      expect(dashboardData.documents).toEqual([]);
    });
  });

  describe('Utility Methods', () => {
    test('getTotalRevenue calculates total revenue correctly', () => {
      const totalRevenue = unifiedMockDataService.getTotalRevenue();
      expect(typeof totalRevenue).toBe('number');
      expect(totalRevenue).toBeGreaterThan(0);
    });

    test('getPendingClaimsCount returns pending claims count', () => {
      const pendingCount = unifiedMockDataService.getPendingClaimsCount();
      expect(typeof pendingCount).toBe('number');
      expect(pendingCount).toBeGreaterThanOrEqual(0);
    });

    test('getOverduePaymentsCount returns overdue payments count', () => {
      const overdueCount = unifiedMockDataService.getOverduePaymentsCount();
      expect(typeof overdueCount).toBe('number');
      expect(overdueCount).toBeGreaterThanOrEqual(0);
    });

    test('getRevenueByMonth calculates monthly revenue', () => {
      const monthlyRevenue = unifiedMockDataService.getRevenueByMonth(2024, 1);
      expect(typeof monthlyRevenue).toBe('number');
      expect(monthlyRevenue).toBeGreaterThanOrEqual(0);
    });

    test('getRevenueByMonth handles invalid month', () => {
      const monthlyRevenue = unifiedMockDataService.getRevenueByMonth(2024, 13);
      expect(monthlyRevenue).toBe(0);
    });

    test('getRevenueByMonth handles invalid year', () => {
      const monthlyRevenue = unifiedMockDataService.getRevenueByMonth(2020, 1);
      expect(monthlyRevenue).toBe(0);
    });
  });

  describe('Async Methods', () => {
    jest.setTimeout(10000);

    test('fetchUsersAsync returns users with delay', async () => {
      const startTime = Date.now();
      const users = await unifiedMockDataService.fetchUsersAsync();
      const endTime = Date.now();
      
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(3);
      expect(endTime - startTime).toBeGreaterThanOrEqual(400);
    });

    test('fetchPoliciesAsync returns policies with delay', async () => {
      const policies = await unifiedMockDataService.fetchPoliciesAsync();
      expect(policies).toBeDefined();
      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBe(2);
    });

    test('fetchClaimsAsync returns claims with delay', async () => {
      const claims = await unifiedMockDataService.fetchClaimsAsync();
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
      expect(claims.length).toBe(2);
    });

    test('fetchPaymentsAsync returns payments with delay', async () => {
      const payments = await unifiedMockDataService.fetchPaymentsAsync();
      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBe(1);
    });

    test('fetchDocumentsAsync returns documents with delay', async () => {
      const documents = await unifiedMockDataService.fetchDocumentsAsync();
      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBe(1);
    });

    test('fetchDashboardDataAsync returns dashboard data with delay', async () => {
      const dashboardData = await unifiedMockDataService.fetchDashboardDataAsync('1');
      expect(dashboardData).toBeDefined();
      expect(dashboardData.stats).toBeDefined();
      expect(dashboardData.policies).toBeDefined();
      expect(Array.isArray(dashboardData.policies)).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    test('all users have required fields', () => {
      const users = unifiedMockDataService.getUsers();
      users.forEach(user => {
        expect(user.id).toBeDefined();
        expect(user.firstName).toBeDefined();
        expect(user.lastName).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
        expect(['CLIENT', 'AGENT', 'ADMIN']).toContain(user.role);
      });
    });

    test('all policies have valid relationships', () => {
      const policies = unifiedMockDataService.getPolicies();
      const users = unifiedMockDataService.getUsers();
      const userIds = users.map(u => u.id);

      policies.forEach(policy => {
        expect(policy.id).toBeDefined();
        expect(policy.policyNumber).toBeDefined();
        expect(policy.clientId).toBeDefined();
        expect(userIds).toContain(policy.clientId);
        expect(['AUTO', 'HOME', 'LIFE', 'HEALTH']).toContain(policy.type);
        expect(['ACTIVE', 'INACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']).toContain(policy.status);
      });
    });

    test('all claims have valid policy relationships', () => {
      const claims = unifiedMockDataService.getClaims();
      const policies = unifiedMockDataService.getPolicies();
      const policyIds = policies.map(p => p.id);

      claims.forEach(claim => {
        expect(claim.id).toBeDefined();
        expect(claim.claimNumber).toBeDefined();
        expect(claim.policyId).toBeDefined();
        expect(policyIds).toContain(claim.policyId);
        expect(['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING', 'APPROVED', 'DENIED', 'PAID', 'CLOSED']).toContain(claim.status);
      });
    });

    test('payment methods belong to valid users', () => {
      const paymentMethods = unifiedMockDataService.getPaymentMethods();
      const users = unifiedMockDataService.getUsers();
      const userIds = users.map(u => u.id);

      paymentMethods.forEach(method => {
        expect(method.id).toBeDefined();
        expect(method.userId).toBeDefined();
        expect(userIds).toContain(method.userId);
        expect(['CREDIT_CARD', 'BANK_ACCOUNT']).toContain(method.type);
      });
    });

    test('documents belong to valid users', () => {
      const documents = unifiedMockDataService.getDocuments();
      const users = unifiedMockDataService.getUsers();
      const userIds = users.map(u => u.id);

      documents.forEach(document => {
        expect(document.id).toBeDefined();
        expect(document.name).toBeDefined();
        expect(document.userId).toBeDefined();
        expect(userIds).toContain(document.userId);
      });
    });

    test('payments belong to valid policies and users', () => {
      const payments = unifiedMockDataService.getPayments();
      const policies = unifiedMockDataService.getPolicies();
      const users = unifiedMockDataService.getUsers();
      const policyIds = policies.map(p => p.id);
      const userIds = users.map(u => u.id);

      payments.forEach(payment => {
        expect(payment.id).toBeDefined();
        expect(payment.policyId).toBeDefined();
        expect(payment.clientId).toBeDefined();
        expect(policyIds).toContain(payment.policyId);
        expect(userIds).toContain(payment.clientId);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles null and undefined inputs gracefully', () => {
      expect(unifiedMockDataService.getUserById(null as any)).toBeUndefined();
      expect(unifiedMockDataService.getUserById(undefined as any)).toBeUndefined();
      expect(unifiedMockDataService.searchUsers(null as any)).toEqual([]);
      expect(unifiedMockDataService.searchUsers(undefined as any)).toEqual([]);
    });

    test('handles numeric inputs as strings', () => {
      expect(unifiedMockDataService.getUserById(1 as any)).toBeUndefined();
      expect(unifiedMockDataService.getPolicyById(1 as any)).toBeUndefined();
    });

    test('methods return consistent data types', () => {
      expect(Array.isArray(unifiedMockDataService.getUsers())).toBe(true);
      expect(Array.isArray(unifiedMockDataService.getPolicies())).toBe(true);
      expect(Array.isArray(unifiedMockDataService.getClaims())).toBe(true);
      expect(Array.isArray(unifiedMockDataService.getPayments())).toBe(true);
      expect(Array.isArray(unifiedMockDataService.getDocuments())).toBe(true);
    });

    test('search methods handle special characters', () => {
      const results = unifiedMockDataService.searchUsers('@');
      expect(Array.isArray(results)).toBe(true);
    });

    test('async methods handle concurrent calls', async () => {
      const promises = [
        unifiedMockDataService.fetchUsersAsync(),
        unifiedMockDataService.fetchPoliciesAsync(),
        unifiedMockDataService.fetchClaimsAsync()
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      expect(Array.isArray(results[0])).toBe(true);
      expect(Array.isArray(results[1])).toBe(true);
      expect(Array.isArray(results[2])).toBe(true);
    });
  });
});