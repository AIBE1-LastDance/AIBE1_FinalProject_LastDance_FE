import { useNotificationStore } from '../store/notificationStore';

// 개발 환경에서만 사용할 테스트 알림 함수
export const addTestNotification = () => {
    if (!import.meta.env.DEV) return;
    
    const { addNotification } = useNotificationStore.getState();
    
    const testNotifications = [
        {
            type: 'SCHEDULE' as const,
            title: '테스트 일정 알림',
            content: '오늘 오후 3시에 회의가 있습니다.',
            icon: '📅'
        },
        {
            type: 'PAYMENT' as const,
            title: '테스트 결제 알림',
            content: '월 구독료 결제가 완료되었습니다.',
            icon: '💳'
        },
        {
            type: 'CHECKLIST' as const,
            title: '테스트 할일 알림',
            content: '프로젝트 마감일이 내일입니다.',
            icon: '✅'
        }
    ];
    
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    
    addNotification({
        ...randomNotification,
        content: `${randomNotification.content} (${new Date().toLocaleTimeString()})`
    });
    
    console.log('테스트 알림 추가됨:', randomNotification.title);
};

// 브라우저 개발자 도구에서 사용할 수 있도록 전역 함수로 등록
if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as any).addTestNotification = addTestNotification;
    console.log('테스트 알림 함수가 등록되었습니다. 콘솔에서 addTestNotification() 을 실행해보세요.');
}
