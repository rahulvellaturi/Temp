import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN' | 'CLAIMS_ADJUSTER' | 'BILLING_SPECIALIST';
  isActive: boolean;
  mfa?: {
    isEnabled: boolean;
    method: 'SMS' | 'AUTHENTICATOR';
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string, mfaToken?: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (email: string, password: string, mfaToken?: string) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post('/auth/login', {
            email,
            password,
            mfaToken,
          });

          const { token, user } = response.data;
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          const response = await api.put('/users/profile', userData);
          const { user } = response.data;
          
          set({ user });
        } catch (error: any) {
          throw error;
        }
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/auth/me');
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid, clear auth state
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Initialize auth check on app load
useAuthStore.getState().checkAuth();