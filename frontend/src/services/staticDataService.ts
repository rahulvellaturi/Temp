import staticData from '../data/staticData.json';
import clientClaimsData from '../data/clientClaimsData.json';
import clientPaymentsData from '../data/clientPaymentsData.json';
import clientDocumentsData from '../data/clientDocumentsData.json';
import adminPoliciesData from '../data/adminPoliciesData.json';

// Type definitions for static data
interface DocumentCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

interface AvailablePolicy {
  id: string;
  number: string;
  type: string;
  description: string;
  balance?: number;
}

interface AvailableClient {
  id: string;
  name: string;
  email: string;
}

interface AvailableAgent {
  id: string;
  name: string;
  email: string;
}

interface ClaimTypes {
  AUTO: string[];
  HOME: string[];
  LIFE: string[];
  HEALTH: string[];
}

interface StaticDataStructure {
  usStates: string[];
  claimTypes: ClaimTypes;
  documentCategories: DocumentCategory[];
  availablePolicies: AvailablePolicy[];
  availableClients: AvailableClient[];
  availableAgents: AvailableAgent[];
}

// Static data service class
class StaticDataService {
  private data: StaticDataStructure;
  private clientClaimsData: typeof clientClaimsData;
  private clientPaymentsData: typeof clientPaymentsData;
  private clientDocumentsData: typeof clientDocumentsData;
  private adminPoliciesData: typeof adminPoliciesData;

  constructor() {
    this.data = staticData as StaticDataStructure;
    this.clientClaimsData = clientClaimsData;
    this.clientPaymentsData = clientPaymentsData;
    this.clientDocumentsData = clientDocumentsData;
    this.adminPoliciesData = adminPoliciesData;
  }

  // US States data
  getUsStates(): string[] {
    return this.data.usStates;
  }

  // Claim types data
  getClaimTypes(): ClaimTypes {
    return this.data.claimTypes;
  }

  getClaimTypesByInsuranceType(type: keyof ClaimTypes): string[] {
    return this.data.claimTypes[type] || [];
  }

  // Document categories data
  getDocumentCategories(): DocumentCategory[] {
    return this.data.documentCategories;
  }

  getDocumentCategoryById(id: string): DocumentCategory | undefined {
    return this.data.documentCategories.find(category => category.id === id);
  }

  // Available policies data
  getAvailablePolicies(): AvailablePolicy[] {
    return this.data.availablePolicies;
  }

  getAvailablePolicyById(id: string): AvailablePolicy | undefined {
    return this.data.availablePolicies.find(policy => policy.id === id);
  }

  // Available clients data (for admin)
  getAvailableClients(): AvailableClient[] {
    return this.data.availableClients;
  }

  getAvailableClientById(id: string): AvailableClient | undefined {
    return this.data.availableClients.find(client => client.id === id);
  }

  // Available agents data (for admin)
  getAvailableAgents(): AvailableAgent[] {
    return this.data.availableAgents;
  }

  getAvailableAgentById(id: string): AvailableAgent | undefined {
    return this.data.availableAgents.find(agent => agent.id === agent.id);
  }

  // Client claims data
  getClientClaims() {
    return this.clientClaimsData.claims;
  }

  getClientClaimById(id: string) {
    return this.clientClaimsData.claims.find(claim => claim.id === id);
  }

  getClientClaimsByStatus(status: string) {
    return this.clientClaimsData.claims.filter(claim => claim.status === status);
  }

  getClientClaimsByType(type: string) {
    return this.clientClaimsData.claims.filter(claim => claim.type === type);
  }

  // Client payments data
  getClientPayments() {
    return this.clientPaymentsData.payments;
  }

  getClientPaymentById(id: string) {
    return this.clientPaymentsData.payments.find(payment => payment.id === id);
  }

  getClientPaymentsByStatus(status: string) {
    return this.clientPaymentsData.payments.filter(payment => payment.status === status);
  }

  // Payment methods data
  getPaymentMethods() {
    return this.clientPaymentsData.paymentMethods;
  }

  getPaymentMethodById(id: string) {
    return this.clientPaymentsData.paymentMethods.find(method => method.id === id);
  }

  getDefaultPaymentMethod() {
    return this.clientPaymentsData.paymentMethods.find(method => method.isDefault);
  }

  // Client documents data
  getClientDocuments() {
    return this.clientDocumentsData.documents;
  }

  getClientDocumentById(id: string) {
    return this.clientDocumentsData.documents.find(document => document.id === id);
  }

  getClientDocumentsByType(type: string) {
    return this.clientDocumentsData.documents.filter(document => document.type === type);
  }

  getClientDocumentsByCategory(category: string) {
    return this.clientDocumentsData.documents.filter(document => document.category === category);
  }

