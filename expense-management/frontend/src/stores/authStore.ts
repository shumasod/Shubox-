import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
  role_id: string;
  department: string | null;
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser, tenantSlug: string) => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tenantSlug: null,
      isAuthenticated: false,

      setAuth: (token, user, tenantSlug) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('tenant_slug', tenantSlug);
        set({ user, token, tenantSlug, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('tenant_slug');
        set({ user: null, token: null, tenantSlug: null, isAuthenticated: false });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        return user?.role?.permissions?.includes(permission) ?? false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tenantSlug: state.tenantSlug,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
