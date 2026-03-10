import { create } from 'zustand';

interface SSEState {
    isSSEConnected: boolean;
    notificationPermission: NotificationPermission;
    
    // Actions
    setSSEConnected: (connected: boolean) => void;
    setNotificationPermission: (permission: NotificationPermission) => void;
    
    // Functions (will be set by useNotifications hook)
    requestNotificationPermission?: () => Promise<boolean>;
    connectSSE?: () => void;
    disconnectSSE?: () => void;

    // Set functions
    setFunctions: (functions: {
        requestNotificationPermission: () => Promise<boolean>;
        connectSSE: () => void;
        disconnectSSE: () => void;
    }) => void;
}

export const useSSEStore = create<SSEState>((set) => ({
    isSSEConnected: false,
    notificationPermission: 'default',
    
    setSSEConnected: (connected) => set({ isSSEConnected: connected }),
    setNotificationPermission: (permission) => set({ notificationPermission: permission }),
    
    setFunctions: (functions) => set(functions),
}));
