import React, { ReactElement } from 'react';
import { mount, shallow, ShallowWrapper, ReactWrapper } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/store/slices/authSlice';
import { User } from '@/types';

// Mock data for testing
export const mockUser: User = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'CLIENT',
  avatar: '/avatars/john-doe.jpg'
};

export const mockAgent: User = {
  id: '2',
  firstName: 'Jane',
  lastName: 'Agent',
  email: 'jane.agent@assureme.com',
  role: 'AGENT',
  avatar: '/avatars/jane-agent.jpg'
};

export const mockAdmin: User = {
  id: '3',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@assureme.com',
  role: 'ADMIN',
  avatar: '/avatars/admin-user.jpg'
};

// Create a test store
export const createTestStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: initialState,
  });
};

// Enhanced wrapper options
interface WrapperOptions {
  initialState?: any;
  store?: ReturnType<typeof createTestStore>;
  route?: string;
  mountType?: 'mount' | 'shallow';
}

// Enhanced mount with providers
export const mountWithProviders = (
  component: ReactElement,
  options: WrapperOptions = {}
): ReactWrapper => {
  const {
    initialState = {},
    store = createTestStore(initialState),
    route = '/',
    mountType = 'mount'
  } = options;

  // Set initial route
  window.history.pushState({}, 'Test page', route);

  const ProviderWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  if (mountType === 'shallow') {
    return mount(component, {
      wrappingComponent: ProviderWrapper
    });
  }

  return mount(
    <ProviderWrapper>
      {component}
    </ProviderWrapper>
  );
};

// Shallow mount with providers
export const shallowWithProviders = (
  component: ReactElement,
  options: WrapperOptions = {}
): ShallowWrapper => {
  const {
    initialState = {},
    store = createTestStore(initialState),
  } = options;

  const ProviderWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return shallow(
    <ProviderWrapper>
      {component}
    </ProviderWrapper>
  );
};

// Mount with authenticated user
export const mountWithAuth = (
  component: ReactElement,
  user: User = mockUser,
  options: WrapperOptions = {}
): ReactWrapper => {
  const initialState = {
    auth: {
      user,
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  };

  return mountWithProviders(component, {
    ...options,
    initialState: { ...initialState, ...options.initialState },
  });
};

// Shallow mount with authenticated user
export const shallowWithAuth = (
  component: ReactElement,
  user: User = mockUser,
  options: WrapperOptions = {}
): ShallowWrapper => {
  const initialState = {
    auth: {
      user,
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  };

  return shallowWithProviders(component, {
    ...options,
    initialState: { ...initialState, ...options.initialState },
  });
};

// Utility to simulate async operations
export const waitForAsync = (wrapper: ReactWrapper | ShallowWrapper, ms = 0): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      wrapper.update();
      resolve();
    }, ms);
  });
};

// Utility to simulate user events
export const simulateEvent = (
  wrapper: ReactWrapper | ShallowWrapper,
  selector: string,
  event: string,
  eventData?: any
): void => {
  const element = wrapper.find(selector);
  if (element.length > 0) {
    element.simulate(event, eventData);
    wrapper.update();
  }
};

// Utility to check if element exists and has text
export const expectElementWithText = (
  wrapper: ReactWrapper | ShallowWrapper,
  selector: string,
  text: string
): void => {
  const element = wrapper.find(selector);
  expect(element.exists()).toBe(true);
  expect(element.text()).toContain(text);
};

// Utility to check element properties
export const expectElementProps = (
  wrapper: ReactWrapper | ShallowWrapper,
  selector: string,
  props: Record<string, any>
): void => {
  const element = wrapper.find(selector);
  expect(element.exists()).toBe(true);
  Object.entries(props).forEach(([key, value]) => {
    expect(element.prop(key)).toEqual(value);
  });
};

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message = 'API Error', delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

// Form testing utilities
export const fillFormField = (
  wrapper: ReactWrapper | ShallowWrapper,
  selector: string,
  value: string
): void => {
  const input = wrapper.find(selector);
  input.simulate('change', { target: { value } });
  wrapper.update();
};

export const submitForm = (
  wrapper: ReactWrapper | ShallowWrapper,
  formSelector: string = 'form'
): void => {
  const form = wrapper.find(formSelector);
  form.simulate('submit', { preventDefault: jest.fn() });
  wrapper.update();
};

// Mock data factories
export const createMockClaim = (overrides = {}) => ({
  id: '1',
  claimNumber: 'CLM-2024-001',
  policyId: '1',
  policyType: 'AUTO',
  policyNumber: 'AUTO-2024-001',
  clientId: '1',
  clientName: 'John Doe',
  type: 'Collision',
  status: 'SUBMITTED',
  amount: 5000,
  estimatedAmount: 5500,
  payoutAmount: 0,
  submittedDate: '2024-01-15',
  submittedAt: '2024-01-15T14:30:00Z',
  updatedAt: '2024-01-18T10:15:00Z',
  incidentDate: '2024-01-10',
  description: 'Rear-end collision on Highway 101',
  location: 'Highway 101, San Francisco, CA',
  adjusterName: 'Sarah Johnson',
  adjusterPhone: '(555) 123-4567',
  adjusterEmail: 'sarah.johnson@assureme.com',
  documents: [],
  timeline: [],
  ...overrides
});

export const createMockPolicy = (overrides = {}) => ({
  id: '1',
  policyNumber: 'AUTO-2024-001',
  clientId: '1',
  clientName: 'John Doe',
  type: 'AUTO',
  status: 'ACTIVE',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  premium: 1200,
  deductible: 500,
  coverageAmount: 100000,
  description: 'Comprehensive auto insurance coverage',
  ...overrides
});

export const createMockPayment = (overrides = {}) => ({
  id: '1',
  policyId: '1',
  clientId: '1',
  amount: 1200,
  dueDate: '2024-02-01',
  paidDate: '2024-01-28',
  status: 'COMPLETED',
  method: 'Credit Card',
  description: 'Monthly premium payment',
  ...overrides
});

export const createMockDocument = (overrides = {}) => ({
  id: '1',
  name: 'policy-document.pdf',
  type: 'POLICY',
  category: 'Auto Insurance',
  uploadDate: '2024-01-15',
  size: 1024000,
  userId: '1',
  ...overrides
});

// Performance testing utilities
export const measureRenderTime = (renderFn: () => ReactWrapper | ShallowWrapper): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Component state testing utilities
export const getComponentState = (wrapper: ReactWrapper, stateName: string): any => {
  return wrapper.state(stateName);
};

export const setComponentState = (wrapper: ReactWrapper, state: Record<string, any>): void => {
  wrapper.setState(state);
  wrapper.update();
};

// Props testing utilities
export const getComponentProps = (wrapper: ReactWrapper | ShallowWrapper): any => {
  return wrapper.props();
};

// Cleanup utilities
export const cleanupWrapper = (wrapper: ReactWrapper | ShallowWrapper): void => {
  if (wrapper && wrapper.unmount) {
    wrapper.unmount();
  }
};