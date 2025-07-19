import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAuth, mockUser, checkAccessibility } from '@/__tests__/utils/test-utils';
import Claims from '../Claims';
import unifiedMockDataService from '@/services/unifiedMockDataService';

// Mock the unified mock data service
jest.mock('@/services/unifiedMockDataService', () => ({
  __esModule: true,
  default: {
    fetchClaimsAsync: jest.fn(),
    getClaimsByUserId: jest.fn(),
    getAvailablePolicies: jest.fn(),
    getClaimTypes: jest.fn(),
  },
}));

// Mock the useDataLoader hook
jest.mock('@/hooks/useDataLoader', () => ({
  useDataLoader: jest.fn(),
}));

const mockClaims = [
  {
    id: '1',
    claimNumber: 'CLM-2024-001',
    policyId: '1',
    policyType: 'AUTO',
    policyNumber: 'AUTO-2024-001',
    clientId: '1',
    clientName: 'John Doe',
    type: 'Collision',
    status: 'UNDER_REVIEW',
    amount: 5000,
    estimatedAmount: 5500,
    payoutAmount: 0,
    submittedDate: '2024-01-15',
    submittedAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-18T10:15:00Z',
    incidentDate: '2024-01-10',
    description: 'Rear-end collision on Highway 101 during morning commute',
    location: 'Highway 101, San Francisco, CA',
    adjusterName: 'Sarah Johnson',
    adjusterPhone: '(555) 123-4567',
    adjusterEmail: 'sarah.johnson@assureme.com',
    documents: [],
    timeline: [],
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
    submittedAt: '2024-01-10T09:45:00Z',
    updatedAt: '2024-01-18T16:20:00Z',
    incidentDate: '2024-01-08',
    description: 'Pipe burst in basement causing extensive water damage',
    location: '123 Main St, Basement',
    adjusterName: 'Mike Chen',
    adjusterPhone: '(555) 987-6543',
    adjusterEmail: 'mike.chen@assureme.com',
    documents: [],
    timeline: [],
  },
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
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (unifiedMockDataService.fetchClaimsAsync as jest.Mock).mockResolvedValue(mockClaims);
    (unifiedMockDataService.getClaimsByUserId as jest.Mock).mockReturnValue(mockClaims);
    (unifiedMockDataService.getAvailablePolicies as jest.Mock).mockReturnValue(mockAvailablePolicies);
    (unifiedMockDataService.getClaimTypes as jest.Mock).mockReturnValue(mockClaimTypes);

    // Mock useDataLoader
    require('@/hooks/useDataLoader').useDataLoader.mockReturnValue({
      data: mockClaims,
      loading: false,
      error: null,
      setData: jest.fn(),
    });
  });

  describe('Rendering', () => {
    test('renders claims page with header', async () => {
      renderWithAuth(<Claims />);

      expect(screen.getByText('Claims')).toBeInTheDocument();
      expect(screen.getByText('Manage and track your insurance claims')).toBeInTheDocument();
    });

    test('displays loading state initially', () => {
      require('@/hooks/useDataLoader').useDataLoader.mockReturnValue({
        data: [],
        loading: true,
        error: null,
        setData: jest.fn(),
      });

      renderWithAuth(<Claims />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('displays error state when there is an error', () => {
      require('@/hooks/useDataLoader').useDataLoader.mockReturnValue({
        data: [],
        loading: false,
        error: 'Failed to load claims',
        setData: jest.fn(),
      });

      renderWithAuth(<Claims />);
      expect(screen.getByText(/error loading claims/i)).toBeInTheDocument();
    });

    test('displays claims list when data is loaded', async () => {
      renderWithAuth(<Claims />);

      await waitFor(() => {
        expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
        expect(screen.getByText('CLM-2024-002')).toBeInTheDocument();
      });
    });
  });

  describe('Claims Statistics', () => {
    test('displays correct claim statistics', async () => {
      renderWithAuth(<Claims />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total Claims
        expect(screen.getByText('1')).toBeInTheDocument(); // Under Review
        expect(screen.getByText('1')).toBeInTheDocument(); // Approved
        expect(screen.getByText('$12,000')).toBeInTheDocument(); // Total Paid
      });
    });

    test('updates statistics when claims change', async () => {
      const { rerender } = renderWithAuth(<Claims />);

      // Update mock data
      const updatedClaims = [...mockClaims, {
        ...mockClaims[0],
        id: '3',
        claimNumber: 'CLM-2024-003',
        status: 'PAID',
        payoutAmount: 3000,
      }];

      require('@/hooks/useDataLoader').useDataLoader.mockReturnValue({
        data: updatedClaims,
        loading: false,
        error: null,
        setData: jest.fn(),
      });

      rerender(<Claims />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total Claims updated
      });
    });
  });

  describe('Claims Filtering', () => {
    test('filters claims by search term', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      const searchInput = screen.getByPlaceholderText(/search claims/i);
      await user.type(searchInput, 'collision');

      await waitFor(() => {
        expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
        expect(screen.queryByText('CLM-2024-002')).not.toBeInTheDocument();
      });
    });

    test('filters claims by status', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusFilter);
      await user.click(screen.getByText('Approved'));

      await waitFor(() => {
        expect(screen.queryByText('CLM-2024-001')).not.toBeInTheDocument();
        expect(screen.getByText('CLM-2024-002')).toBeInTheDocument();
      });
    });

    test('filters claims by policy type', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      const policyTypeFilter = screen.getByRole('combobox', { name: /policy type/i });
      await user.click(policyTypeFilter);
      await user.click(screen.getByText('Auto'));

      await waitFor(() => {
        expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
        expect(screen.queryByText('CLM-2024-002')).not.toBeInTheDocument();
      });
    });

    test('clears all filters', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      // Apply filters
      const searchInput = screen.getByPlaceholderText(/search claims/i);
      await user.type(searchInput, 'collision');

      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
        expect(screen.getByText('CLM-2024-002')).toBeInTheDocument();
      });
    });
  });

  describe('Claim Details Modal', () => {
    test('opens claim details modal when claim is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      await waitFor(() => {
        const claimCard = screen.getByText('CLM-2024-001');
        user.click(claimCard);
      });

      await waitFor(() => {
        expect(screen.getByText('Claim CLM-2024-001')).toBeInTheDocument();
        expect(screen.getByText('Collision - AUTO-2024-001')).toBeInTheDocument();
      });
    });

    test('closes claim details modal', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      // Open modal
      await waitFor(() => {
        const claimCard = screen.getByText('CLM-2024-001');
        user.click(claimCard);
      });

      // Close modal
      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        user.click(closeButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Claim CLM-2024-001')).not.toBeInTheDocument();
      });
    });
  });

  describe('New Claim Form', () => {
    test('opens new claim form modal', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      const newClaimButton = screen.getByText(/file new claim/i);
      await user.click(newClaimButton);

      await waitFor(() => {
        expect(screen.getByText('File New Claim')).toBeInTheDocument();
        expect(screen.getByLabelText(/select policy/i)).toBeInTheDocument();
      });
    });

    test('validates required fields in new claim form', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      const newClaimButton = screen.getByText(/file new claim/i);
      await user.click(newClaimButton);

      const submitButton = screen.getByText(/submit claim/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/policy is required/i)).toBeInTheDocument();
        expect(screen.getByText(/claim type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/incident date is required/i)).toBeInTheDocument();
      });
    });

    test('submits new claim form successfully', async () => {
      const user = userEvent.setup();
      renderWithAuth(<Claims />);

      const newClaimButton = screen.getByText(/file new claim/i);
      await user.click(newClaimButton);

      // Fill form
      const policySelect = screen.getByLabelText(/select policy/i);
      await user.click(policySelect);
      await user.click(screen.getByText('AUTO-2024-001'));

      const claimTypeSelect = screen.getByLabelText(/claim type/i);
      await user.click(claimTypeSelect);
      await user.click(screen.getByText('Collision'));

      const incidentDateInput = screen.getByLabelText(/incident date/i);
      await user.type(incidentDateInput, '2024-01-20');

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test claim description');

      const submitButton = screen.getByText(/submit claim/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/claim submitted successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('meets accessibility standards', async () => {
      const { container } = renderWithAuth(<Claims />);
      await checkAccessibility(container);
    });

    test('supports keyboard navigation', async () => {
      renderWithAuth(<Claims />);

      // Test tab navigation
      const newClaimButton = screen.getByText(/file new claim/i);
      newClaimButton.focus();
      expect(newClaimButton).toHaveFocus();

      // Test search input
      const searchInput = screen.getByPlaceholderText(/search claims/i);
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });

    test('has proper ARIA labels', () => {
      renderWithAuth(<Claims />);

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Claims page');
      expect(screen.getByRole('search')).toHaveAttribute('aria-label', 'Search claims');
      expect(screen.getByRole('region', { name: /claim statistics/i })).toBeInTheDocument();
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

      renderWithAuth(<Claims />);

      // Check if mobile-specific classes are applied
      const claimsGrid = screen.getByTestId('claims-grid');
      expect(claimsGrid).toHaveClass('grid-cols-1');
    });

    test('adapts to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithAuth(<Claims />);

      const claimsGrid = screen.getByTestId('claims-grid');
      expect(claimsGrid).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Performance', () => {
    test('renders within acceptable time', async () => {
      const startTime = performance.now();
      renderWithAuth(<Claims />);
      
      await waitFor(() => {
        expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    test('handles large datasets efficiently', async () => {
      // Create large dataset
      const largeClaims = Array.from({ length: 100 }, (_, index) => ({
        ...mockClaims[0],
        id: `${index + 1}`,
        claimNumber: `CLM-2024-${String(index + 1).padStart(3, '0')}`,
      }));

      require('@/hooks/useDataLoader').useDataLoader.mockReturnValue({
        data: largeClaims,
        loading: false,
        error: null,
        setData: jest.fn(),
      });

      const startTime = performance.now();
      renderWithAuth(<Claims />);

      await waitFor(() => {
        expect(screen.getAllByText(/CLM-2024-/)).toHaveLength(20); // Assuming pagination shows 20 per page
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should still render within acceptable time even with large dataset
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('Error Handling', () => {
    test('handles service errors gracefully', async () => {
      (unifiedMockDataService.fetchClaimsAsync as jest.Mock).mockRejectedValue(
        new Error('Service unavailable')
      );

      require('@/hooks/useDataLoader').useDataLoader.mockReturnValue({
        data: [],
        loading: false,
        error: 'Service unavailable',
        setData: jest.fn(),
      });

      renderWithAuth(<Claims />);

      expect(screen.getByText(/error loading claims/i)).toBeInTheDocument();
      expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
    });

    test('provides retry functionality on error', async () => {
      const user = userEvent.setup();
      const retryFn = jest.fn();

      require('@/hooks/useDataLoader').useDataLoader.mockReturnValue({
        data: [],
        loading: false,
        error: 'Network error',
        setData: jest.fn(),
        retry: retryFn,
      });

      renderWithAuth(<Claims />);

      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);

      expect(retryFn).toHaveBeenCalledTimes(1);
    });
  });
});