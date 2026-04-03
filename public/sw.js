// Service Worker for Web Push Notifications
console.log('Service Worker 로드됨');

// 알림 타입별 설정 (백엔드 NotificationType과 매칭)
const getNotificationConfig = (type) => {
    const configs = {
        SCHEDULE: {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            color: '#3B82F6',
            emoji: '📅'
        },
        PAYMENT: {
            icon: '/favicon.ico',
            badge: '/favicon.ico', 
            color: '#10B981',
            emoji: '💳'
        },
        CHECKLIST: {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            color: '#8B5CF6',
            emoji: '✅'
        }
    };
    return configs[type] || configs.SCHEDULE;
};

// 알림 타입별 아이콘 반환
function getNotificationIcon(type) {
    switch (type) {
        case 'SCHEDULE':
            return '📅';
        case 'PAYMENT':
            return '💳';
        case 'CHECKLIST':
            return '✅';
        default:
            return '🔔';
    }
}

// 알림 타입별 URL 반환
function getNotificationUrl(type) {
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
}

// 푸시 메시지 수신 이벤트
self.addEventListener('push', event => {
    console.log('푸시 메시지 수신:', event);
    
    let data = {};
    
    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        console.error('푸시 데이터 파싱 오류:', error);
        data = {
            title: '새 알림',
            body: '새로운 알림이 있습니다.',
            icon: '/favicon.ico'
        };
    }
    
    // 브라우저 탭에 메시지 전송하여 store 업데이트
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'PUSH_NOTIFICATION_RECEIVED',
                data: {
                    type: data.type || 'SCHEDULE',
                    title: data.title || '새 알림',
                    content: data.content || data.body || '새로운 알림이 있습니다.',
                    icon: getNotificationIcon(data.type),
                    relatedId: data.id,
                    url: getNotificationUrl(data.type)
                }
            });
        });
    });

    const config = getNotificationConfig(data.type);
    
    const options = {
        body: data.content || data.body || '새로운 알림이 있습니다.',
        icon: config.icon,
        badge: config.badge,
        tag: data.tag || `notification-${Date.now()}`,
        data: {
            ...data.data,
            notificationId: data.id,
            url: data.url || getNotificationUrl(data.type),
            timestamp: Date.now(),
            type: data.type
        },
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: '열기'
            },
            {
                action: 'close', 
                title: '닫기'
            }
        ],
        image: data.image,
        vibrate: [100, 50, 100],
        silent: false,
        renotify: true
    };

    const title = `${config.emoji} ${data.title || '우리집 알림'}`;

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', event => {
    console.log('알림 클릭됨:', event);
    
    event.notification.close();

    const handleAction = () => {
        const url = event.notification.data?.url || '/';
        
        return self.clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then(clientList => {
            // 이미 열린 탭이 있으면 포커스하고 해당 URL로 이동
            for (let client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    if (client.url !== self.location.origin + url) {
                        client.navigate(url);
                    }
                    return client.focus();
                }
            }
            // 새 탭 열기
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        });
    };

    if (event.action === 'open') {
        // 앱 열기
        event.waitUntil(handleAction());
    } else if (event.action === 'close') {
        // 알림만 닫기
        console.log('알림 닫기');
    } else {
        // 기본 클릭 동작 (앱 열기)
        event.waitUntil(handleAction());
    }
    

});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', event => {
    console.log('백그라운드 동기화:', event);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // 백그라운드에서 수행할 작업
            Promise.resolve(console.log('백그라운드 동기화 수행'))
        );
    }
});

// Service Worker 설치
self.addEventListener('install', event => {
    console.log('Service Worker 설치됨');
    self.skipWaiting();
});

// Service Worker 활성화
self.addEventListener('activate', event => {
    console.log('Service Worker 활성화됨');
    event.waitUntil(
        // 이전 버전의 캐시 정리 등
        self.clients.claim()
    );
});

// 푸시 구독 변경 이벤트
self.addEventListener('pushsubscriptionchange', event => {
    console.log('푸시 구독 변경됨:', event);
    
    event.waitUntil(
        // 새 구독으로 서버 업데이트
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: event.oldSubscription?.options?.applicationServerKey
        }).then(newSubscription => {
            // 서버에 새 구독 정보 전송
            return fetch('/api/v1/notifications/webpush/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    endpoint: newSubscription.endpoint,
                    keys: {
                        p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')),
                        auth: arrayBufferToBase64(newSubscription.getKey('auth'))
                    }
                })
            });
        }).catch(error => {
            console.error('푸시 구독 갱신 실패:', error);
        })
    );
});

// 유틸리티 함수
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return btoa(binary);
}
