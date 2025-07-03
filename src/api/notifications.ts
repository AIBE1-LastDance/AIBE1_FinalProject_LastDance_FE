import { apiClient } from '../utils/api';

// 알림 설정 요청 DTO - 백엔드와 매칭
export interface NotificationSettingRequest {
  emailEnabled: boolean;
  scheduleReminder: boolean;
  paymentReminder: boolean;
  checklistReminder: boolean;
}

// 알림 설정 응답 DTO - 백엔드와 매칭
export interface NotificationSettingResponse {
  settingId: number;
  userId: string;
  emailEnabled: boolean;
  scheduleReminder: boolean;
  paymentReminder: boolean;
  checklistReminder: boolean;
  createdAt: string;
}

// 웹푸시 구독 요청 DTO - 백엔드 WebPushSubscriptionRequest와 매칭
export interface WebPushSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// 테스트 알림 요청 DTO
export interface TestNotificationRequest {
  type: 'SCHEDULE' | 'PAYMENT' | 'CHECKLIST';
  title: string;
  content: string;
  relatedId: string;
}

export const notificationApi = {
  // 내 알림 설정 조회
  getMySettings: async (): Promise<NotificationSettingResponse> => {
    const response = await apiClient.get('/api/v1/notification-settings/me');
    return response.data;
  },

  // 내 알림 설정 수정
  updateMySettings: async (settings: NotificationSettingRequest): Promise<string> => {
    const response = await apiClient.put('/api/v1/notification-settings/me', settings);
    return response.data;
  },

  // 특정 사용자 알림 설정 조회 (관리자용)
  getUserSettings: async (userId: string): Promise<NotificationSettingResponse> => {
    const response = await apiClient.get(`/api/v1/notification-settings/${userId}`);
    return response.data;
  },

  // 특정 사용자 알림 설정 수정 (관리자용)
  updateUserSettings: async (userId: string, settings: NotificationSettingRequest): Promise<string> => {
    const response = await apiClient.put(`/api/v1/notification-settings/${userId}`, settings);
    return response.data;
  },

  // 웹푸시 구독 등록 - 백엔드 WebPushController와 매칭
  subscribeWebPush: async (subscription: WebPushSubscriptionRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/v1/notifications/webpush/subscribe', subscription);
    return response.data;
  },

  // 테스트 알림 전송 (하이브리드 시스템 테스트용)
  sendTestNotification: async (notification: TestNotificationRequest): Promise<string> => {
    const response = await apiClient.post('/api/v1/notifications/test', notification);
    return response.data;
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId: string): Promise<string> => {
    const response = await apiClient.post(`/api/v1/notifications/read/${notificationId}`);
    return response.data;
  }
};
