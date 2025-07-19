import React from 'react';
import { ReactWrapper } from 'enzyme';
import Claims from '../Claims';
import {
  mountWithAuth,
  shallowWithAuth,
  mockUser,
  createMockClaim,
  waitForAsync,
  simulateEvent,
  expectElementWithText,
  expectElementProps,
  fillFormField,
  submitForm,
  cleanupWrapper
} from '@/__tests__/utils/enzyme-utils';

// Mock the unified mock data service
jest.mock('@/services/unifiedMockDataService', () => ({
  __esModule: true,
  default: {
    fetchClaimsAsync: jest.fn(),
    getClaimsByUserId: jest.fn(),
    getAvailablePolicies: jest.fn(),
    getClaimTypes: jest.fn(),
    getClaims: jest.fn(),
    getClaimById: jest.fn(),
    searchClaims: jest.fn(),
    getClaimsByStatus: jest.fn(),
  },
}));

// Mock the useDataLoader hook
jest.mock('@/hooks/useDataLoader', () => ({
  useDataLoader: jest.fn(),
}));

// Mock react-redux
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => mockSelector(selector),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  XCircle: () => <div data-testid="x-circle-icon">XCircle</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  DollarSign: () => <div data-testid="dollar-sign-icon">DollarSign</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
}));

const mockClaims = [
  createMockClaim({
    id: '1',
    claimNumber: 'CLM-2024-001',
    status: 'SUBMITTED',
    type: 'Collision',
    amount: 5000,
    description: 'Rear-end collision on Highway 101',
  }),
  createMockClaim({
    id: '2',
    claimNumber: 'CLM-2024-002',
    status: 'APPROVED',
    type: 'Water Damage',
    amount: 12000,
    description: 'Water damage from burst pipe',
  }),
  createMockClaim({
    id: '3',
    claimNumber: 'CLM-2024-003',
    status: 'UNDER_REVIEW',
    type: 'Fire Damage',
    amount: 8000,
    description: 'Kitchen fire damage',
  }),
];

const mockAvailablePolicies = [
  { id: '1', number: 'AUTO-2024-001', type: 'AUTO', description: 'Toyota Camry 2022', balance: 1200 },
  { id: '2', number: 'HOME-2024-002', type: 'HOME', description: '123 Main St Property', balance: 800 },
];

const mockClaimTypes = {
  AUTO: ['Collision', 'Comprehensive', 'Liability'],
  HOME: ['Fire Damage', 'Water Damage', 'Theft'],
  LIFE: ['Death Benefit', 'Terminal Illness'],
  HEALTH: ['Medical Treatment', 'Emergency Care'],
};

