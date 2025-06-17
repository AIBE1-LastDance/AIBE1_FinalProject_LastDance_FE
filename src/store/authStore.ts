import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Sample user for testing
const sampleUser: User = {
  id: 'google_user_123',
  name: '김우리',
  email: 'woori@gmail.com',
  provider: 'google'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: sampleUser,
      isAuthenticated: true,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          // Parse the JSON string and convert date strings back to Date objects
          return JSON.parse(str, (key, value) => {
            // Check if the value is a date string (ISO format)
            if (typeof value === 'string' && 
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
              return new Date(value);
            }
            return value;
          });
        },
        setItem: (name, value) => {
          // Stringify the state and convert Date objects to ISO strings
          const str = JSON.stringify(value, (key, value) => {
            if (value instanceof Date) {
              return value.toISOString();
            }
            return value;
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);
