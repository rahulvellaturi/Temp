import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Cypress plugins
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });

      // Code coverage
      require('@cypress/code-coverage/task')(on, config);
      
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },

  env: {
    // Environment variables for tests
    apiUrl: 'http://localhost:5000/api',
    coverage: true,
  },

  retries: {
    runMode: 2,
    openMode: 0,
  },

  chromeWebSecurity: false,
  
  // Accessibility testing configuration
  experimentalStudio: true,
});