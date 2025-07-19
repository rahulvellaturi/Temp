// Import commands.js using ES2015 syntax:
import './commands';

// Import Cypress plugins
import 'cypress-axe';
import 'cypress-real-events/support';
import '@cypress/code-coverage/support';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions from the application
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Custom commands for accessibility testing
Cypress.Commands.add('checkA11y', (context?: string | Node, options?: any) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Custom commands for authentication
Cypress.Commands.add('loginAsClient', () => {
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
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('auth', JSON.stringify({
      user: {
        id: '2',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@assureme.com',
        role: 'ADMIN'
      },
      token: 'mock-admin-token',
      isAuthenticated: true
    }));
  });
});

// Custom commands for form interactions
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid="${field}"]`).type(value);
  });
});

// Custom commands for waiting
Cypress.Commands.add('waitForSpinner', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      checkA11y(context?: string | Node, options?: any): Chainable<Element>;
      loginAsClient(): Chainable<Element>;
      loginAsAdmin(): Chainable<Element>;
      fillForm(formData: Record<string, string>): Chainable<Element>;
      waitForSpinner(): Chainable<Element>;
    }
  }
}