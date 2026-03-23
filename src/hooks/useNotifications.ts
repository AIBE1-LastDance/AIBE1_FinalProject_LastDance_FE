import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSSEStore } from '../store/sseStore';
import toast from 'react-hot-toast';
import { sseDebugger } from '../utils/sseDebugger';
import {notificationApi} from "../api/notifications.ts";

// 알림 데이터 타입
interface NotificationData {
    id?: string;
    title: string;
    content: string;
    type: 'SCHEDULE' | 'PAYMENT' | 'CHECKLIST';
    icon: string;
    timestamp: string;
    relatedId?: string; // relatedId 추가
}

// 전역 SSE 연결 관리자 - 개선된 버전
class SSEManager {
    private static instance: SSEManager;
    private eventSource: EventSource | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private isConnecting = false;
    private currentUserId: string | null = null;
    private listeners = new Set<() => void>();
    private readonly maxReconnectAttempts = 5;

    // 중복 연결 방지를 위한 추가 플래그
    private connectionInProgress = false;
    private lastConnectAttempt = 0;
    private readonly minConnectInterval = 1000;

    private constructor() {}

    static getInstance(): SSEManager {
        if (!SSEManager.instance) {
            SSEManager.instance = new SSEManager();
        }
        return SSEManager.instance;
    }

    // 리스너 등록
    addListener(listener: () => void) {
        this.listeners.add(listener);
    }

    // 리스너 제거
    removeListener(listener: () => void) {
        this.listeners.delete(listener);
    }

