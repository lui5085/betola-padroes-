import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    setAuth: (user, token) => {
      set({ user, token, isAuthenticated: true });
      if (typeof window !== 'undefined') {
        const { apiClient } = require('@/lib/api/client');
        apiClient.setAuthToken(token);
      }
    },
    logout: () => {
      set({ user: null, token: null, isAuthenticated: false });
      if (typeof window !== 'undefined') {
        const { apiClient } = require('@/lib/api/client');
        apiClient.setAuthToken(null);
        localStorage.removeItem('auth-storage');
      }
    },
  }),
  {
    name: 'auth-storage',
    version: 2,
    onRehydrateStorage: () => (state) => {
      if (state?.token && typeof window !== 'undefined') {
        const { apiClient } = require('@/lib/api/client');
        apiClient.setAuthToken(state.token);
      }
    },
  }
));