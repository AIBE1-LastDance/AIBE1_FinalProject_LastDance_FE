import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 알림 데이터 타입
export interface NotificationItem {
    id: string;
    type: 'SCHEDULE' | 'PAYMENT' | 'CHECKLIST';
    title: string;
    content: string;
    icon: string;
    timestamp: string; // ISO string으로 저장
    read: boolean;
    relatedId?: string;
    url?: string;
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
    
    // 액션들
    addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;
    getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            addNotification: (notificationData) => {
                const newNotification: NotificationItem = {
                    ...notificationData,
                    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(), // ISO string으로 저장
                    read: false,
                };

                set((state) => {
                    const updatedNotifications = [newNotification, ...state.notifications];
                    // 최대 50개까지만 저장 (성능 고려)
                    const limitedNotifications = updatedNotifications.slice(0, 50);
                    const unreadCount = limitedNotifications.filter(n => !n.read).length;
                    
                    return {
                        notifications: limitedNotifications,
                        unreadCount,
                    };
                });
            },

            markAsRead: (notificationId) => {
                set((state) => {
                    const updatedNotifications = state.notifications.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, read: true }
                            : notification
                    );
                    const unreadCount = updatedNotifications.filter(n => !n.read).length;
                    
                    return {
                        notifications: updatedNotifications,
                        unreadCount,
                    };
                });
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map(notification => ({
                        ...notification,
                        read: true,
                    })),
                    unreadCount: 0,
                }));
            },

            removeNotification: (notificationId) => {
                set((state) => {
                    const updatedNotifications = state.notifications.filter(
                        notification => notification.id !== notificationId
                    );
                    const unreadCount = updatedNotifications.filter(n => !n.read).length;
                    
                    return {
                        notifications: updatedNotifications,
                        unreadCount,
                    };
                });
            },

            clearAllNotifications: () => {
                set({
                    notifications: [],
                    unreadCount: 0,
                });
            },

            getUnreadCount: () => {
                return get().notifications.filter(n => !n.read).length;
            },
        }),
        {
            name: 'notification-storage',
            // 알림은 민감한 정보가 아니므로 localStorage에 저장
            partialize: (state) => ({
                notifications: state.notifications,
                unreadCount: state.unreadCount,
            }),
        }
    )
);
