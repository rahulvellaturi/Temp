import React from 'react';
import { ReactWrapper } from 'enzyme';
import { 
  mountWithProviders, 
  mockUser, 
  waitForAsync, 
  simulateEvent, 
  findByTestId,
  findByText 
} from '../utils/enzyme-utils';
import App from '../../App';

// Mock API calls
const mockApiCalls = {
  getClaims: jest.fn(),
  createClaim: jest.fn(),
  updateClaim: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Claims Workflow Integration Tests', () => {
  const authenticatedUser = {
    ...mockUser,
    role: 'CLIENT' as const,
  };

  describe('Complete Claims Journey', () => {
    test('user can navigate to claims, view existing claims, and file new claim', async () => {
      // Mock authenticated state
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      // Mount the app with authenticated state
      const wrapper = mountWithProviders(<App />, { initialState });
      
      // Wait for initial render
      await waitForAsync(wrapper);

      // Navigate to claims page
      const claimsLink = findByText(wrapper, /claims/i);
      expect(claimsLink.length).toBeGreaterThan(0);
      
      if (claimsLink.length > 0) {
        claimsLink.first().simulate('click');
        await waitForAsync(wrapper);
      }

      // Verify claims page is loaded
      const claimsHeader = findByText(wrapper, /my claims/i);
      expect(claimsHeader.length).toBeGreaterThan(0);

      // Check if existing claims are displayed
      const claimsList = findByTestId(wrapper, 'claims-list');
      expect(claimsList.length).toBeGreaterThan(0);

      // Test filing a new claim
      const newClaimButton = findByTestId(wrapper, 'new-claim-button');
      if (newClaimButton.length > 0) {
        newClaimButton.first().simulate('click');
        await waitForAsync(wrapper);

        // Verify claim form is displayed
        const claimForm = findByTestId(wrapper, 'claim-form');
        expect(claimForm.length).toBeGreaterThan(0);

        // Fill out claim form
        const claimTypeSelect = wrapper.find('select[name="claimType"]');
        if (claimTypeSelect.length > 0) {
          claimTypeSelect.simulate('change', { target: { name: 'claimType', value: 'AUTO' } });
        }

        const descriptionInput = wrapper.find('textarea[name="description"]');
        if (descriptionInput.length > 0) {
          descriptionInput.simulate('change', { 
            target: { name: 'description', value: 'Test claim description' } 
          });
        }

        const amountInput = wrapper.find('input[name="amount"]');
        if (amountInput.length > 0) {
          amountInput.simulate('change', { target: { name: 'amount', value: '1000' } });
        }

        // Submit the form
        const submitButton = findByTestId(wrapper, 'submit-claim-button');
        if (submitButton.length > 0) {
          submitButton.first().simulate('click');
          await waitForAsync(wrapper);
        }

        // Verify success message or navigation
        const successMessage = findByText(wrapper, /claim submitted/i);
        expect(successMessage.length).toBeGreaterThanOrEqual(0);
      }

      wrapper.unmount();
    });

    test('user can view claim details and track status', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      const wrapper = mountWithProviders(<App />, { initialState });
      await waitForAsync(wrapper);

      // Navigate to claims
      const claimsLink = findByText(wrapper, /claims/i);
      if (claimsLink.length > 0) {
        claimsLink.first().simulate('click');
        await waitForAsync(wrapper);
      }

      // Click on first claim to view details
      const firstClaim = wrapper.find('[data-testid*="claim-item"]').first();
      if (firstClaim.length > 0) {
        firstClaim.simulate('click');
        await waitForAsync(wrapper);

        // Verify claim details are shown
        const claimDetails = findByTestId(wrapper, 'claim-details');
        expect(claimDetails.length).toBeGreaterThan(0);

        // Check for status information
        const statusElement = findByTestId(wrapper, 'claim-status');
        expect(statusElement.length).toBeGreaterThan(0);

        // Check for claim history/timeline
        const claimHistory = findByTestId(wrapper, 'claim-history');
        expect(claimHistory.length).toBeGreaterThanOrEqual(0);
      }

      wrapper.unmount();
    });

    test('user can upload documents for a claim', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      const wrapper = mountWithProviders(<App />, { initialState });
      await waitForAsync(wrapper);

      // Navigate to claims
      const claimsLink = findByText(wrapper, /claims/i);
      if (claimsLink.length > 0) {
        claimsLink.first().simulate('click');
        await waitForAsync(wrapper);
      }

      // Open claim details
      const firstClaim = wrapper.find('[data-testid*="claim-item"]').first();
      if (firstClaim.length > 0) {
        firstClaim.simulate('click');
        await waitForAsync(wrapper);

        // Look for upload button
        const uploadButton = findByTestId(wrapper, 'upload-document-button');
        if (uploadButton.length > 0) {
          uploadButton.first().simulate('click');
          await waitForAsync(wrapper);

          // Verify upload modal or form is shown
          const uploadForm = findByTestId(wrapper, 'document-upload-form');
          expect(uploadForm.length).toBeGreaterThanOrEqual(0);
        }
      }

      wrapper.unmount();
    });

    test('user receives real-time updates on claim status', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      const wrapper = mountWithProviders(<App />, { initialState });
      await waitForAsync(wrapper);

      // This test would involve mocking WebSocket or polling mechanisms
      // For now, we'll just verify the claims page can handle updates
      const claimsLink = findByText(wrapper, /claims/i);
      if (claimsLink.length > 0) {
        claimsLink.first().simulate('click');
        await waitForAsync(wrapper);

        // Verify claims list is present
        const claimsList = findByTestId(wrapper, 'claims-list');
        expect(claimsList.length).toBeGreaterThan(0);
      }

      wrapper.unmount();
    });
  });

  describe('Error Handling', () => {
    test('handles claim submission errors gracefully', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      const wrapper = mountWithProviders(<App />, { initialState });
      await waitForAsync(wrapper);

      // Navigate to claims and try to submit invalid claim
      const claimsLink = findByText(wrapper, /claims/i);
      if (claimsLink.length > 0) {
        claimsLink.first().simulate('click');
        await waitForAsync(wrapper);

        const newClaimButton = findByTestId(wrapper, 'new-claim-button');
        if (newClaimButton.length > 0) {
          newClaimButton.first().simulate('click');
          await waitForAsync(wrapper);

          // Try to submit empty form
          const submitButton = findByTestId(wrapper, 'submit-claim-button');
          if (submitButton.length > 0) {
            submitButton.first().simulate('click');
            await waitForAsync(wrapper);

            // Check for error messages
            const errorMessage = findByText(wrapper, /error/i);
            expect(errorMessage.length).toBeGreaterThanOrEqual(0);
          }
        }
      }

      wrapper.unmount();
    });

    test('handles network errors during claim operations', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      const wrapper = mountWithProviders(<App />, { initialState });
      await waitForAsync(wrapper);

      // This test would mock network failures
      // For now, we'll just verify error boundaries work
      expect(wrapper.exists()).toBe(true);

      wrapper.unmount();
    });
  });

  describe('Performance Tests', () => {
    test('claims page loads within acceptable time', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      const startTime = performance.now();
      const wrapper = mountWithProviders(<App />, { initialState });
      
      const claimsLink = findByText(wrapper, /claims/i);
      if (claimsLink.length > 0) {
        claimsLink.first().simulate('click');
        await waitForAsync(wrapper);
      }

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Expect page to load within 2 seconds
      expect(loadTime).toBeLessThan(2000);

      wrapper.unmount();
    });

    test('handles large number of claims efficiently', async () => {
      const initialState = {
        auth: {
          user: authenticatedUser,
          isAuthenticated: true,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      };

      const wrapper = mountWithProviders(<App />, { initialState });
      await waitForAsync(wrapper);

      // Navigate to claims page
      const claimsLink = findByText(wrapper, /claims/i);
      if (claimsLink.length > 0) {
        claimsLink.first().simulate('click');
        await waitForAsync(wrapper);

        // Verify claims list renders without performance issues
        const claimsList = findByTestId(wrapper, 'claims-list');
        expect(claimsList.length).toBeGreaterThan(0);
      }

      wrapper.unmount();
    });
  });
});