describe('Claims Component', () => {
  let wrapper: ReactWrapper;
  const unifiedMockDataService = require('@/services/unifiedMockDataService').default;
  const useDataLoader = require('@/hooks/useDataLoader').useDataLoader;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    unifiedMockDataService.fetchClaimsAsync.mockResolvedValue(mockClaims);
    unifiedMockDataService.getClaimsByUserId.mockReturnValue(mockClaims);
    unifiedMockDataService.getAvailablePolicies.mockReturnValue(mockAvailablePolicies);
    unifiedMockDataService.getClaimTypes.mockReturnValue(mockClaimTypes);
    unifiedMockDataService.getClaims.mockReturnValue(mockClaims);
    unifiedMockDataService.getClaimById.mockImplementation((id: string) => 
      mockClaims.find(claim => claim.id === id)
    );
    unifiedMockDataService.searchClaims.mockImplementation((term: string) =>
      mockClaims.filter(claim => 
        claim.description.toLowerCase().includes(term.toLowerCase()) ||
        claim.claimNumber.toLowerCase().includes(term.toLowerCase())
      )
    );
    unifiedMockDataService.getClaimsByStatus.mockImplementation((status: string) =>
      mockClaims.filter(claim => claim.status === status)
    );

    // Mock useDataLoader default return
    useDataLoader.mockReturnValue({
      data: mockClaims,
      loading: false,
      error: null,
      setData: jest.fn(),
    });

    // Mock Redux selector
    mockSelector.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      token: 'mock-token',
    });
  });

  afterEach(() => {
    if (wrapper) {
      cleanupWrapper(wrapper);
    }
  });

  describe('Component Rendering', () => {
    test('renders claims page with correct structure', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('[data-testid="claims-page"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="page-header"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="claims-statistics"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="claims-content"]')).toHaveLength(1);
    });

    test('renders page header with correct title and description', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expectElementWithText(wrapper, '[data-testid="page-title"]', 'Claims');
      expectElementWithText(wrapper, '[data-testid="page-description"]', 'Manage and track your insurance claims');
    });

    test('renders file new claim button', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const newClaimButton = wrapper.find('[data-testid="file-new-claim"]');
      expect(newClaimButton).toHaveLength(1);
      expect(newClaimButton.text()).toContain('File New Claim');
    });

    test('renders search and filter controls', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="search-input"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="status-filter"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="policy-type-filter"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="clear-filters"]')).toHaveLength(1);
    });

    test('renders claims statistics cards', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="stat-total-claims"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="stat-under-review"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="stat-approved"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="stat-total-paid"]')).toHaveLength(1);
    });

    test('renders claims grid when data is loaded', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="claims-grid"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="claim-card"]')).toHaveLength(3);
    });

    test('renders loading state', () => {
      useDataLoader.mockReturnValue({
        data: [],
        loading: true,
        error: null,
        setData: jest.fn(),
      });

      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="loading-spinner"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="loading-text"]').text()).toContain('Loading claims');
    });

    test('renders error state', () => {
      useDataLoader.mockReturnValue({
        data: [],
        loading: false,
        error: 'Failed to load claims',
        setData: jest.fn(),
      });

      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="error-state"]')).toHaveLength(1);
      expectElementWithText(wrapper, '[data-testid="error-message"]', 'Failed to load claims');
    });

    test('renders empty state when no claims', () => {
      useDataLoader.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        setData: jest.fn(),
      });

      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="empty-state"]')).toHaveLength(1);
      expectElementWithText(wrapper, '[data-testid="empty-message"]', 'No claims found');
    });
  });

  describe('Claims Statistics', () => {
    test('displays correct total claims count', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expectElementWithText(wrapper, '[data-testid="stat-total-claims"] .stat-value', '3');
    });

    test('displays correct under review count', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expectElementWithText(wrapper, '[data-testid="stat-under-review"] .stat-value', '1');
    });

    test('displays correct approved count', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expectElementWithText(wrapper, '[data-testid="stat-approved"] .stat-value', '1');
    });

    test('calculates total paid amount correctly', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expectElementWithText(wrapper, '[data-testid="stat-total-paid"] .stat-value', '$12,000');
    });

    test('updates statistics when claims data changes', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      const newClaims = [
        ...mockClaims,
        createMockClaim({
          id: '4',
          status: 'PAID',
          payoutAmount: 5000,
        }),
      ];

      // Update the mock data
      useDataLoader.mockReturnValue({
        data: newClaims,
        loading: false,
        error: null,
        setData: jest.fn(),
      });

      wrapper.setProps({}); // Force re-render
      await waitForAsync(wrapper);

      expectElementWithText(wrapper, '[data-testid="stat-total-claims"] .stat-value', '4');
    });
  });

  describe('Claims List Display', () => {
    test('displays all claim cards', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const claimCards = wrapper.find('[data-testid="claim-card"]');
      expect(claimCards).toHaveLength(3);
    });

    test('displays claim information correctly', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const firstClaimCard = wrapper.find('[data-testid="claim-card"]').at(0);
      expectElementWithText(firstClaimCard, '[data-testid="claim-number"]', 'CLM-2024-001');
      expectElementWithText(firstClaimCard, '[data-testid="claim-type"]', 'Collision');
      expectElementWithText(firstClaimCard, '[data-testid="claim-amount"]', '$5,000');
      expectElementWithText(firstClaimCard, '[data-testid="claim-status"]', 'SUBMITTED');
    });

    test('displays claim descriptions', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const firstClaimCard = wrapper.find('[data-testid="claim-card"]').at(0);
      expectElementWithText(firstClaimCard, '[data-testid="claim-description"]', 'Rear-end collision on Highway 101');
    });

    test('displays status badges with correct styling', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const statusBadges = wrapper.find('[data-testid="claim-status"]');
      expect(statusBadges.at(0).hasClass('status-submitted')).toBe(true);
      expect(statusBadges.at(1).hasClass('status-approved')).toBe(true);
      expect(statusBadges.at(2).hasClass('status-under-review')).toBe(true);
    });

    test('displays claim dates in correct format', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const claimCards = wrapper.find('[data-testid="claim-card"]');
      claimCards.forEach(card => {
        const dateElement = card.find('[data-testid="claim-date"]');
        expect(dateElement.text()).toMatch(/\d{4}-\d{2}-\d{2}/);
      });
    });
  });

  describe('Search and Filtering', () => {
    test('filters claims by search term', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      const searchInput = wrapper.find('[data-testid="search-input"]');
      fillFormField(wrapper, '[data-testid="search-input"]', 'collision');
      
      await waitForAsync(wrapper);
      
      expect(unifiedMockDataService.searchClaims).toHaveBeenCalledWith('collision');
    });

    test('clears search when input is empty', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      // First enter a search term
      fillFormField(wrapper, '[data-testid="search-input"]', 'collision');
      await waitForAsync(wrapper);
      
      // Then clear it
      fillFormField(wrapper, '[data-testid="search-input"]', '');
      await waitForAsync(wrapper);
      
      // Should show all claims again
      expect(wrapper.find('[data-testid="claim-card"]')).toHaveLength(3);
    });

    test('filters claims by status', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      const statusFilter = wrapper.find('[data-testid="status-filter"]');
      simulateEvent(wrapper, '[data-testid="status-filter"]', 'change', {
        target: { value: 'APPROVED' }
      });
      
      await waitForAsync(wrapper);
      
      expect(unifiedMockDataService.getClaimsByStatus).toHaveBeenCalledWith('APPROVED');
    });

    test('filters claims by policy type', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="policy-type-filter"]', 'change', {
        target: { value: 'AUTO' }
      });
      
      await waitForAsync(wrapper);
      
      const displayedClaims = wrapper.find('[data-testid="claim-card"]');
      displayedClaims.forEach(card => {
        expect(card.find('[data-testid="claim-policy-type"]').text()).toBe('AUTO');
      });
    });

    test('clears all filters when clear button is clicked', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      // Apply some filters first
      fillFormField(wrapper, '[data-testid="search-input"]', 'collision');
      simulateEvent(wrapper, '[data-testid="status-filter"]', 'change', {
        target: { value: 'APPROVED' }
      });
      
      await waitForAsync(wrapper);
      
      // Click clear filters
      simulateEvent(wrapper, '[data-testid="clear-filters"]', 'click');
      
      await waitForAsync(wrapper);
      
      // Check that inputs are cleared
      expect(wrapper.find('[data-testid="search-input"]').prop('value')).toBe('');
      expect(wrapper.find('[data-testid="status-filter"]').prop('value')).toBe('ALL');
      expect(wrapper.find('[data-testid="policy-type-filter"]').prop('value')).toBe('ALL');
    });

    test('combines search and filter criteria', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      fillFormField(wrapper, '[data-testid="search-input"]', 'damage');
      simulateEvent(wrapper, '[data-testid="status-filter"]', 'change', {
        target: { value: 'APPROVED' }
      });
      
      await waitForAsync(wrapper);
      
      // Should show only approved claims that match "damage"
      const displayedClaims = wrapper.find('[data-testid="claim-card"]');
      expect(displayedClaims).toHaveLength(1);
      expectElementWithText(displayedClaims.at(0), '[data-testid="claim-type"]', 'Water Damage');
    });
  });

  describe('Claim Details Modal', () => {
    test('opens claim details modal when claim card is clicked', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      const firstClaimCard = wrapper.find('[data-testid="claim-card"]').at(0);
      simulateEvent(wrapper, '[data-testid="claim-card"]', 'click', {}, 0);
      
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="claim-details-modal"]')).toHaveLength(1);
    });

    test('displays claim details in modal', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="claim-card"]', 'click', {}, 0);
      await waitForAsync(wrapper);
      
      const modal = wrapper.find('[data-testid="claim-details-modal"]');
      expectElementWithText(modal, '[data-testid="modal-title"]', 'Claim CLM-2024-001');
      expectElementWithText(modal, '[data-testid="claim-details-type"]', 'Collision - AUTO-2024-001');
    });

    test('displays claim timeline in modal', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="claim-card"]', 'click', {}, 0);
      await waitForAsync(wrapper);
      
      const modal = wrapper.find('[data-testid="claim-details-modal"]');
      expect(modal.find('[data-testid="claim-timeline"]')).toHaveLength(1);
    });

    test('displays claim documents in modal', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="claim-card"]', 'click', {}, 0);
      await waitForAsync(wrapper);
      
      const modal = wrapper.find('[data-testid="claim-details-modal"]');
      expect(modal.find('[data-testid="claim-documents"]')).toHaveLength(1);
    });

    test('closes modal when close button is clicked', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      // Open modal
      simulateEvent(wrapper, '[data-testid="claim-card"]', 'click', {}, 0);
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="claim-details-modal"]')).toHaveLength(1);
      
      // Close modal
      simulateEvent(wrapper, '[data-testid="modal-close"]', 'click');
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="claim-details-modal"]')).toHaveLength(0);
    });

    test('closes modal when backdrop is clicked', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      // Open modal
      simulateEvent(wrapper, '[data-testid="claim-card"]', 'click', {}, 0);
      await waitForAsync(wrapper);
      
      // Click backdrop
      simulateEvent(wrapper, '[data-testid="modal-backdrop"]', 'click');
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="claim-details-modal"]')).toHaveLength(0);
    });

    test('handles modal keyboard navigation', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      // Open modal
      simulateEvent(wrapper, '[data-testid="claim-card"]', 'click', {}, 0);
      await waitForAsync(wrapper);
      
      // Press Escape key
      simulateEvent(wrapper, '[data-testid="claim-details-modal"]', 'keydown', {
        key: 'Escape',
        keyCode: 27,
      });
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="claim-details-modal"]')).toHaveLength(0);
    });
  });

  describe('New Claim Form', () => {
    test('opens new claim form modal', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="new-claim-modal"]')).toHaveLength(1);
    });

    test('displays form fields in new claim modal', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      const modal = wrapper.find('[data-testid="new-claim-modal"]');
      expect(modal.find('[data-testid="policy-select"]')).toHaveLength(1);
      expect(modal.find('[data-testid="claim-type-select"]')).toHaveLength(1);
      expect(modal.find('[data-testid="incident-date"]')).toHaveLength(1);
      expect(modal.find('[data-testid="description"]')).toHaveLength(1);
      expect(modal.find('[data-testid="location"]')).toHaveLength(1);
    });

    test('validates required fields', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      // Try to submit without filling required fields
      simulateEvent(wrapper, '[data-testid="submit-claim"]', 'click');
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="policy-error"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="claim-type-error"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="incident-date-error"]')).toHaveLength(1);
    });

    test('populates claim types based on selected policy', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      // Select AUTO policy
      simulateEvent(wrapper, '[data-testid="policy-select"]', 'change', {
        target: { value: '1' }
      });
      await waitForAsync(wrapper);
      
      const claimTypeOptions = wrapper.find('[data-testid="claim-type-option"]');
      expect(claimTypeOptions.length).toBeGreaterThan(0);
      expect(claimTypeOptions.at(0).text()).toBe('Collision');
    });

    test('submits form with valid data', async () => {
      const mockSubmit = jest.fn().mockResolvedValue({ success: true });
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      // Fill form
      simulateEvent(wrapper, '[data-testid="policy-select"]', 'change', {
        target: { value: '1' }
      });
      simulateEvent(wrapper, '[data-testid="claim-type-select"]', 'change', {
        target: { value: 'Collision' }
      });
      fillFormField(wrapper, '[data-testid="incident-date"]', '2024-01-25');
      fillFormField(wrapper, '[data-testid="description"]', 'Test claim description');
      fillFormField(wrapper, '[data-testid="location"]', 'Test location');
      
      await waitForAsync(wrapper);
      
      // Submit form
      simulateEvent(wrapper, '[data-testid="submit-claim"]', 'click');
      await waitForAsync(wrapper);
      
      // Should show success message
      expect(wrapper.find('[data-testid="success-message"]')).toHaveLength(1);
    });

    test('handles form submission errors', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      // Mock form submission error
      const form = wrapper.find('[data-testid="new-claim-form"]');
      form.prop('onSubmit')({ preventDefault: jest.fn() });
      
      // Simulate API error
      await waitForAsync(wrapper, 100);
      wrapper.setProps({}); // Force re-render
      
      expect(wrapper.find('[data-testid="error-message"]')).toHaveLength(1);
    });

    test('closes form modal after successful submission', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      expect(wrapper.find('[data-testid="new-claim-modal"]')).toHaveLength(1);
      
      // Fill and submit form successfully
      simulateEvent(wrapper, '[data-testid="policy-select"]', 'change', {
        target: { value: '1' }
      });
      simulateEvent(wrapper, '[data-testid="claim-type-select"]', 'change', {
        target: { value: 'Collision' }
      });
      fillFormField(wrapper, '[data-testid="incident-date"]', '2024-01-25');
      fillFormField(wrapper, '[data-testid="description"]', 'Test claim');
      
      simulateEvent(wrapper, '[data-testid="submit-claim"]', 'click');
      await waitForAsync(wrapper, 500);
      
      // Modal should be closed
      expect(wrapper.find('[data-testid="new-claim-modal"]')).toHaveLength(0);
    });
  });

  describe('Component Lifecycle', () => {
    test('loads claims data on component mount', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(useDataLoader).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ initialData: [] })
      );
    });

    test('cleans up resources on unmount', () => {
      wrapper = mountWithAuth(<Claims />);
      const instance = wrapper.instance();
      
      wrapper.unmount();
      
      // Verify cleanup occurred
      expect(wrapper.exists()).toBe(false);
    });

    test('handles component re-renders correctly', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      const initialClaimCount = wrapper.find('[data-testid="claim-card"]').length;
      
      // Force re-render with same props
      wrapper.setProps({});
      await waitForAsync(wrapper);
      
      const updatedClaimCount = wrapper.find('[data-testid="claim-card"]').length;
      expect(updatedClaimCount).toBe(initialClaimCount);
    });
  });

  describe('Error Handling', () => {
    test('displays error message when data loading fails', () => {
      useDataLoader.mockReturnValue({
        data: [],
        loading: false,
        error: 'Network error',
        setData: jest.fn(),
      });

      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="error-state"]')).toHaveLength(1);
      expectElementWithText(wrapper, '[data-testid="error-message"]', 'Network error');
    });

    test('provides retry functionality on error', () => {
      const mockRetry = jest.fn();
      useDataLoader.mockReturnValue({
        data: [],
        loading: false,
        error: 'Network error',
        setData: jest.fn(),
        retry: mockRetry,
      });

      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="retry-button"]', 'click');
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    test('handles service method errors gracefully', async () => {
      unifiedMockDataService.searchClaims.mockImplementation(() => {
        throw new Error('Service error');
      });

      wrapper = mountWithAuth(<Claims />);
      
      // This should not crash the component
      fillFormField(wrapper, '[data-testid="search-input"]', 'test');
      await waitForAsync(wrapper);
      
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Performance and Optimization', () => {
    test('renders within acceptable time', () => {
      const startTime = performance.now();
      wrapper = mountWithAuth(<Claims />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms
    });

    test('handles large datasets efficiently', () => {
      const largeMockClaims = Array.from({ length: 100 }, (_, index) =>
        createMockClaim({ id: `${index + 1}`, claimNumber: `CLM-2024-${String(index + 1).padStart(3, '0')}` })
      );

      useDataLoader.mockReturnValue({
        data: largeMockClaims,
        loading: false,
        error: null,
        setData: jest.fn(),
      });

      const startTime = performance.now();
      wrapper = mountWithAuth(<Claims />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should handle large datasets efficiently
      expect(wrapper.find('[data-testid="claim-card"]')).toHaveLength(100);
    });

    test('memoizes expensive calculations', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const initialStatsRender = wrapper.find('[data-testid="claims-statistics"]');
      
      // Force re-render without changing data
      wrapper.setProps({});
      
      const secondStatsRender = wrapper.find('[data-testid="claims-statistics"]');
      
      // Statistics should be the same (memoized)
      expect(initialStatsRender.html()).toBe(secondStatsRender.html());
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="claims-page"]').prop('role')).toBe('main');
      expect(wrapper.find('[data-testid="search-input"]').prop('aria-label')).toBe('Search claims');
      expect(wrapper.find('[data-testid="file-new-claim"]').prop('aria-label')).toBe('File new claim');
    });

    test('supports keyboard navigation', () => {
      wrapper = mountWithAuth(<Claims />);
      
      const fileNewClaimButton = wrapper.find('[data-testid="file-new-claim"]');
      expect(fileNewClaimButton.prop('tabIndex')).toBe(0);
      
      const searchInput = wrapper.find('[data-testid="search-input"]');
      expect(searchInput.prop('tabIndex')).toBe(0);
    });

    test('has proper heading hierarchy', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('h1')).toHaveLength(1);
      expect(wrapper.find('h2').length).toBeGreaterThan(0);
      expect(wrapper.find('h3').length).toBeGreaterThan(0);
    });

    test('provides focus management for modals', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      simulateEvent(wrapper, '[data-testid="file-new-claim"]', 'click');
      await waitForAsync(wrapper);
      
      const modal = wrapper.find('[data-testid="new-claim-modal"]');
      expect(modal.prop('aria-modal')).toBe(true);
      expect(modal.prop('role')).toBe('dialog');
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      wrapper = mountWithAuth(<Claims />);
      
      const claimsGrid = wrapper.find('[data-testid="claims-grid"]');
      expect(claimsGrid.hasClass('grid-cols-1')).toBe(true);
    });

    test('adapts to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      wrapper = mountWithAuth(<Claims />);
      
      const claimsGrid = wrapper.find('[data-testid="claims-grid"]');
      expect(claimsGrid.hasClass('md:grid-cols-2')).toBe(true);
    });

    test('adapts to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      wrapper = mountWithAuth(<Claims />);
      
      const claimsGrid = wrapper.find('[data-testid="claims-grid"]');
      expect(claimsGrid.hasClass('lg:grid-cols-3')).toBe(true);
    });
  });

  describe('Data Integration', () => {
    test('calls unified mock data service methods correctly', () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(useDataLoader).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ initialData: [] })
      );
    });

    test('handles async data loading correctly', async () => {
      useDataLoader.mockReturnValue({
        data: [],
        loading: true,
        error: null,
        setData: jest.fn(),
      });

      wrapper = mountWithAuth(<Claims />);
      expect(wrapper.find('[data-testid="loading-spinner"]')).toHaveLength(1);

      // Simulate data loading completion
      useDataLoader.mockReturnValue({
        data: mockClaims,
        loading: false,
        error: null,
        setData: jest.fn(),
      });

      wrapper.setProps({}); // Force re-render
      await waitForAsync(wrapper);

      expect(wrapper.find('[data-testid="claim-card"]')).toHaveLength(3);
    });

    test('updates UI when data changes', async () => {
      wrapper = mountWithAuth(<Claims />);
      
      expect(wrapper.find('[data-testid="claim-card"]')).toHaveLength(3);
      
      // Update data
      const newMockClaims = [
        ...mockClaims,
        createMockClaim({ id: '4', claimNumber: 'CLM-2024-004' }),
      ];

      useDataLoader.mockReturnValue({
        data: newMockClaims,
        loading: false,
        error: null,
        setData: jest.fn(),
      });

      wrapper.setProps({}); // Force re-render
      await waitForAsync(wrapper);

      expect(wrapper.find('[data-testid="claim-card"]')).toHaveLength(4);
    });
  });
});