    // 상태 변경 알림
    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    // 연결 상태 확인
    isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN;
    }

    // SSE 연결 - 개선된 중복 방지 로직
    connect(userId: string) {
        const now = Date.now();

        sseDebugger.log('SSE 연결 시도', { userId, currentUserId: this.currentUserId, isConnected: this.isConnected() }, userId);

        // 중복 연결 방지 체크들
        // 1. 너무 빈번한 연결 시도 방지
        if (now - this.lastConnectAttempt < this.minConnectInterval) {
            console.log('[SSEManager] 너무 빈번한 연결 시도, 스킵');
            sseDebugger.log('연결 시도 스킵 - 빈번한 시도', { timeDiff: now - this.lastConnectAttempt }, userId);
            return;
        }

        // 2. 이미 연결 진행 중인 경우
        if (this.connectionInProgress) {
            console.log('[SSEManager] 이미 연결 진행 중, 스킵');
            sseDebugger.log('연결 시도 스킵 - 진행 중', { connectionInProgress: this.connectionInProgress }, userId);
            return;
        }

        // 3. 이미 같은 사용자로 연결되어 있고 연결 상태가 정상인 경우
        if (this.currentUserId === userId && this.isConnected()) {
            console.log('[SSEManager] 이미 연결되어 있음, 스킵');
            sseDebugger.log('연결 시도 스킵 - 이미 연결됨', { userId, isConnected: true }, userId);
            return;
        }

        // 4. 연결 중이거나 이미 연결되어 있지만 다른 사용자인 경우
        if (this.isConnecting || (this.eventSource && this.currentUserId !== userId)) {
            console.log('[SSEManager] 기존 연결 해제 후 재연결');
            sseDebugger.log('기존 연결 해제 후 재연결', { oldUserId: this.currentUserId, newUserId: userId }, userId);
            this.disconnect();
        }

        this.lastConnectAttempt = now;
        this.connectionInProgress = true;
        this.isConnecting = true;
        this.currentUserId = userId;

        console.log(`[SSEManager] SSE 연결 시작 - 사용자: ${userId}`);
        sseDebugger.log('SSE 연결 시작', { userId }, userId);

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        this.eventSource = new EventSource(`${apiBaseUrl}/api/v2/notifications/stream`, {
            withCredentials: true
        });

        this.eventSource.onopen = () => {
            console.log('[SSEManager] SSE 연결 성공');
            sseDebugger.log('SSE 연결 성공', { userId: this.currentUserId }, this.currentUserId);
            this.isConnecting = false;
            this.connectionInProgress = false;
            this.reconnectAttempts = 0;
            useSSEStore.getState().setSSEConnected(true);
            this.notifyListeners();
        };

        this.eventSource.addEventListener('connected', (event) => {
            console.log('[SSEManager] SSE 연결 확인:', event.data);
            useSSEStore.getState().setSSEConnected(true);
            this.notifyListeners();
        });

        this.eventSource.addEventListener('notification', (event) => {
            try {
                const notification: NotificationData = JSON.parse(event.data);
                console.log('[SSEManager] SSE 알림 수신:', notification);

                // 알림 타입과 relatedId에 따른 상세 URL 결정
                const getDetailUrl = (type: string, relatedId?: string) => {
                    if (!relatedId) {
                        // relatedId가 없으면 기본 페이지로
                        switch (type) {
                            case 'SCHEDULE': return '/calendar';
                            case 'PAYMENT': return '/expenses';
                            case 'CHECKLIST': return '/tasks';
                            default: return '/dashboard';
                        }
                    }

                    switch (type) {
                        case 'SCHEDULE':
                            return `/calendar?eventId=${relatedId}`;
                        case 'PAYMENT':
                            return `/expenses?splitId=${relatedId}`;
                        case 'CHECKLIST':
                            return `/tasks?taskId=${relatedId}`;
                        default:
                            return '/dashboard';
                    }
                };

                // 알림 store에 저장
                useNotificationStore.getState().addNotification({
                    type: notification.type,
                    title: notification.title,
                    content: notification.content,
                    icon: notification.icon,
                    relatedId: notification.relatedId,
                    url: getDetailUrl(notification.type, notification.relatedId)
                });

                // 인앱 토스트 알림 표시 (클릭 시 상세 페이지 이동)
                const typeConfig = {
                    SCHEDULE: { emoji: '📅', color: '#3B82F6' },
                    PAYMENT: { emoji: '💳', color: '#10B981' },
                    CHECKLIST: { emoji: '✅', color: '#8B5CF6' }
                };

                const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.SCHEDULE;
                const detailUrl = getDetailUrl(notification.type, notification.relatedId);

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
                            maxWidth: '400px',
                            cursor: 'pointer',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap'
                        },
                        onClick: () => {
                            // 토스트 클릭 시 상세 페이지로 이동
                            window.location.href = detailUrl;
                        }
                    }
                );
            } catch (error) {
                console.error('[SSEManager] SSE 알림 파싱 오류:', error);
            }
        });

        this.eventSource.addEventListener('heartbeat', (event) => {
            console.log('[SSEManager] SSE heartbeat 수신:', event.data);
            useSSEStore.getState().setSSEConnected(true);
            this.notifyListeners();
        });

        this.eventSource.onerror = (error) => {
            console.error('[SSEManager] SSE 연결 오류:', error);
            sseDebugger.log('SSE 연결 오류', { error, userId: this.currentUserId }, this.currentUserId);
            this.isConnecting = false;
            this.connectionInProgress = false;
            useSSEStore.getState().setSSEConnected(false);
            this.notifyListeners();

            if (this.eventSource) {
                this.eventSource.close();
                this.eventSource = null;
            }

            // 재연결 시도 전에 현재 인증 상태를 확인
            const isAuthenticated = useAuthStore.getState().isAuthenticated;

            // 현재 사용자가 있고 재연결 횟수가 초과되지 않았으며, 인증된 상태일 때만 재연결
            if (this.currentUserId && this.reconnectAttempts < this.maxReconnectAttempts && isAuthenticated) {
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                this.reconnectAttempts++;

                console.log(`[SSEManager] SSE 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts}) ${delay}ms 후`);

                this.reconnectTimeout = setTimeout(() => {
                    // 재연결 시점에 여전히 사용자가 있고 인증된 상태인지 다시 확인
                    if (this.currentUserId && useAuthStore.getState().isAuthenticated) {
                        this.connect(this.currentUserId);
                    } else {
                        console.log('[SSEManager] 재연결 조건 불충족 (사용자 없음 또는 인증되지 않음)');
                        sseDebugger.log('재연결 조건 불충족', { userId: useAuthStore.getState().user?.id, isAuthenticated: useAuthStore.getState().isAuthenticated }, useAuthStore.getState().user?.id);
                    }
                }, delay);
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                toast.error('실시간 알림 연결이 실패했습니다.');
            }
        };
    }

    // SSE 연결 해제
    disconnect() {
        console.log('[SSEManager] SSE 연결 해제 시작');

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.isConnecting = false;
        this.connectionInProgress = false;
        this.currentUserId = null;
        this.reconnectAttempts = 0;

        useSSEStore.getState().setSSEConnected(false);
        this.notifyListeners();

        console.log('[SSEManager] SSE 연결 해제 완료');
    }

    // 현재 연결된 사용자 ID 반환
    getCurrentUserId(): string | null {
        return this.currentUserId;
    }
}

