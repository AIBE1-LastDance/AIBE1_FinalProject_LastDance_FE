import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSSEStore } from '../store/sseStore';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

// 알림 데이터 타입
interface NotificationData {
    id?: string;
    title: string;
    content: string;
    type: 'SCHEDULE' | 'PAYMENT' | 'CHECKLIST';
    icon: string;
    timestamp: string;
}

// 웹푸시 구독 요청 타입
interface WebPushSubscriptionRequest {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export const useNotifications = () => {
    const { user } = useAuthStore();
    const { setCurrentUser } = useNotificationStore();
    const {
        setSSEConnected,
        setWebPushSupported,
        setWebPushSubscribed,
        setNotificationPermission,
        setFunctions
    } = useSSEStore();
    
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const isConnectingRef = useRef(false);
    const maxReconnectAttempts = 5;

    // 웹푸시 구독 상태 확인
    const checkWebPushSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                setWebPushSubscribed(false);
                return;
            }

            const subscription = await registration.pushManager.getSubscription();
            setWebPushSubscribed(!!subscription);
        } catch (error) {
            console.error('웹푸시 구독 상태 확인 오류:', error);
            setWebPushSubscribed(false);
        }
    }, [setWebPushSubscribed]);

    // Service Worker로부터 메시지 처리
    const handleServiceWorkerMessage = useCallback((event: MessageEvent) => {
        if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
            const notificationData = event.data.data;
            console.log('Service Worker로부터 웹푸시 알림 수신:', notificationData);
            
            // store의 addNotification을 직접 호출
            useNotificationStore.getState().addNotification({
                type: notificationData.type,
                title: notificationData.title,
                content: notificationData.content,
                icon: notificationData.icon,
                relatedId: notificationData.relatedId,
                url: notificationData.url
            });
        }
    }, []);

    // SSE 연결 해제
    const disconnectSSE = useCallback(() => {
        console.log('SSE 연결 해제 시작');
        
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        setSSEConnected(false);
        reconnectAttempts.current = 0;
        isConnectingRef.current = false;
        
        console.log('SSE 연결 해제 완료');
    }, [setSSEConnected]);

    // SSE 연결 함수
    const connectSSE = useCallback(() => {
        // 중복 연결 방지
        if (eventSourceRef.current || isConnectingRef.current) {
            console.log('SSE 연결 건너뜀 - 이미 연결되어 있거나 연결 중');
            return;
        }

        isConnectingRef.current = true;
        console.log('SSE 연결 시도...');
        
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const eventSource = new EventSource(`${apiBaseUrl}/api/v1/notifications/stream`, {
            withCredentials: true
        });
        
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('SSE 연결 성공');
            setSSEConnected(true);
            reconnectAttempts.current = 0;
            isConnectingRef.current = false;
        };

        eventSource.addEventListener('connected', (event) => {
            console.log('SSE 연결 확인:', event.data);
            setSSEConnected(true);
        });

        eventSource.addEventListener('notification', (event) => {
            try {
                const notification: NotificationData = JSON.parse(event.data);
                console.log('SSE 알림 수신:', notification);
                
                // 알림 타입에 따른 URL 결정
                const getUrl = (type: string) => {
                    switch (type) {
                        case 'SCHEDULE': return '/calendar';
                        case 'PAYMENT': return '/expenses';
                        case 'CHECKLIST': return '/tasks';
                        default: return '/dashboard';
                    }
                };

                // 1. 알림 store에 저장 (Header에서 표시)
                useNotificationStore.getState().addNotification({
                    type: notification.type,
                    title: notification.title,
                    content: notification.content,
                    icon: notification.icon,
                    relatedId: notification.id,
                    url: getUrl(notification.type)
                });
                
                // 2. 인앱 토스트 알림 표시
                const typeConfig = {
                    SCHEDULE: { emoji: '📅', color: '#3B82F6' },
                    PAYMENT: { emoji: '💳', color: '#10B981' },
                    CHECKLIST: { emoji: '✅', color: '#8B5CF6' }
                };

                const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.SCHEDULE;
                
                toast(
                    `${config.emoji} ${notification.title}\n${notification.content}`,
                    {
                        duration: 5000,
                        position: 'top-right',
                        style: {
                            borderLeft: `4px solid ${config.color}`,
                            padding: '16px',
                            backgroundColor: 'white',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            borderRadius: '12px',
                            maxWidth: '400px'
                        }
                    }
                );
            } catch (error) {
                console.error('SSE 알림 파싱 오류:', error);
            }
        });

        eventSource.addEventListener('heartbeat', (event) => {
            console.log('SSE heartbeat 수신:', event.data);
            setSSEConnected(true);
        });

        eventSource.onerror = (error) => {
            console.error('SSE 연결 오류:', error);
            setSSEConnected(false);
            isConnectingRef.current = false;
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            
            // 현재 user 상태를 직접 참조하여 재연결 결정
            const currentUser = useAuthStore.getState().user;
            if (currentUser && reconnectAttempts.current < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                reconnectAttempts.current++;
                
                console.log(`SSE 재연결 시도 (${reconnectAttempts.current}/${maxReconnectAttempts}) ${delay}ms 후`);
                
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectSSE();
                }, delay);
            } else if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.log('SSE 재연결 포기. 웹푸시 모드로 전환');
                toast.error('실시간 알림 연결이 실패했습니다. 브라우저 알림으로 전환됩니다.');
            }
        };
    }, [setSSEConnected]);

    // 알림 권한 요청
    const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            toast.error('이 브라우저는 알림을 지원하지 않습니다.');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            
            if (permission === 'granted') {
                toast.success('알림 권한이 허용되었습니다.');
                return true;
            } else {
                toast.error('알림 권한이 거부되었습니다.');
                return false;
            }
        } catch (error) {
            console.error('알림 권한 요청 오류:', error);
            toast.error('알림 권한 요청에 실패했습니다.');
            return false;
        }
    }, [setNotificationPermission]);

    // 웹푸시 구독 등록
    const subscribeToWebPush = useCallback(async (): Promise<boolean> => {
        const isWebPushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        
        if (!isWebPushSupported) {
            toast.error('이 브라우저는 웹푸시를 지원하지 않습니다.');
            return false;
        }

        const currentPermission = useSSEStore.getState().notificationPermission;
        if (currentPermission !== 'granted') {
            const granted = await requestNotificationPermission();
            if (!granted) return false;
        }

        try {
            // Service Worker 등록 확인
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                console.log('Service Worker 등록 중...');
                registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;
                console.log('Service Worker 등록 완료');
            }

            // 기존 구독 확인
            let subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
                // VAPID 공개키 확인
                const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                
                if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'your_vapid_public_key_here') {
                    console.warn('VAPID 공개키가 설정되지 않았습니다.');
                    toast.error('웹푸시 기능을 사용하려면 VAPID 키 설정이 필요합니다. 현재는 SSE와 이메일 알림을 사용합니다.');
                    return false;
                }

                if (VAPID_PUBLIC_KEY.length < 80) {
                    console.error('VAPID 공개키가 너무 짧습니다:', VAPID_PUBLIC_KEY.length, '자');
                    toast.error('VAPID 공개키 설정이 올바르지 않습니다. 관리자에게 문의하세요.');
                    return false;
                }

                console.log('새 웹푸시 구독 생성 중...');
                const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
                console.log('웹푸시 구독 생성 완료');
            }

            // 서버에 구독 정보 전송
            const subscriptionData: WebPushSubscriptionRequest = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                    auth: arrayBufferToBase64(subscription.getKey('auth')!)
                }
            };

            await apiClient.post('/api/v1/notifications/webpush/subscribe', subscriptionData);
            setWebPushSubscribed(true);
            toast.success('웹푸시 구독이 완료되었습니다.');
            
            return true;
        } catch (error) {
            console.error('웹푸시 구독 오류:', error);
            toast.error('웹푸시 구독에 실패했습니다.');
            return false;
        }
    }, [requestNotificationPermission, setWebPushSubscribed]);

    // 웹푸시 구독 해제
    const unsubscribeFromWebPush = useCallback(async (): Promise<boolean> => {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) return true;

            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                console.log('로컬 웹푸시 구독 해제 완료');
            }

            setWebPushSubscribed(false);
            toast.success('웹푸시 구독이 해제되었습니다.');
            return true;
        } catch (error) {
            console.error('웹푸시 구독 해제 오류:', error);
            toast.error('웹푸시 구독 해제에 실패했습니다.');
            return false;
        }
    }, [setWebPushSubscribed]);

    // 유틸리티 함수들
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
        return window.btoa(binary);
    };

    // 브라우저 지원 확인 및 초기화
    useEffect(() => {
        const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        setWebPushSupported(isSupported);
        
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        if (isSupported) {
            checkWebPushSubscription();
        }

        // Service Worker 메시지 리스너 등록
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }

        // 전역 store에 함수들 등록
        setFunctions({
            requestNotificationPermission,
            subscribeToWebPush,
            unsubscribeFromWebPush,
            connectSSE,
            disconnectSSE,
            checkWebPushSubscription,
        });

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
            }
        };
    }, [
        setWebPushSupported,
        setNotificationPermission,
        checkWebPushSubscription,
        handleServiceWorkerMessage,
        setFunctions,
        requestNotificationPermission,
        subscribeToWebPush,
        unsubscribeFromWebPush,
        connectSSE,
        disconnectSSE,
    ]);

    // SSE 연결 관리 - 사용자 로그인/로그아웃 시
    useEffect(() => {
        console.log('사용자 상태 변경됨:', !!user);
        
        // 사용자 정보가 변경될 때마다 알림 스토어에 현재 사용자 설정
        setCurrentUser(user?.id || null);
        
        if (user) {
            console.log('사용자 로그인됨, SSE 연결 시작');
            // 기존 연결이 있다면 먼저 해제
            if (eventSourceRef.current) {
                console.log('기존 SSE 연결 해제');
                disconnectSSE();
            }
            // 짧은 지연 후 새 연결 시작
            setTimeout(() => {
                connectSSE();
            }, 100);
        } else {
            console.log('사용자 로그아웃됨, SSE 연결 해제');
            disconnectSSE();
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            disconnectSSE();
        };
    }, [user?.id, connectSSE, disconnectSSE, setCurrentUser]);

    // 반환값 없음 - 모든 상태는 전역 store에서 관리
    return null;
};
