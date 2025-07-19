import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
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

// Custom render function with providers
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  store?: ReturnType<typeof createTestStore>;
  route?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    initialState = {},
    store = createTestStore(initialState),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
): RenderResult => {
  // Set initial route
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to render with authenticated user
export const renderWithAuth = (
  ui: ReactElement,
  user: User = mockUser,
  options?: ExtendedRenderOptions
) => {
  const initialState = {
    auth: {
      user,
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  };

  return renderWithProviders(ui, {
    ...options,
    initialState: { ...initialState, ...options?.initialState },
  });
};

// Helper to wait for loading states
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 100));
};

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 100): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message = 'API Error', delay = 100): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

// Custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null;
    return {
      message: () =>
        pass
          ? `expected element not to be in the document`
          : `expected element to be in the document`,
      pass,
    };
  },
});

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Mock resize observer
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Form testing helpers
export const fillForm = async (
  getByLabelText: any,
  formData: Record<string, string>
) => {
  const { fireEvent } = await import('@testing-library/react');
  
  for (const [label, value] of Object.entries(formData)) {
    const input = getByLabelText(label);
    fireEvent.change(input, { target: { value } });
  }
};

// Accessibility testing helper
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe');
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Performance testing helper
export const measurePerformance = async (fn: () => Promise<void>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';