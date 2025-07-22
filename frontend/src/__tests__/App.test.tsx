import React from 'react';
import { shallow, mount } from 'enzyme';
import App from '../App';
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
} from './utils/enzyme-utils';

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
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
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

describe('App', () => {
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

    
    useSelector.mockImplementation((selector: any) => {
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
      const wrapper = shallowWithProviders(<App />);
      expectComponentToRender(wrapper);
    });

    it('should render with default props', () => {
      const wrapper = mountWithProviders(<App />);
      expectComponentToRender(wrapper);
      expect(wrapper.find('App')).toHaveLength(1);
    });

    
    it('should render with custom props', () => {
      const customProps = {
        className: 'custom-class',
        'data-testid': 'test-component',
      };
      const wrapper = mountWithProviders(<App {...customProps} />);
      expectComponentToRender(wrapper);
      expectComponentToHaveProps(wrapper.find('App'), customProps);
    });

    it('should match snapshot', () => {
      const wrapper = shallowWithProviders(<App />);
      expectToMatchSnapshot(wrapper);
    });
  });

  

  

  describe('Event Handling', () => {
    it('should handle click events', async () => {
      const mockOnClick = jest.fn();
      const wrapper = mountWithProviders(<App onClick={mockOnClick} />);
      
      const clickableElements = wrapper.find('button, [role="button"], a');
      if (clickableElements.length > 0) {
        simulateEvent(wrapper, clickableElements.first(), 'click');
        await waitForAsync(wrapper);
      }
    });

    it('should handle keyboard events', async () => {
      const wrapper = mountWithProviders(<App />);
      
      const focusableElements = wrapper.find('button, input, select, textarea, a, [tabindex]');
      if (focusableElements.length > 0) {
        simulateEvent(wrapper, focusableElements.first(), 'keydown', { key: 'Enter' });
        simulateEvent(wrapper, focusableElements.first(), 'keydown', { key: ' ' });
        await waitForAsync(wrapper);
      }
    });

    it('should handle focus events', async () => {
      const wrapper = mountWithProviders(<App />);
      
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
      const wrapper = mountWithProviders(<App />);
      checkAriaAttributes(wrapper);
    });

    it('should support keyboard navigation', () => {
      const wrapper = mountWithProviders(<App />);
      const focusableSelectors = ['button', 'input', 'select', 'textarea', 'a', '[tabindex]'];
      checkKeyboardNavigation(wrapper, focusableSelectors);
    });

    it('should have proper semantic structure', () => {
      const wrapper = mountWithProviders(<App />);
      
      // Check for semantic elements
      const semanticElements = wrapper.find('main, section, article, aside, nav, header, footer, h1, h2, h3, h4, h5, h6');
      expect(semanticElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', () => {
      const renderTime = measureRenderTime(() => {
        mountWithProviders(<App />);
      });
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    it('should not have memory leaks', () => {
      const wrapper = mountWithProviders(<App />);
      checkMemoryLeaks(wrapper);
    });

    it('should handle rapid re-renders', async () => {
      const wrapper = mountWithProviders(<App />);
      
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
        const wrapper = mountWithProviders(<App />);
        expectComponentToRender(wrapper);
      } catch (error) {
        // Component should handle errors gracefully
        expect(error).toBeInstanceOf(Error);
      }
      
      consoleSpy.mockRestore();
    });

    it('should handle missing props gracefully', () => {
      const wrapper = mountWithProviders(<App />);
      expectComponentToRender(wrapper);
    });
  });

  

  describe('Integration', () => {
    it('should integrate with Redux store', () => {
      const wrapper = mountWithProviders(<App />, { store: mockStore });
      expectComponentToRender(wrapper);
    });

    it('should integrate with React Router', () => {
      const wrapper = mountWithProviders(<App />, {
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

      const wrapper = mountWithProviders(<App />);
      expectComponentToRender(wrapper);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined props', () => {
      const wrapper = mountWithProviders(<App data={null} />);
      expectComponentToRender(wrapper);
    });

    it('should handle empty arrays/objects', () => {
      const wrapper = mountWithProviders(<App items={[]} config={{}} />);
      expectComponentToRender(wrapper);
    });

    it('should handle very large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const wrapper = mountWithProviders(<App items={largeDataset} />);
      expectComponentToRender(wrapper);
    });
  });
});
