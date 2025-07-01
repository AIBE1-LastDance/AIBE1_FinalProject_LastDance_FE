import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
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
    const { addNotification } = useNotificationStore();
    const [isSSEConnected, setIsSSEConnected] = useState(false);
    const [isWebPushSupported, setIsWebPushSupported] = useState(false);
    const [isWebPushSubscribed, setIsWebPushSubscribed] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const isConnectingRef = useRef(false); // 연결 중 플래그 추가
    const maxReconnectAttempts = 5;

    // 웹푸시 구독 상태 확인
    const checkWebPushSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                setIsWebPushSubscribed(false);
                return;
            }

            const subscription = await registration.pushManager.getSubscription();
            setIsWebPushSubscribed(!!subscription);
        } catch (error) {
            console.error('웹푸시 구독 상태 확인 오류:', error);
            setIsWebPushSubscribed(false);
        }
    }, []);

    // Service Worker로부터 메시지 처리
    const handleServiceWorkerMessage = useCallback((event: MessageEvent) => {
        if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
            const notificationData = event.data.data;
            console.log('Service Worker로부터 웹푸시 알림 수신:', notificationData);
            
            // 알림 store에 추가
            addNotification({
                type: notificationData.type,
                title: notificationData.title,
                content: notificationData.content,
                icon: notificationData.icon,
                relatedId: notificationData.relatedId,
                url: notificationData.url
            });
        }
    }, [addNotification]);

    // 알림 타입에 따른 URL 반환
    const getNotificationUrl = useCallback((type: 'SCHEDULE' | 'PAYMENT' | 'CHECKLIST'): string => {
        switch (type) {
            case 'SCHEDULE':
                return '/calendar';
            case 'PAYMENT':
                return '/expenses';
            case 'CHECKLIST':
                return '/tasks';
            default:
                return '/dashboard';
        }
    }, []);

    // 인앱 알림 표시
    const showInAppNotification = useCallback((notification: NotificationData) => {
        const typeConfig = {
            SCHEDULE: { emoji: '📅', color: 'blue' },
            PAYMENT: { emoji: '💳', color: 'green' },
            CHECKLIST: { emoji: '✅', color: 'purple' }
        };

        const config = typeConfig[notification.type] || typeConfig.SCHEDULE;
        
        toast(
            `${config.emoji} ${notification.title}\n${notification.content}`,
            {
                duration: 5000,
                position: 'top-right',
                style: {
                    borderLeft: `4px solid ${config.color === 'blue' ? '#3B82F6' : config.color === 'green' ? '#10B981' : '#8B5CF6'}`,
                    padding: '16px',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '12px',
                    maxWidth: '400px'
                }
            }
        );
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
        
        setIsSSEConnected(false);
        reconnectAttempts.current = 0;
        isConnectingRef.current = false;
        
        console.log('SSE 연결 해제 완료');
    }, []);

    // SSE 연결 함수
    const connectSSE = useCallback(() => {
        // 이미 연결되어 있거나 연결 중이면 중단
        if (!user || eventSourceRef.current || isConnectingRef.current) {
            console.log('SSE 연결 건너뜀:', {
                hasUser: !!user,
                hasEventSource: !!eventSourceRef.current,
                isConnecting: isConnectingRef.current
            });
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
            setIsSSEConnected(true);
            reconnectAttempts.current = 0;
            isConnectingRef.current = false;
        };

        eventSource.addEventListener('connected', (event) => {
            console.log('SSE 연결 확인:', event.data);
            setIsSSEConnected(true);
        });

        eventSource.addEventListener('notification', (event) => {
            try {
                const notification: NotificationData = JSON.parse(event.data);
                console.log('SSE 알림 수신:', notification);
                
                // 1. 알림 store에 저장 (Header에서 표시)
                addNotification({
                    type: notification.type,
                    title: notification.title,
                    content: notification.content,
                    icon: notification.icon,
                    relatedId: notification.id,
                    url: getNotificationUrl(notification.type)
                });
                
                // 2. 인앱 토스트 알림 표시
                showInAppNotification(notification);
            } catch (error) {
                console.error('SSE 알림 파싱 오류:', error);
            }
        });

        eventSource.addEventListener('heartbeat', (event) => {
            console.log('SSE heartbeat 수신:', event.data);
            // 연결 상태 확인 - heartbeat 수신 시 연결 상태를 확실히 설정
            if (!isSSEConnected) {
                setIsSSEConnected(true);
            }
        });

        eventSource.onerror = (error) => {
            console.error('SSE 연결 오류:', error);
            setIsSSEConnected(false);
            isConnectingRef.current = false;
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            
            // 재연결 시도 (사용자가 로그인되어 있고 최대 시도 횟수 내에서만)
            if (user && reconnectAttempts.current < maxReconnectAttempts) {
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
    }, [user, addNotification, getNotificationUrl, showInAppNotification]);

    // 알림 권한 요청
    const requestNotificationPermission = async (): Promise<boolean> => {
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
    };

    // 웹푸시 구독 등록
    const subscribeToWebPush = async (): Promise<boolean> => {
        if (!isWebPushSupported) {
            toast.error('이 브라우저는 웹푸시를 지원하지 않습니다.');
            return false;
        }

        if (notificationPermission !== 'granted') {
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

                // VAPID 키 길이 검증 (최소 80자 이상이어야 함)
                if (VAPID_PUBLIC_KEY.length < 80) {
                    console.error('VAPID 공개키가 너무 짧습니다:', VAPID_PUBLIC_KEY.length, '자');
                    toast.error('VAPID 공개키 설정이 올바르지 않습니다. 관리자에게 문의하세요.');
                    return false;
                }

                console.log('VAPID 공개키 확인:', VAPID_PUBLIC_KEY.substring(0, 10) + '... (' + VAPID_PUBLIC_KEY.length + '자)');
                
                console.log('새 웹푸시 구독 생성 중...');
                try {
                    // applicationServerKey 생성 시도
                    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                    console.log('applicationServerKey 생성 완료:', applicationServerKey.length, '바이트');
                    
                    // 새 구독 생성
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey
                    });
                    console.log('웹푸시 구독 생성 완료');
                } catch (subscribeError) {
                    console.error('웹푸시 구독 생성 실패:', subscribeError);
                    
                    if (subscribeError instanceof Error) {
                        if (subscribeError.name === 'InvalidAccessError') {
                            toast.error('VAPID 공개키가 유효하지 않습니다. 백엔드에서 올바른 VAPID 키를 생성해주세요.');
                        } else if (subscribeError.name === 'NotSupportedError') {
                            toast.error('현재 브라우저에서 웹푸시를 지원하지 않습니다.');
                        } else {
                            toast.error(`웹푸시 구독 실패: ${subscribeError.message}`);
                        }
                    } else {
                        toast.error('웹푸시 구독 생성에 실패했습니다.');
                    }
                    return false;
                }
            } else {
                console.log('기존 웹푸시 구독 발견');
            }

            // 서버에 구독 정보 전송
            const subscriptionData: WebPushSubscriptionRequest = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                    auth: arrayBufferToBase64(subscription.getKey('auth')!)
                }
            };

            console.log('서버에 구독 정보 전송 중...');
            await apiClient.post('/api/v1/notifications/webpush/subscribe', subscriptionData);
            console.log('서버 구독 등록 완료');
            
            setIsWebPushSubscribed(true);
            toast.success('웹푸시 구독이 완료되었습니다.');
            
            return true;
        } catch (error) {
            console.error('웹푸시 구독 오류:', error);
            
            // 구체적인 오류 메시지 제공
            if (error instanceof Error) {
                if (error.name === 'NotSupportedError') {
                    toast.error('브라우저가 웹푸시를 지원하지 않습니다.');
                } else if (error.name === 'NotAllowedError') {
                    toast.error('웹푸시 권한이 거부되었습니다.');
                } else if (error.message.includes('VAPID')) {
                    toast.error('VAPID 공개키 설정 문제입니다. 관리자에게 문의하세요.');
                } else {
                    toast.error(`웹푸시 구독 실패: ${error.message}`);
                }
            } else {
                toast.error('웹푸시 구독에 실패했습니다.');
            }
            
            return false;
        }
    };

    // 웹푸시 구독 해제
    const unsubscribeFromWebPush = async (): Promise<boolean> => {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) return true;

            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                
                // 서버에 구독 해제 알림 (백엔드에 해당 API가 있는지 확인 필요)
                try {
                    // 웹푸시 구독 해제 API는 백엔드에 구현되어 있지 않은 것 같아 주석 처리
                    // await apiClient.delete('/api/v1/notifications/webpush/unsubscribe');
                    console.log('로컬 웹푸시 구독 해제 완료');
                } catch (error) {
                    console.error('서버 구독 해제 알림 실패:', error);
                    // 로컬 해제는 성공했으므로 계속 진행
                }
            }

            setIsWebPushSubscribed(false);
            toast.success('웹푸시 구독이 해제되었습니다.');
            return true;
        } catch (error) {
            console.error('웹푸시 구독 해제 오류:', error);
            toast.error('웹푸시 구독 해제에 실패했습니다.');
            return false;
        }
    };

    // 유틸리티 함수들
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        try {
            // 입력값 검증
            if (!base64String || typeof base64String !== 'string') {
                throw new Error('유효하지 않은 VAPID 공개키입니다.');
            }

            // URL-safe base64를 일반 base64로 변환
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            // Base64 문자열 유효성 검사
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (!base64Regex.test(base64)) {
                throw new Error('VAPID 공개키가 올바른 Base64 형식이 아닙니다.');
            }

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            
            // VAPID 키 길이 검증 (일반적으로 65바이트)
            if (outputArray.length !== 65) {
                console.warn(`VAPID 공개키 길이가 예상과 다릅니다. 예상: 65바이트, 실제: ${outputArray.length}바이트`);
            }
            
            return outputArray;
        } catch (error) {
            console.error('Base64 디코딩 오류:', error);
            console.error('입력 VAPID 공개키:', base64String);
            console.error('환경변수 VITE_VAPID_PUBLIC_KEY 값을 확인해주세요.');
            throw new Error('VAPID 공개키 형식이 올바르지 않습니다. 환경변수를 확인해주세요.');
        }
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
        return window.btoa(binary);
    };

    // 브라우저 지원 확인 (한 번만 실행)
    useEffect(() => {
        const checkSupport = () => {
            setIsWebPushSupported(
                'serviceWorker' in navigator && 
                'PushManager' in window && 
                'Notification' in window
            );
            
            if ('Notification' in window) {
                setNotificationPermission(Notification.permission);
            }
        };

        checkSupport();
        
        // 웹푸시 구독 상태 확인
        if (isWebPushSupported) {
            checkWebPushSubscription();
        }

        // Service Worker 메시지 리스너 등록
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
            }
        };
    }, []); // 빈 의존성 배열로 한 번만 실행

    // 사용자 로그인/로그아웃 시 SSE 연결 관리
    useEffect(() => {
        if (user) {
            console.log('사용자 로그인됨, SSE 연결 시작');
            connectSSE();
        } else {
            console.log('사용자 로그아웃됨, SSE 연결 해제');
            disconnectSSE();
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            disconnectSSE();
        };
    }, [user]); // user만 의존성으로 설정

    // 페이지 가시성 변경 시 SSE 재연결 (연결이 끊어진 경우에만)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user && !isSSEConnected && !isConnectingRef.current) {
                console.log('페이지 활성화됨, SSE 재연결 시도');
                connectSSE();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, isSSEConnected, connectSSE]);

    return {
        // 상태
        isSSEConnected,
        isWebPushSupported,
        isWebPushSubscribed,
        notificationPermission,
        
        // 함수
        requestNotificationPermission,
        subscribeToWebPush,
        unsubscribeFromWebPush,
        connectSSE,
        disconnectSSE,
        checkWebPushSubscription
    };
};
