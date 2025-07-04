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
    userId: string; // 사용자별 알림 분리를 위한 필드 추가
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
    currentUserId: string | null; // 현재 사용자 ID 추가
    
    // 액션들
    setCurrentUser: (userId: string | null) => void;
    addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read' | 'userId'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;
    clearUserNotifications: (userId?: string) => void; // 특정 사용자 알림만 삭제
    getUnreadCount: () => number;
    getUserNotifications: (userId?: string) => NotificationItem[]; // 특정 사용자 알림만 조회
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            currentUserId: null,

            setCurrentUser: (userId) => {
                set((state) => {
                    const newState = { currentUserId: userId };
                    
                    // 사용자가 변경되면 해당 사용자의 알림으로 unreadCount 업데이트
                    if (userId) {
                        const userNotifications = state.notifications.filter(n => n.userId === userId);
                        const unreadCount = userNotifications.filter(n => !n.read).length;
                        return { ...newState, unreadCount };
                    } else {
                        // 로그아웃 시 unreadCount 초기화
                        return { ...newState, unreadCount: 0 };
                    }
                });
            },

            addNotification: (notificationData) => {
                const state = get();
                const currentUserId = state.currentUserId;
                
                if (!currentUserId) {
                    console.warn('사용자가 로그인되지 않은 상태에서 알림을 추가하려고 시도했습니다.');
                    return;
                }

                const newNotification: NotificationItem = {
                    ...notificationData,
                    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    userId: currentUserId,
                };

                set((state) => {
                    const updatedNotifications = [newNotification, ...state.notifications];
                    // 전체 알림은 최대 200개, 사용자별로는 50개까지 저장 (성능 고려)
                    const limitedNotifications = updatedNotifications.slice(0, 200);
                    
                    // 현재 사용자의 알림만 계산
                    const userNotifications = limitedNotifications.filter(n => n.userId === currentUserId);
                    const userLimitedNotifications = userNotifications.slice(0, 50);
                    
                    // 현재 사용자가 아닌 다른 사용자들의 알림
                    const otherUsersNotifications = limitedNotifications.filter(n => n.userId !== currentUserId);
                    
                    // 최종 알림 배열: 현재 사용자 알림(최대 50개) + 다른 사용자들 알림
                    const finalNotifications = [...userLimitedNotifications, ...otherUsersNotifications];
                    
                    const unreadCount = userLimitedNotifications.filter(n => !n.read).length;
                    
                    return {
                        notifications: finalNotifications,
                        unreadCount,
                    };
                });
            },

            markAsRead: (notificationId) => {
                set((state) => {
                    const currentUserId = state.currentUserId;
                    const updatedNotifications = state.notifications.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, read: true }
                            : notification
                    );
                    
                    // 현재 사용자의 읽지 않은 알림 수만 계산
                    const unreadCount = currentUserId 
                        ? updatedNotifications.filter(n => n.userId === currentUserId && !n.read).length
                        : 0;
                    
                    return {
                        notifications: updatedNotifications,
                        unreadCount,
                    };
                });
            },

            markAllAsRead: () => {
                set((state) => {
                    const currentUserId = state.currentUserId;
                    if (!currentUserId) return state;

                    const updatedNotifications = state.notifications.map(notification =>
                        notification.userId === currentUserId
                            ? { ...notification, read: true }
                            : notification
                    );
                    
                    return {
                        notifications: updatedNotifications,
                        unreadCount: 0,
                    };
                });
            },

            removeNotification: (notificationId) => {
                set((state) => {
                    const currentUserId = state.currentUserId;
                    const updatedNotifications = state.notifications.filter(
                        notification => notification.id !== notificationId
                    );
                    
                    // 현재 사용자의 읽지 않은 알림 수만 계산
                    const unreadCount = currentUserId 
                        ? updatedNotifications.filter(n => n.userId === currentUserId && !n.read).length
                        : 0;
                    
                    return {
                        notifications: updatedNotifications,
                        unreadCount,
                    };
                });
            },

            clearAllNotifications: () => {
                set((state) => {
                    const currentUserId = state.currentUserId;
                    if (!currentUserId) return state;

                    // 현재 사용자의 알림만 삭제, 다른 사용자 알림은 유지
                    const updatedNotifications = state.notifications.filter(
                        notification => notification.userId !== currentUserId
                    );
                    
                    return {
                        notifications: updatedNotifications,
                        unreadCount: 0,
                    };
                });
            },

            clearUserNotifications: (userId) => {
                set((state) => {
                    const targetUserId = userId || state.currentUserId;
                    if (!targetUserId) return state;

                    const updatedNotifications = state.notifications.filter(
                        notification => notification.userId !== targetUserId
                    );
                    
                    // 현재 사용자의 알림을 삭제한 경우 unreadCount도 업데이트
                    const unreadCount = targetUserId === state.currentUserId 
                        ? 0 
                        : state.unreadCount;
                    
                    return {
                        notifications: updatedNotifications,
                        unreadCount,
                    };
                });
            },

            getUnreadCount: () => {
                const state = get();
                const currentUserId = state.currentUserId;
                if (!currentUserId) return 0;
                
                return state.notifications.filter(n => n.userId === currentUserId && !n.read).length;
            },

            getUserNotifications: (userId) => {
                const state = get();
                const targetUserId = userId || state.currentUserId;
                if (!targetUserId) return [];
                
                return state.notifications
                    .filter(n => n.userId === targetUserId)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            },
        }),
        {
            name: 'notification-storage',
            // 알림은 민감한 정보가 아니므로 localStorage에 저장
            partialize: (state) => ({
                notifications: state.notifications,
                // currentUserId와 unreadCount는 persist하지 않음 (로그인 시 새로 설정)
            }),
            // 저장된 데이터 복원 시 상태 초기화
            onRehydrate: (state) => {
                if (state) {
                    state.currentUserId = null;
                    state.unreadCount = 0;
                }
            }
        }
    )
);