  getClientDocumentsByStatus(status: string) {
    return this.clientDocumentsData.documents.filter(document => document.status === status);
  }

  getFavoriteDocuments() {
    return this.clientDocumentsData.documents.filter(document => document.isFavorite);
  }

  getConfidentialDocuments() {
    return this.clientDocumentsData.documents.filter(document => document.isConfidential);
  }

  // Admin policies data
  getAdminPolicies() {
    return this.adminPoliciesData.policies;
  }

  getAdminPolicyById(id: string) {
    return this.adminPoliciesData.policies.find(policy => policy.id === id);
  }

  getAdminPoliciesByType(type: string) {
    return this.adminPoliciesData.policies.filter(policy => policy.type === type);
  }

  getAdminPoliciesByStatus(status: string) {
    return this.adminPoliciesData.policies.filter(policy => policy.status === status);
  }

  getAdminPoliciesByClient(clientId: string) {
    return this.adminPoliciesData.policies.filter(policy => policy.clientId === clientId);
  }

  getAdminPoliciesByAgent(agentId: string) {
    return this.adminPoliciesData.policies.filter(policy => policy.agentId === agentId);
  }

  // Search methods
  searchClientClaims(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return this.clientClaimsData.claims.filter(claim => 
      claim.claimNumber.toLowerCase().includes(lowercaseQuery) ||
      claim.description.toLowerCase().includes(lowercaseQuery) ||
      claim.type.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchClientPayments(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return this.clientPaymentsData.payments.filter(payment => 
      payment.paymentNumber.toLowerCase().includes(lowercaseQuery) ||
      payment.policyNumber.toLowerCase().includes(lowercaseQuery) ||
      payment.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchClientDocuments(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return this.clientDocumentsData.documents.filter(document => 
      document.name.toLowerCase().includes(lowercaseQuery) ||
      document.description?.toLowerCase().includes(lowercaseQuery) ||
      document.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  searchAdminPolicies(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return this.adminPoliciesData.policies.filter(policy => 
      policy.policyNumber.toLowerCase().includes(lowercaseQuery) ||
      policy.clientName.toLowerCase().includes(lowercaseQuery) ||
      policy.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Utility methods
  getTotalClientPaymentsAmount() {
    return this.clientPaymentsData.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPendingClientPayments() {
    return this.clientPaymentsData.payments.filter(payment => payment.status === 'PENDING');
  }

  getFailedClientPayments() {
    return this.clientPaymentsData.payments.filter(payment => payment.status === 'FAILED');
  }

  getActiveClientClaims() {
    return this.clientClaimsData.claims.filter(claim => 
      ['SUBMITTED', 'UNDER_REVIEW'].includes(claim.status)
    );
  }

  getApprovedClientClaims() {
    return this.clientClaimsData.claims.filter(claim => 
      ['APPROVED', 'PAID'].includes(claim.status)
    );
  }

  getActiveAdminPolicies() {
    return this.adminPoliciesData.policies.filter(policy => policy.status === 'ACTIVE');
  }

  getPendingAdminPolicies() {
    return this.adminPoliciesData.policies.filter(policy => policy.status === 'PENDING');
  }

  getExpiredAdminPolicies() {
    return this.adminPoliciesData.policies.filter(policy => policy.status === 'EXPIRED');
  }

  // Statistics methods
  getClientClaimsStats() {
    const claims = this.clientClaimsData.claims;
    return {
      total: claims.length,
      pending: claims.filter(c => c.status === 'UNDER_REVIEW').length,
      approved: claims.filter(c => c.status === 'APPROVED').length,
      paid: claims.filter(c => c.status === 'PAID').length,
      totalAmount: claims.reduce((sum, c) => sum + c.amount, 0),
    };
  }

  getClientPaymentsStats() {
    const payments = this.clientPaymentsData.payments;
    return {
      total: payments.length,
      completed: payments.filter(p => p.status === 'COMPLETED').length,
      pending: payments.filter(p => p.status === 'PENDING').length,
      failed: payments.filter(p => p.status === 'FAILED').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    };
  }

  getAdminPoliciesStats() {
    const policies = this.adminPoliciesData.policies;
    return {
      total: policies.length,
      active: policies.filter(p => p.status === 'ACTIVE').length,
      pending: policies.filter(p => p.status === 'PENDING').length,
      expired: policies.filter(p => p.status === 'EXPIRED').length,
      totalPremiums: policies.reduce((sum, p) => sum + p.premium, 0),
      totalCoverage: policies.reduce((sum, p) => sum + p.coverage, 0),
    };
  }
}

// Export singleton instance
export const staticDataService = new StaticDataService();
export default staticDataService;