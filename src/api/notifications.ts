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
  }
};
