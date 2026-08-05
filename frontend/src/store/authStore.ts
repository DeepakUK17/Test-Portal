import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'ADMIN' | 'FACULTY' | 'STUDENT';

interface AuthState {
  accessToken: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      isAuthenticated: false,
      setAuth: (accessToken, role) => set({ accessToken, role, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ accessToken: null, role: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // unique name
      // Only persist role and auth state, accessToken is already in local storage directly
      // but Zustand handles it nicer here. We can sync it.
    }
  )
);