export const useNotifications = () => {
    const { user } = useAuthStore();
    const { setCurrentUser } = useNotificationStore();
    const {
        setSSEConnected,
        setNotificationPermission,
        setFunctions
    } = useSSEStore();

    const sseManager = SSEManager.getInstance();
    const stateUpdateRef = useRef<() => void>();

    // 🔥 중복 실행 방지를 위한 ref
    const initializationRef = useRef(false);

    // SSE 연결 함수 (전역 관리자를 통해) - 설정 확인 후 연결
    const connectSSE = useCallback(async () => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser?.id) return;

        try {
            // 🔥 연결 전에 사용자의 SSE 설정 확인
            const settings = await notificationApi.getMySettings();
            if (!settings.sseEnabled) {
                console.log('[connectSSE] SSE가 비활성화되어 있어 연결하지 않음');
                return;
            }
        } catch (error) {
            console.error('[connectSSE] 설정 확인 실패:', error);
            // 설정 확인 실패 시에는 기본적으로 연결 시도
        }

        sseManager.connect(currentUser.id);
        updateSSESetting(true);
    }, [sseManager]);

    // SSE 연결 해제 함수 (전역 관리자를 통해)
    const disconnectSSE = useCallback(() => {
        sseManager.disconnect();
        updateSSESetting(false);
    }, [sseManager]);

    const updateSSESetting = async (enabled: boolean) => {
        try {
            const currentSettings = await notificationApi.getMySettings();
            await notificationApi.updateMySettings({
                ...currentSettings,
                sseEnabled: enabled
            });
        } catch (error) {
            console.error('SSE 설정 업데이트 실패:', error);
        }
    };

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

    // 🔥 브라우저 지원 확인 및 초기화 - 한 번만 실행되도록 개선
    useEffect(() => {
        // 이미 초기화되었으면 스킵
        if (initializationRef.current) {
            return;
        }

        console.log('[useNotifications] 초기화 시작');
        initializationRef.current = true;

        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        // SSE 상태 변경 리스너 등록
        const stateUpdateListener = () => {
            setSSEConnected(sseManager.isConnected());
        };
        stateUpdateRef.current = stateUpdateListener;
        sseManager.addListener(stateUpdateListener);

        // 전역 store에 함수들 등록
        setFunctions({
            requestNotificationPermission,
            connectSSE,
            disconnectSSE,
        });

        console.log('[useNotifications] 초기화 완료');

        return () => {
            console.log('[useNotifications] cleanup 시작');
            if (stateUpdateRef.current) {
                sseManager.removeListener(stateUpdateRef.current);
            }
        };
    }, []);

    // SSE 연결 관리 - 사용자 로그인/로그아웃 시에만 실행
    useEffect(() => {
        console.log('[useNotifications] 사용자 상태 변경됨:', !!user, user?.id);
        sseDebugger.log('useNotifications - 사용자 상태 변경', { hasUser: !!user, userId: user?.id }, user?.id);

        // 사용자 정보가 변경될 때마다 알림 스토어에 현재 사용자 설정
        setCurrentUser(user?.id || null);

        if (user?.id) {
            console.log('[useNotifications] 사용자 로그인됨, SSE 연결 확인/시작');
            sseDebugger.log('사용자 로그인됨 - SSE 연결 확인', {
                userId: user.id,
                currentSSEUser: sseManager.getCurrentUserId(),
                isConnected: sseManager.isConnected()
            }, user.id);

            // 현재 연결된 사용자와 다르면 설정 확인 후 연결
            if (sseManager.getCurrentUserId() !== user.id) {
                sseDebugger.log('SSE 연결 호출 (설정 확인 후)', { userId: user.id }, user.id);
                connectSSE(); // 이제 내부에서 설정을 확인함
            }
        } else {
            console.log('[useNotifications] 사용자 로그아웃됨, SSE 연결 해제');
            sseManager.disconnect();
        }

        // 컴포넌트 언마운트 시에는 연결을 유지 (전역 관리자이므로)
        return () => {
            // 컴포넌트 언마운트 시에는 연결을 해제하지 않음
            // 전역 SSEManager가 생명주기를 관리
        };
    }, [user?.id, setCurrentUser, sseManager, connectSSE]); // connectSSE dependency 추가

    // 반환값 없음 - 모든 상태는 전역 store에서 관리
    return null;
};