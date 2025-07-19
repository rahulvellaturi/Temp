describe('Claims E2E Tests', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth', JSON.stringify({
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'CLIENT'
        },
        token: 'mock-token',
        isAuthenticated: true
      }));
    });

    // Intercept API calls
    cy.intercept('GET', '/api/claims', { fixture: 'claims.json' }).as('getClaims');
    cy.intercept('GET', '/api/policies/available', { fixture: 'available-policies.json' }).as('getAvailablePolicies');
    cy.intercept('POST', '/api/claims', { 
      statusCode: 201,
      body: { id: '3', claimNumber: 'CLM-2024-003', status: 'SUBMITTED' }
    }).as('createClaim');
  });

  describe('Claims Page Navigation', () => {
    it('should navigate to claims page from dashboard', () => {
      cy.visit('/client/dashboard');
      cy.get('[data-testid="nav-claims"]').click();
      cy.url().should('include', '/client/claims');
      cy.get('h1').should('contain', 'Claims');
    });

    it('should display breadcrumb navigation', () => {
      cy.visit('/client/claims');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Dashboard');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Claims');
    });
  });

  describe('Claims List Display', () => {
    it('should load and display claims list', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claims-grid"]').should('be.visible');
      cy.get('[data-testid="claim-card"]').should('have.length.at.least', 1);
      
      // Check first claim card content
      cy.get('[data-testid="claim-card"]').first().within(() => {
        cy.get('[data-testid="claim-number"]').should('contain', 'CLM-2024');
        cy.get('[data-testid="claim-status"]').should('be.visible');
        cy.get('[data-testid="claim-amount"]').should('be.visible');
      });
    });

    it('should display correct claim statistics', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claims-statistics"]').should('be.visible');
      cy.get('[data-testid="stat-total-claims"]').should('contain', '2');
      cy.get('[data-testid="stat-under-review"]').should('contain', '1');
      cy.get('[data-testid="stat-approved"]').should('contain', '1');
    });

    it('should show loading state initially', () => {
      cy.intercept('GET', '/api/claims', { delay: 2000, fixture: 'claims.json' }).as('getClaimsSlowly');
      
      cy.visit('/client/claims');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-text"]').should('contain', 'Loading claims');
      
      cy.wait('@getClaimsSlowly');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should handle empty claims state', () => {
      cy.intercept('GET', '/api/claims', { body: [] }).as('getEmptyClaims');
      
      cy.visit('/client/claims');
      cy.wait('@getEmptyClaims');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state"]').should('contain', 'No claims found');
    });
  });

  describe('Claims Filtering and Search', () => {
    it('should filter claims by search term', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="search-input"]').type('collision');
      cy.get('[data-testid="claim-card"]').should('have.length', 1);
      cy.get('[data-testid="claim-card"]').first().should('contain', 'Collision');

      // Clear search
      cy.get('[data-testid="search-input"]').clear();
      cy.get('[data-testid="claim-card"]').should('have.length.at.least', 2);
    });

    it('should filter claims by status', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option-approved"]').click();
      
      cy.get('[data-testid="claim-card"]').should('have.length', 1);
      cy.get('[data-testid="claim-card"]').first().should('contain', 'Approved');
    });

    it('should filter claims by policy type', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="policy-type-filter"]').click();
      cy.get('[data-testid="policy-type-option-auto"]').click();
      
      cy.get('[data-testid="claim-card"]').should('have.length', 1);
      cy.get('[data-testid="claim-card"]').first().should('contain', 'AUTO');
    });

    it('should clear all filters', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      // Apply filters
      cy.get('[data-testid="search-input"]').type('collision');
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option-approved"]').click();

      // Clear filters
      cy.get('[data-testid="clear-filters"]').click();
      
      cy.get('[data-testid="search-input"]').should('have.value', '');
      cy.get('[data-testid="claim-card"]').should('have.length.at.least', 2);
    });
  });

  describe('Claim Details Modal', () => {
    it('should open claim details when claim card is clicked', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claim-card"]').first().click();
      
      cy.get('[data-testid="claim-details-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Claim CLM-2024');
      cy.get('[data-testid="claim-timeline"]').should('be.visible');
      cy.get('[data-testid="claim-documents"]').should('be.visible');
    });

    it('should display claim timeline correctly', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claim-card"]').first().click();
      
      cy.get('[data-testid="claim-timeline"]').within(() => {
        cy.get('[data-testid="timeline-item"]').should('have.length.at.least', 3);
        cy.get('[data-testid="timeline-item"]').first().should('contain', 'Claim Submitted');
      });
    });

    it('should display claim documents', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claim-card"]').first().click();
      
      cy.get('[data-testid="claim-documents"]').within(() => {
        cy.get('[data-testid="document-item"]').should('have.length.at.least', 2);
        cy.get('[data-testid="document-item"]').first().should('contain', '.pdf');
      });
    });

    it('should close modal when close button is clicked', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claim-card"]').first().click();
      cy.get('[data-testid="claim-details-modal"]').should('be.visible');
      
      cy.get('[data-testid="modal-close"]').click();
      cy.get('[data-testid="claim-details-modal"]').should('not.exist');
    });

    it('should close modal when clicking outside', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claim-card"]').first().click();
      cy.get('[data-testid="claim-details-modal"]').should('be.visible');
      
      cy.get('[data-testid="modal-backdrop"]').click({ force: true });
      cy.get('[data-testid="claim-details-modal"]').should('not.exist');
    });
  });

  describe('New Claim Form', () => {
    it('should open new claim form modal', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="file-new-claim"]').click();
      
      cy.get('[data-testid="new-claim-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'File New Claim');
    });

    it('should validate required fields', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="file-new-claim"]').click();
      cy.get('[data-testid="submit-claim"]').click();
      
      cy.get('[data-testid="policy-error"]').should('contain', 'Policy is required');
      cy.get('[data-testid="claim-type-error"]').should('contain', 'Claim type is required');
      cy.get('[data-testid="incident-date-error"]').should('contain', 'Incident date is required');
    });

    it('should populate claim types based on selected policy', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');
      cy.wait('@getAvailablePolicies');

      cy.get('[data-testid="file-new-claim"]').click();
      
      cy.get('[data-testid="policy-select"]').click();
      cy.get('[data-testid="policy-option-auto"]').click();
      
      cy.get('[data-testid="claim-type-select"]').click();
      cy.get('[data-testid="claim-type-options"]').within(() => {
        cy.get('[data-testid="claim-type-collision"]').should('be.visible');
        cy.get('[data-testid="claim-type-comprehensive"]').should('be.visible');
      });
    });

    it('should successfully submit new claim', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');
      cy.wait('@getAvailablePolicies');

      cy.get('[data-testid="file-new-claim"]').click();
      
      // Fill form
      cy.get('[data-testid="policy-select"]').click();
      cy.get('[data-testid="policy-option-auto"]').click();
      
      cy.get('[data-testid="claim-type-select"]').click();
      cy.get('[data-testid="claim-type-collision"]').click();
      
      cy.get('[data-testid="incident-date"]').type('2024-01-25');
      cy.get('[data-testid="description"]').type('Test claim description for E2E testing');
      cy.get('[data-testid="location"]').type('Test Location');
      
      cy.get('[data-testid="submit-claim"]').click();
      cy.wait('@createClaim');
      
      cy.get('[data-testid="success-message"]').should('contain', 'Claim submitted successfully');
      cy.get('[data-testid="new-claim-modal"]').should('not.exist');
    });

    it('should handle form submission errors', () => {
      cy.intercept('POST', '/api/claims', { 
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createClaimError');

      cy.visit('/client/claims');
      cy.wait('@getClaims');
      cy.wait('@getAvailablePolicies');

      cy.get('[data-testid="file-new-claim"]').click();
      
      // Fill and submit form
      cy.get('[data-testid="policy-select"]').click();
      cy.get('[data-testid="policy-option-auto"]').click();
      
      cy.get('[data-testid="claim-type-select"]').click();
      cy.get('[data-testid="claim-type-collision"]').click();
      
      cy.get('[data-testid="incident-date"]').type('2024-01-25');
      cy.get('[data-testid="description"]').type('Test claim');
      
      cy.get('[data-testid="submit-claim"]').click();
      cy.wait('@createClaimError');
      
      cy.get('[data-testid="error-message"]').should('contain', 'Error submitting claim');
      cy.get('[data-testid="try-again"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with keyboard navigation', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'file-new-claim');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'status-filter');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[role="main"]').should('exist');
      cy.get('[role="search"]').should('exist');
      cy.get('[role="region"]').should('exist');
      
      cy.get('[data-testid="file-new-claim"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label');
    });

    it('should pass automated accessibility tests', () => {
      cy.visit('/client/claims');
      cy.wait('@getClaims');
      
      cy.injectAxe();
      cy.checkA11y('[data-testid="claims-page"]', {
        tags: ['wcag2a', 'wcag2aa'],
        includedImpacts: ['minor', 'moderate', 'serious', 'critical']
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claims-grid"]').should('have.class', 'grid-cols-1');
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
    });

    it('should adapt to tablet viewport', () => {
      cy.viewport(768, 1024); // iPad
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claims-grid"]').should('have.class', 'md:grid-cols-2');
    });

    it('should adapt to desktop viewport', () => {
      cy.viewport(1200, 800); // Desktop
      cy.visit('/client/claims');
      cy.wait('@getClaims');

      cy.get('[data-testid="claims-grid"]').should('have.class', 'lg:grid-cols-3');
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time', () => {
      cy.visit('/client/claims', {
        onBeforeLoad: (win) => {
          win.performance.mark('start');
        },
        onLoad: (win) => {
          win.performance.mark('end');
          win.performance.measure('pageLoad', 'start', 'end');
          const measure = win.performance.getEntriesByName('pageLoad')[0];
          expect(measure.duration).to.be.lessThan(3000); // Should load within 3 seconds
        }
      });
      
      cy.wait('@getClaims');
      cy.get('[data-testid="claims-grid"]').should('be.visible');
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/claims', { fixture: 'large-claims.json' }).as('getLargeClaims');
      
      cy.visit('/client/claims');
      cy.wait('@getLargeClaims');
      
      // Should still render within reasonable time
      cy.get('[data-testid="claims-grid"]').should('be.visible');
      cy.get('[data-testid="claim-card"]').should('have.length.at.least', 20);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/claims', { 
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getClaimsError');

      cy.visit('/client/claims');
      cy.wait('@getClaimsError');
      
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Error loading claims');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should provide retry functionality', () => {
      cy.intercept('GET', '/api/claims', { 
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getClaimsError');

      cy.visit('/client/claims');
      cy.wait('@getClaimsError');
      
      // Mock successful retry
      cy.intercept('GET', '/api/claims', { fixture: 'claims.json' }).as('getClaimsRetry');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@getClaimsRetry');
      
      cy.get('[data-testid="claims-grid"]').should('be.visible');
      cy.get('[data-testid="error-state"]').should('not.exist');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', '/api/claims', { forceNetworkError: true }).as('getClaimsNetworkError');

      cy.visit('/client/claims');
      cy.wait('@getClaimsNetworkError');
      
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="network-error"]').should('contain', 'Connection failed');
    });
  });
});