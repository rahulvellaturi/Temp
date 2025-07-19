import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUser } from '@/__tests__/utils/test-utils';
import App from '@/App';
import { server } from '@/__tests__/mocks/server';

// Mock service worker for API calls
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Claims Workflow Integration Tests', () => {
  const authenticatedUser = {
    ...mockUser,
    role: 'CLIENT' as const,
  };

  describe('Complete Claims Journey', () => {
    test('user can navigate to claims, view existing claims, and file new claim', async () => {
      const user = userEvent.setup();
      
      // Start with authenticated user
      const initialState = {
        auth: {
          user: authenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/dashboard'
      });

      // Navigate to claims from dashboard
      const claimsLink = screen.getByRole('link', { name: /claims/i });
      await user.click(claimsLink);

      // Wait for claims page to load
      await waitFor(() => {
        expect(screen.getByText('Claims')).toBeInTheDocument();
        expect(screen.getByText('Manage and track your insurance claims')).toBeInTheDocument();
      });

      // Verify existing claims are displayed
      await waitFor(() => {
        expect(screen.getByText(/CLM-2024-001/)).toBeInTheDocument();
        expect(screen.getByText(/CLM-2024-002/)).toBeInTheDocument();
      });

      // Test filtering functionality
      const searchInput = screen.getByPlaceholderText(/search claims/i);
      await user.type(searchInput, 'collision');

      await waitFor(() => {
        expect(screen.getByText(/CLM-2024-001/)).toBeInTheDocument();
        expect(screen.queryByText(/CLM-2024-002/)).not.toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);

      // File new claim
      const fileNewClaimButton = screen.getByText(/file new claim/i);
      await user.click(fileNewClaimButton);

      // Fill out new claim form
      await waitFor(() => {
        expect(screen.getByText('File New Claim')).toBeInTheDocument();
      });

      const policySelect = screen.getByLabelText(/select policy/i);
      await user.click(policySelect);
      await user.click(screen.getByText(/AUTO-2024-001/));

      const claimTypeSelect = screen.getByLabelText(/claim type/i);
      await user.click(claimTypeSelect);
      await user.click(screen.getByText('Collision'));

      const incidentDateInput = screen.getByLabelText(/incident date/i);
      await user.type(incidentDateInput, '2024-01-25');

      const descriptionTextarea = screen.getByLabelText(/description/i);
      await user.type(descriptionTextarea, 'Minor collision in parking lot');

      const locationInput = screen.getByLabelText(/location/i);
      await user.type(locationInput, 'Shopping Mall Parking Lot');

      // Submit claim
      const submitButton = screen.getByText(/submit claim/i);
      await user.click(submitButton);

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/claim submitted successfully/i)).toBeInTheDocument();
      });

      // Verify new claim appears in the list
      await waitFor(() => {
        expect(screen.getByText(/CLM-2024-003/)).toBeInTheDocument();
      });
    });

    test('user can view claim details and track progress', async () => {
      const user = userEvent.setup();
      
      const initialState = {
        auth: {
          user: authenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/claims'
      });

      // Wait for claims to load
      await waitFor(() => {
        expect(screen.getByText(/CLM-2024-001/)).toBeInTheDocument();
      });

      // Click on a claim to view details
      const claimCard = screen.getByText(/CLM-2024-001/);
      await user.click(claimCard);

      // Verify claim details modal opens
      await waitFor(() => {
        expect(screen.getByText('Claim CLM-2024-001')).toBeInTheDocument();
        expect(screen.getByText(/Collision - AUTO-2024-001/)).toBeInTheDocument();
      });

      // Check claim timeline
      expect(screen.getByText(/claim submitted/i)).toBeInTheDocument();
      expect(screen.getByText(/documents received/i)).toBeInTheDocument();
      expect(screen.getByText(/adjuster assigned/i)).toBeInTheDocument();

      // Check claim documents
      expect(screen.getByText(/police_report\.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/damage_photos\.zip/i)).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Claim CLM-2024-001')).not.toBeInTheDocument();
      });
    });
  });

  describe('Claims Data Consistency', () => {
    test('claims data remains consistent across navigation', async () => {
      const user = userEvent.setup();
      
      const initialState = {
        auth: {
          user: authenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/claims'
      });

      // Wait for claims to load
      await waitFor(() => {
        expect(screen.getByText(/CLM-2024-001/)).toBeInTheDocument();
      });

      // Note the number of claims
      const claimElements = screen.getAllByText(/CLM-2024-/);
      const initialClaimCount = claimElements.length;

      // Navigate to dashboard
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.click(dashboardLink);

      // Navigate back to claims
      const claimsLink = screen.getByRole('link', { name: /claims/i });
      await user.click(claimsLink);

      // Verify same number of claims
      await waitFor(() => {
        const updatedClaimElements = screen.getAllByText(/CLM-2024-/);
        expect(updatedClaimElements).toHaveLength(initialClaimCount);
      });
    });

    test('claim statistics match individual claim data', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/claims'
      });

      await waitFor(() => {
        expect(screen.getByText(/CLM-2024-001/)).toBeInTheDocument();
      });

      // Count claims by status manually
      const claimCards = screen.getAllByTestId('claim-card');
      let underReviewCount = 0;
      let approvedCount = 0;
      let paidCount = 0;

      claimCards.forEach(card => {
        if (card.textContent?.includes('Under Review')) underReviewCount++;
        if (card.textContent?.includes('Approved')) approvedCount++;
        if (card.textContent?.includes('Paid')) paidCount++;
      });

      // Verify statistics match
      const statsSection = screen.getByTestId('claims-statistics');
      expect(statsSection.textContent).toContain(underReviewCount.toString());
      expect(statsSection.textContent).toContain(approvedCount.toString());
      expect(statsSection.textContent).toContain(paidCount.toString());
    });
  });

  describe('Error Scenarios', () => {
    test('handles network errors gracefully during claim submission', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      server.use(
        rest.post('/api/claims', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      const initialState = {
        auth: {
          user: authenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/claims'
      });

      // Try to file new claim
      const fileNewClaimButton = screen.getByText(/file new claim/i);
      await user.click(fileNewClaimButton);

      // Fill form and submit
      const policySelect = screen.getByLabelText(/select policy/i);
      await user.click(policySelect);
      await user.click(screen.getByText(/AUTO-2024-001/));

      const claimTypeSelect = screen.getByLabelText(/claim type/i);
      await user.click(claimTypeSelect);
      await user.click(screen.getByText('Collision'));

      const incidentDateInput = screen.getByLabelText(/incident date/i);
      await user.type(incidentDateInput, '2024-01-25');

      const descriptionTextarea = screen.getByLabelText(/description/i);
      await user.type(descriptionTextarea, 'Test claim');

      const submitButton = screen.getByText(/submit claim/i);
      await user.click(submitButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error submitting claim/i)).toBeInTheDocument();
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
      });

      // Verify retry functionality
      const retryButton = screen.getByText(/try again/i);
      expect(retryButton).toBeInTheDocument();
    });

    test('handles unauthorized access appropriately', async () => {
      // Mock unauthorized response
      server.use(
        rest.get('/api/claims', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
        })
      );

      const initialState = {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/claims'
      });

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and UX', () => {
    test('provides loading states during data fetching', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      // Mock slow API response
      server.use(
        rest.get('/api/claims', (req, res, ctx) => {
          return res(ctx.delay(2000), ctx.json([]));
        })
      );

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/claims'
      });

      // Should show loading state
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText(/loading claims/i)).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('maintains responsive design across viewport changes', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<App />, { 
        initialState,
        route: '/client/claims'
      });

      await waitFor(() => {
        expect(screen.getByText('Claims')).toBeInTheDocument();
      });

      // Test mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      const claimsGrid = screen.getByTestId('claims-grid');
      expect(claimsGrid).toHaveClass('grid-cols-1');

      // Test desktop viewport
      global.innerWidth = 1200;
      global.dispatchEvent(new Event('resize'));

      expect(claimsGrid).toHaveClass('lg:grid-cols-3');
    });
  });
});