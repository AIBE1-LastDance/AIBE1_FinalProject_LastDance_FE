import { apiClient } from '../utils/api';

// 알림 설정 요청 DTO - 백엔드와 매칭
export interface NotificationSettingRequest {
  emailEnabled: boolean;
  scheduleReminder: boolean;
  paymentReminder: boolean;
  checklistReminder: boolean;
  sseEnabled: boolean;
}

// 백엔드 data 필드 내부 구조
export interface NotificationSettingResponse {
  settingId: number;
  userId: string;
  emailEnabled: boolean;
  scheduleReminder: boolean;
  paymentReminder: boolean;
  checklistReminder: boolean;
  sseEnabled: boolean;
  createdAt: string;
}

export const notificationApi = {
  // 내 알림 설정 조회 - 백엔드 응답의 data 필드만 반환
  getMySettings: async (): Promise<NotificationSettingResponse> => {
    const response = await apiClient.get('/api/v2/notification-settings/me');
    return response.data.data ?? response.data;
  },

  // 내 알림 설정 수정
  updateMySettings: async (settings: NotificationSettingRequest): Promise<string> => {
    const response = await apiClient.put('/api/v2/notification-settings/me', settings);
    return response.data;
  },
};
