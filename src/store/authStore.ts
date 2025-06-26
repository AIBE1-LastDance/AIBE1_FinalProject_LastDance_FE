import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {User} from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isProcessingAccountDeletion: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    setProcessingAccountDeletion: (processing: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isProcessingAccountDeletion: false,
            login: (user) => set({user, isAuthenticated: true}),
            logout: () => set({user: null, isAuthenticated: false}),
            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? {...state.user, ...userData} : null,
                })),
            setProcessingAccountDeletion: (processing) =>
                set({isProcessingAccountDeletion: processing}),
        }),
        {
            name: 'auth-storage',
            storage: {
                getItem: (name) => {
                    try {
                        const str = localStorage.getItem(name);
                        if (!str) return null;

                        // Parse the JSON string and convert date strings back to Date objects
                        return JSON.parse(str, (_, value) => {
                            // Check if the value is a date string (ISO format)
                            if (typeof value === 'string' &&
                                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
                                return new Date(value);
                            }
                            return value;
                        });
                    } catch (error) {
                        console.error('Auth storage parse error:', error);
                        localStorage.removeItem(name);
                        return null;
                    }
                },
                setItem: (name, value) => {
                    try {
                        // Stringify the state and convert Date objects to ISO strings
                        const str = JSON.stringify(value, (_, value) => {
                            if (value instanceof Date) {
                                return value.toISOString();
                            }
                            return value;
                        });
                        localStorage.setItem(name, str);
                    } catch (error) {
                        console.error('Auth storage save error:', error);
                    }
                },
                removeItem: (name) => {
                    try {
                        localStorage.removeItem(name);
                    } catch (error) {
                        console.error('Auth storage remove error:', error);
                    }
                }
            }
        }
    )
);
