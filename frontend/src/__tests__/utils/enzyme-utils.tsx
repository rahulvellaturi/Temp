import React, { ReactElement } from 'react';
import { mount, shallow, ShallowWrapper, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker';

// Store setup for testing
import { authSlice } from '../../store/slices/authSlice';
import { uiSlice } from '../../store/slices/uiSlice';

// Types
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
}

export interface MockClaim {
  id: string;
  policyNumber: string;
  claimNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  description: string;
  dateSubmitted: string;
  userId: string;
}

export interface TestStore {
  auth: {
    user: MockUser | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  };
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    notifications: Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      timestamp: string;
    }>;
  };
}

// Mock data factories
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: faker.helpers.arrayElement(['client', 'admin']),
  ...overrides,
});

export const createMockClaim = (overrides: Partial<MockClaim> = {}): MockClaim => ({
  id: faker.string.uuid(),
  policyNumber: faker.string.alphanumeric(10).toUpperCase(),
  claimNumber: faker.string.alphanumeric(8).toUpperCase(),
  status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
  amount: faker.number.int({ min: 100, max: 50000 }),
  description: faker.lorem.sentence(),
  dateSubmitted: faker.date.recent().toISOString(),
  userId: faker.string.uuid(),
  ...overrides,
});

// Create test store
export const createTestStore = (initialState: Partial<TestStore> = {}) => {
  const defaultState: TestStore = {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    },
    ui: {
      theme: 'light',
      sidebarOpen: false,
      notifications: [],
    },
  };

  const mergedState = {
    ...defaultState,
    ...initialState,
    auth: { ...defaultState.auth, ...initialState.auth },
    ui: { ...defaultState.ui, ...initialState.ui },
  };

  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: mergedState,
  });
};

// Wrapper components
export const TestProviders: React.FC<{
  children: React.ReactNode;
  store?: ReturnType<typeof createTestStore>;
  initialEntries?: string[];
}> = ({ children, store, initialEntries = ['/'] }) => {
  const testStore = store || createTestStore();

  return (
    <Provider store={testStore}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

// Enhanced mount function with providers
export const mountWithProviders = (
  component: ReactElement,
  options: {
    store?: ReturnType<typeof createTestStore>;
    initialEntries?: string[];
    mountOptions?: any;
  } = {}
): ReactWrapper => {
  const { store, initialEntries, mountOptions = {} } = options;

  return mount(
    <TestProviders store={store} initialEntries={initialEntries}>
      {component}
    </TestProviders>,
    mountOptions
  );
};

// Enhanced shallow function
export const shallowWithProviders = (
  component: ReactElement,
  options: {
    store?: ReturnType<typeof createTestStore>;
    shallowOptions?: any;
  } = {}
): ShallowWrapper => {
  const { shallowOptions = {} } = options;
  return shallow(component, shallowOptions);
};

// Utility functions for testing
export const waitForAsync = (wrapper: ReactWrapper, ms: number = 0): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      wrapper.update();
      resolve();
    }, ms);
  });
};

export const simulateEvent = (
  wrapper: ReactWrapper | ShallowWrapper,
  selector: string,
  event: string,
  eventData: any = {}
): void => {
  const element = wrapper.find(selector);
  if (element.length === 0) {
    throw new Error(`Element with selector "${selector}" not found`);
  }
  element.simulate(event, eventData);
  wrapper.update();
};

export const findByTestId = (
  wrapper: ReactWrapper | ShallowWrapper,
  testId: string
): ReactWrapper | ShallowWrapper => {
  return wrapper.find(`[data-testid="${testId}"]`);
};

export const findByText = (
  wrapper: ReactWrapper | ShallowWrapper,
  text: string | RegExp
): ReactWrapper | ShallowWrapper => {
  if (typeof text === 'string') {
    return wrapper.findWhere(node => node.text() === text);
  } else {
    return wrapper.findWhere(node => text.test(node.text()));
  }
};

// Performance testing utilities
export const measureRenderTime = (renderFunction: () => void): number => {
  const start = performance.now();
  renderFunction();
  const end = performance.now();
  return end - start;
};

export const checkMemoryLeaks = (wrapper: ReactWrapper): void => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  wrapper.unmount();
  
  // Force garbage collection if available (in Node.js with --expose-gc)
  if (global.gc) {
    global.gc();
  }
  
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const memoryDiff = finalMemory - initialMemory;
  
  if (memoryDiff > 1000000) { // 1MB threshold
    console.warn(`Potential memory leak detected: ${memoryDiff} bytes`);
  }
};

