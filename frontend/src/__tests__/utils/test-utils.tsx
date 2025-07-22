import React, { ReactElement } from 'react';
import { mount, shallow, ShallowWrapper, ReactWrapper } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../../store/slices/authSlice';
import { User } from '../../types';

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

// Custom render function with providers using Enzyme
interface ExtendedMountOptions {
  initialState?: any;
  store?: ReturnType<typeof createTestStore>;
  route?: string;
}

export const mountWithProviders = (
  ui: ReactElement,
  {
    initialState = {},
    store = createTestStore(initialState),
    route = '/',
  }: ExtendedMountOptions = {}
): ReactWrapper => {
  // Create wrapper component
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return mount(<Wrapper>{ui}</Wrapper>);
};

export const shallowWithProviders = (
  ui: ReactElement,
  {
    initialState = {},
    store = createTestStore(initialState),
  }: ExtendedMountOptions = {}
): ShallowWrapper => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return shallow(<Wrapper>{ui}</Wrapper>);
};

// Helper to render with authenticated user
export const mountWithAuth = (
  ui: ReactElement,
  user: User = mockUser,
  options?: ExtendedMountOptions
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

  return mountWithProviders(ui, {
    ...options,
    initialState: { ...initialState, ...options?.initialState },
  });
};

// Helper to wait for loading states
export const waitForLoadingToFinish = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 100));
};

// Mock intersection observer
export const mockIntersectionObserver = (): void => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  (window as any).IntersectionObserver = mockIntersectionObserver;
};

// Mock resize observer
export const mockResizeObserver = (): void => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  (window as any).ResizeObserver = mockResizeObserver;
};

// Form testing helpers
export const fillForm = (
  wrapper: ReactWrapper | ShallowWrapper,
  formData: Record<string, string>
): void => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const input = wrapper.find(`[name="${fieldName}"]`);
    if (input.length > 0) {
      input.simulate('change', { target: { name: fieldName, value } });
    }
  }
  wrapper.update();
};

// Accessibility testing helper
export const checkAccessibility = async (wrapper: ReactWrapper): Promise<void> => {
  // Basic accessibility checks using Enzyme
  const elementsWithAriaLabel = wrapper.find('[aria-label]');
  const elementsWithRole = wrapper.find('[role]');
  const buttons = wrapper.find('button');
  const inputs = wrapper.find('input');
  
  // Check if interactive elements have proper attributes
  buttons.forEach((button) => {
    const buttonWrapper = button as any;
    expect(
      buttonWrapper.prop('aria-label') || 
      buttonWrapper.text() || 
      buttonWrapper.prop('title')
    ).toBeTruthy();
  });

  inputs.forEach((input) => {
    const inputWrapper = input as any;
    expect(
      inputWrapper.prop('aria-label') || 
      inputWrapper.prop('placeholder') ||
      wrapper.find(`label[for="${inputWrapper.prop('id')}"]`).length > 0
    ).toBeTruthy();
  });
};

// Performance testing helper
export const measurePerformance = async (fn: () => Promise<void>): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Enzyme-specific utilities
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
    return wrapper.findWhere(node => node.text().includes(text));
  } else {
    return wrapper.findWhere(node => text.test(node.text()));
  }
};

export const simulateEvent = (
  wrapper: ReactWrapper | ShallowWrapper,
  selector: string,
  event: string,
  eventData: any = {}
): void => {
  const element = wrapper.find(selector);
  if (element.length > 0) {
    element.simulate(event, eventData);
    wrapper.update();
  }
};

// Re-export Enzyme functions
export { mount, shallow } from 'enzyme';
export type { ReactWrapper, ShallowWrapper } from 'enzyme';

// Generic functions (moved to end to avoid JSX conflicts)
export function mockApiResponse<T>(data: T, delay = 100): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export function mockApiError(message = 'API Error', delay = 100): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}