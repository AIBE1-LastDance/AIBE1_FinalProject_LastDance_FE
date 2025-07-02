import { create } from 'zustand';

interface SSEState {
    isSSEConnected: boolean;
    isWebPushSupported: boolean;
    isWebPushSubscribed: boolean;
    notificationPermission: NotificationPermission;
    
    // Actions
    setSSEConnected: (connected: boolean) => void;
    setWebPushSupported: (supported: boolean) => void;
    setWebPushSubscribed: (subscribed: boolean) => void;
    setNotificationPermission: (permission: NotificationPermission) => void;
    
    // Functions (will be set by useNotifications hook)
    requestNotificationPermission?: () => Promise<boolean>;
    subscribeToWebPush?: () => Promise<boolean>;
    unsubscribeFromWebPush?: () => Promise<boolean>;
    connectSSE?: () => void;
    disconnectSSE?: () => void;
    checkWebPushSubscription?: () => Promise<void>;
    
    // Set functions
    setFunctions: (functions: {
        requestNotificationPermission: () => Promise<boolean>;
        subscribeToWebPush: () => Promise<boolean>;
        unsubscribeFromWebPush: () => Promise<boolean>;
        connectSSE: () => void;
        disconnectSSE: () => void;
        checkWebPushSubscription: () => Promise<void>;
    }) => void;
}

export const useSSEStore = create<SSEState>((set) => ({
    isSSEConnected: false,
    isWebPushSupported: false,
    isWebPushSubscribed: false,
    notificationPermission: 'default',
    
    setSSEConnected: (connected) => set({ isSSEConnected: connected }),
    setWebPushSupported: (supported) => set({ isWebPushSupported: supported }),
    setWebPushSubscribed: (subscribed) => set({ isWebPushSubscribed: subscribed }),
    setNotificationPermission: (permission) => set({ notificationPermission: permission }),
    
    setFunctions: (functions) => set(functions),
}));