// Accessibility testing helpers
export const checkAriaAttributes = (wrapper: ReactWrapper | ShallowWrapper): void => {
  const elementsWithAriaLabel = wrapper.find('[aria-label]');
  const elementsWithAriaDescribedBy = wrapper.find('[aria-describedby]');
  const elementsWithRole = wrapper.find('[role]');
  
  expect(elementsWithAriaLabel.length + elementsWithAriaDescribedBy.length + elementsWithRole.length)
    .toBeGreaterThan(0);
};

export const checkKeyboardNavigation = (
  wrapper: ReactWrapper,
  focusableSelectors: string[]
): void => {
  focusableSelectors.forEach(selector => {
    const element = wrapper.find(selector);
    if (element.length > 0) {
      element.simulate('keydown', { key: 'Tab' });
      element.simulate('keydown', { key: 'Enter' });
      element.simulate('keydown', { key: ' ' });
    }
  });
};

// Form testing utilities
export const fillForm = (
  wrapper: ReactWrapper,
  formData: Record<string, any>
): void => {
  Object.entries(formData).forEach(([field, value]) => {
    const input = wrapper.find(`[name="${field}"]`);
    if (input.length > 0) {
      input.simulate('change', { target: { name: field, value } });
    }
  });
  wrapper.update();
};

export const submitForm = (wrapper: ReactWrapper, formSelector: string = 'form'): void => {
  const form = wrapper.find(formSelector);
  if (form.length > 0) {
    form.simulate('submit', { preventDefault: jest.fn() });
  }
  wrapper.update();
};

// Redux testing utilities
export const getStoreState = (store: ReturnType<typeof createTestStore>): TestStore => {
  return store.getState() as TestStore;
};

export const dispatchAction = (
  store: ReturnType<typeof createTestStore>,
  action: any
): void => {
  store.dispatch(action);
};

// Mock API responses
export const mockApiSuccess = (data: any) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(data),
});

export const mockApiError = (status: number = 400, message: string = 'Error') => ({
  ok: false,
  status,
  json: () => Promise.resolve({ message }),
});

// Component testing helpers
export const expectComponentToRender = (wrapper: ReactWrapper | ShallowWrapper): void => {
  expect(wrapper.exists()).toBe(true);
  expect(wrapper.length).toBe(1);
};

export const expectComponentToHaveProps = (
  wrapper: ReactWrapper | ShallowWrapper,
  expectedProps: Record<string, any>
): void => {
  Object.entries(expectedProps).forEach(([prop, value]) => {
    expect(wrapper.prop(prop)).toEqual(value);
  });
};

export const expectComponentToHaveState = (
  wrapper: ReactWrapper,
  expectedState: Record<string, any>
): void => {
  Object.entries(expectedState).forEach(([key, value]) => {
    expect(wrapper.state(key)).toEqual(value);
  });
};

// Snapshot testing utilities
export const expectToMatchSnapshot = (wrapper: ReactWrapper | ShallowWrapper): void => {
  expect(wrapper).toMatchSnapshot();
};

// Error boundary testing
export const triggerError = (wrapper: ReactWrapper, error: Error): void => {
  const errorComponent = wrapper.find('ThrowError');
  if (errorComponent.length > 0) {
    errorComponent.prop('onError')(error);
  }
  wrapper.update();
};

// Export commonly used test data
export const mockUsers = Array.from({ length: 5 }, () => createMockUser());
export const mockClaims = Array.from({ length: 10 }, () => createMockClaim());

export const mockAuthenticatedUser = createMockUser({
  id: 'auth-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'client',
});

export const mockAdminUser = createMockUser({
  id: 'admin-user-id',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
});

export default {
  mountWithProviders,
  shallowWithProviders,
  createTestStore,
  createMockUser,
  createMockClaim,
  waitForAsync,
  simulateEvent,
  findByTestId,
  findByText,
  measureRenderTime,
  checkMemoryLeaks,
  checkAriaAttributes,
  checkKeyboardNavigation,
  fillForm,
  submitForm,
  getStoreState,
  dispatchAction,
  mockApiSuccess,
  mockApiError,
  expectComponentToRender,
  expectComponentToHaveProps,
  expectComponentToHaveState,
  expectToMatchSnapshot,
  triggerError,
  mockUsers,
  mockClaims,
  mockAuthenticatedUser,
  mockAdminUser,
};