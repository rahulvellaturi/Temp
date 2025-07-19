import unifiedMockDataService from '../unifiedMockDataService';
import { User, Policy, Claim, Payment, PaymentMethod, Document } from '../unifiedMockDataService';

describe('UnifiedMockDataService', () => {
  describe('User Methods', () => {
    test('getUsers returns all users', () => {
      const users = unifiedMockDataService.getUsers();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    test('getUserById returns correct user', () => {
      const user = unifiedMockDataService.getUserById('1');
      expect(user).toBeDefined();
      expect(user?.id).toBe('1');
      expect(user?.firstName).toBe('John');
      expect(user?.lastName).toBe('Doe');
    });

    test('getUserById returns undefined for non-existent user', () => {
      const user = unifiedMockDataService.getUserById('999');
      expect(user).toBeUndefined();
    });

    test('getUsersByRole returns users with specific role', () => {
      const clients = unifiedMockDataService.getUsersByRole('CLIENT');
      expect(clients).toBeDefined();
      expect(Array.isArray(clients)).toBe(true);
      clients.forEach(user => {
        expect(user.role).toBe('CLIENT');
      });
    });

    test('searchUsers finds users by name and email', () => {
      const results = unifiedMockDataService.searchUsers('john');
      expect(results.length).toBeGreaterThan(0);
      
      const johnUser = results.find(user => user.firstName.toLowerCase() === 'john');
      expect(johnUser).toBeDefined();
    });
  });

  describe('Policy Methods', () => {
    test('getPolicies returns all policies', () => {
      const policies = unifiedMockDataService.getPolicies();
      expect(policies).toBeDefined();
      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBeGreaterThan(0);
    });

    test('getPolicyById returns correct policy', () => {
      const policy = unifiedMockDataService.getPolicyById('1');
      expect(policy).toBeDefined();
      expect(policy?.id).toBe('1');
      expect(policy?.policyNumber).toBe('AUTO-2024-001');
    });

    test('getPoliciesByUserId returns user policies', () => {
      const policies = unifiedMockDataService.getPoliciesByUserId('1');
      expect(policies).toBeDefined();
      expect(Array.isArray(policies)).toBe(true);
      policies.forEach(policy => {
        expect(policy.clientId).toBe('1');
      });
    });

    test('getPoliciesByType returns policies of specific type', () => {
      const autoPolicies = unifiedMockDataService.getPoliciesByType('AUTO');
      expect(autoPolicies).toBeDefined();
      autoPolicies.forEach(policy => {
        expect(policy.type).toBe('AUTO');
      });
    });

    test('getPoliciesByStatus returns policies with specific status', () => {
      const activePolicies = unifiedMockDataService.getPoliciesByStatus('ACTIVE');
      expect(activePolicies).toBeDefined();
      activePolicies.forEach(policy => {
        expect(policy.status).toBe('ACTIVE');
      });
    });

    test('getAvailablePolicies returns available policies', () => {
      const availablePolicies = unifiedMockDataService.getAvailablePolicies();
      expect(availablePolicies).toBeDefined();
      expect(Array.isArray(availablePolicies)).toBe(true);
      expect(availablePolicies.length).toBeGreaterThan(0);
    });

    test('searchPolicies finds policies by number and description', () => {
      const results = unifiedMockDataService.searchPolicies('auto');
      expect(results.length).toBeGreaterThan(0);
      
      const autoPolicy = results.find(policy => 
        policy.policyNumber.toLowerCase().includes('auto') || 
        policy.description.toLowerCase().includes('auto')
      );
      expect(autoPolicy).toBeDefined();
    });
  });

  describe('Claim Methods', () => {
    test('getClaims returns all claims', () => {
      const claims = unifiedMockDataService.getClaims();
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
      expect(claims.length).toBeGreaterThan(0);
    });

    test('getClaimById returns correct claim', () => {
      const claim = unifiedMockDataService.getClaimById('1');
      expect(claim).toBeDefined();
      expect(claim?.id).toBe('1');
    });

    test('getClaimsByUserId returns user claims', () => {
      const claims = unifiedMockDataService.getClaimsByUserId('1');
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
      claims.forEach(claim => {
        expect(claim.clientId).toBe('1');
      });
    });

    test('getClaimsByPolicyId returns policy claims', () => {
      const claims = unifiedMockDataService.getClaimsByPolicyId('1');
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
      claims.forEach(claim => {
        expect(claim.policyId).toBe('1');
      });
    });

    test('getClaimsByStatus returns claims with specific status', () => {
      const pendingClaims = unifiedMockDataService.getClaimsByStatus('SUBMITTED');
      expect(pendingClaims).toBeDefined();
      pendingClaims.forEach(claim => {
        expect(claim.status).toBe('SUBMITTED');
      });
    });

    test('getClaimTypes returns claim types by policy type', () => {
      const claimTypes = unifiedMockDataService.getClaimTypes();
      expect(claimTypes).toBeDefined();
      expect(claimTypes.AUTO).toBeDefined();
      expect(claimTypes.HOME).toBeDefined();
      expect(claimTypes.LIFE).toBeDefined();
      expect(claimTypes.HEALTH).toBeDefined();
      expect(Array.isArray(claimTypes.AUTO)).toBe(true);
    });

    test('searchClaims finds claims by number and description', () => {
      const results = unifiedMockDataService.searchClaims('collision');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Methods', () => {
    test('getPayments returns all payments', () => {
      const payments = unifiedMockDataService.getPayments();
      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBeGreaterThan(0);
    });

    test('getPaymentById returns correct payment', () => {
      const payment = unifiedMockDataService.getPaymentById('1');
      expect(payment).toBeDefined();
      expect(payment?.id).toBe('1');
    });

    test('getPaymentsByUserId returns user payments', () => {
      const payments = unifiedMockDataService.getPaymentsByUserId('1');
      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
      payments.forEach(payment => {
        expect(payment.clientId).toBe('1');
      });
    });

    test('getPaymentsByStatus returns payments with specific status', () => {
      const completedPayments = unifiedMockDataService.getPaymentsByStatus('COMPLETED');
      expect(completedPayments).toBeDefined();
      completedPayments.forEach(payment => {
        expect(payment.status).toBe('COMPLETED');
      });
    });

    test('getPaymentMethods returns all payment methods', () => {
      const paymentMethods = unifiedMockDataService.getPaymentMethods();
      expect(paymentMethods).toBeDefined();
      expect(Array.isArray(paymentMethods)).toBe(true);
    });

    test('getPaymentMethodsByUserId returns user payment methods', () => {
      const paymentMethods = unifiedMockDataService.getPaymentMethodsByUserId('1');
      expect(paymentMethods).toBeDefined();
      expect(Array.isArray(paymentMethods)).toBe(true);
      paymentMethods.forEach(method => {
        expect(method.userId).toBe('1');
      });
    });
  });

  describe('Document Methods', () => {
    test('getDocuments returns all documents', () => {
      const documents = unifiedMockDataService.getDocuments();
      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBeGreaterThan(0);
    });

    test('getDocumentById returns correct document', () => {
      const document = unifiedMockDataService.getDocumentById('1');
      expect(document).toBeDefined();
      expect(document?.id).toBe('1');
    });

    test('getDocumentsByUserId returns user documents', () => {
      const documents = unifiedMockDataService.getDocumentsByUserId('1');
      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
      documents.forEach(doc => {
        expect(doc.userId).toBe('1');
      });
    });

    test('getDocumentsByCategory returns documents by category', () => {
      const autoDocuments = unifiedMockDataService.getDocumentsByCategory('Auto Insurance');
      expect(autoDocuments).toBeDefined();
      expect(Array.isArray(autoDocuments)).toBe(true);
      autoDocuments.forEach(doc => {
        expect(doc.category).toBe('Auto Insurance');
      });
    });

    test('searchDocuments finds documents by name and tags', () => {
      const results = unifiedMockDataService.searchDocuments('policy');
      expect(results.length).toBeGreaterThan(0);
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
    });

    test('getRecentActivity returns recent activities', () => {
      const activities = unifiedMockDataService.getRecentActivity();
      expect(activities).toBeDefined();
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);
    });

    test('getQuickActions returns quick actions', () => {
      const quickActions = unifiedMockDataService.getQuickActions();
      expect(quickActions).toBeDefined();
      expect(Array.isArray(quickActions)).toBe(true);
      expect(quickActions.length).toBeGreaterThan(0);
    });
  });

  describe('Dashboard Methods', () => {
    test('getDashboardStats returns dashboard statistics', () => {
      const dashboardStats = unifiedMockDataService.getDashboardStats();
      expect(dashboardStats).toBeDefined();
      expect(typeof dashboardStats.totalPolicies).toBe('number');
      expect(typeof dashboardStats.activeClaims).toBe('number');
      expect(typeof dashboardStats.totalCoverage).toBe('number');
    });

    test('getDashboardData returns comprehensive dashboard data', () => {
      const dashboardData = unifiedMockDataService.getDashboardData('1');
      expect(dashboardData).toBeDefined();
      expect(dashboardData.stats).toBeDefined();
      expect(dashboardData.policies).toBeDefined();
      expect(dashboardData.claims).toBeDefined();
      expect(dashboardData.payments).toBeDefined();
      expect(dashboardData.documents).toBeDefined();
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
  });

  describe('Async Methods', () => {
    test('fetchUsersAsync returns users with delay', async () => {
      const startTime = Date.now();
      const users = await unifiedMockDataService.fetchUsersAsync();
      const endTime = Date.now();
      
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(400); // Should take at least 400ms
    });

    test('fetchPoliciesAsync returns policies with delay', async () => {
      const policies = await unifiedMockDataService.fetchPoliciesAsync();
      expect(policies).toBeDefined();
      expect(Array.isArray(policies)).toBe(true);
    });

    test('fetchClaimsAsync returns claims with delay', async () => {
      const claims = await unifiedMockDataService.fetchClaimsAsync();
      expect(claims).toBeDefined();
      expect(Array.isArray(claims)).toBe(true);
    });

    test('fetchPaymentsAsync returns payments with delay', async () => {
      const payments = await unifiedMockDataService.fetchPaymentsAsync();
      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
    });

    test('fetchDocumentsAsync returns documents with delay', async () => {
      const documents = await unifiedMockDataService.fetchDocumentsAsync();
      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
    });

    test('fetchDashboardDataAsync returns dashboard data with delay', async () => {
      const dashboardData = await unifiedMockDataService.fetchDashboardDataAsync('1');
      expect(dashboardData).toBeDefined();
      expect(dashboardData.stats).toBeDefined();
      expect(dashboardData.policies).toBeDefined();
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
  });
});