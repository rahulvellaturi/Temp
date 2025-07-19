module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: [
    '**/integration/**/*.+(ts|tsx|js)',
    '**/*.integration.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.integration.ts'],
  testTimeout: 60000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1, // Run integration tests sequentially
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true
};