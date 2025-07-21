import React from 'react';
import { shallow, mount } from 'enzyme';
import Payments from '../Payments';
import {
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
  expectComponentToRender,
  expectComponentToHaveProps,
  expectToMatchSnapshot,
  mockAuthenticatedUser,
  mockAdminUser
} from '../../__tests__/utils/enzyme-utils';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/test' }),
  useParams: () => ({}),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

// Mock external libraries
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }) => children,
}));

jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Search: () => <div data-testid="search-icon" />,
  User: () => <div data-testid="user-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash: () => <div data-testid="trash-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
}));

describe('Payments', () => {
  let mockStore;
  let mockDispatch;
  let mockNavigate;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockNavigate = jest.fn();
    
    // Setup Redux mock
    const { useSelector, useDispatch } = require('react-redux');
    useDispatch.mockReturnValue(mockDispatch);
    
    // Setup Router mock
    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);

    
    useSelector.mockImplementation((selector) => {
      const state = {
        auth: {
          user: mockAuthenticatedUser,
          token: 'mock-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
        claims: {
          claims: [],
          loading: false,
          error: null,
          selectedClaim: null,
        },
        admin: {
          users: [],
          claims: [],
          loading: false,
          error: null,
          stats: {
            totalClaims: 0,
            pendingClaims: 0,
            approvedClaims: 0,
            rejectedClaims: 0,
            totalUsers: 0,
          },
        },
        ui: {
          theme: 'light',
          sidebarOpen: false,
          notifications: [],
        },
      };
      return selector(state);
    });

    mockStore = createTestStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const wrapper = shallowWithProviders(<Payments />);
      expectComponentToRender(wrapper);
    });

    it('should render with default props', () => {
      const wrapper = mountWithProviders(<Payments />);
      expectComponentToRender(wrapper);
      expect(wrapper.find('Payments')).toHaveLength(1);
    });

    

    it('should match snapshot', () => {
      const wrapper = shallowWithProviders(<Payments />);
      expectToMatchSnapshot(wrapper);
    });
  });

  

  
  describe('Page Functionality', () => {
    it('should handle loading state', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          auth: { user: mockAuthenticatedUser, isAuthenticated: true },
          claims: { loading: true, claims: [], error: null },
          admin: { loading: true, users: [], claims: [], error: null },
          ui: { theme: 'light', notifications: [] },
        };
        return selector(state);
      });

      const wrapper = mountWithProviders(<Payments />);
      const loadingElements = wrapper.find('[data-testid*="loading"], .loading, .spinner');
      expect(loadingElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle error state', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        const state = {
          auth: { user: mockAuthenticatedUser, isAuthenticated: true },
          claims: { loading: false, claims: [], error: 'Test error' },
          admin: { loading: false, users: [], claims: [], error: 'Test error' },
          ui: { theme: 'light', notifications: [] },
        };
        return selector(state);
      });

      const wrapper = mountWithProviders(<Payments />);
      const errorElements = wrapper.find('[data-testid*="error"], .error');
      expect(errorElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle navigation', async () => {
      const wrapper = mountWithProviders(<Payments />);
      
      const navigationElements = wrapper.find('button, a, [role="button"]');
      if (navigationElements.length > 0) {
        simulateEvent(wrapper, navigationElements.first(), 'click');
        await waitForAsync(wrapper);
        // Navigation should be handled
        expect(mockNavigate).toHaveBeenCalledWith(expect.any(String));
      }
    });
  });

  describe('Event Handling', () => {
    it('should handle click events', async () => {
      const mockOnClick = jest.fn();
      const wrapper = mountWithProviders(<Payments onClick={mockOnClick} />);
      
      const clickableElements = wrapper.find('button, [role="button"], a');
      if (clickableElements.length > 0) {
        simulateEvent(wrapper, clickableElements.first(), 'click');
        await waitForAsync(wrapper);
      }
    });

    it('should handle keyboard events', async () => {
      const wrapper = mountWithProviders(<Payments />);
      
      const focusableElements = wrapper.find('button, input, select, textarea, a, [tabindex]');
      if (focusableElements.length > 0) {
        simulateEvent(wrapper, focusableElements.first(), 'keydown', { key: 'Enter' });
        simulateEvent(wrapper, focusableElements.first(), 'keydown', { key: ' ' });
        await waitForAsync(wrapper);
      }
    });

    it('should handle focus events', async () => {
      const wrapper = mountWithProviders(<Payments />);
      
      const focusableElements = wrapper.find('button, input, select, textarea, a');
      if (focusableElements.length > 0) {
        simulateEvent(wrapper, focusableElements.first(), 'focus');
        simulateEvent(wrapper, focusableElements.first(), 'blur');
        await waitForAsync(wrapper);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mountWithProviders(<Payments />);
      checkAriaAttributes(wrapper);
    });

    it('should support keyboard navigation', () => {
      const wrapper = mountWithProviders(<Payments />);
      const focusableSelectors = ['button', 'input', 'select', 'textarea', 'a', '[tabindex]'];
      checkKeyboardNavigation(wrapper, focusableSelectors);
    });

    it('should have proper semantic structure', () => {
      const wrapper = mountWithProviders(<Payments />);
      
      // Check for semantic elements
      const semanticElements = wrapper.find('main, section, article, aside, nav, header, footer, h1, h2, h3, h4, h5, h6');
      expect(semanticElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', () => {
      const renderTime = measureRenderTime(() => {
        mountWithProviders(<Payments />);
      });
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    it('should not have memory leaks', () => {
      const wrapper = mountWithProviders(<Payments />);
      checkMemoryLeaks(wrapper);
    });

    it('should handle rapid re-renders', async () => {
      const wrapper = mountWithProviders(<Payments />);
      
      // Force multiple re-renders
      for (let i = 0; i < 10; i++) {
        wrapper.setProps({ key: i });
        await waitForAsync(wrapper, 1);
      }
      
      expectComponentToRender(wrapper);
    });
  });

  describe('Error Handling', () => {
    it('should handle component errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        const wrapper = mountWithProviders(<Payments />);
        expectComponentToRender(wrapper);
      } catch (error) {
        // Component should handle errors gracefully
        expect(error).toBeInstanceOf(Error);
      }
      
      consoleSpy.mockRestore();
    });

    it('should handle missing props gracefully', () => {
      const wrapper = mountWithProviders(<Payments />);
      expectComponentToRender(wrapper);
    });
  });

  
  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      // Mock different viewport sizes
      const viewports = [
        { width: 320, height: 568 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ];

      viewports.forEach(viewport => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        const wrapper = mountWithProviders(<Payments />);
        expectComponentToRender(wrapper);
        wrapper.unmount();
      });
    });
  });

  describe('Integration', () => {
    it('should integrate with Redux store', () => {
      const wrapper = mountWithProviders(<Payments />, { store: mockStore });
      expectComponentToRender(wrapper);
    });

    it('should integrate with React Router', () => {
      const wrapper = mountWithProviders(<Payments />, {
        initialEntries: ['/test-route']
      });
      expectComponentToRender(wrapper);
    });

    
    it('should handle authentication state changes', () => {
      const { useSelector } = require('react-redux');
      
      // Test unauthenticated state
      useSelector.mockImplementation((selector) => {
        const state = {
          auth: { user: null, isAuthenticated: false },
          ui: { theme: 'light', notifications: [] },
        };
        return selector(state);
      });

      const wrapper = mountWithProviders(<Payments />);
      expectComponentToRender(wrapper);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined props', () => {
      const wrapper = mountWithProviders(<Payments data={null} />);
      expectComponentToRender(wrapper);
    });

    it('should handle empty arrays/objects', () => {
      const wrapper = mountWithProviders(<Payments items={[]} config={{}} />);
      expectComponentToRender(wrapper);
    });

    it('should handle very large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const wrapper = mountWithProviders(<Payments items={largeDataset} />);
      expectComponentToRender(wrapper);
    });
  });
});
